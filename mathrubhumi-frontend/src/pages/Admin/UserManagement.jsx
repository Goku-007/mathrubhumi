import React, { useEffect, useMemo, useState } from "react";
import api from "../../utils/axiosInstance";
import { getSession } from "../../utils/session";
import Modal from "../../components/Modal";

export default function UserManagement() {
  const { user } = getSession();
  const isAdmin = Boolean(user?.is_admin || String(user?.role || "").toLowerCase() === "admin");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [users, setUsers] = useState([]);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [branches, setBranches] = useState([]);
  const [branchQuery, setBranchQuery] = useState("");
  const [branchPickerOpen, setBranchPickerOpen] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
  const [actionMenuUserId, setActionMenuUserId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    id: null,
    name: "",
    email: "",
    role: "Manager",
    branchIds: [],
  });
  const [editBranchQuery, setEditBranchQuery] = useState("");
  const [editPickerOpen, setEditPickerOpen] = useState(false);
  const [editActiveSuggestionIndex, setEditActiveSuggestionIndex] = useState(0);

  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "Manager",
    branchIds: [],
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  const canSubmit = useMemo(() => {
    if (!form.name.trim() || !form.email.trim() || !form.password) return false;
    if (form.password !== form.confirmPassword) return false;
    if (!["Manager", "Staff"].includes(form.role)) return false;
    if (!Array.isArray(form.branchIds) || form.branchIds.length === 0) return false;
    return true;
  }, [form]);

  const branchNameById = useMemo(() => {
    const map = new Map();
    for (const b of branches) map.set(Number(b.id), b.branches_nm);
    return map;
  }, [branches]);

  const filteredBranches = useMemo(() => {
    const q = branchQuery.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter((b) => String(b.branches_nm || "").toLowerCase().includes(q));
  }, [branches, branchQuery]);

  const editFilteredBranches = useMemo(() => {
    if (!editOpen) return [];
    const q = editBranchQuery.trim().toLowerCase();
    if (!q) return branches;
    return branches.filter((b) => String(b.branches_nm || "").toLowerCase().includes(q));
  }, [branches, editBranchQuery, editOpen]);

  const suggestions = useMemo(() => {
    const selected = new Set((form.branchIds || []).map((x) => Number(x)));
    const list = filteredBranches.filter((b) => !selected.has(Number(b.id)));
    return list.slice(0, 50);
  }, [filteredBranches, form.branchIds]);

  const editSuggestions = useMemo(() => {
    if (!editOpen) return [];
    const selected = new Set((editForm.branchIds || []).map((x) => Number(x)));
    const list = editFilteredBranches.filter((b) => !selected.has(Number(b.id)));
    return list.slice(0, 50);
  }, [editFilteredBranches, editForm.branchIds, editOpen]);

  useEffect(() => {
    if (!branchPickerOpen) return;
    setActiveSuggestionIndex(0);
  }, [branchPickerOpen, branchQuery]);

  useEffect(() => {
    if (!editPickerOpen) return;
    setEditActiveSuggestionIndex(0);
  }, [editPickerOpen, editBranchQuery]);

  useEffect(() => {
    if (!actionMenuUserId) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setActionMenuUserId(null);
    };
    const onMouseDown = (e) => {
      if (e.target.closest("[data-user-actions-root]")) return;
      setActionMenuUserId(null);
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onMouseDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onMouseDown);
    };
  }, [actionMenuUserId]);

  const loadUsers = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("auth/admin/users/");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (_) {
      setErr("Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    setBranchesLoading(true);
    try {
      const res = await api.get("auth/branches/");
      setBranches(Array.isArray(res.data) ? res.data : []);
    } catch (_) {
      setErr("Unable to load branches.");
    } finally {
      setBranchesLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    loadBranches();
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const onCreate = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    if (!canSubmit) {
      setErr("Please fill all fields correctly.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("auth/admin/users/", {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        branch_ids: form.branchIds.map((v) => Number(v)),
        password: form.password,
      });
      setSuccess("User created successfully.");
      setForm((f) => ({ ...f, branchIds: [], password: "", confirmPassword: "" }));
      await loadUsers();
    } catch (error) {
      const apiErr = error?.response?.data?.error;
      if (Array.isArray(apiErr)) setErr(apiErr.join(" "));
      else setErr(String(apiErr || "User creation failed."));
    } finally {
      setSubmitting(false);
    }
  };

  const addBranch = (branch) => {
    const bid = Number(branch?.id);
    if (!bid) return;
    setForm((f) => {
      const current = Array.isArray(f.branchIds) ? f.branchIds : [];
      if (current.includes(bid)) return f;
      return { ...f, branchIds: [...current, bid] };
    });
  };

  const removeBranchId = (bid) => {
    setForm((f) => {
      const current = Array.isArray(f.branchIds) ? f.branchIds : [];
      return { ...f, branchIds: current.filter((x) => Number(x) !== Number(bid)) };
    });
  };

  const openEdit = (u) => {
    setErr("");
    setSuccess("");
    setActionMenuUserId(null);
    setEditForm({
      id: u.id,
      name: u.name || "",
      email: u.email || "",
      role: u.role === "Staff" ? "Staff" : "Manager",
      branchIds: Array.isArray(u.branch_ids) ? u.branch_ids.map((x) => Number(x)) : [],
    });
    setEditBranchQuery("");
    setEditPickerOpen(false);
    setEditOpen(true);
  };

  const addEditBranch = (branch) => {
    const bid = Number(branch?.id);
    if (!bid) return;
    setEditForm((f) => {
      const current = Array.isArray(f.branchIds) ? f.branchIds : [];
      if (current.includes(bid)) return f;
      return { ...f, branchIds: [...current, bid] };
    });
  };

  const removeEditBranchId = (bid) => {
    setEditForm((f) => {
      const current = Array.isArray(f.branchIds) ? f.branchIds : [];
      return { ...f, branchIds: current.filter((x) => Number(x) !== Number(bid)) };
    });
  };

  const onEditBranchKeyDown = (e) => {
    if (!editPickerOpen) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setEditPickerOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setEditActiveSuggestionIndex((i) => Math.min(i + 1, Math.max(0, editSuggestions.length - 1)));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setEditActiveSuggestionIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      if (editSuggestions[editActiveSuggestionIndex]) {
        e.preventDefault();
        addEditBranch(editSuggestions[editActiveSuggestionIndex]);
      }
    }
  };

  const saveEdit = async () => {
    setErr("");
    setSuccess("");
    if (!editForm.id) return;
    if (!editForm.name.trim()) {
      setErr("Name is required.");
      return;
    }
    if (!["Manager", "Staff"].includes(editForm.role)) {
      setErr("Role must be Manager or Staff.");
      return;
    }
    if (!Array.isArray(editForm.branchIds) || editForm.branchIds.length === 0) {
      setErr("Select at least one branch.");
      return;
    }

    setEditSubmitting(true);
    try {
      await api.patch(`auth/admin/users/${editForm.id}/`, {
        name: editForm.name.trim(),
        role: editForm.role,
        branch_ids: editForm.branchIds.map((v) => Number(v)),
      });
      setSuccess("User updated successfully.");
      setEditOpen(false);
      await loadUsers();
    } catch (error) {
      const apiErr = error?.response?.data?.error;
      if (Array.isArray(apiErr)) setErr(apiErr.join(" "));
      else setErr(String(apiErr || "Update failed."));
    } finally {
      setEditSubmitting(false);
    }
  };

  const confirmDelete = (u) => {
    setErr("");
    setSuccess("");
    setActionMenuUserId(null);
    setDeleteTarget(u);
  };

  const doDelete = async () => {
    if (!deleteTarget?.id) return;
    setDeleteSubmitting(true);
    setErr("");
    setSuccess("");
    try {
      await api.delete(`auth/admin/users/${deleteTarget.id}/`);
      setSuccess("User deleted successfully.");
      setDeleteTarget(null);
      await loadUsers();
    } catch (error) {
      const apiErr = error?.response?.data?.error;
      if (Array.isArray(apiErr)) setErr(apiErr.join(" "));
      else setErr(String(apiErr || "Delete failed."));
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const onBranchKeyDown = (e) => {
    if (!branchPickerOpen) return;
    if (e.key === "Escape") {
      e.preventDefault();
      setBranchPickerOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((i) => Math.min(i + 1, Math.max(0, suggestions.length - 1)));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      if (suggestions[activeSuggestionIndex]) {
        e.preventDefault();
        addBranch(suggestions[activeSuggestionIndex]);
      }
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          Access denied. Admin permissions required.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Modal
        isOpen={Boolean(deleteTarget)}
        type="warning"
        message={
          deleteTarget
            ? `Delete ${deleteTarget.name} (${deleteTarget.email})? This will disable the account and remove branch access.`
            : ""
        }
        buttons={[
          {
            label: "Cancel",
            onClick: () => setDeleteTarget(null),
            className: "bg-gray-600 hover:bg-gray-700",
          },
          {
            label: deleteSubmitting ? "Deleting…" : "Delete",
            onClick: doDelete,
            className: "bg-red-600 hover:bg-red-700",
          },
        ]}
      />

      <Modal
        isOpen={editOpen}
        type="info"
        message="Edit user"
        size="lg"
        buttons={[
          {
            label: "Cancel",
            onClick: () => setEditOpen(false),
            className: "bg-gray-600 hover:bg-gray-700",
          },
          {
            label: editSubmitting ? "Saving…" : "Save changes",
            onClick: saveEdit,
            className: "bg-blue-600 hover:bg-blue-700",
          },
        ]}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700" htmlFor="edit-name">
                Name
              </label>
              <input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                autoComplete="name"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700" htmlFor="edit-email">
                Email
              </label>
              <input
                id="edit-email"
                value={editForm.email}
                disabled
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700" htmlFor="edit-role">
                Role
              </label>
              <select
                id="edit-role"
                value={editForm.role}
                onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-medium text-slate-700">Allowed branches</label>
              <div className="text-xs text-slate-500">{editForm.branchIds.length} selected</div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-full">
                <input
                  value={editBranchQuery}
                  onChange={(e) => {
                    setEditBranchQuery(e.target.value);
                    setEditPickerOpen(true);
                  }}
                  onFocus={() => setEditPickerOpen(true)}
                  onKeyDown={onEditBranchKeyDown}
                  placeholder={branchesLoading ? "Loading branches…" : "Search and add branches"}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  disabled={branchesLoading}
                />

                {editPickerOpen && !branchesLoading && (
                  <div
                    className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <div className="max-h-60 overflow-auto" role="listbox">
                      {editSuggestions.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-600">
                          {editBranchQuery.trim() ? "No matches." : "Type to search branches."}
                        </div>
                      ) : (
                        <ul className="divide-y divide-slate-100">
                          {editSuggestions.map((b, idx) => {
                            const active = idx === editActiveSuggestionIndex;
                            return (
                              <li key={b.id} role="option" aria-selected={active}>
                                <button
                                  type="button"
                                  onClick={() => addEditBranch(b)}
                                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 ${
                                    active ? "bg-blue-50" : ""
                                  }`}
                                >
                                  <div className="text-sm font-medium text-slate-900">{b.branches_nm}</div>
                                  <div className="text-xs text-slate-500">#{b.id}</div>
                                </button>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/50">
                      <div className="text-xs text-slate-500">
                        Showing {Math.min(editSuggestions.length, 50)} of {editFilteredBranches.length}
                      </div>
                      <button
                        type="button"
                        className="text-xs font-medium text-slate-700 hover:text-slate-900"
                        onClick={() => setEditPickerOpen(false)}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setEditForm((f) => ({ ...f, branchIds: branches.map((b) => Number(b.id)) }))}
                className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                disabled={branchesLoading || branches.length === 0}
              >
                Select all
              </button>
              <button
                type="button"
                onClick={() => setEditForm((f) => ({ ...f, branchIds: [] }))}
                className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                disabled={editForm.branchIds.length === 0}
              >
                Clear
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3">
              {editForm.branchIds.length === 0 ? (
                <div className="text-sm text-slate-600">No branches selected.</div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {editForm.branchIds
                    .slice()
                    .sort((a, b) => Number(a) - Number(b))
                    .map((bid) => (
                      <span
                        key={bid}
                        className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800"
                        title={branchNameById.get(Number(bid)) || `Branch #${bid}`}
                      >
                        <span className="truncate max-w-[260px]">
                          {branchNameById.get(Number(bid)) || `Branch #${bid}`}
                        </span>
                        <button
                          type="button"
                          className="text-slate-500 hover:text-slate-800"
                          onClick={() => removeEditBranchId(bid)}
                          aria-label="Remove branch"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
          <p className="text-sm text-slate-600">Create Manager and Staff accounts (Admin only).</p>
        </div>
      </div>

      {(err || success) && (
        <div
          className={`rounded-xl border p-4 ${
            err ? "border-red-200 bg-red-50 text-red-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
          role="status"
        >
          {err || success}
        </div>
      )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Create */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="text-sm font-semibold text-slate-900">Create User</div>
            <div className="text-xs text-slate-500 mt-1">Passwords are validated by the server policy.</div>
          </div>
          <form onSubmit={onCreate} className="p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  autoComplete="name"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="role">
                  Role
                </label>
                <select
                  id="role"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                >
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-slate-700">Allowed branches</label>
                <div className="text-xs text-slate-500">
                  {form.branchIds.length} selected
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full">
                  <input
                    value={branchQuery}
                    onChange={(e) => setBranchQuery(e.target.value)}
                    onFocus={() => setBranchPickerOpen(true)}
                    onKeyDown={onBranchKeyDown}
                    placeholder={branchesLoading ? "Loading branches…" : "Search and add branches"}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    disabled={branchesLoading}
                    role="combobox"
                    aria-expanded={branchPickerOpen}
                    aria-controls="branch-suggestions"
                    aria-autocomplete="list"
                  />

                  {branchPickerOpen && !branchesLoading && (
                    <div
                      className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden"
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <div className="max-h-60 overflow-auto" id="branch-suggestions" role="listbox">
                        {suggestions.length === 0 ? (
                          <div className="px-4 py-3 text-sm text-slate-600">
                            {branchQuery.trim() ? "No matches." : "Type to search branches."}
                          </div>
                        ) : (
                          <ul className="divide-y divide-slate-100">
                            {suggestions.map((b, idx) => {
                              const active = idx === activeSuggestionIndex;
                              return (
                                <li key={b.id} role="option" aria-selected={active}>
                                  <button
                                    type="button"
                                    onClick={() => addBranch(b)}
                                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 ${
                                      active ? "bg-blue-50" : ""
                                    }`}
                                  >
                                    <div className="text-sm font-medium text-slate-900">{b.branches_nm}</div>
                                    <div className="text-xs text-slate-500">#{b.id}</div>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                      <div className="px-4 py-2 border-t border-slate-100 flex items-center justify-between gap-2 bg-slate-50/50">
                        <div className="text-xs text-slate-500">
                          Showing {Math.min(suggestions.length, 50)} of {filteredBranches.length}
                        </div>
                        <button
                          type="button"
                          className="text-xs font-medium text-slate-700 hover:text-slate-900"
                          onClick={() => setBranchPickerOpen(false)}
                        >
                          Close
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, branchIds: branches.map((b) => Number(b.id)) }))}
                  className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  disabled={branchesLoading || branches.length === 0}
                >
                  Select all
                </button>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, branchIds: [] }))}
                  className="whitespace-nowrap rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                  disabled={form.branchIds.length === 0}
                >
                  Clear
                </button>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-3">
                {form.branchIds.length === 0 ? (
                  <div className="text-sm text-slate-600">No branches selected.</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {form.branchIds
                      .slice()
                      .sort((a, b) => Number(a) - Number(b))
                      .map((bid) => (
                        <span
                          key={bid}
                          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800"
                          title={branchNameById.get(Number(bid)) || `Branch #${bid}`}
                        >
                          <span className="truncate max-w-[260px]">
                            {branchNameById.get(Number(bid)) || `Branch #${bid}`}
                          </span>
                          <button
                            type="button"
                            className="text-slate-500 hover:text-slate-800"
                            onClick={() => removeBranchId(bid)}
                            aria-label="Remove branch"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {!branchesLoading && form.branchIds.length === 0 && (
                <div className="text-xs text-rose-600">Select at least one branch.</div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-10 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 px-3 text-slate-500 hover:text-slate-700"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3l18 18M10.585 10.585A2 2 0 0 0 12 14a2 2 0 0 0 1.415-3.415M9.88 5.515A9.99 9.99 0 0 1 12 5c5.523 0 10 4.477 10 7-0 1.052-.485 2.053-1.339 2.97M6.16 6.16C4.09 7.263 2.61 8.96 2 12c0 2.523 4.477 7 10 7 1.228 0 2.403-.196 3.49-.557" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7C20.268 16.057 16.477 19 12 19S3.732 16.057 2.458 12Z" />
                        <circle cx="12" cy="12" r="3" strokeWidth="2" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700" htmlFor="confirmPassword">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  autoComplete="new-password"
                  required
                />
                {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                  <div className="text-xs text-rose-600">Passwords do not match.</div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !canSubmit}
              className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? "Creating…" : "Create user"}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Existing Users</div>
              <div className="text-xs text-slate-500 mt-1">{loading ? "Loading…" : `${users.length} users`}</div>
            </div>
            <button
              type="button"
              onClick={loadUsers}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              disabled={loading}
            >
              Refresh
            </button>
          </div>

          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="text-left font-medium px-4 py-3">Name</th>
                  <th className="text-left font-medium px-4 py-3">Email</th>
                  <th className="text-left font-medium px-4 py-3">Role</th>
                  <th className="text-left font-medium px-4 py-3">Branches</th>
                  <th className="text-left font-medium px-4 py-3">Status</th>
                  <th className="text-right font-medium px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-900">{u.name}</td>
                    <td className="px-4 py-3 text-slate-700">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700">
                        {u.role || "Staff"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {Array.isArray(u.branch_ids) && u.branch_ids.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {u.branch_ids.slice(0, 3).map((bid) => (
                            <span
                              key={bid}
                              className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-700"
                              title={branchNameById.get(Number(bid)) || `Branch #${bid}`}
                            >
                              {branchNameById.get(Number(bid)) || `#${bid}`}
                            </span>
                          ))}
                          {u.branch_ids.length > 3 && (
                            <span className="text-xs text-slate-500">+{u.branch_ids.length - 3} more</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                          u.is_active ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {u.is_active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {String(u.role || "").toLowerCase() === "admin" ? (
                        <span className="text-xs text-slate-400">—</span>
                      ) : (
                        <div className="relative inline-flex" data-user-actions-root>
                          <button
                            type="button"
                            onClick={() => setActionMenuUserId((cur) => (cur === u.id ? null : u.id))}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            aria-label="User actions"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6h.01M12 12h.01M12 18h.01" />
                            </svg>
                          </button>

                          {actionMenuUserId === u.id && (
                            <div className="absolute right-0 mt-2 w-40 rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden z-10">
                              <button
                                type="button"
                                onClick={() => openEdit(u)}
                                className="w-full px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16.862 3.487a2.1 2.1 0 012.97 2.97L7.5 18.79 3 21l2.21-4.5L16.862 3.487z" />
                                </svg>
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => confirmDelete(u)}
                                className="w-full px-3 py-2.5 text-sm text-rose-700 hover:bg-rose-50 flex items-center gap-2"
                              >
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-9 0l1 14h8l1-14" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && users.length === 0 && (
                  <tr>
                    <td className="px-4 py-6 text-slate-500" colSpan={6}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
