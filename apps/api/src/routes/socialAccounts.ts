import { Router } from 'express';

export const socialAccountsRouter = Router();

socialAccountsRouter.get('/', (_req, res) => {
  res.status(200).json({
    ok: true,
    accounts: [],
    message: 'Social account storage is not configured yet.'
  });
});
