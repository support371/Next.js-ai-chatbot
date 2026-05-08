import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { healthRouter } from './routes/health.js';
import { intelligenceRouter } from './routes/intelligence.js';
import { socialAccountsRouter } from './routes/socialAccounts.js';
import { socialPostsRouter } from './routes/socialPosts.js';
import { workspaceAppsRouter } from './routes/workspaceApps.js';

const app = express();

const allowedOrigins = process.env.CORS_ORIGIN?.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(
  cors({
    origin: allowedOrigins?.length ? allowedOrigins : false
  })
);
app.use(express.json({ limit: process.env.JSON_BODY_LIMIT ?? '2mb' }));
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: Number(process.env.RATE_LIMIT_PER_MINUTE ?? 60),
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.use('/api/health', healthRouter);
app.use('/api/intelligence', intelligenceRouter);
app.use('/api/social/accounts', socialAccountsRouter);
app.use('/api/social/posts', socialPostsRouter);
app.use('/api/workspace/apps', workspaceAppsRouter);

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(error);

  res.status(500).json({
    ok: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: 'The API encountered an unexpected error.'
  });
});

const port = Number(process.env.PORT ?? 8080);

app.listen(port, () => {
  console.log(`OpenGuardians API running on port ${port}`);
});
