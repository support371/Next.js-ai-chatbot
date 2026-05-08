import type { NextFunction, Request, Response } from 'express';

type RequiredScope =
  | 'apps:read'
  | 'apps:write'
  | 'apps:launch'
  | 'apps:health'
  | 'ai:invoke'
  | 'social:read'
  | 'social:write';

function hasScope(actorScopes: string[] | undefined, requiredScope: RequiredScope) {
  if (!actorScopes?.length) {
    return false;
  }

  if (actorScopes.includes('*')) {
    return true;
  }

  const namespace = requiredScope.split(':')[0];
  return actorScopes.includes(requiredScope) || actorScopes.includes(`${namespace}:*`);
}

export function requireScope(requiredScope: RequiredScope) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.actor) {
      return res.status(401).json({
        ok: false,
        error: 'ACTOR_REQUIRED'
      });
    }

    if (!hasScope(req.actor.scopes, requiredScope)) {
      return res.status(403).json({
        ok: false,
        error: 'INSUFFICIENT_SCOPE',
        requiredScope
      });
    }

    return next();
  };
}

export function requireRole(minimumRole: 'viewer' | 'operator' | 'admin') {
  const rank = {
    viewer: 1,
    operator: 2,
    admin: 3
  } as const;

  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.actor) {
      return res.status(401).json({
        ok: false,
        error: 'ACTOR_REQUIRED'
      });
    }

    if (rank[req.actor.role] < rank[minimumRole]) {
      return res.status(403).json({
        ok: false,
        error: 'INSUFFICIENT_ROLE',
        requiredRole: minimumRole
      });
    }

    return next();
  };
}
