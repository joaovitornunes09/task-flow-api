import { TaskController } from '../controllers/TaskController';
import { ITaskService } from '../types/ITaskService';
import { TaskStatus, TaskPriority, TaskWithDetails } from '../models/Task';
import { FastifyRequest, FastifyReply } from 'fastify';

describe('TaskController', () => {
  let taskController: TaskController;
  let mockTaskService: jest.Mocked<ITaskService>;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

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
    mockTaskService = {
      createTask: jest.fn(),
      getTaskById: jest.fn(),
      getTasksByUser: jest.fn(),
      getTasksByCategory: jest.fn(),
      getTasksByStatus: jest.fn(),
      getAssignedTasks: jest.fn(),
      updateTask: jest.fn(),
      deleteTask: jest.fn(),
    };

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      user: { id: 'user1', name: 'Usuário Teste', email: 'teste@exemplo.com' },
      body: {},
      params: {},
    };

    taskController = new TaskController(mockTaskService);
  });

  describe('create', () => {
    it('should create task successfully', async () => {
      const createData = {
        title: 'Nova Tarefa',
        description: 'Nova Descrição',
        priority: TaskPriority.HIGH,
        assignedUserId: 'user1',
      };

      mockRequest.body = createData;
      mockTaskService.createTask.mockResolvedValue(mockTask);

      await taskController.create(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockTaskService.createTask).toHaveBeenCalledWith({
        ...createData,
        createdById: 'user1',
      });
      expect(mockReply.status).toHaveBeenCalledWith(201);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Task created successfully',
        data: mockTask,
      });
    });

    it('should handle creation error', async () => {
      mockRequest.body = { title: 'Nova Tarefa' };
      mockTaskService.createTask.mockRejectedValue(new Error('Falha na criação'));

      await taskController.create(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Falha na criação',
      });
    });
  });

  describe('getById', () => {
    it('should get task by id successfully', async () => {
      mockRequest.params = { id: '1' };
      mockTaskService.getTaskById.mockResolvedValue(mockTask);

      await taskController.getById(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockTaskService.getTaskById).toHaveBeenCalledWith('1', 'user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Task retrieved successfully',
        data: mockTask,
      });
    });

    it('should handle task not found', async () => {
      mockRequest.params = { id: '1' };
      mockTaskService.getTaskById.mockRejectedValue(new Error('Tarefa não encontrada'));

      await taskController.getById(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(404);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Tarefa não encontrada',
      });
    });
  });

  describe('getByUser', () => {
    it('should get tasks by user successfully', async () => {
      const tasks = [mockTask];
      mockTaskService.getTasksByUser.mockResolvedValue(tasks);

      await taskController.getByUser(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockTaskService.getTasksByUser).toHaveBeenCalledWith('user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Tasks retrieved successfully',
        data: tasks,
      });
    });

    it('should handle service error', async () => {
      mockTaskService.getTasksByUser.mockRejectedValue(new Error('Erro do serviço'));

      await taskController.getByUser(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to retrieve tasks',
      });
    });
  });

  describe('update', () => {
    it('should update task successfully', async () => {
      const updateData = { title: 'Tarefa Atualizada' };
      const updatedTask = { ...mockTask, ...updateData };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      mockTaskService.updateTask.mockResolvedValue(updatedTask);

      await taskController.update(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockTaskService.updateTask).toHaveBeenCalledWith('1', updateData, 'user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Task updated successfully',
        data: updatedTask,
      });
    });

    it('should handle update error', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { title: 'Tarefa Atualizada' };
      mockTaskService.updateTask.mockRejectedValue(new Error('Falha na atualização'));

      await taskController.update(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Falha na atualização',
      });
    });
  });

  describe('delete', () => {
    it('should delete task successfully', async () => {
      mockRequest.params = { id: '1' };
      mockTaskService.deleteTask.mockResolvedValue();

      await taskController.delete(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockTaskService.deleteTask).toHaveBeenCalledWith('1', 'user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Task deleted successfully',
      });
    });

    it('should handle delete error', async () => {
      mockRequest.params = { id: '1' };
      mockTaskService.deleteTask.mockRejectedValue(new Error('Falha na exclusão'));

      await taskController.delete(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Falha na exclusão',
      });
    });
  });

  describe('getByStatus', () => {
    it('should get tasks by status successfully', async () => {
      const tasks = [mockTask];
      mockRequest.params = { status: TaskStatus.TODO };
      mockTaskService.getTasksByStatus.mockResolvedValue(tasks);

      await taskController.getByStatus(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockTaskService.getTasksByStatus).toHaveBeenCalledWith(TaskStatus.TODO, 'user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Tasks retrieved successfully',
        data: tasks,
      });
    });
  });

  describe('getAssigned', () => {
    it('should get assigned tasks successfully', async () => {
      const tasks = [mockTask];
      mockTaskService.getAssignedTasks.mockResolvedValue(tasks);

      await taskController.getAssigned(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockTaskService.getAssignedTasks).toHaveBeenCalledWith('user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Assigned tasks retrieved successfully',
        data: tasks,
      });
    });
  });
});