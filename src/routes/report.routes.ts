import z from "zod";
import { FastifyTypedInstance } from "../types/fastify";
import { withAuth } from "../middlewares/auth";
import { ReportController } from "../controllers/ReportController";

export async function reportRoutes(app: FastifyTypedInstance, reportController: ReportController) {
  app.get(
    "/reports/user",
    withAuth({
      schema: {
        description: "Get task report for current user",
        tags: ["Reports"],
        summary: "Get user report",
        response: {
          200: z.object({
            message: z.string(),
            data: z.object({
              totalTasks: z.number(),
              tasksByStatus: z.object({
                TODO: z.number(),
                IN_PROGRESS: z.number(),
                COMPLETED: z.number(),
              }),
              tasksByCategory: z.array(z.object({
                categoryId: z.string(),
                categoryName: z.string(),
                count: z.number(),
              })),
              overdueTasks: z.number(),
              completedThisMonth: z.number(),
            }),
          }),
        },
      },
    }),
    reportController.getUserReport.bind(reportController)
  );

  app.post(
    "/reports/team",
    withAuth({
      schema: {
        description: "Get report for multiple users",
        tags: ["Reports"],
        summary: "Get team report",
        body: z.object({
          userIds: z.array(z.string()).describe("Array of user IDs"),
        }),
        response: {
          200: z.object({
            message: z.string(),
            data: z.array(z.object({
              userId: z.string(),
              userName: z.string(),
              assignedTasks: z.number(),
              completedTasks: z.number(),
              overdueTasks: z.number(),
            })),
          }),
        },
      },
    }),
    reportController.getTeamReport.bind(reportController)
  );

  app.get(
    "/reports/completed-tasks",
    withAuth({
      schema: {
        description: "Get count of tasks completed in a period",
        tags: ["Reports"],
        summary: "Get completed tasks count",
        querystring: z.object({
          startDate: z.string().describe("Start date (ISO string)"),
          endDate: z.string().describe("End date (ISO string)"),
          userId: z.string().optional().describe("User ID (optional, defaults to current user)"),
        }),
        response: {
          200: z.object({
            message: z.string(),
            data: z.object({
              userId: z.string(),
              startDate: z.string(),
              endDate: z.string(),
              completedTasks: z.number(),
            }),
          }),
          400: z.object({
            message: z.string(),
          }),
        },
      },
    }),
    reportController.getCompletedTasksInPeriod.bind(reportController)
  );
}
