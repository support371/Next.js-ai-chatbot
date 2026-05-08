# API authentication and workspace context

OpenGuardians API routes are protected by API-key authentication, workspace context enforcement, and route-level scopes.

## Public route

The health endpoint is public:

```bash
curl "$OPENGUARDIANS_API_URL/api/health"
```

## Protected routes

All other API routes require an API key.

Legacy simple-key format:

```env
OPENGUARDIANS_API_KEYS=key_one,key_two
```

Preferred scoped-key format:

```env
OPENGUARDIANS_API_KEY_CONFIG_JSON=[{"name":"admin","key":"key_one","role":"admin","scopes":["*"],"workspaces":["*"]}]
```

Call protected routes with either header format:

```bash
curl "$OPENGUARDIANS_API_URL/api/workspace/apps" \
  -H "Authorization: Bearer key_one" \
  -H "x-workspace-id: gem-workspace"
```

or:

```bash
curl "$OPENGUARDIANS_API_URL/api/workspace/apps" \
  -H "x-api-key: key_one" \
  -H "x-workspace-id: gem-workspace"
```

## Roles

| Role | Intent |
| --- | --- |
| `admin` | Full operational control. |
| `operator` | Day-to-day app operations and app onboarding. |
| `viewer` | Read-only control-plane visibility. |

## Supported scopes

| Scope | Permission |
| --- | --- |
| `*` | All scopes. |
| `apps:*` | All workspace app registry operations. |
| `apps:read` | List/read registered apps. |
| `apps:write` | Register or bulk-import apps. |
| `apps:launch` | Resolve or redirect into active apps. |
| `apps:health` | Probe app health endpoints. |
| `ai:invoke` | Invoke AI intelligence route. |
| `social:read` | Read social account/post stubs. |
| `social:write` | Create social post drafts. |

## Delegated key examples

Read-only marketing key:

```json
[
  {
    "name": "marketing-viewer",
    "key": "replace_me",
    "role": "viewer",
    "scopes": ["apps:read", "apps:launch"],
    "workspaces": ["gem-workspace"]
  }
]
```

Automation operator key:

```json
[
  {
    "name": "automation-operator",
    "key": "replace_me",
    "role": "operator",
    "scopes": ["apps:read", "apps:write", "apps:health"],
    "workspaces": ["gem-workspace"]
  }
]
```

Platform admin key:

```json
[
  {
    "name": "platform-admin",
    "key": "replace_me",
    "role": "admin",
    "scopes": ["*"],
    "workspaces": ["*"]
  }
]
```

## Workspace resolution order

The API resolves workspace context in this order:

1. `x-workspace-id` header
2. `workspaceId` query parameter
3. `workspaceId` request body field
4. `DEFAULT_WORKSPACE_ID` environment variable

If no workspace context is available, protected routes return:

```json
{
  "ok": false,
  "error": "WORKSPACE_ID_REQUIRED"
}
```

If a key is not allowed for the resolved workspace, protected routes return:

```json
{
  "ok": false,
  "error": "WORKSPACE_ACCESS_DENIED"
}
```

## Mismatch protection

If a request includes a workspace header/query context and a different `workspaceId` in the body, the API rejects the request before writing data:

```json
{
  "ok": false,
  "error": "WORKSPACE_CONTEXT_MISMATCH"
}
```

## Production posture

- Store API key configuration in a secret manager or Vercel/Azure environment secret store.
- Rotate keys by adding the new scoped key, updating clients, then removing the old key.
- Prefer `x-workspace-id` for machine-to-machine calls so workspace scoping is explicit.
- Keep `DEFAULT_WORKSPACE_ID` only for single-workspace deployments or local development.
- Use scoped keys for app-specific integrations instead of sharing a platform admin key.
