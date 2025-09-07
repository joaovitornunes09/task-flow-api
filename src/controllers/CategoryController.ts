import { FastifyRequest, FastifyReply } from "fastify";
import { ICategoryService } from "../types/ICategoryService";
import { CreateCategoryData, UpdateCategoryData } from "../models/Category";

export class CategoryController {
  constructor(private categoryService: ICategoryService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.id;
      const categoryData = {
        ...(request.body as CreateCategoryData),
        userId,
      };
      
      const category = await this.categoryService.createCategory(categoryData);
      
      return reply.status(201).send({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : "Category creation failed",
      });
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const category = await this.categoryService.getCategoryById(id);
      
      return reply.status(200).send({
        success: true,
        message: "Category retrieved successfully",
        data: category,
      });
    } catch (error) {
      return reply.status(404).send({
        success: false,
        message: error instanceof Error ? error.message : "Category not found",
      });
    }
  }

  async getByUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.id;
      const categories = await this.categoryService.getCategoriesByUser(userId);
      
      return reply.status(200).send({
        success: true,
        message: "Categories retrieved successfully",
        data: categories,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Failed to retrieve categories",
      });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user.id;
      
      const category = await this.categoryService.updateCategory(id, request.body as UpdateCategoryData, userId);
      
      return reply.status(200).send({
        success: true,
        message: "Category updated successfully",
        data: category,
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : "Category update failed",
      });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user.id;
      
      await this.categoryService.deleteCategory(id, userId);
      
      return reply.status(200).send({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : "Category deletion failed",
      });
    }
  }
}