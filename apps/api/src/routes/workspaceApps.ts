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
  workspaceId: z.string().trim().min(1).optional(),
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
  workspaceId: z.string().trim().min(1).optional(),
  apps: z.array(registerAppSchema.omit({ workspaceId: true })).min(1).max(50)
});

function requireRouteWorkspaceId(req: Express.Request) {
  if (!req.workspaceId) {
    throw new Error('Workspace context was not initialized.');
  }

  return req.workspaceId;
}

function ensureBodyWorkspaceMatchesContext(bodyWorkspaceId: string | undefined, contextWorkspaceId: string) {
  if (bodyWorkspaceId && bodyWorkspaceId !== contextWorkspaceId) {
    return false;
  }

  return true;
}

function buildHealthUrl(app: { url: string; healthPath: string | null }) {
  return new URL(app.healthPath ?? '/', app.url).toString();
}

workspaceAppsRouter.get('/', async (req, res, next) => {
  try {
    const workspaceId = requireRouteWorkspaceId(req);
    const modeResult = req.query.mode ? modeSchema.safeParse(req.query.mode) : undefined;

    if (modeResult && !modeResult.success) {
      return res.status(400).json({
        ok: false,
        error: 'INVALID_WORKSPACE_APP_MODE',
        allowedModes: modeSchema.options
      });
    }

    const mode = modeResult?.data;
    const apps = await listWorkspaceApps(workspaceId, mode as WorkspaceAppMode | undefined);

    return res.status(200).json({
      ok: true,
      workspaceId,
      mode,
      apps
    });
  } catch (error) {
    return next(error);
  }
});

workspaceAppsRouter.post('/', async (req, res, next) => {
  try {
    const workspaceId = requireRouteWorkspaceId(req);
    const parsed = registerAppSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        error: 'INVALID_WORKSPACE_APP',
        issues: parsed.error.flatten()
      });
    }

    if (!ensureBodyWorkspaceMatchesContext(parsed.data.workspaceId, workspaceId)) {
      return res.status(409).json({
        ok: false,
        error: 'WORKSPACE_CONTEXT_MISMATCH'
      });
    }

    const app = await registerWorkspaceApp({
      ...parsed.data,
      workspaceId
    });

    return res.status(201).json({
      ok: true,
      app
    });
  } catch (error) {
    return next(error);
  }
});

workspaceAppsRouter.post('/bulk', async (req, res, next) => {
  try {
    const workspaceId = requireRouteWorkspaceId(req);
    const parsed = bulkImportSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        error: 'INVALID_WORKSPACE_APP_BULK_IMPORT',
        issues: parsed.error.flatten()
      });
    }

    if (!ensureBodyWorkspaceMatchesContext(parsed.data.workspaceId, workspaceId)) {
      return res.status(409).json({
        ok: false,
        error: 'WORKSPACE_CONTEXT_MISMATCH'
      });
    }

    const importedApps = await Promise.all(
      parsed.data.apps.map((app) =>
        registerWorkspaceApp({
          ...app,
          workspaceId
        })
      )
    );

    return res.status(201).json({
      ok: true,
      workspaceId,
      count: importedApps.length,
      apps: importedApps
    });
  } catch (error) {
    return next(error);
  }
});

workspaceAppsRouter.get('/:appId', async (req, res, next) => {
  try {
    const workspaceId = requireRouteWorkspaceId(req);
    const app = await getWorkspaceApp(workspaceId, req.params.appId);

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
  } catch (error) {
    return next(error);
  }
});

workspaceAppsRouter.get('/:appId/launch', async (req, res, next) => {
  try {
    const workspaceId = requireRouteWorkspaceId(req);
    const redirect = req.query.redirect !== 'false';
    const app = await getWorkspaceApp(workspaceId, req.params.appId);

    if (!app) {
      return res.status(404).json({
        ok: false,
        error: 'WORKSPACE_APP_NOT_FOUND'
      });
    }

    if (app.status !== 'active') {
      return res.status(409).json({
        ok: false,
        error: 'WORKSPACE_APP_NOT_ACTIVE',
        status: app.status
      });
    }

    if (redirect) {
      return res.redirect(302, app.url);
    }

    return res.status(200).json({
      ok: true,
      launchUrl: app.url,
      app
    });
  } catch (error) {
    return next(error);
  }
});

workspaceAppsRouter.get('/:appId/health', async (req, res, next) => {
  try {
    const workspaceId = requireRouteWorkspaceId(req);
    const app = await getWorkspaceApp(workspaceId, req.params.appId);

    if (!app) {
      return res.status(404).json({
        ok: false,
        error: 'WORKSPACE_APP_NOT_FOUND'
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), Number(process.env.APP_HEALTH_TIMEOUT_MS ?? 5000));
    const startedAt = Date.now();
    const targetUrl = buildHealthUrl(app);

    try {
      const response = await fetch(targetUrl, {
        method: 'GET',
        signal: controller.signal
      });

      const latencyMs = Date.now() - startedAt;

      return res.status(200).json({
        ok: response.ok,
        appId: app.id,
        workspaceId: app.workspaceId,
        targetUrl,
        status: response.status,
        statusText: response.statusText,
        latencyMs,
        checkedAt: new Date().toISOString()
      });
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    return next(error);
  }
});
