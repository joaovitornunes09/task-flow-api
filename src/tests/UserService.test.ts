import { UserService } from '../services/UserService';
import { IUserRepository } from '../types/IUserRepository';
import { hashPassword, verifyPassword } from '../utils/hash';

jest.mock('../utils/hash');

const mockedHashPassword = hashPassword as jest.MockedFunction<typeof hashPassword>;
const mockedVerifyPassword = verifyPassword as jest.MockedFunction<typeof verifyPassword>;

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<IUserRepository>;
  let mockJwtSign: jest.Mock;

  const mockUser = {
    id: 'user1',
    name: 'João Silva',
    email: 'joao@exemplo.com',
    password: 'senhaHasheada123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockJwtSign = jest.fn();

    userService = new UserService(mockUserRepository, mockJwtSign);

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register user successfully', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        password: 'senha123',
      };

      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockedHashPassword.mockResolvedValue('senhaHasheada123');
      mockUserRepository.create.mockResolvedValue(mockUser);

      const result = await userService.register(userData);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(userData.email);
      expect(mockedHashPassword).toHaveBeenCalledWith(userData.password);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...userData,
        password: 'senhaHasheada123',
      });
      expect(result).toEqual(mockUser);
    });

    it('should fail to register user that already exists', async () => {
      const userData = {
        name: 'João Silva',
        email: 'joao@exemplo.com',
        password: 'senha123',
      };

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(userService.register(userData)).rejects.toThrow('User already exists');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('authenticate', () => {
    it('should authenticate user with valid credentials', async () => {
      const email = 'joao@exemplo.com';
      const password = 'senha123';
      const token = 'jwt-token-123';

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockedVerifyPassword.mockResolvedValue(true);
      mockJwtSign.mockReturnValue(token);

      const result = await userService.authenticate(email, password);

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(mockedVerifyPassword).toHaveBeenCalledWith(password, mockUser.password);
      expect(mockJwtSign).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        user: mockUser,
        token,
      });
    });

    it('should fail with invalid email', async () => {
      const email = 'emailinexistente@exemplo.com';
      const password = 'senha123';

      mockUserRepository.findByEmail.mockResolvedValue(null);

      await expect(userService.authenticate(email, password)).rejects.toThrow('Invalid email or password');
      expect(mockedVerifyPassword).not.toHaveBeenCalled();
      expect(mockJwtSign).not.toHaveBeenCalled();
    });

    it('should fail with invalid password', async () => {
      const email = 'joao@exemplo.com';
      const password = 'senhaErrada';

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);
      mockedVerifyPassword.mockResolvedValue(false);

      await expect(userService.authenticate(email, password)).rejects.toThrow('Invalid email or password');
      expect(mockJwtSign).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should get user by ID successfully', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById('user1');

      expect(mockUserRepository.findById).toHaveBeenCalledWith('user1');
      expect(result).toEqual(mockUser);
    });

    it('should fail when user is not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(userService.getUserById('userInexistente')).rejects.toThrow('User not found');
    });
  });

  describe('updateUser', () => {
    it('should update user without changing password', async () => {
      const updateData = {
        name: 'João Silva Santos',
        email: 'joao.santos@exemplo.com',
      };
      const updatedUser = { ...mockUser, ...updateData };

      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser('user1', updateData);

      expect(mockUserRepository.update).toHaveBeenCalledWith('user1', updateData);
      expect(mockedHashPassword).not.toHaveBeenCalled();
      expect(result).toEqual(updatedUser);
    });

    it('should update user with new password', async () => {
      const updateData = {
        name: 'João Silva Santos',
        password: 'novaSenha123',
      };
      const updatedUser = { ...mockUser, ...updateData, password: 'novaSenhaHasheada' };

      mockedHashPassword.mockResolvedValue('novaSenhaHasheada');
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser('user1', updateData);

      expect(mockedHashPassword).toHaveBeenCalledWith('novaSenha123');
      expect(mockUserRepository.update).toHaveBeenCalledWith('user1', {
        ...updateData,
        password: 'novaSenhaHasheada',
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockUserRepository.delete.mockResolvedValue();

      await userService.deleteUser('user1');

      expect(mockUserRepository.delete).toHaveBeenCalledWith('user1');
    });
  });

  describe('getAllUsers', () => {
    it('should get all users successfully', async () => {
      const users = [
        mockUser,
        {
          id: 'user2',
          name: 'Maria Santos',
          email: 'maria@exemplo.com',
          password: 'senhaHasheada456',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];

      mockUserRepository.findAll.mockResolvedValue(users);

      const result = await userService.getAllUsers();

      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result).toEqual(users);
    });
  });
});