import { FastifyRequest, FastifyReply } from "fastify";
import { IReportService } from "../types/IReportService";

export class ReportController {
  constructor(private reportService: IReportService) {}

  async getUserReport(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.id;
      const report = await this.reportService.getUserTaskReport(userId);
      
      return reply.status(200).send({
        message: "User report retrieved successfully",
        data: report,
      });
    } catch (error) {
      return reply.status(500).send({
        message: "Failed to generate user report",
      });
    }
  }

  async getTeamReport(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userIds } = request.body as { userIds: string[] };
      const report = await this.reportService.getTeamReport(userIds);
      
      return reply.status(200).send({
        message: "Team report retrieved successfully",
        data: report,
      });
    } catch (error) {
      return reply.status(500).send({
        message: "Failed to generate team report",
      });
    }
  }

  async getCompletedTasksInPeriod(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { startDate, endDate, userId } = request.query as { startDate: string; endDate: string; userId?: string };
      const targetUserId = userId || request.user.id;
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      const count = await this.reportService.getTasksCompletedInPeriod(targetUserId, start, end);
      
      return reply.status(200).send({
        message: "Completed tasks count retrieved successfully",
        data: {
          userId: targetUserId,
          startDate,
          endDate,
          completedTasks: count,
        },
      });
    } catch (error) {
      return reply.status(400).send({
        message: error instanceof Error ? error.message : "Failed to get completed tasks count",
      });
    }
  }
}