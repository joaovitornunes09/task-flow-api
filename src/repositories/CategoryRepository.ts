import { prisma } from "../lib/prisma";
import { ICategoryRepository } from "../types/ICategoryRepository";
import { Category, CreateCategoryData, UpdateCategoryData } from "../models/Category";

export class CategoryRepository implements ICategoryRepository {
  async create(data: CreateCategoryData): Promise<Category> {
    return (await prisma.category.create({
      data,
    })) as Category;
  }

  async findById(id: string): Promise<Category | null> {
    return (await prisma.category.findUnique({
      where: { id },
    })) as Category | null;
  }

  async findByUserId(userId: string): Promise<Category[]> {
    return (await prisma.category.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })) as Category[];
  }

  async findByNameAndUserId(name: string, userId: string): Promise<Category | null> {
    return (await prisma.category.findFirst({
      where: {
        name,
        userId,
      },
    })) as Category | null;
  }

  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    return (await prisma.category.update({
      where: { id },
      data,
    })) as Category;
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id },
    }) as any;
  }
}