import { TaskCollaboration, CreateTaskCollaborationData } from "../models/TaskCollaboration";

export interface ICollaborationService {
  addCollaborator(data: CreateTaskCollaborationData, ownerId: string): Promise<TaskCollaboration>;
  getTaskCollaborators(taskId: string, userId: string): Promise<TaskCollaboration[]>;
  getUserCollaborations(userId: string): Promise<TaskCollaboration[]>;
  removeCollaborator(taskId: string, userId: string, ownerId: string): Promise<void>;
  checkUserPermission(taskId: string, userId: string): Promise<'OWNER' | 'COLLABORATOR' | 'VIEWER' | null>;
}