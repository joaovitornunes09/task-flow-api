import { Task, CreateTaskData, UpdateTaskData, TaskStatus } from "../models/Task";

export interface ITaskService {
  createTask(data: CreateTaskData): Promise<Task>;
  getTaskById(id: string, userId: string): Promise<Task>;
  getTasksByUser(userId: string): Promise<Task[]>;
  getTasksByCategory(categoryId: string, userId: string): Promise<Task[]>;
  getTasksByStatus(status: TaskStatus, userId: string): Promise<Task[]>;
  getAssignedTasks(userId: string): Promise<Task[]>;
  updateTask(id: string, data: UpdateTaskData, userId: string): Promise<Task>;
  deleteTask(id: string, userId: string): Promise<void>;
}