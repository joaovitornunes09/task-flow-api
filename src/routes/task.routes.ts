import z from "zod";
import { formatISO, parseISO } from "date-fns";
import { FastifyTypedInstance } from "../types/fastify";
import { withAuth } from "../middlewares/auth";
import { TaskController } from "../controllers/TaskController";

const TaskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]);
const TaskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

const TaskUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

const TaskCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  color: z.string().nullable(),
});

const TaskWithDetailsSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: TaskStatusEnum,
  priority: TaskPriorityEnum,
  dueDate: z.date().nullable().transform(date => date ? formatISO(date) : null),
  categoryId: z.string().nullable(),
  assignedUserId: z.string(),
  createdById: z.string(),
  createdAt: z.date().transform(date => formatISO(date)),
  updatedAt: z.date().transform(date => formatISO(date)),
  assignedUser: TaskUserSchema,
  category: TaskCategorySchema.nullable(),
  createdBy: TaskUserSchema,
});

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
          dueDate: z.string().optional().transform(date => date ? parseISO(date) : undefined).describe("Due date (ISO string)"),
          categoryId: z.string().optional().describe("Category ID"),
          assignedUserId: z.string().describe("User ID to assign task to"),
        }),
        response: {
          201: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              id: z.string(),
              title: z.string(),
              description: z.string().nullable(),
              status: TaskStatusEnum,
              priority: TaskPriorityEnum,
              dueDate: z.date().nullable().transform(date => date ? formatISO(date) : null),
              categoryId: z.string().nullable(),
              assignedUserId: z.string(),
              createdById: z.string(),
              createdAt: z.date().transform(date => formatISO(date)),
              updatedAt: z.date().transform(date => formatISO(date)),
            }),
          }),
          400: z.object({
            success: z.boolean(),
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
            success: z.boolean(),
            message: z.string(),
            data: TaskWithDetailsSchema,
          }),
          404: z.object({
            success: z.boolean(),
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
            success: z.boolean(),
            message: z.string(),
            data: z.array(TaskWithDetailsSchema),
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
            success: z.boolean(),
            message: z.string(),
            data: z.array(TaskWithDetailsSchema),
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
            success: z.boolean(),
            message: z.string(),
            data: z.array(TaskWithDetailsSchema),
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
            success: z.boolean(),
            message: z.string(),
            data: z.array(TaskWithDetailsSchema),
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
          dueDate: z.string().optional().transform(date => date ? parseISO(date) : undefined),
          categoryId: z.string().optional(),
          assignedUserId: z.string().optional(),
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              id: z.string(),
              title: z.string(),
              description: z.string().nullable(),
              status: TaskStatusEnum,
              priority: TaskPriorityEnum,
              dueDate: z.date().nullable().transform(date => date ? formatISO(date) : null),
              categoryId: z.string().nullable(),
              assignedUserId: z.string(),
              createdById: z.string(),
              createdAt: z.date().transform(date => formatISO(date)),
              updatedAt: z.date().transform(date => formatISO(date)),
            }),
          }),
          400: z.object({
            success: z.boolean(),
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
    taskController.delete.bind(taskController)
  );
}
