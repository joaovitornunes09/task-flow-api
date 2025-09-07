import { FastifyRequest, FastifyReply } from "fastify";
import { parseISO } from "date-fns";
import { IReportService } from "../types/IReportService";

export class ReportController {
  constructor(private reportService: IReportService) {}

  async getUserReport(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.id;
      const report = await this.reportService.getUserTaskReport(userId);
      
      return reply.status(200).send({
        success: true,
        message: "User report retrieved successfully",
        data: report,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Failed to generate user report",
      });
    }
  }

  async getTeamReport(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { userIds } = request.body as { userIds: string[] };
      const report = await this.reportService.getTeamReport(userIds);
      
      return reply.status(200).send({
        success: true,
        message: "Team report retrieved successfully",
        data: report,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Failed to generate team report",
      });
    }
  }

  async getCompletedTasksInPeriod(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { startDate, endDate, userId } = request.query as { startDate: string; endDate: string; userId?: string };
      const targetUserId = userId || request.user.id;
      
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      
      const count = await this.reportService.getTasksCompletedInPeriod(targetUserId, start, end);
      
      return reply.status(200).send({
        success: true,
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
        success: false,
        message: error instanceof Error ? error.message : "Failed to get completed tasks count",
      });
    }
  }
}