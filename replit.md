# DevHub

A full-stack developer social platform where developers build their public presence — showcasing projects, writing technical blog posts, and discovering others in the community.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/devhub run dev` — run the frontend (port auto via $PORT)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — JWT signing secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19, Vite, Tailwind CSS v4, shadcn/ui, TanStack Query v5, Wouter (routing)
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Auth: bcryptjs (password hashing) + jsonwebtoken (JWT in localStorage as `devhub_token`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for all API contracts)
- `lib/api-client-react/src/generated/` — Generated React Query hooks and Zod schemas
- `lib/db/src/schema/` — Drizzle ORM table definitions (users, projects, posts, likes, saves)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, users, projects, posts, interactions, search, stats)
- `artifacts/devhub/src/pages/` — React page components
- `artifacts/devhub/src/contexts/AuthContext.tsx` — Auth state (token + user)
- `artifacts/devhub/src/lib/auth.ts` — JWT injection via setAuthTokenGetter

## Architecture decisions

- Contract-first API: OpenAPI spec written manually, then Orval generates typed React Query hooks + Zod schemas. Server validates inputs using the same Zod schemas.
- JWT in localStorage (not cookies) — simpler for a Vite SPA, no CORS/cookie complexity.
- No ORM in route handlers — Drizzle ORM used directly with explicit queries for transparency.
- Dark-mode-first UI: `dark` class applied on the Layout root, not via OS preference detection.
- Monorepo with shared `lib/db` and `lib/api-client-react` — both backend and frontend share one source of truth.

## Product

DevHub is a developer portfolio and community platform:
- **Profiles**: username, bio, avatar, banner, GitHub link, skills tags
- **Projects**: tech stack showcase with GitHub/live URLs, likes and saves
- **Blog**: technical articles with categories, tags, likes and saves
- **Explore**: discover developers by skill, see trending tags and platform stats
- **Search**: full-text search across developers, projects, and articles
- **Interactions**: like and bookmark projects/posts; view all saves in one place

## Demo Accounts (password: `password123`)

- alice@devhub.dev / alicedev — full-stack / TypeScript
- bob@devhub.dev / bobbuilds — Rust / systems
- carol@devhub.dev / carolcodes — Python / AI/ML
- dave@devhub.dev / davehacks — Go / security
- eva@devhub.dev / evarossi — React / design

## User preferences

- Dark indigo/cyan color scheme: background `230 40% 7%`, primary `190 100% 45%`
- Fonts: Plus Jakarta Sans (sans), Space Mono (mono)
- All pages use the Layout wrapper for consistent dark background

## Gotchas

- Import `setAuthTokenGetter` from `@workspace/api-client-react` (the main entry), NOT from the internal `/src/custom-fetch` path — that subpath is not in the package exports.
- Auth token is injected globally via `lib/auth.ts` which calls `setAuthTokenGetter` at module load time — import this file in `App.tsx` before any API calls happen.
- The `dark` class must be on the Layout root div for all pages to render in dark mode. Standalone pages (login/register) must add `dark` class to their own root div.
- Run `pnpm --filter @workspace/db run push` after any schema changes before running the server.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- See `README.md` for the full setup guide and database schema documentation
