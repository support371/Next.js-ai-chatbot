# Workspace app onboarding

OpenGuardians can register completed apps under a workspace and classify each app by operating mode.

## Supported modes

| Mode | Purpose |
| --- | --- |
| `production` | Customer-facing or internal production applications that must be treated as live services. |
| `marketing` | Landing pages, campaign apps, content hubs, SEO surfaces, and lead-generation apps. |
| `automation` | Worker dashboards, cron consoles, operational tools, and system automation apps. |

## Register one app

```bash
curl -X POST "$OPENGUARDIANS_API_URL/api/workspace/apps" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "gem-workspace",
    "name": "Admin Console",
    "mode": "production",
    "source": "vercel",
    "url": "https://admin.example.com",
    "vercelProjectId": "prj_xxxxx",
    "vercelDeploymentUrl": "https://admin-console.vercel.app",
    "healthPath": "/api/health",
    "description": "Primary admin app for workspace operations",
    "status": "active"
  }'
```

## Bulk import completed apps

```bash
curl -X POST "$OPENGUARDIANS_API_URL/api/workspace/apps/bulk" \
  -H "Content-Type: application/json" \
  -d '{
    "workspaceId": "gem-workspace",
    "apps": [
      {
        "name": "Admin Console",
        "mode": "production",
        "source": "vercel",
        "url": "https://admin.example.com",
        "vercelProjectId": "prj_admin",
        "healthPath": "/api/health"
      },
      {
        "name": "Marketing Site",
        "mode": "marketing",
        "source": "vercel",
        "url": "https://www.example.com",
        "vercelProjectId": "prj_marketing"
      },
      {
        "name": "Automation Hub",
        "mode": "automation",
        "source": "vercel",
        "url": "https://automation.example.com",
        "vercelProjectId": "prj_automation",
        "healthPath": "/api/health"
      }
    ]
  }'
```

## List workspace apps

```bash
curl "$OPENGUARDIANS_API_URL/api/workspace/apps?workspaceId=gem-workspace"
```

## Filter by mode

```bash
curl "$OPENGUARDIANS_API_URL/api/workspace/apps?workspaceId=gem-workspace&mode=production"
curl "$OPENGUARDIANS_API_URL/api/workspace/apps?workspaceId=gem-workspace&mode=marketing"
curl "$OPENGUARDIANS_API_URL/api/workspace/apps?workspaceId=gem-workspace&mode=automation"
```

## Production handoff requirements

Before an imported app is marked `active`, confirm:

1. The Vercel production domain resolves correctly.
2. Required environment variables are configured in Vercel.
3. The app has a health endpoint where possible.
4. Ownership, repository, and deployment source are known.
5. Secrets remain in Vercel or a vault, not in GitHub.

## Persistence note

The first implementation uses an in-memory registry to unblock API/UI integration. Replace `apps/api/src/services/appRegistry.ts` with Prisma-backed persistence before production rollout.
