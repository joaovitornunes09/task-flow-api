import { TaskService } from '../services/TaskService';
import { ITaskRepository } from '../types/ITaskRepository';
import { ITaskCollaborationRepository } from '../types/ITaskCollaborationRepository';
import { TaskStatus, TaskPriority, TaskWithDetails } from '../models/Task';

describe('TaskService', () => {
  let taskService: TaskService;
  let mockTaskRepository: jest.Mocked<ITaskRepository>;
  let mockCollaborationRepository: jest.Mocked<ITaskCollaborationRepository>;

  const mockTask: TaskWithDetails = {
    id: '1',
    title: 'Tarefa de Teste',
    description: 'Descrição de Teste',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date('2024-12-31'),
    categoryId: 'cat1',
    assignedUserId: 'user1',
    createdById: 'user2',
    createdAt: new Date(),
    updatedAt: new Date(),
    assignedUser: {
      id: 'user1',
      name: 'João Silva',
      email: 'joao@exemplo.com',
    },
    category: {
      id: 'cat1',
      name: 'Trabalho',
      description: 'Tarefas de trabalho',
      color: '#2563eb',
    },
    createdBy: {
      id: 'user2',
      name: 'Maria Santos',
      email: 'maria@exemplo.com',
    },
  };

  beforeEach(() => {
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

    mockCollaborationRepository = {
      create: jest.fn(),
      findByTaskId: jest.fn(),
      findByUserId: jest.fn(),
      findByTaskAndUser: jest.fn(),
      delete: jest.fn(),
      deleteAllByTaskId: jest.fn(),
    };

    taskService = new TaskService(mockTaskRepository, mockCollaborationRepository);
  });

  describe('createTask', () => {
    it('should create a task and collaboration successfully', async () => {
      const createTaskData = {
        title: 'Nova Tarefa',
        description: 'Nova Descrição',
        priority: TaskPriority.HIGH,
        assignedUserId: 'user1',
        createdById: 'user2',
      };

      const createdTask = {
        id: '1',
        ...createTaskData,
        status: TaskStatus.TODO,
        dueDate: null,
        categoryId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockTaskRepository.findByTitleAndCategory.mockResolvedValue(null);
      mockTaskRepository.create.mockResolvedValue(createdTask);
      mockCollaborationRepository.create.mockResolvedValue({
        id: '1',
        taskId: '1',
        userId: 'user2',
        role: 'OWNER' as any,
        createdAt: new Date(),
      });

      const result = await taskService.createTask(createTaskData);

      expect(mockTaskRepository.findByTitleAndCategory).toHaveBeenCalledWith('Nova Tarefa', null);
      expect(mockTaskRepository.create).toHaveBeenCalledWith(createTaskData);
      expect(mockCollaborationRepository.create).toHaveBeenCalledWith({
        taskId: '1',
        userId: 'user2',
        role: 'OWNER' as any,
      });
      expect(result).toEqual(createdTask);
    });

    it('should fail when task with same title already exists in same category', async () => {
      const createTaskData = {
        title: 'Tarefa Duplicada',
        description: 'Descrição da tarefa',
        priority: TaskPriority.MEDIUM,
        categoryId: 'cat1',
        assignedUserId: 'user1',
        createdById: 'user2',
      };

      const existingTask = { ...mockTask, title: 'Tarefa Duplicada' };
      mockTaskRepository.findByTitleAndCategory.mockResolvedValue(existingTask);

      await expect(taskService.createTask(createTaskData)).rejects.toThrow('A task with this title already exists in this category');
      expect(mockTaskRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('getTaskById', () => {
    it('should return task when user has access', async () => {
      const userId = 'user1';
      mockTaskRepository.findById.mockResolvedValue(mockTask);

      const result = await taskService.getTaskById('1', userId);

      expect(mockTaskRepository.findById).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockTask);
    });

    it('should throw error when task not found', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(taskService.getTaskById('1', 'user1')).rejects.toThrow('Task not found');
    });

    it('should throw error when user lacks access', async () => {
      const unauthorizedTask = { ...mockTask, assignedUserId: 'otheruser', createdById: 'otheruser' };
      mockTaskRepository.findById.mockResolvedValue(unauthorizedTask);
      mockCollaborationRepository.findByTaskAndUser.mockResolvedValue(null);

      await expect(taskService.getTaskById('1', 'user1')).rejects.toThrow('Unauthorized to view this task');
    });

    it('should allow access via collaboration', async () => {
      const unauthorizedTask = { ...mockTask, assignedUserId: 'otheruser', createdById: 'otheruser' };
      mockTaskRepository.findById.mockResolvedValue(unauthorizedTask);
      mockCollaborationRepository.findByTaskAndUser.mockResolvedValue({
        id: '1',
        taskId: '1',
        userId: 'user1',
        role: 'VIEWER' as any,
        createdAt: new Date(),
      });

      const result = await taskService.getTaskById('1', 'user1');

      expect(result).toEqual(unauthorizedTask);
    });
  });

  describe('getTasksByUser', () => {
    it('should return tasks for user', async () => {
      const tasks = [mockTask];
      mockTaskRepository.findByUserId.mockResolvedValue(tasks);

      const result = await taskService.getTasksByUser('user1');

      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith('user1');
      expect(result).toEqual(tasks);
    });
  });

  describe('updateTask', () => {
    it('should update task when user has permission', async () => {
      const updateData = { title: 'Título Atualizado' };
      const updatedTask = { ...mockTask, ...updateData };

      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskRepository.findByTitleAndCategory.mockResolvedValue(null);
      mockTaskRepository.update.mockResolvedValue(updatedTask);

      const result = await taskService.updateTask('1', updateData, 'user1');

      expect(mockTaskRepository.findByTitleAndCategory).toHaveBeenCalledWith('Título Atualizado', mockTask.categoryId);
      expect(mockTaskRepository.update).toHaveBeenCalledWith('1', updateData);
      expect(result).toEqual(updatedTask);
    });

    it('should throw error when task not found', async () => {
      mockTaskRepository.findById.mockResolvedValue(null);

      await expect(taskService.updateTask('1', {}, 'user1')).rejects.toThrow('Task not found');
    });

    it('should throw error when user lacks permission', async () => {
      const unauthorizedTask = { ...mockTask, assignedUserId: 'otheruser', createdById: 'otheruser' };
      mockTaskRepository.findById.mockResolvedValue(unauthorizedTask);
      mockCollaborationRepository.findByTaskAndUser.mockResolvedValue(null);

      await expect(taskService.updateTask('1', {}, 'user1')).rejects.toThrow('Unauthorized to update this task');
    });

    it('should fail when task title already exists in same category', async () => {
      const updateData = { title: 'Título Duplicado' };
      const existingTask = { ...mockTask, id: '2', title: 'Título Duplicado' };

      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockTaskRepository.findByTitleAndCategory.mockResolvedValue(existingTask);

      await expect(taskService.updateTask('1', updateData, 'user1')).rejects.toThrow('A task with this title already exists in this category');
      expect(mockTaskRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteTask', () => {
    it('should delete task when user is creator', async () => {
      mockTaskRepository.findById.mockResolvedValue(mockTask);
      mockCollaborationRepository.deleteAllByTaskId.mockResolvedValue();
      mockTaskRepository.delete.mockResolvedValue();

      await taskService.deleteTask('1', 'user2');

      expect(mockCollaborationRepository.deleteAllByTaskId).toHaveBeenCalledWith('1');
      expect(mockTaskRepository.delete).toHaveBeenCalledWith('1');
    });

    it('should throw error when user cannot delete', async () => {
      const unauthorizedTask = { ...mockTask, createdById: 'otheruser' };
      mockTaskRepository.findById.mockResolvedValue(unauthorizedTask);
      mockCollaborationRepository.findByTaskAndUser.mockResolvedValue(null);

      await expect(taskService.deleteTask('1', 'user1')).rejects.toThrow('Unauthorized to delete this task');
    });
  });

  describe('getAssignedTasks', () => {
    it('should return assigned tasks', async () => {
      const tasks = [mockTask];
      mockTaskRepository.findByAssignedUser.mockResolvedValue(tasks);

      const result = await taskService.getAssignedTasks('user1');

      expect(mockTaskRepository.findByAssignedUser).toHaveBeenCalledWith('user1');
      expect(result).toEqual(tasks);
    });
  });
});
