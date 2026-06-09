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
