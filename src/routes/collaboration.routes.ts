import z from "zod";
import { formatISO } from "date-fns";
import { FastifyTypedInstance } from "../types/fastify";
import { withAuth } from "../middlewares/auth";
import { CollaborationController } from "../controllers/CollaborationController";

const CollaborationRoleEnum = z.enum(["OWNER", "COLLABORATOR", "VIEWER"]);

export async function collaborationRoutes(app: FastifyTypedInstance, collaborationController: CollaborationController) {
  app.post(
    "/collaborations",
    withAuth({
      schema: {
        description: "Add collaborator to task",
        tags: ["Collaboration"],
        summary: "Add collaborator",
        body: z.object({
          taskId: z.string().describe("Task ID"),
          userId: z.string().describe("User ID to add as collaborator"),
          role: CollaborationRoleEnum.describe("Collaboration role"),
        }),
        response: {
          201: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              id: z.string(),
              taskId: z.string(),
              userId: z.string(),
              role: CollaborationRoleEnum,
              createdAt: z.date().transform(date => formatISO(date)),
            }),
          }),
          400: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    }),
    collaborationController.addCollaborator.bind(collaborationController)
  );

  app.get(
    "/collaborations/task/:taskId",
    withAuth({
      schema: {
        description: "Get all collaborators for a task",
        tags: ["Collaboration"],
        summary: "Get task collaborators",
        params: z.object({
          taskId: z.string().describe("Task ID"),
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.array(z.object({
              id: z.string(),
              taskId: z.string(),
              userId: z.string(),
              role: CollaborationRoleEnum,
              createdAt: z.date().transform(date => formatISO(date)),
              user: z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
              }).optional(),
            })),
          }),
          400: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    }),
    collaborationController.getTaskCollaborators.bind(collaborationController)
  );

  app.get(
    "/collaborations/user",
    withAuth({
      schema: {
        description: "Get all collaborations for current user",
        tags: ["Collaboration"],
        summary: "Get user collaborations",
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.array(z.object({
              id: z.string(),
              taskId: z.string(),
              userId: z.string(),
              role: CollaborationRoleEnum,
              createdAt: z.date().transform(date => formatISO(date)),
              task: z.object({
                id: z.string(),
                title: z.string(),
                description: z.string().nullable(),
                status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]),
                priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
                dueDate: z.date().nullable().transform(date => date ? formatISO(date) : null),
                categoryId: z.string().nullable(),
                assignedUserId: z.string(),
                createdById: z.string(),
                createdAt: z.date().transform(date => formatISO(date)),
                updatedAt: z.date().transform(date => formatISO(date)),
              }).optional(),
            })),
          }),
        },
      },
    }),
    collaborationController.getUserCollaborations.bind(collaborationController)
  );

  app.delete(
    "/collaborations/task/:taskId/user/:userId",
    withAuth({
      schema: {
        description: "Remove collaborator from task",
        tags: ["Collaboration"],
        summary: "Remove collaborator",
        params: z.object({
          taskId: z.string().describe("Task ID"),
          userId: z.string().describe("User ID to remove"),
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
    collaborationController.removeCollaborator.bind(collaborationController)
  );

  app.get(
    "/collaborations/permission/:taskId",
    withAuth({
      schema: {
        description: "Check user permission for task",
        tags: ["Collaboration"],
        summary: "Check permission",
        params: z.object({
          taskId: z.string().describe("Task ID"),
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              permission: CollaborationRoleEnum.nullable(),
            }),
          }),
        },
      },
    }),
    collaborationController.checkPermission.bind(collaborationController)
  );
}
