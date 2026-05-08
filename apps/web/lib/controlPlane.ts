export interface WorkspaceApp {
  id: string;
  workspaceId: string;
  name: string;
  mode: 'production' | 'marketing' | 'automation';
  source: 'vercel' | 'external';
  url: string;
  healthPath?: string | null;
  status: 'active' | 'draft' | 'disabled';
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceAppsResponse {
  ok: boolean;
  workspaceId: string;
  mode?: WorkspaceApp['mode'];
  apps: WorkspaceApp[];
}

export function getControlPlaneConfig() {
  return {
    apiUrl: process.env.OPENGUARDIANS_API_URL,
    apiKey: process.env.OPENGUARDIANS_CONTROL_PLANE_API_KEY,
    workspaceId: process.env.OPENGUARDIANS_WEB_WORKSPACE_ID ?? process.env.DEFAULT_WORKSPACE_ID ?? 'default'
  };
}

export async function listWorkspaceApps() {
  const config = getControlPlaneConfig();

  if (!config.apiUrl || !config.apiKey) {
    return {
      configured: false as const,
      workspaceId: config.workspaceId,
      apps: [],
      error: 'OPENGUARDIANS_API_URL and OPENGUARDIANS_CONTROL_PLANE_API_KEY are required for live registry data.'
    };
  }

  const url = new URL('/api/workspace/apps', config.apiUrl);
  url.searchParams.set('workspaceId', config.workspaceId);

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'x-workspace-id': config.workspaceId
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    return {
      configured: true as const,
      workspaceId: config.workspaceId,
      apps: [],
      error: `Control plane API returned ${response.status}.`
    };
  }

  const data = (await response.json()) as WorkspaceAppsResponse;

  return {
    configured: true as const,
    workspaceId: data.workspaceId,
    apps: data.apps,
    error: undefined
  };
}
