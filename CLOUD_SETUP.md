# Deploy guide — Vercel (frontend) + Railway (backend) + Neon + Redis
# Temporal stays OFF (`DISABLE_TEMPORAL=true`)

## Architecture

```
Browser → Vercel (Next.js frontend, this fork)
              ↓ NEXT_PUBLIC_BACKEND_URL
         Railway (NestJS backend, this fork)
              ├── Neon Postgres (DATABASE_URL)
              └── Redis (REDIS_URL)  ← your redis.io
```

No Temporal for now. Scheduled posting won’t work until you turn it back on.

---

## 0. Before anything

1. Push **this** `postiz-app` folder to **your** GitHub repo (fork/private).
2. Paste your Neon URI into Railway vars (local `.env` still has a placeholder — that’s OK if Railway has the real value).
3. Have your Redis `rediss://...` URL ready.

---

## 1. Vercel — frontend

**Easiest (recommended for this repo): Root Directory = `.` (repo root)**  
Root `vercel.json` builds the frontend and copies `.next` to the repo root so Vercel finds it.

1. Import `yousufSadeqi/positz`  
2. **Root Directory:** leave empty / `.`  
3. **Output Directory:** leave **blank**  
4. Add env vars from `.env.vercel.example`  
5. Push latest code and deploy  

**Alternative:** Root Directory = `apps/frontend` (then `apps/frontend/vercel.json` is used instead).

### If you see “.next was not found at /vercel/path0/.next”

1. Output Directory must be **blank**  
2. Root Directory = `.` (use root `vercel.json`) **or** `apps/frontend`  
3. Make sure latest commit includes root `vercel.json` (the one that `cp -R apps/frontend/.next .next`)  
4. Redeploy

---

## 2. Railway — backend (this fork, no Temporal)

1. https://railway.app → **New Project** → **Deploy from GitHub** → same repo  
2. Railway reads `railway.toml` (Nixpacks, builds backend only)  
3. Add **all** vars from `.env.railway.example`  
4. Important:

```env
DATABASE_URL=           # Neon URI with ?sslmode=require
REDIS_URL=              # rediss://... from redis.io
DISABLE_TEMPORAL=true
SKIP_AUTH=true
NEXT_PUBLIC_SKIP_AUTH=true
NOT_SECURED=true
FRONTEND_URL=https://YOUR.vercel.app
MAIN_URL=https://YOUR.vercel.app
NEXT_PUBLIC_BACKEND_URL=https://YOUR.up.railway.app
JWT_SECRET=             # same long secret as Vercel
IS_GENERAL=true
RUN_CRON=false
```

5. Generate a public domain for the service (Settings → Networking)  
6. Redeploy  

---

## 3. Wire the two together

On **Vercel**, set:

```env
NEXT_PUBLIC_BACKEND_URL=https://YOUR.up.railway.app
BACKEND_INTERNAL_URL=https://YOUR.up.railway.app
FRONTEND_URL=https://YOUR.vercel.app
MAIN_URL=https://YOUR.vercel.app
```

Redeploy Vercel (required — `NEXT_PUBLIC_*` is baked in at build time).

---

## 4. First-time DB

Railway start runs `prisma-db-push` against Neon automatically.

Open the Vercel URL → `/launches` (auth skipped).  
API calls go to Railway. If Neon is empty and `SKIP_AUTH` needs a user later, register once with `SKIP_AUTH=false`, then turn it back on — or keep guest UI until backend user exists.

---

## Checklist

| Item | Where |
|---|---|
| Neon `DATABASE_URL` | Railway |
| Redis `REDIS_URL` | Railway |
| `DISABLE_TEMPORAL=true` | Railway |
| `SKIP_AUTH` / `NEXT_PUBLIC_SKIP_AUTH` | Vercel + Railway |
| `FRONTEND_URL` / `MAIN_URL` | both = Vercel URL |
| `NEXT_PUBLIC_BACKEND_URL` | both = Railway URL |
| Same `JWT_SECRET` | both |

---

## Not ready / later

- Temporal / scheduled posts  
- Your custom auth (turn `SKIP_AUTH=false` when ready)  
- Social provider API keys  
- Cloudflare R2 (optional; local storage is fine on Railway `/tmp` for testing only — use a volume or R2 for real uploads)
