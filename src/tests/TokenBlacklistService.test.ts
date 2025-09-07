import { TokenBlacklistService } from '../services/TokenBlacklistService';
import { prisma } from '../lib/prisma';

jest.mock('../lib/prisma', () => ({
  prisma: {
    tokenBlacklist: {
      create: jest.fn(),
      findUnique: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

// Obter referência ao mock após a criação
const { prisma: mockedPrisma } = require('../lib/prisma') as any;

describe('TokenBlacklistService', () => {
  let tokenBlacklistService: TokenBlacklistService;

  beforeEach(() => {
    tokenBlacklistService = new TokenBlacklistService();
    jest.clearAllMocks();
  });

  describe('addTokenToBlacklist', () => {
    it('should add token to blacklist successfully', async () => {
      const token = 'jwt.token.exemplo';
      const expiresAt = new Date('2024-12-31T23:59:59Z');

      mockedPrisma.tokenBlacklist.create.mockResolvedValue({
        id: 'blacklist1',
        token,
        expiresAt,
        createdAt: new Date(),
      });

      await tokenBlacklistService.addTokenToBlacklist(token, expiresAt);

      expect(mockedPrisma.tokenBlacklist.create).toHaveBeenCalledWith({
        data: {
          token,
          expiresAt,
        },
      });
    });

    it('should propagate error when creation fails', async () => {
      const token = 'jwt.token.exemplo';
      const expiresAt = new Date('2024-12-31T23:59:59Z');

      mockedPrisma.tokenBlacklist.create.mockRejectedValue(new Error('Erro de banco de dados'));

      await expect(tokenBlacklistService.addTokenToBlacklist(token, expiresAt))
        .rejects.toThrow('Erro de banco de dados');
    });
  });

  describe('isTokenBlacklisted', () => {
    it('should return true for blacklisted and non-expired token', async () => {
      const token = 'jwt.token.exemplo';
      const futureDate = new Date(Date.now() + 3600000); // 1 hora no futuro

      mockedPrisma.tokenBlacklist.findUnique.mockResolvedValue({
        id: 'blacklist1',
        token,
        expiresAt: futureDate,
        createdAt: new Date(),
      });

      const result = await tokenBlacklistService.isTokenBlacklisted(token);

      expect(mockedPrisma.tokenBlacklist.findUnique).toHaveBeenCalledWith({
        where: { token },
      });
      expect(result).toBe(true);
    });

    it('should return false for blacklisted but expired token', async () => {
      const token = 'jwt.token.exemplo';
      const pastDate = new Date(Date.now() - 3600000);

      mockedPrisma.tokenBlacklist.findUnique.mockResolvedValue({
        id: 'blacklist1',
        token,
        expiresAt: pastDate,
        createdAt: new Date(),
      });

      const result = await tokenBlacklistService.isTokenBlacklisted(token);

      expect(result).toBe(false);
    });

    it('should return false for token not found in blacklist', async () => {
      const token = 'jwt.token.nao.encontrado';

      mockedPrisma.tokenBlacklist.findUnique.mockResolvedValue(null);

      const result = await tokenBlacklistService.isTokenBlacklisted(token);

      expect(result).toBe(false);
    });

    it('should propagate error when search fails', async () => {
      const token = 'jwt.token.exemplo';

      mockedPrisma.tokenBlacklist.findUnique.mockRejectedValue(new Error('Erro de conexão com banco'));

      await expect(tokenBlacklistService.isTokenBlacklisted(token))
        .rejects.toThrow('Erro de conexão com banco');
    });
  });

  describe('cleanExpiredTokens', () => {
    it('should remove expired tokens successfully', async () => {
      mockedPrisma.tokenBlacklist.deleteMany.mockResolvedValue({ count: 5 });

      await tokenBlacklistService.cleanExpiredTokens();

      expect(mockedPrisma.tokenBlacklist.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lte: expect.any(Date),
          },
        },
      });
    });

    it('should handle case where there are no tokens to remove', async () => {
      mockedPrisma.tokenBlacklist.deleteMany.mockResolvedValue({ count: 0 });

      await tokenBlacklistService.cleanExpiredTokens();

      expect(mockedPrisma.tokenBlacklist.deleteMany).toHaveBeenCalled();
    });

    it('should propagate error when removal fails', async () => {
      mockedPrisma.tokenBlacklist.deleteMany.mockRejectedValue(new Error('Erro ao deletar tokens'));

      await expect(tokenBlacklistService.cleanExpiredTokens())
        .rejects.toThrow('Erro ao deletar tokens');
    });
  });
});
