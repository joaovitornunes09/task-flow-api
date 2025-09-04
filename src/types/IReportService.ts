import { TaskStatus } from "../models/Task";

export interface TaskReport {
  totalTasks: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByCategory: Array<{
    categoryId: string;
    categoryName: string;
    count: number;
  }>;
  overdueTasks: number;
  completedThisMonth: number;
}

export interface UserReport {
  userId: string;
  userName: string;
  assignedTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

export interface IReportService {
  getUserTaskReport(userId: string): Promise<TaskReport>;
  getTeamReport(userIds: string[]): Promise<UserReport[]>;
  getTasksCompletedInPeriod(userId: string, startDate: Date, endDate: Date): Promise<number>;
}