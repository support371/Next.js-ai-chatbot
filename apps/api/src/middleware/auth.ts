import type { NextFunction, Request, Response } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

const publicPaths = new Set(['/api/health']);

const apiKeyConfigSchema = z.array(
  z.object({
    name: z.string().trim().min(1).optional(),
    key: z.string().trim().min(1),
    role: z.enum(['admin', 'operator', 'viewer']).default('operator'),
    scopes: z.array(z.string().trim().min(1)).default(['*']),
    workspaces: z.array(z.string().trim().min(1)).default(['*'])
  })
);

type ApiKeyConfig = z.infer<typeof apiKeyConfigSchema>[number];

function getLegacyApiKeyConfig(): ApiKeyConfig[] {
  return (process.env.OPENGUARDIANS_API_KEYS ?? process.env.OPENGUARDIANS_API_KEY ?? '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean)
    .map((key, index) => ({
      name: `legacy-${index + 1}`,
      key,
      role: 'admin' as const,
      scopes: ['*'],
      workspaces: ['*']
    }));
}

function getConfiguredApiKeys() {
  const configJson = process.env.OPENGUARDIANS_API_KEY_CONFIG_JSON;

  if (!configJson) {
    return getLegacyApiKeyConfig();
  }

  const parsedJson = JSON.parse(configJson) as unknown;
  return apiKeyConfigSchema.parse(parsedJson);
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

function findMatchingApiKey(token: string, configuredApiKeys: ApiKeyConfig[]) {
  return configuredApiKeys.find((apiKey) => safeEqual(token, apiKey.key));
}

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  if (publicPaths.has(req.path)) {
    return next();
  }

  let configuredApiKeys: ApiKeyConfig[];

  try {
    configuredApiKeys = getConfiguredApiKeys();
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      error: 'API_KEY_CONFIGURATION_INVALID'
    });
  }

  if (configuredApiKeys.length === 0 && process.env.NODE_ENV !== 'production') {
    req.actor = {
      type: 'api-key',
      role: 'admin',
      scopes: ['*'],
      workspaces: ['*']
    };
    return next();
  }

  const token = getBearerToken(req) ?? req.header('x-api-key');

  if (!token) {
    return res.status(401).json({
      ok: false,
      error: 'API_KEY_REQUIRED'
    });
  }

  const apiKey = findMatchingApiKey(token, configuredApiKeys);

  if (!apiKey) {
    return res.status(403).json({
      ok: false,
      error: 'API_KEY_INVALID'
    });
  }

  req.actor = {
    type: 'api-key',
    name: apiKey.name,
    role: apiKey.role,
    scopes: apiKey.scopes,
    workspaces: apiKey.workspaces
  };

  return next();
}
