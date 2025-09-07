import { authMiddleware } from '../middlewares/auth';
import { FastifyRequest, FastifyReply } from 'fastify';

jest.mock('../services/TokenBlacklistService');
jest.mock('../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

const { TokenBlacklistService } = require('../services/TokenBlacklistService');
const { prisma } = require('../lib/prisma');

describe('Auth Middleware', () => {
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;
  let mockTokenBlacklistService: any;

  const mockUser = {
    id: 'user1',
    name: 'João Silva',
    email: 'joao@exemplo.com',
  };

  beforeEach(() => {
    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      headers: {},
      server: {
        jwt: {
          verify: jest.fn(),
        },
      } as any,
    };

    mockTokenBlacklistService = {
      isTokenBlacklisted: jest.fn(),
    };
    TokenBlacklistService.mockImplementation(() => mockTokenBlacklistService);

    jest.clearAllMocks();
  });

  it('should reject request without authorization header', async () => {
    mockRequest.headers = {};

    await authMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Access token is required',
    });
  });

  it('should reject request with invalid authorization header', async () => {
    mockRequest.headers = { authorization: 'Invalid header' };

    await authMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Access token is required',
    });
  });

  it('should reject blacklisted token', async () => {
    const token = 'blacklisted.jwt.token';
    mockRequest.headers = { authorization: `Bearer ${token}` };
    mockTokenBlacklistService.isTokenBlacklisted.mockResolvedValue(true);

    await authMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockTokenBlacklistService.isTokenBlacklisted).toHaveBeenCalledWith(token);
    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Token has been revoked',
    });
  });

  it('should reject invalid token', async () => {
    const token = 'invalid.jwt.token';
    mockRequest.headers = { authorization: `Bearer ${token}` };
    mockTokenBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
    mockRequest.server!.jwt.verify = jest.fn().mockImplementation(() => {
      throw new Error('Invalid token');
    });

    await authMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'Invalid or expired token',
    });
  });

  it('should reject when user not found', async () => {
    const token = 'valid.jwt.token';
    const decodedPayload = { id: 'inexistente', email: 'inexistente@exemplo.com' };

    mockRequest.headers = { authorization: `Bearer ${token}` };
    mockTokenBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
    mockRequest.server!.jwt.verify = jest.fn().mockReturnValue(decodedPayload);
    prisma.user.findUnique.mockResolvedValue(null);

    await authMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({
      message: 'User not found',
    });
  });

  it('should authenticate successfully with valid token', async () => {
    const token = 'valid.jwt.token';
    const decodedPayload = { id: 'user1', email: 'joao@exemplo.com' };

    mockRequest.headers = { authorization: `Bearer ${token}` };
    mockTokenBlacklistService.isTokenBlacklisted.mockResolvedValue(false);
    mockRequest.server!.jwt.verify = jest.fn().mockReturnValue(decodedPayload);
    prisma.user.findUnique.mockResolvedValue(mockUser);

    await authMiddleware(mockRequest as FastifyRequest, mockReply as FastifyReply);

    expect(mockTokenBlacklistService.isTokenBlacklisted).toHaveBeenCalledWith(token);
    expect(mockRequest.server!.jwt.verify).toHaveBeenCalledWith(token);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: decodedPayload.id },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    expect(mockRequest.authPayload).toEqual(decodedPayload);
    expect(mockRequest.user).toEqual(mockUser);
    expect(mockRequest.token).toEqual(token);
  });
});
