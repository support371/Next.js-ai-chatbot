import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import { healthRouter } from './routes/health.js';
import { intelligenceRouter } from './routes/intelligence.js';
import { socialAccountsRouter } from './routes/socialAccounts.js';
import { socialPostsRouter } from './routes/socialPosts.js';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '20mb' }));

app.use('/api/health', healthRouter);
app.use('/api/intelligence', intelligenceRouter);
app.use('/api/social/accounts', socialAccountsRouter);
app.use('/api/social/posts', socialPostsRouter);

const port = Number(process.env.PORT ?? 8080);

app.listen(port, () => {
  console.log(`OpenGuardians API running on port ${port}`);
});
