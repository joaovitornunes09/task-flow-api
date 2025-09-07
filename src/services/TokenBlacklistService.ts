import { prisma } from "../lib/prisma";

export class TokenBlacklistService {
  async addTokenToBlacklist(token: string, expiresAt: Date): Promise<void> {
    await prisma.tokenBlacklist.create({
      data: {
        token,
        expiresAt,
      },
    });
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklistedToken = await prisma.tokenBlacklist.findUnique({
      where: { token },
    });

    return blacklistedToken !== null && blacklistedToken.expiresAt > new Date();
  }

  async cleanExpiredTokens(): Promise<void> {
    await prisma.tokenBlacklist.deleteMany({
      where: {
        expiresAt: {
          lte: new Date(),
        },
      },
    });
  }
}