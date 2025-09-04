import { FastifyRequest, FastifyReply } from "fastify";
import { ITaskService } from "../types/ITaskService";
import { CreateTaskData, UpdateTaskData, TaskStatus } from "../models/Task";


export class TaskController {
  constructor(private taskService: ITaskService) {}

  async create(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.id;
      const taskData = {
        ...request.body as CreateTaskData,
        createdById: userId,
      };

      const task = await this.taskService.createTask(taskData);

      return reply.status(201).send({
        message: "Task created successfully",
        data: task,
      });
    } catch (error) {
      return reply.status(400).send({
        message: error instanceof Error ? error.message : "Task creation failed",
      });
    }
  }

  async getById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user.id;
      const task = await this.taskService.getTaskById(id, userId);

      return reply.status(200).send({
        message: "Task retrieved successfully",
        data: task,
      });
    } catch (error) {
      return reply.status(404).send({
        message: error instanceof Error ? error.message : "Task not found",
      });
    }
  }

  async getByUser(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.id;
      const tasks = await this.taskService.getTasksByUser(userId);

      return reply.status(200).send({
        message: "Tasks retrieved successfully",
        data: tasks,
      });
    } catch (error) {
      return reply.status(500).send({
        message: "Failed to retrieve tasks",
      });
    }
  }

  async getByCategory(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { categoryId } = request.params as { categoryId: string };
      const userId = request.user.id;
      const tasks = await this.taskService.getTasksByCategory(categoryId, userId);

      return reply.status(200).send({
        message: "Tasks retrieved successfully",
        data: tasks,
      });
    } catch (error) {
      return reply.status(500).send({
        message: "Failed to retrieve tasks",
      });
    }
  }

  async getByStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { status } = request.params as { status: TaskStatus };
      const userId = request.user.id;
      const tasks = await this.taskService.getTasksByStatus(status, userId);

      return reply.status(200).send({
        message: "Tasks retrieved successfully",
        data: tasks,
      });
    } catch (error) {
      return reply.status(500).send({
        message: "Failed to retrieve tasks",
      });
    }
  }

  async getAssigned(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.id;
      const tasks = await this.taskService.getAssignedTasks(userId);

      return reply.status(200).send({
        message: "Assigned tasks retrieved successfully",
        data: tasks,
      });
    } catch (error) {
      return reply.status(500).send({
        message: "Failed to retrieve assigned tasks",
      });
    }
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user.id;

      const task = await this.taskService.updateTask(id, request.body as UpdateTaskData, userId);

      return reply.status(200).send({
        message: "Task updated successfully",
        data: task,
      });
    } catch (error) {
      return reply.status(400).send({
        message: error instanceof Error ? error.message : "Task update failed",
      });
    }
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const userId = request.user.id;

      await this.taskService.deleteTask(id, userId);

      return reply.status(200).send({
        message: "Task deleted successfully",
      });
    } catch (error) {
      return reply.status(400).send({
        message: error instanceof Error ? error.message : "Task deletion failed",
      });
    }
  }
}
