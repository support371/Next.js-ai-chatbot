import { Router } from 'express';
import { z } from 'zod';

import { gemAIIntelligence } from '@openguardians/ai';

export const intelligenceRouter = Router();

const intelligenceRequestSchema = z.object({
  mode: z.string().trim().min(1).max(80).default('general'),
  prompt: z.string().trim().min(1).max(12000)
});

intelligenceRouter.post('/', async (req, res, next) => {
  try {
    const parsed = intelligenceRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        ok: false,
        error: 'INVALID_INTELLIGENCE_REQUEST',
        issues: parsed.error.flatten()
      });
    }

    const result = await gemAIIntelligence(parsed.data);
    return res.status(result.ok ? 200 : 429).json(result);
  } catch (error) {
    return next(error);
  }
});
