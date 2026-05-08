declare global {
  namespace Express {
    interface Request {
      workspaceId?: string;
      actor?: {
        type: 'api-key';
        name?: string;
        role: 'admin' | 'operator' | 'viewer';
        scopes: string[];
        workspaces: string[];
      };
    }
  }
}

export {};
