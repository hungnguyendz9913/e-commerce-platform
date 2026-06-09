import type { Request } from 'express';

export type AuthenticatedUser = {
  userId: string;
  sessionId: string;
  roles: string[];
};

export type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};
