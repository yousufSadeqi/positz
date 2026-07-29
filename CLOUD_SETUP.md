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

1. https://vercel.com → **Add New Project** → import your GitHub repo  
2. **Root Directory:** set to `apps/frontend` (required — do not leave as `.`)  
3. Framework Preset: **Next.js**  
4. **Output Directory:** leave **empty** / default (do not set `.next` or `apps/frontend/.next`)  
5. Install/Build come from `apps/frontend/vercel.json`  
6. Add env vars from `.env.vercel.example`  
7. Deploy  

After first deploy you get `https://….vercel.app`.

**Then** set / update:

```env
FRONTEND_URL=https://YOUR.vercel.app
MAIN_URL=https://YOUR.vercel.app
```

You still need Railway URL for `NEXT_PUBLIC_BACKEND_URL` — redeploy frontend after Railway is live.

### If you see “Routes Manifest Could Not Be Found”

Vercel Root Directory is wrong. Fix:

1. Project → **Settings → General → Root Directory** → `apps/frontend`  
2. **Settings → Build & Development → Output Directory** → clear it (blank)  
3. Redeploy

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
