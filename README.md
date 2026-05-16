# DevHub

DevHub is a full-stack developer social platform where developers build their public presence — showcasing projects, writing technical blog posts, and discovering others in the community.

## Live Link



## Features

- **Authentication** — Register & login with JWT-based auth (stored in localStorage)
- **Developer Profiles** — Bio, avatar, banner, skills, GitHub, website
- **Project Showcase** — Create/edit projects with tech stack tags, GitHub links, live demo links
- **Tech Blog** — Write and publish technical articles with categories and tags
- **Explore** — Discover developers filtered by skill, see trending tags and platform stats
- **Search** — Full-text search across developers, projects, and articles
- **Interactions** — Like and save projects and posts; view saved items in your bookmark collection

## Setup Instructions

### Prerequisites

- Node.js 24+
- pnpm 10+
- PostgreSQL database

### 1. Clone and install

```bash
pnpm install
```

### 2. Environment Variables

Create a `.env` file or set the following in your environment:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string (e.g. `postgresql://user:pass@host/db`) |
| `SESSION_SECRET` | Secret key used to sign JWTs (any long random string) |

### 3. Push the database schema

```bash
pnpm --filter @workspace/db run push
```

### 4. (Optional) Seed demo data

Run INSERT statements to seed users/projects/posts. Demo accounts use `password123`.

### 5. Run in development

```bash
# API server (port 5000 / $PORT)
pnpm --filter @workspace/api-server run dev

# Frontend (port auto-assigned via $PORT)
pnpm --filter @workspace/devhub run dev
```

### 6. Type-check & build

```bash
pnpm run typecheck
pnpm run build
```

## Database Schema

### `users`

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `email` | text unique | Login identifier |
| `username` | text unique | URL-safe handle |
| `passwordHash` | text | bcrypt hash |
| `displayName` | text | Optional friendly name |
| `bio` | text | Profile bio |
| `avatarUrl` | text | Profile image URL |
| `bannerUrl` | text | Profile banner URL |
| `githubUsername` | text | |
| `website` | text | |
| `skills` | text[] | Array of skill tags |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### `projects`

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `userId` | int FK→users | Owner |
| `title` | text | |
| `description` | text | |
| `techStack` | text[] | Array of tech tags |
| `githubUrl` | text | |
| `liveUrl` | text | |
| `imageUrl` | text | |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### `posts`

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `userId` | int FK→users | Author |
| `title` | text | |
| `content` | text | Markdown content |
| `tags` | text[] | |
| `category` | text | e.g. Backend, Frontend, AI/ML |
| `published` | boolean | Draft vs published |
| `createdAt` | timestamp | |
| `updatedAt` | timestamp | |

### `likes`

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `userId` | int FK→users | |
| `targetType` | text | `"project"` or `"post"` |
| `targetId` | int | ID of the liked item |
| `createdAt` | timestamp | |

Unique constraint on `(userId, targetType, targetId)`.

### `saves`

| Column | Type | Notes |
|---|---|---|
| `id` | serial PK | |
| `userId` | int FK→users | |
| `targetType` | text | `"project"` or `"post"` |
| `targetId` | int | ID of the saved item |
| `createdAt` | timestamp | |

Unique constraint on `(userId, targetType, targetId)`.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS v4, shadcn/ui, TanStack Query, Wouter |
| Backend | Express 5, Node.js 24, TypeScript |
| Database | PostgreSQL, Drizzle ORM |
| Auth | bcryptjs (hashing), jsonwebtoken (JWT) |
| API Contract | OpenAPI 3 spec → Orval codegen (typed hooks + Zod schemas) |
| Monorepo | pnpm workspaces |

## Demo Accounts

All accounts use password `password123`:

| Email | Username |
|---|---|
| alice@devhub.dev | alicedev |
| bob@devhub.dev | bobbuilds |
| carol@devhub.dev | carolcodes |
| dave@devhub.dev | davehacks |
| eva@devhub.dev | evarossi |
# minihackthonsprint
