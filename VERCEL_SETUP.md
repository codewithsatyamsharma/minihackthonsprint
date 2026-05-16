# Quick Setup Guide

## 🚀 Vercel Environment Setup

Your project has been configured with environment variables. Follow these steps:

### 1. PostgreSQL Database
You need a PostgreSQL database. Choose one:

**Option A: Vercel Postgres** (Recommended)
- [Create Vercel Postgres DB](https://vercel.com/docs/storage/vercel-postgres/quickstart)
- Copy the connection string to your DATABASE_URL

**Option B: External Database**
- Supabase: https://supabase.com
- Railway: https://railway.app
- AWS RDS
- Your own server

### 2. Set Environment Variables in Vercel

```bash
# Method 1: Using Vercel CLI
vercel env add DATABASE_URL
vercel env add SESSION_SECRET
vercel env add NODE_ENV

# Method 2: Dashboard
# 1. Go to https://vercel.com/dashboard
# 2. Select your project
# 3. Settings → Environment Variables
# 4. Add the following:
```

**Variables to add:**

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/devhub` |
| `SESSION_SECRET` | `b12cc8a20d1fe17331d4df9467477cd15107fe9b2d7e4b5db9a352b6baa255f7` |
| `NODE_ENV` | `production` |

### 3. Deploy

- Push to GitHub: `git push`
- Vercel automatically deploys

### 4. Verify

Check logs:
```bash
vercel logs --follow
```

## 📋 Current Configuration

✅ **Generated SESSION_SECRET**: 
```
b12cc8a20d1fe17331d4df9467477cd15107fe9b2d7e4b5db9a352b6baa255f7
```

✅ **API Endpoint** (after deploy):
```
https://minihackthonsprint.vercel.app/api
```

✅ **Frontend** (if deployed):
```
https://minihackthonsprint.vercel.app
```

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Environment Variables Guide](https://vercel.com/docs/environment-variables)
