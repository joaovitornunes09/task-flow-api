import { ITaskService } from "../types/ITaskService";
import { ITaskRepository } from "../types/ITaskRepository";
import { ITaskCollaborationRepository } from "../types/ITaskCollaborationRepository";
import { Task, CreateTaskData, UpdateTaskData, TaskStatus } from "../models/Task";
import { CollaborationRole } from "../models/TaskCollaboration";

export class TaskService implements ITaskService {
  constructor(
    private taskRepository: ITaskRepository,
    private collaborationRepository: ITaskCollaborationRepository
  ) {}

  async createTask(data: CreateTaskData): Promise<Task> {
    const task = await this.taskRepository.create(data);

    await this.collaborationRepository.create({
      taskId: task.id,
      userId: data.createdById,
      role: CollaborationRole.OWNER,
    });

    return task;
  }

  async getTaskById(id: string, userId: string): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new Error("Task not found");
    }

    const collaboration = await this.collaborationRepository.findByTaskAndUser(id, userId);
    if (!collaboration && task.assignedUserId !== userId && task.createdById !== userId) {
      throw new Error("Unauthorized to view this task");
    }

    return task;
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    return await this.taskRepository.findByUserId(userId);
  }

  async getTasksByCategory(categoryId: string, userId: string): Promise<Task[]> {
    const tasks = await this.taskRepository.findByCategoryId(categoryId);

    const accessibleTasks = [];
    for (const task of tasks) {
      if (task.assignedUserId === userId || task.createdById === userId) {
        accessibleTasks.push(task);
        continue;
      }

      const collaboration = await this.collaborationRepository.findByTaskAndUser(task.id, userId);
      if (collaboration) {
        accessibleTasks.push(task);
      }
    }

    return accessibleTasks;
  }

  async getTasksByStatus(status: TaskStatus, userId: string): Promise<Task[]> {
    const allTasks = await this.taskRepository.findByStatus(status);

    const accessibleTasks = [];
    for (const task of allTasks) {
      if (task.assignedUserId === userId || task.createdById === userId) {
        accessibleTasks.push(task);
        continue;
      }

      const collaboration = await this.collaborationRepository.findByTaskAndUser(task.id, userId);
      if (collaboration) {
        accessibleTasks.push(task);
      }
    }

    return accessibleTasks;
  }

  async getAssignedTasks(userId: string): Promise<Task[]> {
    return await this.taskRepository.findByAssignedUser(userId);
  }

  async updateTask(id: string, data: UpdateTaskData, userId: string): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new Error("Task not found");
    }

    const collaboration = await this.collaborationRepository.findByTaskAndUser(id, userId);
    const hasEditPermission = task.createdById === userId ||
                            task.assignedUserId === userId ||
                            (collaboration && (collaboration.role === CollaborationRole.OWNER || collaboration.role === CollaborationRole.COLLABORATOR));

    if (!hasEditPermission) {
      throw new Error("Unauthorized to update this task");
    }

    return await this.taskRepository.update(id, data);
  }

  async deleteTask(id: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new Error("Task not found");
    }

    const collaboration = await this.collaborationRepository.findByTaskAndUser(id, userId);
    const canDelete = task.createdById === userId ||
                     (collaboration && collaboration.role === CollaborationRole.OWNER);

    if (!canDelete) {
      throw new Error("Unauthorized to delete this task");
    }

    await this.collaborationRepository.deleteAllByTaskId(id);
    await this.taskRepository.delete(id);
  }
}
