import { CollaborationService } from '../services/CollaborationService';
import { ITaskCollaborationRepository } from '../types/ITaskCollaborationRepository';
import { ITaskRepository } from '../types/ITaskRepository';
import { TaskStatus, TaskPriority } from '../models/Task';

describe('CollaborationService', () => {
  let collaborationService: CollaborationService;
  let mockCollaborationRepository: jest.Mocked<ITaskCollaborationRepository>;
  let mockTaskRepository: jest.Mocked<ITaskRepository>;

  const mockTask = {
    id: 'task1',
    title: 'Tarefa de Exemplo',
    description: 'Descrição da tarefa',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date('2024-12-31'),
    categoryId: 'cat1',
    assignedUserId: 'user2',
    createdById: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
    assignedUser: {
      id: 'user2',
      name: 'Maria Santos',
      email: 'maria@exemplo.com',
    },
    createdBy: {
      id: 'user1',
      name: 'João Silva',
      email: 'joao@exemplo.com',
    },
  };

  const mockCollaboration = {
    id: 'collab1',
    taskId: 'task1',
    userId: 'user3',
    role: 'COLLABORATOR' as any,
    createdAt: new Date(),
  };

  beforeEach(() => {
    mockCollaborationRepository = {
      create: jest.fn(),
      findByTaskId: jest.fn(),
      findByUserId: jest.fn(),
      findByTaskAndUser: jest.fn(),
      delete: jest.fn(),
      deleteAllByTaskId: jest.fn(),
    };

    mockTaskRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByCategoryId: jest.fn(),
      findByStatus: jest.fn(),
      findByAssignedUser: jest.fn(),
      findByCreatedUser: jest.fn(),
      findByTitleAndCategory: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    };

    collaborationService = new CollaborationService(mockCollaborationRepository, mockTaskRepository);

    jest.clearAllMocks();
  });

  describe('addCollaborator', () => {
    it('should add collaborator successfully when user is task creator', async () => {
      const collaborationData = {
        taskId: 'task1',
        userId: 'user3',
        role: 'COLLABORATOR' as any,
      };

      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockCollaborationRepository.findByTaskAndUser
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);
      mockCollaborationRepository.create.mockResolvedValue(mockCollaboration);

      const result = await collaborationService.addCollaborator(collaborationData, 'user1');

      expect(mockTaskRepository.findById).toHaveBeenCalledWith('task1');
      expect(mockCollaborationRepository.create).toHaveBeenCalledWith(collaborationData);
      expect(result).toEqual(mockCollaboration);
    });

    it('should add collaborator when user has OWNER role in collaboration', async () => {
      const collaborationData = {
        taskId: 'task1',
        userId: 'user3',
        role: 'VIEWER' as any,
      };
      const ownerCollaboration = {
        id: 'ownerCollab',
        taskId: 'task1',
        userId: 'user4',
        role: 'OWNER' as any,
        createdAt: new Date(),
      };

      mockTaskRepository.findById.mockResolvedValue({
        ...mockTask,
        createdById: 'differentUser',
        createdBy: {
          id: 'differentUser',
          name: 'Outro Usuário',
          email: 'outro@exemplo.com',
        },
      });
      mockCollaborationRepository.findByTaskAndUser
        .mockResolvedValueOnce(ownerCollaboration)
        .mockResolvedValueOnce(null);
      mockCollaborationRepository.create.mockResolvedValue(mockCollaboration);

      const result = await collaborationService.addCollaborator(collaborationData, 'user4');

      expect(result).toEqual(mockCollaboration);
    });

    it('should fail when task does not exist', async () => {
      const collaborationData = {
        taskId: 'taskInexistente',
        userId: 'user3',
        role: 'COLLABORATOR' as any,
      };

      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(collaborationService.addCollaborator(collaborationData, 'user1'))
        .rejects.toThrow('Task not found');
      expect(mockCollaborationRepository.create).not.toHaveBeenCalled();
    });

    it('should fail when user is not task owner', async () => {
      const collaborationData = {
        taskId: 'task1',
        userId: 'user3',
        role: 'COLLABORATOR' as any,
      };

      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockCollaborationRepository.findByTaskAndUser.mockResolvedValue(null);

      await expect(collaborationService.addCollaborator(collaborationData, 'user3'))
        .rejects.toThrow('Only task owners can add collaborators');
      expect(mockCollaborationRepository.create).not.toHaveBeenCalled();
    });

    it('should fail when user is already a collaborator', async () => {
      const collaborationData = {
        taskId: 'task1',
        userId: 'user3',
        role: 'COLLABORATOR' as any,
      };

      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockCollaborationRepository.findByTaskAndUser
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockCollaboration);

      await expect(collaborationService.addCollaborator(collaborationData, 'user1'))
        .rejects.toThrow('User is already a collaborator');
      expect(mockCollaborationRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getTaskCollaborators', () => {
    it('should return collaborators when user is task creator', async () => {
      const collaborators = [mockCollaboration];

      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockCollaborationRepository.findByTaskAndUser.mockResolvedValue(null);
      mockCollaborationRepository.findByTaskId.mockResolvedValue(collaborators);

      const result = await collaborationService.getTaskCollaborators('task1', 'user1');

      expect(result).toEqual(collaborators);
    });

    it('should return collaborators when user is assigned to task', async () => {
      const collaborators = [mockCollaboration];

      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockCollaborationRepository.findByTaskAndUser.mockResolvedValue(null);
      mockCollaborationRepository.findByTaskId.mockResolvedValue(collaborators);

      const result = await collaborationService.getTaskCollaborators('task1', 'user2');

      expect(result).toEqual(collaborators);
    });

    it('should return collaborators when user is collaborator', async () => {
      const collaborators = [mockCollaboration];

      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockCollaborationRepository.findByTaskAndUser.mockResolvedValue(mockCollaboration);
      mockCollaborationRepository.findByTaskId.mockResolvedValue(collaborators);

      const result = await collaborationService.getTaskCollaborators('task1', 'user3');

      expect(result).toEqual(collaborators);
    });

    it('should fail when task does not exist', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(collaborationService.getTaskCollaborators('taskInexistente', 'user1'))
        .rejects.toThrow('Task not found');
    });

    it('should fail when user has no permission', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockCollaborationRepository.findByTaskAndUser.mockResolvedValue(null);

      await expect(collaborationService.getTaskCollaborators('task1', 'userSemPermissao'))
        .rejects.toThrow('Unauthorized to view task collaborators');
    });
  });

  describe('getUserCollaborations', () => {
    it('should return user collaborations', async () => {
      const collaborations = [mockCollaboration];

      mockCollaborationRepository.findByUserId.mockResolvedValue(collaborations);

      const result = await collaborationService.getUserCollaborations('user3');

      expect(mockCollaborationRepository.findByUserId).toHaveBeenCalledWith('user3');
      expect(result).toEqual(collaborations);
    });
  });

  describe('removeCollaborator', () => {
    it('should remove collaborator when user is task creator', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockCollaborationRepository.findByTaskAndUser.mockResolvedValue(null);
      mockCollaborationRepository.delete.mockResolvedValue();

      await collaborationService.removeCollaborator('task1', 'user3', 'user1');

      expect(mockCollaborationRepository.delete).toHaveBeenCalledWith('task1', 'user3');
    });

    it('should fail when task does not exist', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(collaborationService.removeCollaborator('taskInexistente', 'user3', 'user1'))
        .rejects.toThrow('Task not found');
      expect(mockCollaborationRepository.delete).not.toHaveBeenCalled();
    });

    it('should fail when user is not owner', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockCollaborationRepository.findByTaskAndUser.mockResolvedValue(null);

      await expect(collaborationService.removeCollaborator('task1', 'user3', 'userSemPermissao'))
        .rejects.toThrow('Only task owners can remove collaborators');
      expect(mockCollaborationRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe('checkUserPermission', () => {
    it('should return OWNER when user is task creator', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);

      const result = await collaborationService.checkUserPermission('task1', 'user1');

      expect(result).toBe('OWNER');
    });

    it('should return COLLABORATOR when user is assigned to task', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);

      const result = await collaborationService.checkUserPermission('task1', 'user2');

      expect(result).toBe('COLLABORATOR');
    });

    it('should return collaboration role when user is collaborator', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockCollaborationRepository.findByTaskAndUser.mockResolvedValue(mockCollaboration);

      const result = await collaborationService.checkUserPermission('task1', 'user3');

      expect(result).toBe('COLLABORATOR');
    });

    it('should return null when task does not exist', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      const result = await collaborationService.checkUserPermission('taskInexistente', 'user1');

      expect(result).toBe(null);
    });

    it('should return null when user has no permission', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockCollaborationRepository.findByTaskAndUser.mockResolvedValue(null);

      const result = await collaborationService.checkUserPermission('task1', 'userSemPermissao');

      expect(result).toBe(null);
    });
  });
});
