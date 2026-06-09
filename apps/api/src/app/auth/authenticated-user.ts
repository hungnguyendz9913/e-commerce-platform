export type AuthenticatedUser = {
  userId: string;
  sessionId: string;
  roles: string[];
};

export type RequestWithUser = {
  headers: {
    authorization?: string;
  };
  user?: AuthenticatedUser;
};
