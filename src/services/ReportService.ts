import { startOfMonth } from "date-fns";
import { IReportService, TaskReport, UserReport } from "../types/IReportService";
import { ITaskRepository } from "../types/ITaskRepository";
import { ICategoryRepository } from "../types/ICategoryRepository";
import { IUserRepository } from "../types/IUserRepository";
import { TaskStatus } from "../models/Task";

export class ReportService implements IReportService {
  constructor(
    private taskRepository: ITaskRepository,
    private categoryRepository: ICategoryRepository,
    private userRepository: IUserRepository
  ) {}

  async getUserTaskReport(userId: string): Promise<TaskReport> {
    const userTasks = await this.taskRepository.findByUserId(userId);
    const now = new Date();
    const startOfMonthDate = startOfMonth(now);

    const tasksByStatus = {
      [TaskStatus.TODO]: 0,
      [TaskStatus.IN_PROGRESS]: 0,
      [TaskStatus.COMPLETED]: 0,
    };

    let overdueTasks = 0;
    let completedThisMonth = 0;

    userTasks.forEach(task => {
      tasksByStatus[task.status]++;

      if (task.dueDate && task.dueDate < now && task.status !== TaskStatus.COMPLETED) {
        overdueTasks++;
      }

      if (task.status === TaskStatus.COMPLETED && task.updatedAt >= startOfMonthDate) {
        completedThisMonth++;
      }
    });

    const categoryMap = new Map();
    for (const task of userTasks) {
      if (task.categoryId) {
        if (!categoryMap.has(task.categoryId)) {
          const category = await this.categoryRepository.findById(task.categoryId);
          categoryMap.set(task.categoryId, {
            categoryId: task.categoryId,
            categoryName: category?.name || 'Unknown',
            count: 0,
          });
        }
        categoryMap.get(task.categoryId).count++;
      }
    }

    const tasksByCategory = Array.from(categoryMap.values());

    return {
      totalTasks: userTasks.length,
      tasksByStatus,
      tasksByCategory,
      overdueTasks,
      completedThisMonth,
    };
  }

  async getTeamReport(userIds: string[]): Promise<UserReport[]> {
    const reports = [];

    for (const userId of userIds) {
      const user = await this.userRepository.findById(userId);
      if (!user) continue;

      const assignedTasks = await this.taskRepository.findByAssignedUser(userId);
      const completedTasks = assignedTasks.filter(task => task.status === TaskStatus.COMPLETED).length;
      const now = new Date();
      const overdueTasks = assignedTasks.filter(task =>
        task.dueDate && task.dueDate < now && task.status !== TaskStatus.COMPLETED
      ).length;

      reports.push({
        userId,
        userName: user.name,
        assignedTasks: assignedTasks.length,
        completedTasks,
        overdueTasks,
      });
    }

    return reports;
  }

  async getTasksCompletedInPeriod(userId: string, startDate: Date, endDate: Date): Promise<number> {
    const userTasks = await this.taskRepository.findByUserId(userId);

    return userTasks.filter(task =>
      task.status === TaskStatus.COMPLETED &&
      task.updatedAt >= startDate &&
      task.updatedAt <= endDate
    ).length;
  }
}
