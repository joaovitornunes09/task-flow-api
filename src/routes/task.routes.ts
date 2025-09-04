import z from "zod";
import { FastifyTypedInstance } from "../types/fastify";
import { withAuth } from "../middlewares/auth";
import { TaskController } from "../controllers/TaskController";

const TaskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]);
const TaskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

export async function taskRoutes(app: FastifyTypedInstance, taskController: TaskController) {
  app.post(
    "/tasks",
    withAuth({
      schema: {
        description: "Create a new task",
        tags: ["Tasks"],
        summary: "Create task",
        body: z.object({
          title: z.string().describe("Task title"),
          description: z.string().optional().describe("Task description"),
          priority: TaskPriorityEnum.describe("Task priority"),
          dueDate: z.string().optional().transform(date => date ? new Date(date) : undefined).describe("Due date (ISO string)"),
          categoryId: z.string().optional().describe("Category ID"),
          assignedUserId: z.string().describe("User ID to assign task to"),
        }),
        response: {
          201: z.object({
            message: z.string(),
            data: z.object({
              id: z.string(),
              title: z.string(),
              description: z.string().nullable(),
              status: TaskStatusEnum,
              priority: TaskPriorityEnum,
              dueDate: z.date().nullable().transform(date => date ? date.toISOString() : null),
              categoryId: z.string().nullable(),
              assignedUserId: z.string(),
              createdById: z.string(),
              createdAt: z.date().transform(date => date.toISOString()),
              updatedAt: z.date().transform(date => date.toISOString()),
            }),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    }),
    taskController.create.bind(taskController)
  );

  app.get(
    "/tasks/:id",
    withAuth({
      schema: {
        description: "Get task by ID",
        tags: ["Tasks"],
        summary: "Get task",
        params: z.object({
          id: z.string().describe("Task ID"),
        }),
        response: {
          200: z.object({
            message: z.string(),
            data: z.object({
              id: z.string(),
              title: z.string(),
              description: z.string().nullable(),
              status: TaskStatusEnum,
              priority: TaskPriorityEnum,
              dueDate: z.date().nullable().transform(date => date ? date.toISOString() : null),
              categoryId: z.string().nullable(),
              assignedUserId: z.string(),
              createdById: z.string(),
              createdAt: z.date().transform(date => date.toISOString()),
              updatedAt: z.date().transform(date => date.toISOString()),
            }),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    }),
    taskController.getById.bind(taskController)
  );

  app.get(
    "/tasks",
    withAuth({
      schema: {
        description: "Get all tasks for current user",
        tags: ["Tasks"],
        summary: "Get user tasks",
        response: {
          200: z.object({
            message: z.string(),
            data: z.array(z.object({
              id: z.string(),
              title: z.string(),
              description: z.string().nullable(),
              status: TaskStatusEnum,
              priority: TaskPriorityEnum,
              dueDate: z.date().nullable().transform(date => date ? date.toISOString() : null),
              categoryId: z.string().nullable(),
              assignedUserId: z.string(),
              createdById: z.string(),
              createdAt: z.date().transform(date => date.toISOString()),
              updatedAt: z.date().transform(date => date.toISOString()),
            })),
          }),
        },
      },
    }),
    taskController.getByUser.bind(taskController)
  );

  app.get(
    "/tasks/category/:categoryId",
    withAuth({
      schema: {
        description: "Get tasks by category",
        tags: ["Tasks"],
        summary: "Get tasks by category",
        params: z.object({
          categoryId: z.string().describe("Category ID"),
        }),
        response: {
          200: z.object({
            message: z.string(),
            data: z.array(z.object({
              id: z.string(),
              title: z.string(),
              description: z.string().nullable(),
              status: TaskStatusEnum,
              priority: TaskPriorityEnum,
              dueDate: z.date().nullable().transform(date => date ? date.toISOString() : null),
              categoryId: z.string().nullable(),
              assignedUserId: z.string(),
              createdById: z.string(),
              createdAt: z.date().transform(date => date.toISOString()),
              updatedAt: z.date().transform(date => date.toISOString()),
            })),
          }),
        },
      },
    }),
    taskController.getByCategory.bind(taskController)
  );

  app.get(
    "/tasks/status/:status",
    withAuth({
      schema: {
        description: "Get tasks by status",
        tags: ["Tasks"],
        summary: "Get tasks by status",
        params: z.object({
          status: TaskStatusEnum.describe("Task status"),
        }),
        response: {
          200: z.object({
            message: z.string(),
            data: z.array(z.object({
              id: z.string(),
              title: z.string(),
              description: z.string().nullable(),
              status: TaskStatusEnum,
              priority: TaskPriorityEnum,
              dueDate: z.date().nullable().transform(date => date ? date.toISOString() : null),
              categoryId: z.string().nullable(),
              assignedUserId: z.string(),
              createdById: z.string(),
              createdAt: z.date().transform(date => date.toISOString()),
              updatedAt: z.date().transform(date => date.toISOString()),
            })),
          }),
        },
      },
    }),
    taskController.getByStatus.bind(taskController)
  );

  app.get(
    "/tasks/assigned",
    withAuth({
      schema: {
        description: "Get tasks assigned to current user",
        tags: ["Tasks"],
        summary: "Get assigned tasks",
        response: {
          200: z.object({
            message: z.string(),
            data: z.array(z.object({
              id: z.string(),
              title: z.string(),
              description: z.string().nullable(),
              status: TaskStatusEnum,
              priority: TaskPriorityEnum,
              dueDate: z.date().nullable().transform(date => date ? date.toISOString() : null),
              categoryId: z.string().nullable(),
              assignedUserId: z.string(),
              createdById: z.string(),
              createdAt: z.date().transform(date => date.toISOString()),
              updatedAt: z.date().transform(date => date.toISOString()),
            })),
          }),
        },
      },
    }),
    taskController.getAssigned.bind(taskController)
  );

  app.put(
    "/tasks/:id",
    withAuth({
      schema: {
        description: "Update task",
        tags: ["Tasks"],
        summary: "Update task",
        params: z.object({
          id: z.string().describe("Task ID"),
        }),
        body: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          status: TaskStatusEnum.optional(),
          priority: TaskPriorityEnum.optional(),
          dueDate: z.string().optional().transform(date => date ? new Date(date) : undefined),
          categoryId: z.string().optional(),
          assignedUserId: z.string().optional(),
        }),
        response: {
          200: z.object({
            message: z.string(),
            data: z.object({
              id: z.string(),
              title: z.string(),
              description: z.string().nullable(),
              status: TaskStatusEnum,
              priority: TaskPriorityEnum,
              dueDate: z.date().nullable().transform(date => date ? date.toISOString() : null),
              categoryId: z.string().nullable(),
              assignedUserId: z.string(),
              createdById: z.string(),
              createdAt: z.date().transform(date => date.toISOString()),
              updatedAt: z.date().transform(date => date.toISOString()),
            }),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    }),
    taskController.update.bind(taskController)
  );

  app.delete(
    "/tasks/:id",
    withAuth({
      schema: {
        description: "Delete task",
        tags: ["Tasks"],
        summary: "Delete task",
        params: z.object({
          id: z.string().describe("Task ID"),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    }),
    taskController.delete.bind(taskController)
  );
}
