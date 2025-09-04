import { prisma } from "../lib/prisma";
import { ITaskRepository } from "../types/ITaskRepository";
import { Task, CreateTaskData, UpdateTaskData, TaskStatus } from "../models/Task";

export class TaskRepository implements ITaskRepository {
  async create(data: CreateTaskData): Promise<Task> {
    return (await prisma.task.create({
      data: {
        ...data,
        status: 'TODO',
      },
    })) as Task;
  }

  async findById(id: string): Promise<Task | null> {
    return (await prisma.task.findUnique({
      where: { id },
    })) as Task | null;
  }

  async findByUserId(userId: string): Promise<Task[]> {
    return (await prisma.task.findMany({
      where: {
        OR: [
          { assignedUserId: userId },
          { createdById: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
    })) as Task[];
  }

  async findByCategoryId(categoryId: string): Promise<Task[]> {
    return (await prisma.task.findMany({
      where: { categoryId },
      orderBy: { createdAt: 'desc' },
    })) as Task[];
  }

  async findByStatus(status: TaskStatus): Promise<Task[]> {
    return (await prisma.task.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
    })) as Task[];
  }

  async findByAssignedUser(userId: string): Promise<Task[]> {
    return (await prisma.task.findMany({
      where: { assignedUserId: userId },
      orderBy: { createdAt: 'desc' },
    })) as Task[];
  }

  async findByCreatedUser(userId: string): Promise<Task[]> {
    return (await prisma.task.findMany({
      where: { createdById: userId },
      orderBy: { createdAt: 'desc' },
    })) as Task[];
  }

  async update(id: string, data: UpdateTaskData): Promise<Task> {
    return (await prisma.task.update({
      where: { id },
      data,
    })) as Task;
  }

  async delete(id: string): Promise<void> {
    await prisma.task.delete({
      where: { id },
    }) as any;
  }

  async findAll(): Promise<Task[]> {
    return (await prisma.task.findMany({
      orderBy: { createdAt: 'desc' },
    })) as Task[];
  }
}