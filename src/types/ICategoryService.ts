import { Category, CreateCategoryData, UpdateCategoryData } from "../models/Category";

export interface ICategoryService {
  createCategory(data: CreateCategoryData): Promise<Category>;
  getCategoryById(id: string): Promise<Category>;
  getCategoriesByUser(userId: string): Promise<Category[]>;
  updateCategory(id: string, data: UpdateCategoryData, userId: string): Promise<Category>;
  deleteCategory(id: string, userId: string): Promise<void>;
}