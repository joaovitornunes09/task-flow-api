import { Category, CreateCategoryData, UpdateCategoryData } from "../models/Category";

export interface ICategoryRepository {
  create(data: CreateCategoryData): Promise<Category>;
  findById(id: string): Promise<Category | null>;
  findByUserId(userId: string): Promise<Category[]>;
  findByNameAndUserId(name: string, userId: string): Promise<Category | null>;
  update(id: string, data: UpdateCategoryData): Promise<Category>;
  delete(id: string): Promise<void>;
}