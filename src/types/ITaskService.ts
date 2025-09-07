import { Task, CreateTaskData, UpdateTaskData, TaskStatus, TaskWithDetails } from "../models/Task";

export interface ITaskService {
  createTask(data: CreateTaskData): Promise<Task>;
  getTaskById(id: string, userId: string): Promise<TaskWithDetails>;
  getTasksByUser(userId: string): Promise<TaskWithDetails[]>;
  getTasksByCategory(categoryId: string, userId: string): Promise<TaskWithDetails[]>;
  getTasksByStatus(status: TaskStatus, userId: string): Promise<TaskWithDetails[]>;
  getAssignedTasks(userId: string): Promise<TaskWithDetails[]>;
  updateTask(id: string, data: UpdateTaskData, userId: string): Promise<Task>;
  deleteTask(id: string, userId: string): Promise<void>;
}