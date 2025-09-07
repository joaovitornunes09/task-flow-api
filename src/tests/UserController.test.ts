import { UserController } from '../controllers/UserController';
import { IUserService } from '../types/IUserService';
import { TokenBlacklistService } from '../services/TokenBlacklistService';
import { FastifyRequest, FastifyReply } from 'fastify';

describe('UserController', () => {
  let userController: UserController;
  let mockUserService: jest.Mocked<IUserService>;
  let mockTokenBlacklistService: jest.Mocked<TokenBlacklistService>;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  const mockUser = {
    id: 'user1',
    name: 'João Silva',
    email: 'joao@exemplo.com',
    password: 'senhaHasheada',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockUserService = {
      register: jest.fn(),
      authenticate: jest.fn(),
      getUserById: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      getAllUsers: jest.fn(),
    };

    mockTokenBlacklistService = {
      addTokenToBlacklist: jest.fn(),
      isTokenBlacklisted: jest.fn(),
      cleanExpiredTokens: jest.fn(),
    } as any;

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      user: { id: 'user1', name: 'Usuário Teste', email: 'teste@exemplo.com' },
      body: {},
      params: {},
      token: 'mock-token',
      server: {
        jwt: {
          verify: jest.fn(),
        },
      } as any,
    };

    userController = new UserController(mockUserService, mockTokenBlacklistService);
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const registerData = {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        password: 'senha123',
      };

      mockRequest.body = registerData;
      mockUserService.register.mockResolvedValue(mockUser);

      await userController.register(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockUserService.register).toHaveBeenCalledWith(registerData);
      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'User created successfully',
        data: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        },
      });
    });

    it('should handle registration error', async () => {
      mockRequest.body = { email: 'existente@exemplo.com' };
      mockUserService.register.mockRejectedValue(new Error('Email já existe'));

      await userController.register(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Email já existe',
      });
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const loginData = {
        email: 'joao@exemplo.com',
        password: 'senha123',
      };

      const loginResult = {
        user: mockUser,
        token: 'token-jwt',
      };

      mockRequest.body = loginData;
      mockUserService.authenticate.mockResolvedValue(loginResult);

      await userController.login(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockUserService.authenticate).toHaveBeenCalledWith(loginData.email, loginData.password);
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Login successful',
        token: 'token-jwt',
        user: {
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        },
      });
    });

    it('should handle login error', async () => {
      mockRequest.body = { email: 'errado@exemplo.com', password: 'senhaErrada' };
      mockUserService.authenticate.mockRejectedValue(new Error('Credenciais inválidas'));

      await userController.login(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Credenciais inválidas',
      });
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      const mockJwtVerify = jest.fn().mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });
      mockRequest.server = { jwt: { verify: mockJwtVerify } } as any;
      mockRequest.token = 'token-jwt';
      mockTokenBlacklistService.addTokenToBlacklist.mockResolvedValue();

      await userController.logout(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockTokenBlacklistService.addTokenToBlacklist).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Logout successful',
      });
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      mockUserService.getUserById.mockResolvedValue(mockUser);

      await userController.getProfile(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockUserService.getUserById).toHaveBeenCalledWith('user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
      });
    });

    it('should handle error when getting profile', async () => {
      mockUserService.getUserById.mockRejectedValue(new Error('Usuário não encontrado'));

      await userController.getProfile(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'User not found',
      });
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const updateData = { name: 'Nome Atualizado' };
      const updatedUser = { ...mockUser, ...updateData };

      mockRequest.body = updateData;
      mockUserService.updateUser.mockResolvedValue(updatedUser);

      await userController.updateProfile(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockUserService.updateUser).toHaveBeenCalledWith('user1', updateData);
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Profile updated successfully',
        data: {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
        },
      });
    });

    it('should handle update error', async () => {
      mockRequest.body = { name: 'Nome Atualizado' };
      mockUserService.updateUser.mockRejectedValue(new Error('Falha na atualização'));

      await userController.updateProfile(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Falha na atualização',
      });
    });
  });

  describe('getAllUsers', () => {
    it('should get all users successfully', async () => {
      const users = [mockUser];
      mockUserService.getAllUsers.mockResolvedValue(users);

      await userController.getAllUsers(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockUserService.getAllUsers).toHaveBeenCalled();
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Users retrieved successfully',
        data: [{
          id: mockUser.id,
          name: mockUser.name,
          email: mockUser.email,
        }],
      });
    });
  });
});