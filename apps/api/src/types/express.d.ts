declare global {
  namespace Express {
    interface Request {
      workspaceId?: string;
      actor?: {
        type: 'api-key';
      };
    }
  }
}

export {};
