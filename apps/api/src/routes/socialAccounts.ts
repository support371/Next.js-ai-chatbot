import { Router } from 'express';

import { requireScope } from '../middleware/accessControl.js';

export const socialAccountsRouter = Router();

socialAccountsRouter.get('/', requireScope('social:read'), (_req, res) => {
  res.status(200).json({
    ok: true,
    accounts: [],
    message: 'Social account storage is not configured yet.'
  });
});
