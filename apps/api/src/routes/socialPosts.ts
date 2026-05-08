import { Router } from 'express';
import { z } from 'zod';

export const socialPostsRouter = Router();

const socialPostDraftSchema = z.object({
  channel: z.string().trim().min(1).max(80),
  content: z.string().trim().min(1).max(5000),
  approved: z.boolean().default(false)
});

socialPostsRouter.get('/', (_req, res) => {
  res.status(200).json({
    ok: true,
    posts: [],
    message: 'Social post persistence is not configured yet.'
  });
});

socialPostsRouter.post('/draft', (req, res) => {
  const parsed = socialPostDraftSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      ok: false,
      error: 'INVALID_SOCIAL_POST_DRAFT',
      issues: parsed.error.flatten()
    });
  }

  return res.status(202).json({
    ok: true,
    status: parsed.data.approved ? 'approved_for_queue' : 'draft_requires_approval',
    draft: parsed.data
  });
});
