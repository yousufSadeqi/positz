# Your Postiz cloud setup checklist

Goal: no heavy local Docker images. Neon + Upstash + Temporal Cloud hold the data/scheduler; Railway runs Postiz; Vercel is optional for the frontend later.

## A. Create accounts & paste into `.env`

### 1. Neon (database)
1. https://console.neon.tech → New project
2. Copy **Connection string** (URI, include `?sslmode=require`)
3. Paste into `DATABASE_URL`

### 2. Upstash (Redis)
1. https://console.upstash.com → Create Redis database
2. Copy **Redis URL** (`rediss://...`)
3. Paste into `REDIS_URL`

### 3. Temporal Cloud (scheduling)
1. https://cloud.temporal.io → create namespace
2. Copy **Address** → `TEMPORAL_ADDRESS` (ends with `:7233`)
3. Copy **Namespace** → `TEMPORAL_NAMESPACE`
4. Create **API Key** → `TEMPORAL_API_KEY`
5. Keep `TEMPORAL_TLS=true`

### 4. JWT
Already set in `.env` (`JWT_SECRET`). Do not share it.

---

## B. Deploy on Railway (required — runs the app)

1. Push this repo to **your** GitHub (fork), or connect the local folder in Railway
2. https://railway.app → **New Project** → **Deploy from GitHub**
3. Railway will use `deploy/Dockerfile` + `railway.toml`
4. In the Postiz service → **Variables**, paste every filled value from `.env`
5. **Settings → Networking → Public Networking → Port `5000`**
6. Copy the public URL, e.g. `https://postiz-production-xxxx.up.railway.app`
7. Update these vars (in Railway **and** in local `.env`):

```env
MAIN_URL="https://YOUR_RAILWAY_URL"
FRONTEND_URL="https://YOUR_RAILWAY_URL"
NEXT_PUBLIC_BACKEND_URL="https://YOUR_RAILWAY_URL/api"
```

8. Redeploy, open the Railway URL, create your account

At this point Postiz is usable. **Vercel is optional.**

---

## C. Vercel (optional — frontend only)

Only do this if you want the UI on Vercel and API on Railway.

1. https://vercel.com → Import the same GitHub repo
2. Set Root to repo root (uses `vercel.json`)
3. Env vars on Vercel (frontend needs these at build time):

```env
FRONTEND_URL=https://YOUR_VERCEL_URL
MAIN_URL=https://YOUR_VERCEL_URL
NEXT_PUBLIC_BACKEND_URL=https://YOUR_RAILWAY_URL/api
BACKEND_INTERNAL_URL=https://YOUR_RAILWAY_URL/api
IS_GENERAL=true
JWT_SECRET=same-as-railway
```

4. Then on Railway update:

```env
FRONTEND_URL=https://YOUR_VERCEL_URL
MAIN_URL=https://YOUR_VERCEL_URL
```

---

## D. After first login

Set on Railway:

```env
DISABLE_REGISTRATION=true
```

---

## What you do NOT need on your PC

- postiz-postgres
- postiz-redis
- temporal / temporal-postgresql / temporal-elasticsearch / temporal-ui

Those are replaced by Neon, Upstash, and Temporal Cloud.
