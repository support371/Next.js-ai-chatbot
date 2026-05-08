import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';

import { createApp } from './app.js';

afterEach(() => {
  delete process.env.OPENGUARDIANS_API_KEY;
  delete process.env.OPENGUARDIANS_API_KEYS;
  delete process.env.DEFAULT_WORKSPACE_ID;
});

describe('API middleware', () => {
  it('allows public health checks without API key or workspace context', async () => {
    process.env.OPENGUARDIANS_API_KEY = 'test-key';
    const app = createApp();

    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.ok).toBe(true);
  });

  it('requires an API key on protected routes when configured', async () => {
    process.env.OPENGUARDIANS_API_KEY = 'test-key';
    process.env.DEFAULT_WORKSPACE_ID = 'gem-workspace';
    const app = createApp();

    const response = await request(app).get('/api/workspace/apps');

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('API_KEY_REQUIRED');
  });

  it('rejects invalid API keys on protected routes', async () => {
    process.env.OPENGUARDIANS_API_KEY = 'test-key';
    process.env.DEFAULT_WORKSPACE_ID = 'gem-workspace';
    const app = createApp();

    const response = await request(app)
      .get('/api/workspace/apps')
      .set('authorization', 'Bearer wrong-key');

    expect(response.status).toBe(403);
    expect(response.body.error).toBe('API_KEY_INVALID');
  });

  it('requires workspace context on protected routes', async () => {
    process.env.OPENGUARDIANS_API_KEY = 'test-key';
    const app = createApp();

    const response = await request(app)
      .get('/api/workspace/apps')
      .set('authorization', 'Bearer test-key');

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('WORKSPACE_ID_REQUIRED');
  });

  it('rejects mismatched body workspace context before registry writes', async () => {
    process.env.OPENGUARDIANS_API_KEY = 'test-key';
    const app = createApp();

    const response = await request(app)
      .post('/api/workspace/apps')
      .set('authorization', 'Bearer test-key')
      .set('x-workspace-id', 'workspace-a')
      .send({
        workspaceId: 'workspace-b',
        name: 'Admin Console',
        mode: 'production',
        source: 'vercel',
        url: 'https://admin.example.com'
      });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe('WORKSPACE_CONTEXT_MISMATCH');
  });
});
