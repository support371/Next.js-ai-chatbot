# Database rollout

The workspace app registry is backed by Prisma and PostgreSQL.

## Required environment

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
DEFAULT_WORKSPACE_ID=gem-workspace
```

## Local setup

```bash
npm install
npm run db:generate
npm run db:migrate
npm run dev:api
```

## Production rollout

1. Provision a managed PostgreSQL database.
2. Store `DATABASE_URL` in the API runtime environment or secret vault.
3. Run Prisma migration against the production database during release.
4. Deploy the API service.
5. Register completed Vercel apps through `/api/workspace/apps` or `/api/workspace/apps/bulk`.

## Data model

`WorkspaceApp` persists:

- workspace ownership
- mode: `production`, `marketing`, or `automation`
- source: `vercel` or `external`
- canonical service URL
- optional Vercel project/deployment metadata
- optional health path
- lifecycle status
- timestamps

## Operational note

The API contract stayed stable while the backend moved from in-memory storage to durable persistence. Existing callers can continue using the same payloads.
