# Vercel control plane deployment

This repository can serve as the OpenGuardians control plane while importing completed apps that are already deployed to Vercel.

## Recommended Vercel project layout

Create or link the Vercel project to the monorepo with:

- Root Directory: `apps/web`
- Framework Preset: Next.js
- Install Command: `npm install`
- Build Command: `npm run build --workspace apps/web`
- Development Command: `npm run dev --workspace apps/web`

The API service currently runs as an Express app under `apps/api`. Deploy it as a separate service/container or adapt it into Next.js route handlers before hosting it on the same Vercel project.

## Runtime environment

Configure these variables in the API runtime environment:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DEFAULT_WORKSPACE_ID=gem-workspace
CORS_ORIGIN=https://your-control-plane-domain.com
JSON_BODY_LIMIT=2mb
RATE_LIMIT_PER_MINUTE=60
APP_HEALTH_TIMEOUT_MS=5000
```

## Database release flow

```bash
npm install
npm run db:generate
npm run db:deploy
npm run build
```

Run `db:deploy` against production only after `DATABASE_URL` points at the managed production PostgreSQL database.

## Importing completed Vercel apps

Use the workspace app registry API to register any existing Vercel app:

- `production` for live business/admin apps
- `marketing` for campaign or public-facing marketing surfaces
- `automation` for operational workflows, cron dashboards, and worker tools

The control plane stores the app URL, optional Vercel project ID, optional deployment URL, health path, status, and workspace ownership metadata in PostgreSQL.

## Operating model

1. Deploy each completed app to Vercel as its own project.
2. Confirm its production domain and health endpoint.
3. Run database migrations for the control-plane API.
4. Register the app through `/api/workspace/apps` or `/api/workspace/apps/bulk`.
5. Use `/launch` to serve users into the right app.
6. Use `/health` to probe service availability.
7. Use the dashboard to display service mode and app ownership.
