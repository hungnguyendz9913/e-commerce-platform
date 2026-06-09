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

  findActiveSessionByRefreshTokenHash(refreshTokenHash: string) {
    return this.databaseService.session.findFirst({
      where: {
        refreshTokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            email: true,
            status: true,
            userRoles: {
              select: {
                role: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  rotateRefreshToken(
    sessionId: string,
    currentRefreshTokenHash: string,
    nextRefreshTokenHash: string,
  ) {
    return this.databaseService.session.updateMany({
      where: {
        id: sessionId,
        refreshTokenHash: currentRefreshTokenHash,
        revokedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      data: {
        refreshTokenHash: nextRefreshTokenHash,
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
