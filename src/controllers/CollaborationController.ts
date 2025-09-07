import { FastifyRequest, FastifyReply } from "fastify";
import { ICollaborationService } from "../types/ICollaborationService";
import { CreateTaskCollaborationData } from "../models/TaskCollaboration";

export class CollaborationController {
  constructor(private collaborationService: ICollaborationService) {}

  async addCollaborator(request: FastifyRequest, reply: FastifyReply) {
    try {
      const ownerId = request.user.id;
      const collaboration = await this.collaborationService.addCollaborator(request.body as CreateTaskCollaborationData, ownerId);
      
      return reply.status(201).send({
        success: true,
        message: "Collaborator added successfully",
        data: collaboration,
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : "Failed to add collaborator",
      });
    }
  }

  async getTaskCollaborators(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { taskId } = request.params as { taskId: string };
      const userId = request.user.id;
      const collaborators = await this.collaborationService.getTaskCollaborators(taskId, userId);
      
      return reply.status(200).send({
        success: true,
        message: "Collaborators retrieved successfully",
        data: collaborators,
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : "Failed to retrieve collaborators",
      });
    }
  }

  async getUserCollaborations(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.id;
      const collaborations = await this.collaborationService.getUserCollaborations(userId);
      
      return reply.status(200).send({
        success: true,
        message: "Collaborations retrieved successfully",
        data: collaborations,
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Failed to retrieve collaborations",
      });
    }
  }

  async removeCollaborator(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { taskId, userId } = request.params as { taskId: string; userId: string };
      const ownerId = request.user.id;
      
      await this.collaborationService.removeCollaborator(taskId, userId, ownerId);
      
      return reply.status(200).send({
        success: true,
        message: "Collaborator removed successfully",
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : "Failed to remove collaborator",
      });
    }
  }

  async checkPermission(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { taskId } = request.params as { taskId: string };
      const userId = request.user.id;
      const permission = await this.collaborationService.checkUserPermission(taskId, userId);
      
      return reply.status(200).send({
        success: true,
        message: "Permission checked successfully",
        data: { permission },
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Failed to check permission",
      });
    }
  }
}