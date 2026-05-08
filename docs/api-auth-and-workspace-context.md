# API authentication and workspace context

OpenGuardians API routes are protected by API-key authentication and workspace context enforcement.

## Public route

The health endpoint is public:

```bash
curl "$OPENGUARDIANS_API_URL/api/health"
```

## Protected routes

All other API routes require an API key.

Set one or more comma-separated keys in the API runtime environment:

```env
OPENGUARDIANS_API_KEYS=key_one,key_two
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

## Mismatch protection

If a request includes a workspace header/query context and a different `workspaceId` in the body, the API rejects the request before writing data:

```json
{
  "ok": false,
  "error": "WORKSPACE_CONTEXT_MISMATCH"
}
```

## Production posture

- Store `OPENGUARDIANS_API_KEYS` in a secret manager or Vercel/Azure environment secret store.
- Rotate keys by appending the new key, updating clients, then removing the old key.
- Prefer `x-workspace-id` for machine-to-machine calls so workspace scoping is explicit.
- Keep `DEFAULT_WORKSPACE_ID` only for single-workspace deployments or local development.
