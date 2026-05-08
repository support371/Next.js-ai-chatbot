export type WorkspaceAppMode = 'production' | 'marketing' | 'automation';

export type WorkspaceAppSource = 'vercel' | 'external';

export type WorkspaceAppStatus = 'active' | 'draft' | 'disabled';

export interface WorkspaceApp {
  id: string;
  workspaceId: string;
  name: string;
  mode: WorkspaceAppMode;
  source: WorkspaceAppSource;
  url: string;
  vercelProjectId?: string;
  vercelDeploymentUrl?: string;
  healthPath?: string;
  description?: string;
  status: WorkspaceAppStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWorkspaceAppInput {
  workspaceId: string;
  name: string;
  mode: WorkspaceAppMode;
  source: WorkspaceAppSource;
  url: string;
  vercelProjectId?: string;
  vercelDeploymentUrl?: string;
  healthPath?: string;
  description?: string;
  status?: WorkspaceAppStatus;
}

const apps = new Map<string, WorkspaceApp>();

function createId(input: CreateWorkspaceAppInput) {
  const slug = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);

  return `${input.workspaceId}:${input.mode}:${slug || crypto.randomUUID()}`;
}

export function registerWorkspaceApp(input: CreateWorkspaceAppInput) {
  const now = new Date().toISOString();
  const id = createId(input);
  const existing = apps.get(id);

  const app: WorkspaceApp = {
    ...existing,
    id,
    workspaceId: input.workspaceId,
    name: input.name,
    mode: input.mode,
    source: input.source,
    url: input.url,
    vercelProjectId: input.vercelProjectId,
    vercelDeploymentUrl: input.vercelDeploymentUrl,
    healthPath: input.healthPath,
    description: input.description,
    status: input.status ?? existing?.status ?? 'active',
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  };

  apps.set(id, app);
  return app;
}

export function listWorkspaceApps(workspaceId: string, mode?: WorkspaceAppMode) {
  return [...apps.values()].filter((app) => {
    if (app.workspaceId !== workspaceId) return false;
    if (mode && app.mode !== mode) return false;
    return true;
  });
}

export function getWorkspaceApp(workspaceId: string, appId: string) {
  const app = apps.get(appId);

  if (!app || app.workspaceId !== workspaceId) {
    return undefined;
  }

  return app;
}
