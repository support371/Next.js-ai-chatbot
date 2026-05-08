import type { NextFunction, Request, Response } from 'express';

function resolveWorkspaceId(req: Request) {
  const headerWorkspaceId = req.header('x-workspace-id')?.trim();
  const queryWorkspaceId = typeof req.query.workspaceId === 'string' ? req.query.workspaceId.trim() : undefined;
  const bodyWorkspaceId = typeof req.body?.workspaceId === 'string' ? req.body.workspaceId.trim() : undefined;

  return headerWorkspaceId || queryWorkspaceId || bodyWorkspaceId || process.env.DEFAULT_WORKSPACE_ID;
}

export function requireWorkspaceContext(req: Request, res: Response, next: NextFunction) {
  if (req.path === '/api/health') {
    return next();
  }

  const workspaceId = resolveWorkspaceId(req);

  if (!workspaceId) {
    return res.status(400).json({
      ok: false,
      error: 'WORKSPACE_ID_REQUIRED',
      message: 'Provide x-workspace-id, workspaceId query parameter, workspaceId body field, or DEFAULT_WORKSPACE_ID.'
    });
  }

  req.workspaceId = workspaceId;
  return next();
}
