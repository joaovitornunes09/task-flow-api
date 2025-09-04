import { ICategoryService } from "../types/ICategoryService";
import { ICategoryRepository } from "../types/ICategoryRepository";
import { Category, CreateCategoryData, UpdateCategoryData } from "../models/Category";

export class CategoryService implements ICategoryService {
  constructor(private categoryRepository: ICategoryRepository) {}

  async createCategory(data: CreateCategoryData): Promise<Category> {
    return await this.categoryRepository.create(data);
  }

  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }
    return category;
  }

  async getCategoriesByUser(userId: string): Promise<Category[]> {
    return await this.categoryRepository.findByUserId(userId);
  }

  async updateCategory(id: string, data: UpdateCategoryData, userId: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }
    
    if (category.userId !== userId) {
      throw new Error("Unauthorized to update this category");
    }

    return await this.categoryRepository.update(id, data);
  }

  async deleteCategory(id: string, userId: string): Promise<void> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new Error("Category not found");
    }
    
    if (category.userId !== userId) {
      throw new Error("Unauthorized to delete this category");
    }

    await this.categoryRepository.delete(id);
  }
}