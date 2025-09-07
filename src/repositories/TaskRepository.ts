import { prisma } from "../lib/prisma";
import { ITaskRepository } from "../types/ITaskRepository";
import { Task, CreateTaskData, UpdateTaskData, TaskStatus, TaskWithDetails } from "../models/Task";

export class TaskRepository implements ITaskRepository {
  async create(data: CreateTaskData): Promise<Task> {
    return (await prisma.task.create({
      data: {
        ...data,
        status: 'TODO',
      },
    })) as Task;
  }

  async findById(id: string): Promise<TaskWithDetails | null> {
    return (await prisma.task.findUnique({
      where: { id },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })) as TaskWithDetails | null;
  }

  async findByUserId(userId: string): Promise<TaskWithDetails[]> {
    return (await prisma.task.findMany({
      where: {
        OR: [
          { assignedUserId: userId },
          { createdById: userId },
        ],
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })) as TaskWithDetails[];
  }

  async findByCategoryId(categoryId: string): Promise<TaskWithDetails[]> {
    return (await prisma.task.findMany({
      where: { categoryId },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })) as TaskWithDetails[];
  }

  async findByStatus(status: TaskStatus): Promise<TaskWithDetails[]> {
    return (await prisma.task.findMany({
      where: { status },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })) as TaskWithDetails[];
  }

  async findByAssignedUser(userId: string): Promise<TaskWithDetails[]> {
    return (await prisma.task.findMany({
      where: { assignedUserId: userId },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })) as TaskWithDetails[];
  }

  async findByCreatedUser(userId: string): Promise<TaskWithDetails[]> {
    return (await prisma.task.findMany({
      where: { createdById: userId },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })) as TaskWithDetails[];
  }

  async findByTitleAndCategory(title: string, categoryId: string | null): Promise<TaskWithDetails | null> {
    return (await prisma.task.findFirst({
      where: {
        title,
        categoryId,
      },
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })) as TaskWithDetails | null;
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

  async findAll(): Promise<TaskWithDetails[]> {
    return (await prisma.task.findMany({
      include: {
        assignedUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            color: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })) as TaskWithDetails[];
  }
}