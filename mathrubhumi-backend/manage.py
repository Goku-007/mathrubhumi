#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

# region agent log
def _agent_log(hypothesisId: str, location: str, message: str, data=None, runId: str = "pre-fix"):
    # NDJSON debug log for Cursor debug mode. Never log secrets.
    try:
        import json, time
        from pathlib import Path

        payload = {
            "sessionId": "debug-session",
            "runId": runId,
            "hypothesisId": hypothesisId,
            "location": location,
            "message": message,
            "data": data or {},
            "timestamp": int(time.time() * 1000),
        }
        log_path = Path(__file__).resolve().parent.parent / ".cursor" / "debug.log"
        log_path.parent.mkdir(parents=True, exist_ok=True)
        with open(log_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(payload, ensure_ascii=False) + "\n")
    except Exception:
        pass


def _parse_runserver_target(argv):
    # Supports: runserver, runserver 8001, runserver 0.0.0.0:8000 (ignores flags)
    try:
        idx = argv.index("runserver")
    except ValueError:
        return None

    addrport = None
    for arg in argv[idx + 1 :]:
        if arg.startswith("-"):
            continue
        addrport = arg
        break

    host, port = "127.0.0.1", 8000
    if addrport:
        if ":" in addrport:
            h, p = addrport.rsplit(":", 1)
            if h:
                host = h
            if p.isdigit():
                port = int(p)
        elif addrport.isdigit():
            port = int(addrport)
    return {"host": host, "port": port, "addrport": addrport}


def _can_bind(host: str, port: int) -> bool:
    try:
        import socket

        # If binding to 0.0.0.0, probe bindability on localhost.
        probe_host = "127.0.0.1" if host in {"0.0.0.0"} else host
        family = socket.AF_INET6 if ":" in probe_host else socket.AF_INET
        with socket.socket(family, socket.SOCK_STREAM) as s:
            s.bind((probe_host, port))
        return True
    except Exception:
        return False


def _listener_process_info(port: int):
    # Best-effort: macOS/Linux. Returns {"pid": int|None, "command": str|None}
    try:
        import subprocess

        out = subprocess.check_output(
            ["lsof", "-nP", f"-iTCP:{port}", "-sTCP:LISTEN"],
            stderr=subprocess.STDOUT,
            text=True,
        )
        lines = [ln for ln in out.splitlines() if ln.strip()]
        if len(lines) < 2:
            return {"pid": None, "command": None}
        parts = lines[1].split()
        pid = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else None
        cmdline = None
        cwd = None
        if pid:
            try:
                cmdline = subprocess.check_output(["ps", "-p", str(pid), "-o", "command="], text=True).strip()
            except Exception:
                cmdline = parts[0] if parts else None
            try:
                cwd_out = subprocess.check_output(["lsof", "-a", "-p", str(pid), "-d", "cwd"], text=True).splitlines()
                # The last column of the last line is typically the CWD path.
                if cwd_out:
                    last = cwd_out[-1].strip()
                    if last:
                        cwd = last.split()[-1]
            except Exception:
                cwd = None
        return {"pid": pid, "command": cmdline or (parts[0] if parts else None), "cwd": cwd}
    except Exception:
        return {"pid": None, "command": None, "cwd": None}
# endregion


def main():
    """Run administrative tasks."""
    _agent_log(
        hypothesisId="A",
        location="manage.py:main",
        message="manage.py invoked",
        data={"argv": sys.argv[:], "cwd": os.getcwd()},
        runId="pre-fix",
    )

    # Preflight (OPT-IN ONLY): for runserver, detect port conflicts and provide actionable info.
    # Default Django behavior for local dev is unchanged unless you pass --restart/--kill-existing/--preflight.
    preflight_enabled = any(a in sys.argv for a in ("--restart", "--kill-existing", "--preflight"))
    target = _parse_runserver_target(sys.argv) if preflight_enabled else None
    if target:
        host, port = target["host"], target["port"]
        restart = ("--restart" in sys.argv) or ("--kill-existing" in sys.argv)
        _agent_log(
            hypothesisId="A",
            location="manage.py:runserver-preflight",
            message="parsed runserver target",
            data={"host": host, "port": port, "addrport": target["addrport"], "restart": restart},
            runId="pre-fix",
        )
        available = _can_bind(host, port)
        in_use = not available
        _agent_log(
            hypothesisId="A",
            location="manage.py:runserver-preflight",
            message="port bindability result",
            data={"host": host, "port": port, "canBind": available, "inUse": in_use},
            runId="pre-fix",
        )
        if in_use:
            info = _listener_process_info(port)
            _agent_log(
                hypothesisId="A",
                location="manage.py:runserver-preflight",
                message="port already in use",
                data={"port": port, "pid": info.get("pid"), "command": info.get("command"), "cwd": info.get("cwd")},
                runId="pre-fix",
            )

            # If it's already our backend dev server, treat this as non-fatal and guide the user.
            try:
                import signal
                from pathlib import Path

                backend_dir = str(Path(__file__).resolve().parent)
                this_manage = str(Path(__file__).resolve())
                owner_cwd = info.get("cwd") or ""
                owner_cmd = info.get("command") or ""
                owner_is_same = (owner_cwd and owner_cwd.startswith(backend_dir)) or (this_manage and this_manage in owner_cmd)

                if restart and owner_is_same and info.get("pid"):
                    _agent_log(
                        hypothesisId="A",
                        location="manage.py:runserver-preflight",
                        message="restart requested; terminating existing owner",
                        data={"port": port, "pid": info.get("pid"), "cwd": owner_cwd},
                        runId="pre-fix",
                    )
                    try:
                        os.kill(int(info["pid"]), signal.SIGTERM)
                    except Exception as e:
                        _agent_log(
                            hypothesisId="A",
                            location="manage.py:runserver-preflight",
                            message="failed to terminate owner",
                            data={"port": port, "pid": info.get("pid"), "error": str(e)},
                            runId="pre-fix",
                        )

                    # Remove our custom flags before handing control to Django.
                    sys.argv = [a for a in sys.argv if a not in {"--restart", "--kill-existing", "--preflight"}]
                    _agent_log(
                        hypothesisId="A",
                        location="manage.py:runserver-preflight",
                        message="argv sanitized after restart flag removal",
                        data={"argv": sys.argv[:]},
                        runId="pre-fix",
                    )

                    # Best-effort: if still not bindable right away, fail fast with context.
                    if not _can_bind(host, port):
                        sys.stderr.write(
                            f"Error: Tried to stop the existing server but port {port} is still not available.\n"
                            f"Try again in a moment, or use: `python manage.py runserver {port+1}`\n"
                        )
                        raise SystemExit(1)

                # When preflight is enabled, we still keep Django's default behavior:
                # if the port is in use, we error out (unless --restart was requested above).
            except Exception:
                pass

            pid_part = f" (PID {info['pid']})" if info.get("pid") else ""
            cmd_part = f"\nOwner: {info['command']}" if info.get("command") else ""
            sys.stderr.write(
                f"Error: Port {port} is already in use{pid_part}.{cmd_part}\n"
                f"- Stop the owner process (Ctrl+C) or `kill <PID>`\n"
                f"- Or run on another port: `python manage.py runserver {port+1}`\n"
            )
            raise SystemExit(1)

    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
