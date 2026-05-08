import { prisma } from '@openguardians/db';

export type WorkspaceAppMode = 'production' | 'marketing' | 'automation';

export type WorkspaceAppSource = 'vercel' | 'external';

export type WorkspaceAppStatus = 'active' | 'draft' | 'disabled';

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

export interface UpdateWorkspaceAppInput {
  url?: string;
  vercelProjectId?: string | null;
  vercelDeploymentUrl?: string | null;
  healthPath?: string | null;
  description?: string | null;
  status?: WorkspaceAppStatus;
}

function createId(input: CreateWorkspaceAppInput) {
  const slug = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 48);

  return `${input.workspaceId}:${input.mode}:${slug}`;
}

export async function registerWorkspaceApp(input: CreateWorkspaceAppInput) {
  return prisma.workspaceApp.upsert({
    where: {
      workspaceId_mode_name: {
        workspaceId: input.workspaceId,
        mode: input.mode,
        name: input.name
      }
    },
    create: {
      id: createId(input),
      workspaceId: input.workspaceId,
      name: input.name,
      mode: input.mode,
      source: input.source,
      url: input.url,
      vercelProjectId: input.vercelProjectId,
      vercelDeploymentUrl: input.vercelDeploymentUrl,
      healthPath: input.healthPath,
      description: input.description,
      status: input.status ?? 'active'
    },
    update: {
      source: input.source,
      url: input.url,
      vercelProjectId: input.vercelProjectId,
      vercelDeploymentUrl: input.vercelDeploymentUrl,
      healthPath: input.healthPath,
      description: input.description,
      status: input.status ?? 'active'
    }
  });
}

export async function updateWorkspaceApp(workspaceId: string, appId: string, input: UpdateWorkspaceAppInput) {
  const existing = await getWorkspaceApp(workspaceId, appId);

  if (!existing) {
    return undefined;
  }

  return prisma.workspaceApp.update({
    where: {
      id: appId
    },
    data: input
  });
}

export async function listWorkspaceApps(workspaceId: string, mode?: WorkspaceAppMode) {
  return prisma.workspaceApp.findMany({
    where: {
      workspaceId,
      ...(mode ? { mode } : {})
    },
    orderBy: [
      { mode: 'asc' },
      { name: 'asc' }
    ]
  });
}

export async function getWorkspaceApp(workspaceId: string, appId: string) {
  return prisma.workspaceApp.findFirst({
    where: {
      workspaceId,
      id: appId
    }
  });
}
