import type { NextFunction, Request, Response } from 'express';
import { timingSafeEqual } from 'node:crypto';

const publicPaths = new Set(['/api/health']);

function getConfiguredApiKeys() {
  return (process.env.OPENGUARDIANS_API_KEYS ?? process.env.OPENGUARDIANS_API_KEY ?? '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean);
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function getBearerToken(req: Request) {
  const authorization = req.header('authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return undefined;
  }

  return authorization.slice('Bearer '.length).trim();
}

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  if (publicPaths.has(req.path)) {
    return next();
  }

  const configuredApiKeys = getConfiguredApiKeys();

  if (configuredApiKeys.length === 0 && process.env.NODE_ENV !== 'production') {
    req.actor = { type: 'api-key' };
    return next();
  }

  const token = getBearerToken(req) ?? req.header('x-api-key');

  if (!token) {
    return res.status(401).json({
      ok: false,
      error: 'API_KEY_REQUIRED'
    });
  }

  const valid = configuredApiKeys.some((key) => safeEqual(token, key));

  if (!valid) {
    return res.status(403).json({
      ok: false,
      error: 'API_KEY_INVALID'
    });
  }

  req.actor = { type: 'api-key' };
  return next();
}
