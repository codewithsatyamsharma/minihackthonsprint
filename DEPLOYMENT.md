# Deployment Guide

## Vercel Deployment

### Prerequisites
- PostgreSQL database
- Vercel account

### Environment Variables

Set these in your Vercel project settings:

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/devhub` |
| `SESSION_SECRET` | Secret key for JWT signing | Generate a random string (min 32 chars) |
| `NODE_ENV` | Environment mode | `production` |

### Steps

1. **Connect GitHub Repository**
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
