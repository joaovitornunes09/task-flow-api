import { ICollaborationService } from "../types/ICollaborationService";
import { ITaskCollaborationRepository } from "../types/ITaskCollaborationRepository";
import { ITaskRepository } from "../types/ITaskRepository";
import { TaskCollaboration, CreateTaskCollaborationData } from "../models/TaskCollaboration";

export class CollaborationService implements ICollaborationService {
  constructor(
    private collaborationRepository: ITaskCollaborationRepository,
    private taskRepository: ITaskRepository
  ) {}

  async addCollaborator(data: CreateTaskCollaborationData, ownerId: string): Promise<TaskCollaboration> {
    const task = await this.taskRepository.findById(data.taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const ownerCollaboration = await this.collaborationRepository.findByTaskAndUser(data.taskId, ownerId);
    const isOwner = task.createdById === ownerId ||
                   (ownerCollaboration && ownerCollaboration.role === 'OWNER');

    if (!isOwner) {
      throw new Error("Only task owners can add collaborators");
    }

    const existing = await this.collaborationRepository.findByTaskAndUser(data.taskId, data.userId);
    if (existing) {
      throw new Error("User is already a collaborator");
    }

    return await this.collaborationRepository.create(data);
  }

  async getTaskCollaborators(taskId: string, userId: string): Promise<TaskCollaboration[]> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const collaboration = await this.collaborationRepository.findByTaskAndUser(taskId, userId);
    const hasPermission = task.createdById === userId ||
                         task.assignedUserId === userId ||
                         collaboration;

    if (!hasPermission) {
      throw new Error("Unauthorized to view task collaborators");
    }

    return await this.collaborationRepository.findByTaskId(taskId);
  }

  async getUserCollaborations(userId: string): Promise<TaskCollaboration[]> {
    return await this.collaborationRepository.findByUserId(userId);
  }

  async removeCollaborator(taskId: string, userId: string, ownerId: string): Promise<void> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    const ownerCollaboration = await this.collaborationRepository.findByTaskAndUser(taskId, ownerId);
    const isOwner = task.createdById === ownerId ||
                   (ownerCollaboration && ownerCollaboration.role === 'OWNER');

    if (!isOwner) {
      throw new Error("Only task owners can remove collaborators");
    }

    await this.collaborationRepository.delete(taskId, userId);
  }

  async checkUserPermission(taskId: string, userId: string): Promise<'OWNER' | 'COLLABORATOR' | 'VIEWER' | null> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      return null;
    }

    if (task.createdById === userId) {
      return 'OWNER';
    }

    if (task.assignedUserId === userId) {
      return 'COLLABORATOR';
    }

    const collaboration = await this.collaborationRepository.findByTaskAndUser(taskId, userId);
    return collaboration ? collaboration.role : null;
  }
}
