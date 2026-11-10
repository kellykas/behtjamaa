# BEHT JAMAA

Web app and PWA for BEHT JAMAA: branches, prayer requests, live events, donations and member portals.

## Stack

- Vite, React and TypeScript
- Tailwind CSS and shadcn/ui
- Supabase (database, auth, row-level security, Edge Functions)
- Vitest for tests

## Getting started

Requirements: Node.js 18+ and [Bun](https://bun.sh).

```sh
bun install --frozen-lockfile
# create .env with the Supabase values listed below
bun run dev
```

Environment variables (see `.env`, which is git-ignored):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

## Scripts

- `bun run dev`: start the dev server
- `bun run build`: production build into `dist/`
- `bunx vitest run`: run the test suite
- `bun run lint`: run ESLint

## Database

Migrations live in `supabase/migrations`. Check them against the live schema before relying on a change.
