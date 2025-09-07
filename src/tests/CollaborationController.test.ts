import { CollaborationController } from '../controllers/CollaborationController';
import { ICollaborationService } from '../types/ICollaborationService';
import { FastifyRequest, FastifyReply } from 'fastify';

describe('CollaborationController', () => {
  let collaborationController: CollaborationController;
  let mockCollaborationService: jest.Mocked<ICollaborationService>;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  const mockCollaboration = {
    id: '1',
    taskId: 'task1',
    userId: 'user2',
    role: 'COLLABORATOR' as any,
    createdAt: new Date(),
  };

  const mockCollaborators = [
    {
      id: '1',
      taskId: 'task1',
      userId: 'user2',
      role: 'COLLABORATOR' as any,
      user: {
        id: 'user2',
        name: 'Maria Santos',
        email: 'maria@exemplo.com',
      },
      createdAt: new Date(),
    },
    {
      id: '2',
      taskId: 'task1',
      userId: 'user3',
      role: 'VIEWER' as any,
      user: {
        id: 'user3',
        name: 'Pedro Silva',
        email: 'pedro@exemplo.com',
      },
      createdAt: new Date(),
    },
  ];

  const mockUserCollaborations = [
    {
      id: '1',
      taskId: 'task1',
      userId: 'user1',
      role: 'OWNER' as any,
      task: {
        id: 'task1',
        title: 'Tarefa Importante',
        description: 'Descrição da tarefa importante',
        status: 'A_FAZER',
        priority: 'ALTA',
      },
      createdAt: new Date(),
    },
  ];

  beforeEach(() => {
    mockCollaborationService = {
      addCollaborator: jest.fn(),
      getTaskCollaborators: jest.fn(),
      getUserCollaborations: jest.fn(),
      removeCollaborator: jest.fn(),
      checkUserPermission: jest.fn(),
    };

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      user: { id: 'user1', name: 'João Silva', email: 'joao@exemplo.com' },
      body: {},
      params: {},
    };

    collaborationController = new CollaborationController(mockCollaborationService);
  });

  describe('addCollaborator', () => {
    it('should add collaborator successfully', async () => {
      const collaborationData = {
        taskId: 'task1',
        userId: 'user2',
        role: 'COLLABORATOR' as any,
      };

      mockRequest.body = collaborationData;
      mockCollaborationService.addCollaborator.mockResolvedValue(mockCollaboration);

      await collaborationController.addCollaborator(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockCollaborationService.addCollaborator).toHaveBeenCalledWith(collaborationData, 'user1');
      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Collaborator added successfully',
        data: mockCollaboration,
      });
    });

    it('should handle error when adding collaborator', async () => {
      const collaborationData = {
        taskId: 'task1',
        userId: 'user2',
        role: 'COLLABORATOR' as any,
      };

      mockRequest.body = collaborationData;
      mockCollaborationService.addCollaborator.mockRejectedValue(new Error('Usuário não encontrado'));

      await collaborationController.addCollaborator(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Usuário não encontrado',
      });
    });

    it('should handle generic error', async () => {
      mockRequest.body = { taskId: 'task1', userId: 'user2' };
      mockCollaborationService.addCollaborator.mockRejectedValue('Erro desconhecido');

      await collaborationController.addCollaborator(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to add collaborator',
      });
    });
  });

  describe('getTaskCollaborators', () => {
    it('should get task collaborators successfully', async () => {
      mockRequest.params = { taskId: 'task1' };
      mockCollaborationService.getTaskCollaborators.mockResolvedValue(mockCollaborators);

      await collaborationController.getTaskCollaborators(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockCollaborationService.getTaskCollaborators).toHaveBeenCalledWith('task1', 'user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Collaborators retrieved successfully',
        data: mockCollaborators,
      });
    });

    it('should handle error when getting collaborators', async () => {
      mockRequest.params = { taskId: 'task1' };
      mockCollaborationService.getTaskCollaborators.mockRejectedValue(new Error('Tarefa não encontrada'));

      await collaborationController.getTaskCollaborators(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Tarefa não encontrada',
      });
    });
  });

  describe('getUserCollaborations', () => {
    it('should get user collaborations successfully', async () => {
      mockCollaborationService.getUserCollaborations.mockResolvedValue(mockUserCollaborations);

      await collaborationController.getUserCollaborations(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockCollaborationService.getUserCollaborations).toHaveBeenCalledWith('user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Collaborations retrieved successfully',
        data: mockUserCollaborations,
      });
    });

    it('should handle error when getting user collaborations', async () => {
      mockCollaborationService.getUserCollaborations.mockRejectedValue(new Error('Erro interno'));

      await collaborationController.getUserCollaborations(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to retrieve collaborations',
      });
    });
  });

  describe('removeCollaborator', () => {
    it('should remove collaborator successfully', async () => {
      mockRequest.params = { taskId: 'task1', userId: 'user2' };
      mockCollaborationService.removeCollaborator.mockResolvedValue();

      await collaborationController.removeCollaborator(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockCollaborationService.removeCollaborator).toHaveBeenCalledWith('task1', 'user2', 'user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Collaborator removed successfully',
      });
    });

    it('should handle error when removing collaborator', async () => {
      mockRequest.params = { taskId: 'task1', userId: 'user2' };
      mockCollaborationService.removeCollaborator.mockRejectedValue(new Error('Colaborador não encontrado'));

      await collaborationController.removeCollaborator(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Colaborador não encontrado',
      });
    });
  });

  describe('checkPermission', () => {
    it('should check permission successfully', async () => {
      mockRequest.params = { taskId: 'task1' };
      mockCollaborationService.checkUserPermission.mockResolvedValue('COLLABORATOR' as any);

      await collaborationController.checkPermission(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockCollaborationService.checkUserPermission).toHaveBeenCalledWith('task1', 'user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Permission checked successfully',
        data: { permission: 'COLLABORATOR' },
      });
    });

    it('should handle error when checking permission', async () => {
      mockRequest.params = { taskId: 'task1' };
      mockCollaborationService.checkUserPermission.mockRejectedValue(new Error('Erro interno'));

      await collaborationController.checkPermission(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to check permission',
      });
    });
  });
});