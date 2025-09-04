import { TaskCollaboration, CreateTaskCollaborationData } from "../models/TaskCollaboration";

export interface ITaskCollaborationRepository {
  create(data: CreateTaskCollaborationData): Promise<TaskCollaboration>;
  findByTaskId(taskId: string): Promise<TaskCollaboration[]>;
  findByUserId(userId: string): Promise<TaskCollaboration[]>;
  findByTaskAndUser(taskId: string, userId: string): Promise<TaskCollaboration | null>;
  delete(taskId: string, userId: string): Promise<void>;
  deleteAllByTaskId(taskId: string): Promise<void>;
}