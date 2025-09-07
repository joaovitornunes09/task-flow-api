import { CategoryController } from '../controllers/CategoryController';
import { ICategoryService } from '../types/ICategoryService';
import { FastifyRequest, FastifyReply } from 'fastify';

describe('CategoryController', () => {
  let categoryController: CategoryController;
  let mockCategoryService: jest.Mocked<ICategoryService>;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  const mockCategory = {
    id: 'cat1',
    name: 'Trabalho',
    description: 'Tarefas relacionadas ao trabalho',
    color: '#2563eb',
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    mockCategoryService = {
      createCategory: jest.fn(),
      getCategoryById: jest.fn(),
      getCategoriesByUser: jest.fn(),
      updateCategory: jest.fn(),
      deleteCategory: jest.fn(),
    };

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      user: { id: 'user1', name: 'Usuário Teste', email: 'teste@exemplo.com' },
      body: {},
      params: {},
    };

    categoryController = new CategoryController(mockCategoryService);
  });

  describe('create', () => {
    it('should create category successfully', async () => {
      const createData = {
        name: 'Trabalho',
        description: 'Tarefas relacionadas ao trabalho',
        color: '#2563eb',
      };

      mockRequest.body = createData;
      mockCategoryService.createCategory.mockResolvedValue(mockCategory);

      await categoryController.create(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockCategoryService.createCategory).toHaveBeenCalledWith({
        ...createData,
        userId: 'user1',
      });
      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Category created successfully',
        data: mockCategory,
      });
    });

    it('should handle creation error', async () => {
      mockRequest.body = { name: 'Trabalho' };
      mockCategoryService.createCategory.mockRejectedValue(new Error('Falha na criação'));

      await categoryController.create(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Falha na criação',
      });
    });
  });

  describe('getById', () => {
    it('should get category by id successfully', async () => {
      mockRequest.params = { id: 'cat1' };
      mockCategoryService.getCategoryById.mockResolvedValue(mockCategory);

      await categoryController.getById(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockCategoryService.getCategoryById).toHaveBeenCalledWith('cat1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Category retrieved successfully',
        data: mockCategory,
      });
    });

    it('should handle category not found', async () => {
      mockRequest.params = { id: 'cat1' };
      mockCategoryService.getCategoryById.mockRejectedValue(new Error('Categoria não encontrada'));

      await categoryController.getById(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Categoria não encontrada',
      });
    });
  });

  describe('getByUser', () => {
    it('should get categories by user successfully', async () => {
      const categories = [mockCategory];
      mockCategoryService.getCategoriesByUser.mockResolvedValue(categories);

      await categoryController.getByUser(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockCategoryService.getCategoriesByUser).toHaveBeenCalledWith('user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Categories retrieved successfully',
        data: categories,
      });
    });

    it('should handle service error', async () => {
      mockCategoryService.getCategoriesByUser.mockRejectedValue(new Error('Erro do serviço'));

      await categoryController.getByUser(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to retrieve categories',
      });
    });
  });

  describe('update', () => {
    it('should update category successfully', async () => {
      const updateData = { name: 'Trabalho Atualizado' };
      const updatedCategory = { ...mockCategory, ...updateData };

      mockRequest.params = { id: 'cat1' };
      mockRequest.body = updateData;
      mockCategoryService.updateCategory.mockResolvedValue(updatedCategory);

      await categoryController.update(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockCategoryService.updateCategory).toHaveBeenCalledWith('cat1', updateData, 'user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Category updated successfully',
        data: updatedCategory,
      });
    });

    it('should handle update error', async () => {
      mockRequest.params = { id: 'cat1' };
      mockRequest.body = { name: 'Trabalho Atualizado' };
      mockCategoryService.updateCategory.mockRejectedValue(new Error('Falha na atualização'));

      await categoryController.update(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Falha na atualização',
      });
    });
  });

  describe('delete', () => {
    it('should delete category successfully', async () => {
      mockRequest.params = { id: 'cat1' };
      mockCategoryService.deleteCategory.mockResolvedValue();

      await categoryController.delete(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockCategoryService.deleteCategory).toHaveBeenCalledWith('cat1', 'user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Category deleted successfully',
      });
    });

    it('should handle delete error', async () => {
      mockRequest.params = { id: 'cat1' };
      mockCategoryService.deleteCategory.mockRejectedValue(new Error('Falha na exclusão'));

      await categoryController.delete(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Falha na exclusão',
      });
    });
  });
});