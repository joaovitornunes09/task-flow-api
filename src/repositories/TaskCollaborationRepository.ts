import { prisma } from "../lib/prisma";
import { ITaskCollaborationRepository } from "../types/ITaskCollaborationRepository";
import { TaskCollaboration, CreateTaskCollaborationData } from "../models/TaskCollaboration";

export class TaskCollaborationRepository implements ITaskCollaborationRepository {
  async create(data: CreateTaskCollaborationData): Promise<TaskCollaboration> {
    const result = await prisma.taskCollaboration.create({
      data,
    });
    return result as TaskCollaboration;
  }

  async findByTaskId(taskId: string): Promise<TaskCollaboration[]> {
    const results = await prisma.taskCollaboration.findMany({
      where: { taskId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return results as TaskCollaboration[];
  }

  async findByUserId(userId: string): Promise<TaskCollaboration[]> {
    const results = await prisma.taskCollaboration.findMany({
      where: { userId },
      include: {
        task: true,
      },
    });
    return results as TaskCollaboration[];
  }

  async findByTaskAndUser(taskId: string, userId: string): Promise<TaskCollaboration | null> {
    const result = await prisma.taskCollaboration.findUnique({
      where: {
        taskId_userId: {
          taskId,
          userId,
        },
      },
    });
    return result as TaskCollaboration | null;
  }

  async delete(taskId: string, userId: string): Promise<void> {
    await prisma.taskCollaboration.delete({
      where: {
        taskId_userId: {
          taskId,
          userId,
        },
      },
    });
  }

  async deleteAllByTaskId(taskId: string): Promise<void> {
    await prisma.taskCollaboration.deleteMany({
      where: { taskId },
    });
  }
}