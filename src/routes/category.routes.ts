import z from "zod";
import { FastifyTypedInstance } from "../types/fastify";
import { withAuth } from "../middlewares/auth";
import { CategoryController } from "../controllers/CategoryController";

export async function categoryRoutes(app: FastifyTypedInstance, categoryController: CategoryController) {
  app.post(
    "/categories",
    withAuth({
      schema: {
        description: "Create a new category",
        tags: ["Categories"],
        summary: "Create category",
        body: z.object({
          name: z.string().describe("Category name"),
          description: z.string().optional().describe("Category description"),
          color: z.string().optional().describe("Category color"),
        }),
        response: {
          201: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().optional().nullable(),
              color: z.string().optional().nullable(),
              userId: z.string(),
              createdAt: z.date(),
              updatedAt: z.date(),
            }),
          }),
          400: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    }),
    categoryController.create.bind(categoryController)
  );

  app.get(
    "/categories/:id",
    withAuth({
      schema: {
        description: "Get category by ID",
        tags: ["Categories"],
        summary: "Get category",
        params: z.object({
          id: z.string().describe("Category ID"),
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().optional().nullable(),
              color: z.string().optional().nullable(),
              userId: z.string(),
              createdAt: z.date(),
              updatedAt: z.date(),
            }),
          }),
          404: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    }),
    categoryController.getById.bind(categoryController)
  );

  app.get(
    "/categories",
    withAuth({
      schema: {
        description: "Get all categories for current user",
        tags: ["Categories"],
        summary: "Get user categories",
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.array(z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().optional().nullable(),
              color: z.string().optional().nullable(),
              userId: z.string(),
              createdAt: z.date(),
              updatedAt: z.date(),
            })),
          }),
        },
      },
    }),
    categoryController.getByUser.bind(categoryController)
  );

  app.put(
    "/categories/:id",
    withAuth({
      schema: {
        description: "Update category",
        tags: ["Categories"],
        summary: "Update category",
        params: z.object({
          id: z.string().describe("Category ID"),
        }),
        body: z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          color: z.string().optional(),
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              id: z.string(),
              name: z.string(),
              description: z.string().optional().nullable(),
              color: z.string().optional().nullable(),
              userId: z.string(),
              createdAt: z.date(),
              updatedAt: z.date(),
            }),
          }),
          400: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    }),
    categoryController.update.bind(categoryController)
  );

  app.delete(
    "/categories/:id",
    withAuth({
      schema: {
        description: "Delete category",
        tags: ["Categories"],
        summary: "Delete category",
        params: z.object({
          id: z.string().describe("Category ID"),
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
          400: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    }),
    categoryController.delete.bind(categoryController)
  );
}
