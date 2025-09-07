import { Task, CreateTaskData, UpdateTaskData, TaskStatus, TaskWithDetails } from "../models/Task";

export interface ITaskRepository {
  create(data: CreateTaskData): Promise<Task>;
  findById(id: string): Promise<TaskWithDetails | null>;
  findByUserId(userId: string): Promise<TaskWithDetails[]>;
  findByCategoryId(categoryId: string): Promise<TaskWithDetails[]>;
  findByStatus(status: TaskStatus): Promise<TaskWithDetails[]>;
  findByAssignedUser(userId: string): Promise<TaskWithDetails[]>;
  findByCreatedUser(userId: string): Promise<TaskWithDetails[]>;
  findByTitleAndCategory(title: string, categoryId: string | null): Promise<TaskWithDetails | null>;
  update(id: string, data: UpdateTaskData): Promise<Task>;
  delete(id: string): Promise<void>;
  findAll(): Promise<TaskWithDetails[]>;
}