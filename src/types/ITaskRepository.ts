import { Task, CreateTaskData, UpdateTaskData, TaskStatus } from "../models/Task";

export interface ITaskRepository {
  create(data: CreateTaskData): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findByUserId(userId: string): Promise<Task[]>;
  findByCategoryId(categoryId: string): Promise<Task[]>;
  findByStatus(status: TaskStatus): Promise<Task[]>;
  findByAssignedUser(userId: string): Promise<Task[]>;
  findByCreatedUser(userId: string): Promise<Task[]>;
  update(id: string, data: UpdateTaskData): Promise<Task>;
  delete(id: string): Promise<void>;
  findAll(): Promise<Task[]>;
}