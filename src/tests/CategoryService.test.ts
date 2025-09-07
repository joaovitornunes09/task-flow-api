import { CategoryService } from '../services/CategoryService';
import { ICategoryRepository } from '../types/ICategoryRepository';

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let mockCategoryRepository: jest.Mocked<ICategoryRepository>;

  const mockCategory = {
    id: 'cat1',
    name: 'Trabalho',
    description: 'Tarefas relacionadas ao trabalho',
    color: '#2563eb',
    userId: 'user1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    mockCategoryRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByNameAndUserId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    categoryService = new CategoryService(mockCategoryRepository);

    jest.clearAllMocks();
  });

  describe('createCategory', () => {
    it('should create category successfully', async () => {
      const categoryData = {
        name: 'Trabalho',
        description: 'Tarefas relacionadas ao trabalho',
        color: '#2563eb',
        userId: 'user1',
      };

      mockCategoryRepository.findByNameAndUserId.mockResolvedValue(null);
      mockCategoryRepository.create.mockResolvedValue(mockCategory);

      const result = await categoryService.createCategory(categoryData);

      expect(mockCategoryRepository.findByNameAndUserId).toHaveBeenCalledWith('Trabalho', 'user1');
      expect(mockCategoryRepository.create).toHaveBeenCalledWith(categoryData);
      expect(result).toEqual(mockCategory);
    });

    it('should fail when category with same name already exists', async () => {
      const categoryData = {
        name: 'Trabalho',
        description: 'Tarefas relacionadas ao trabalho',
        color: '#2563eb',
        userId: 'user1',
      };

      mockCategoryRepository.findByNameAndUserId.mockResolvedValue(mockCategory);

      await expect(categoryService.createCategory(categoryData)).rejects.toThrow('A category with this name already exists');
      expect(mockCategoryRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getCategoryById', () => {
    it('should get category by ID successfully', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);

      const result = await categoryService.getCategoryById('cat1');

      expect(mockCategoryRepository.findById).toHaveBeenCalledWith('cat1');
      expect(result).toEqual(mockCategory);
    });

    it('should fail when category is not found', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(categoryService.getCategoryById('categoriaInexistente')).rejects.toThrow('Category not found');
    });
  });

  describe('getCategoriesByUser', () => {
    it('should get user categories successfully', async () => {
      const categories = [
        mockCategory,
        {
          id: 'cat2',
          name: 'Pessoal',
          description: 'Tarefas pessoais',
          color: '#dc2626',
          userId: 'user1',
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];

      mockCategoryRepository.findByUserId.mockResolvedValue(categories);

      const result = await categoryService.getCategoriesByUser('user1');

      expect(mockCategoryRepository.findByUserId).toHaveBeenCalledWith('user1');
      expect(result).toEqual(categories);
    });

    it('should return empty array when user has no categories', async () => {
      mockCategoryRepository.findByUserId.mockResolvedValue([]);

      const result = await categoryService.getCategoriesByUser('user1');

      expect(result).toEqual([]);
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      const updateData = {
        name: 'Trabalho Atualizado',
        description: 'Descrição atualizada',
      };
      const updatedCategory = { ...mockCategory, ...updateData };

      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockCategoryRepository.findByNameAndUserId.mockResolvedValue(null);
      mockCategoryRepository.update.mockResolvedValue(updatedCategory);

      const result = await categoryService.updateCategory('cat1', updateData, 'user1');

      expect(mockCategoryRepository.findById).toHaveBeenCalledWith('cat1');
      expect(mockCategoryRepository.findByNameAndUserId).toHaveBeenCalledWith('Trabalho Atualizado', 'user1');
      expect(mockCategoryRepository.update).toHaveBeenCalledWith('cat1', updateData);
      expect(result).toEqual(updatedCategory);
    });

    it('should fail when category is not found', async () => {
      const updateData = { name: 'Trabalho Atualizado' };

      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(categoryService.updateCategory('categoriaInexistente', updateData, 'user1')).rejects.toThrow('Category not found');
      expect(mockCategoryRepository.update).not.toHaveBeenCalled();
    });

    it('should fail when user is not authorized', async () => {
      const updateData = { name: 'Trabalho Atualizado' };
      const categoryDeOutroUsuario = { ...mockCategory, userId: 'user2' };

      mockCategoryRepository.findById.mockResolvedValue(categoryDeOutroUsuario);

      await expect(categoryService.updateCategory('cat1', updateData, 'user1')).rejects.toThrow('Unauthorized to update this category');
      expect(mockCategoryRepository.update).not.toHaveBeenCalled();
    });

    it('should fail when category name already exists', async () => {
      const updateData = { name: 'Pessoal' };
      const existingCategory = { ...mockCategory, id: 'cat2', name: 'Pessoal' };

      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockCategoryRepository.findByNameAndUserId.mockResolvedValue(existingCategory);

      await expect(categoryService.updateCategory('cat1', updateData, 'user1')).rejects.toThrow('A category with this name already exists');
      expect(mockCategoryRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      mockCategoryRepository.findById.mockResolvedValue(mockCategory);
      mockCategoryRepository.delete.mockResolvedValue();

      await categoryService.deleteCategory('cat1', 'user1');

      expect(mockCategoryRepository.findById).toHaveBeenCalledWith('cat1');
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith('cat1');
    });

    it('should fail when category is not found', async () => {
      mockCategoryRepository.findById.mockResolvedValue(null);

      await expect(categoryService.deleteCategory('categoriaInexistente', 'user1')).rejects.toThrow('Category not found');
      expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
    });

    it('should fail when user is not authorized', async () => {
      const categoryDeOutroUsuario = { ...mockCategory, userId: 'user2' };

      mockCategoryRepository.findById.mockResolvedValue(categoryDeOutroUsuario);

      await expect(categoryService.deleteCategory('cat1', 'user1')).rejects.toThrow('Unauthorized to delete this category');
      expect(mockCategoryRepository.delete).not.toHaveBeenCalled();
    });
  });
});