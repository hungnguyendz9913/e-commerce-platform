import { DatabaseService } from '@e-commerce-platform/database';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  createSession(userId: string, refreshTokenHash: string, expiresAt: Date) {
    return this.databaseService.session.create({
      data: {
        userId,
        refreshTokenHash,
        expiresAt,
      },
      select: {
        id: true,
      },
    });
  }

  findActiveSession(sessionId: string, userId: string) {
    return this.databaseService.session.findFirst({
      where: {
        id: sessionId,
        userId,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
      },
    });
  }

  revokeSession(sessionId: string, userId: string) {
    return this.databaseService.session.updateMany({
      where: {
        id: sessionId,
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }

  revokeSessionsForUser(userId: string) {
    return this.databaseService.session.updateMany({
      where: {
        userId,
        revokedAt: null,
      },
      data: {
        revokedAt: new Date(),
      },
    });
  }
}
