# Deployment Guide

## Vercel Deployment

### Quick Start
See [VERCEL_SETUP.md](./VERCEL_SETUP.md) for detailed setup instructions.

### Prerequisites
- PostgreSQL database (Vercel Postgres, Supabase, Railway, etc.)
- Vercel account

### Environment Variables

**Pre-configured values:**
- `SESSION_SECRET`: `b12cc8a20d1fe17331d4df9467477cd15107fe9b2d7e4b5db9a352b6baa255f7`
- `NODE_ENV`: `production`

**You must provide:**
- `DATABASE_URL`: Your PostgreSQL connection string

### Steps

1. **Set up PostgreSQL Database** (Choose one)
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository: `codewithsatyamsharma/minihackthonsprint`

2. **Set Environment Variables**
   - Project Settings → Environment Variables
   - Add the variables from the table above

3. **Deploy**
   - Vercel will automatically detect changes from GitHub
   - Build and deploy happens automatically on push

4. **Database Setup**
   - Ensure your PostgreSQL database is accessible from Vercel
   - Consider using: [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres), [Supabase](https://supabase.com), or [Railway](https://railway.app)
   - Run migrations in the connected database

### API Endpoint
- Your API will be available at: `https://your-project.vercel.app/api`

## Local Development

1. Copy `.env.example` to `.env`
2. Update the variables with your local values
3. Run `pnpm install`
4. Run `pnpm --filter @workspace/api-server run dev`
5. Run `pnpm --filter @workspace/devhub run dev`

## Troubleshooting

### 500 Error
- Check that `DATABASE_URL` is set correctly
- Verify your database is accessible from Vercel
- Check function logs in Vercel dashboard

### Build Fails
- Ensure all environment variables are set
- Run `pnpm install --no-frozen-lockfile` locally to update lockfile
- Push changes to GitHub and redeploy
