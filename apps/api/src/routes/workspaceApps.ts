import { Router } from 'express';
import { z } from 'zod';

import {
  getWorkspaceApp,
  listWorkspaceApps,
  registerWorkspaceApp,
  type WorkspaceAppMode
} from '../services/appRegistry.js';

export const workspaceAppsRouter = Router();

const modeSchema = z.enum(['production', 'marketing', 'automation']);

const registerAppSchema = z.object({
  workspaceId: z.string().trim().min(1).default(process.env.DEFAULT_WORKSPACE_ID ?? 'default'),
  name: z.string().trim().min(1).max(120),
  mode: modeSchema,
  source: z.enum(['vercel', 'external']).default('vercel'),
  url: z.string().trim().url(),
  vercelProjectId: z.string().trim().min(1).optional(),
  vercelDeploymentUrl: z.string().trim().url().optional(),
  healthPath: z.string().trim().startsWith('/').optional(),
  description: z.string().trim().max(500).optional(),
  status: z.enum(['active', 'draft', 'disabled']).default('active')
});

const bulkImportSchema = z.object({
  workspaceId: z.string().trim().min(1).default(process.env.DEFAULT_WORKSPACE_ID ?? 'default'),
  apps: z.array(registerAppSchema.omit({ workspaceId: true })).min(1).max(50)
});

workspaceAppsRouter.get('/', (req, res) => {
  const workspaceId = String(req.query.workspaceId ?? process.env.DEFAULT_WORKSPACE_ID ?? 'default');
  const modeResult = req.query.mode ? modeSchema.safeParse(req.query.mode) : undefined;

  if (modeResult && !modeResult.success) {
    return res.status(400).json({
      ok: false,
      error: 'INVALID_WORKSPACE_APP_MODE',
      allowedModes: modeSchema.options
    });
  }

  const mode = modeResult?.data;

  return res.status(200).json({
    ok: true,
    workspaceId,
    mode,
    apps: listWorkspaceApps(workspaceId, mode as WorkspaceAppMode | undefined)
  });
});

workspaceAppsRouter.post('/', (req, res) => {
  const parsed = registerAppSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: 'INVALID_WORKSPACE_APP',
      issues: parsed.error.flatten()
    });
  }

  const app = registerWorkspaceApp(parsed.data);

  return res.status(201).json({
    ok: true,
    app
  });
});

workspaceAppsRouter.post('/bulk', (req, res) => {
  const parsed = bulkImportSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: 'INVALID_WORKSPACE_APP_BULK_IMPORT',
      issues: parsed.error.flatten()
    });
  }

  const importedApps = parsed.data.apps.map((app) =>
    registerWorkspaceApp({
      ...app,
      workspaceId: parsed.data.workspaceId
    })
  );

  return res.status(201).json({
    ok: true,
    workspaceId: parsed.data.workspaceId,
    count: importedApps.length,
    apps: importedApps
  });
});

workspaceAppsRouter.get('/:appId', (req, res) => {
  const workspaceId = String(req.query.workspaceId ?? process.env.DEFAULT_WORKSPACE_ID ?? 'default');
  const app = getWorkspaceApp(workspaceId, req.params.appId);

  if (!app) {
    return res.status(404).json({
      ok: false,
      error: 'WORKSPACE_APP_NOT_FOUND'
    });
  }

  return res.status(200).json({
    ok: true,
    app
  });
});
