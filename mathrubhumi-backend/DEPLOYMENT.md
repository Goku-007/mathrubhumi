# Mathrubhumi Backend - Deployment Guide

## Quick Start (Development)

```bash
cd mathrubhumi-backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
python manage.py migrate

# Start development server
python manage.py runserver
```

---

## Production Deployment

### 1. Environment Configuration

Create `.env` with production values:

```bash
# Required - generate a unique key
DJANGO_SECRET_KEY=your-unique-secret-key

# Must be false in production
DJANGO_DEBUG=false

# Your domain(s)
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DB_NAME=mathrubhumi
DB_USER=db_user
DB_PASSWORD=strong_password
DB_HOST=your-db-host
DB_PORT=5432

# Frontend origins (for CORS)
DJANGO_CORS_ALLOWED_ORIGINS=https://yourdomain.com
DJANGO_CSRF_TRUSTED_ORIGINS=https://yourdomain.com

# If behind reverse proxy (nginx, etc.)
DJANGO_SECURE_PROXY_SSL_HEADER=true
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Collect Static Files

```bash
python manage.py collectstatic --noinput
```

### 4. Run Migrations

```bash
python manage.py migrate
```

### 5. Start Gunicorn

```bash
gunicorn backend.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 4 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
```

---

## Health Checks

| Endpoint | Purpose |
|----------|---------|
| `GET /health/` | Application health + DB connectivity |
| `GET /ready/` | Kubernetes-style readiness probe |

---

## Nginx Configuration (Example)

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## Pre-Deployment Checklist

- [ ] `DJANGO_DEBUG=false`
- [ ] `DJANGO_SECRET_KEY` is unique and secure
- [ ] `ALLOWED_HOSTS` contains your domain
- [ ] Database uses strong password
- [ ] SSL certificate is configured
- [ ] Firewall blocks direct DB access
- [ ] Static files collected
- [ ] Migrations applied
