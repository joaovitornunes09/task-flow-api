import { ReportService } from '../services/ReportService';
import { ITaskRepository } from '../types/ITaskRepository';
import { ICategoryRepository } from '../types/ICategoryRepository';
import { IUserRepository } from '../types/IUserRepository';
import { TaskStatus, TaskPriority } from '../models/Task';

describe('ReportService', () => {
  let reportService: ReportService;
  let mockTaskRepository: jest.Mocked<ITaskRepository>;
  let mockCategoryRepository: jest.Mocked<ICategoryRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  const mockTasks = [
    {
      id: '1',
      title: 'Tarefa Completada',
      description: 'Descrição da tarefa',
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.HIGH,
      dueDate: new Date('2025-12-15'),
      categoryId: 'cat1',
      assignedUserId: 'user1',
      createdById: 'user1',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-10'),
      assignedUser: {
        id: 'user1',
        name: 'João Silva',
        email: 'joao@exemplo.com',
      },
      createdBy: {
        id: 'user1',
        name: 'João Silva',
        email: 'joao@exemplo.com',
      },
    },
    {
      id: '2',
      title: 'Tarefa Em Andamento',
      description: 'Tarefa sendo trabalhada',
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date('2025-12-01'),
      categoryId: 'cat1',
      assignedUserId: 'user1',
      createdById: 'user1',
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-05'),
      assignedUser: {
        id: 'user1',
        name: 'João Silva',
        email: 'joao@exemplo.com',
      },
      createdBy: {
        id: 'user1',
        name: 'João Silva',
        email: 'joao@exemplo.com',
      },
    },
    {
      id: '3',
      title: 'Tarefa Atrasada',
      description: 'Tarefa vencida',
      status: TaskStatus.TODO,
      priority: TaskPriority.LOW,
      dueDate: new Date('2025-12-01'),
      categoryId: 'cat2',
      assignedUserId: 'user1',
      createdById: 'user1',
      createdAt: new Date('2023-11-01'),
      updatedAt: new Date('2023-11-01'),
      assignedUser: {
        id: 'user1',
        name: 'João Silva',
        email: 'joao@exemplo.com',
      },
      createdBy: {
        id: 'user1',
        name: 'João Silva',
        email: 'joao@exemplo.com',
      },
    },
  ];

  const mockCategories = [
    {
      id: 'cat1',
      name: 'Trabalho',
      description: 'Tarefas do trabalho',
      color: '#2563eb',
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'cat2',
      name: 'Pessoal',
      description: 'Tarefas pessoais',
      color: '#dc2626',
      userId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockUsers = [
    {
      id: 'user1',
      name: 'João Silva',
      email: 'joao@exemplo.com',
      password: 'senha123',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user2',
      name: 'Maria Santos',
      email: 'maria@exemplo.com',
      password: 'senha456',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

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

    mockCategoryRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByNameAndUserId: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    reportService = new ReportService(mockTaskRepository, mockCategoryRepository, mockUserRepository);

    jest.clearAllMocks();
  });

  describe('getUserTaskReport', () => {
    it('should generate user task report successfully', async () => {
      mockTaskRepository.findByUserId.mockResolvedValue(mockTasks);
      mockCategoryRepository.findById.mockImplementation((id) => {
        return Promise.resolve(mockCategories.find(cat => cat.id === id) || null);
      });

      const result = await reportService.getUserTaskReport('user1');

      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith('user1');
      expect(result).toMatchObject({
        totalTasks: 3,
        tasksByStatus: {
          [TaskStatus.TODO]: 1,
          [TaskStatus.IN_PROGRESS]: 1,
          [TaskStatus.COMPLETED]: 1,
        },
        overdueTasks: 0,
        completedThisMonth: 0,
      });
      expect(result.tasksByCategory).toHaveLength(2);
      expect(result.tasksByCategory.find(cat => cat.categoryName === 'Trabalho')?.count).toBe(2);
      expect(result.tasksByCategory.find(cat => cat.categoryName === 'Pessoal')?.count).toBe(1);
    });

    it('should handle tasks without category', async () => {
      const tasksWithoutCategory = [
        {
          ...mockTasks[0],
          categoryId: null,
          assignedUser: {
            id: 'user1',
            name: 'João Silva',
            email: 'joao@exemplo.com',
          },
          createdBy: {
            id: 'user1',
            name: 'João Silva',
            email: 'joao@exemplo.com',
          },
        },
      ];

      mockTaskRepository.findByUserId.mockResolvedValue(tasksWithoutCategory);

      const result = await reportService.getUserTaskReport('user1');

      expect(result.totalTasks).toBe(1);
      expect(result.tasksByCategory).toHaveLength(0);
    });

    it('should count tasks completed this month correctly', async () => {
      const now = new Date();
      const tasksWithRecentCompletion = [
        {
          ...mockTasks[0],
          status: TaskStatus.COMPLETED,
          updatedAt: now,
          assignedUser: {
            id: 'user1',
            name: 'João Silva',
            email: 'joao@exemplo.com',
          },
          createdBy: {
            id: 'user1',
            name: 'João Silva',
            email: 'joao@exemplo.com',
          },
        },
      ];

      mockTaskRepository.findByUserId.mockResolvedValue(tasksWithRecentCompletion);

      const result = await reportService.getUserTaskReport('user1');

      expect(result.completedThisMonth).toBe(1);
    });
  });

  describe('getTeamReport', () => {
    it('should generate team report successfully', async () => {
      const userIds = ['user1', 'user2'];
      const assignedTasksUser1 = [
        { ...mockTasks[0], assignedUserId: 'user1', status: TaskStatus.COMPLETED },
        { ...mockTasks[1], assignedUserId: 'user1', status: TaskStatus.TODO, dueDate: new Date('2023-12-01') },
      ];
      const assignedTasksUser2 = [
        {
          ...mockTasks[0],
          id: '4',
          assignedUserId: 'user2',
          status: TaskStatus.IN_PROGRESS,
          dueDate: new Date('2025-12-01'),
        },
      ];

      mockUserRepository.findById
        .mockResolvedValueOnce(mockUsers[0])
        .mockResolvedValueOnce(mockUsers[1]);

      mockTaskRepository.findByAssignedUser
        .mockResolvedValueOnce(assignedTasksUser1)
        .mockResolvedValueOnce(assignedTasksUser2);

      const result = await reportService.getTeamReport(userIds);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        userId: 'user1',
        userName: 'João Silva',
        assignedTasks: 2,
        completedTasks: 1,
        overdueTasks: 1,
      });
      expect(result[1]).toMatchObject({
        userId: 'user2',
        userName: 'Maria Santos',
        assignedTasks: 1,
        completedTasks: 0,
        overdueTasks: 0,
      });
    });

    it('should skip users not found', async () => {
      const userIds = ['user1', 'userInexistente'];

      mockUserRepository.findById
        .mockResolvedValueOnce(mockUsers[0])
        .mockResolvedValueOnce(null);

      mockTaskRepository.findByAssignedUser.mockResolvedValue([]);

      const result = await reportService.getTeamReport(userIds);

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe('user1');
    });
  });

  describe('getTasksCompletedInPeriod', () => {
    it('should return count of tasks completed in period', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const tasksInPeriod = [
        {
          ...mockTasks[0],
          status: TaskStatus.COMPLETED,
          updatedAt: new Date('2024-01-15'),
        },
        {
          ...mockTasks[1],
          status: TaskStatus.COMPLETED,
          updatedAt: new Date('2024-01-20'),
        },
        {
          ...mockTasks[2],
          status: TaskStatus.COMPLETED,
          updatedAt: new Date('2023-12-15'),
        },
        {
          id: '4',
          title: 'Tarefa não completada',
          status: TaskStatus.TODO,
          updatedAt: new Date('2024-01-10'),
        } as any,
      ];

      mockTaskRepository.findByUserId.mockResolvedValue(tasksInPeriod);

      const result = await reportService.getTasksCompletedInPeriod('user1', startDate, endDate);

      expect(result).toBe(2);
      expect(mockTaskRepository.findByUserId).toHaveBeenCalledWith('user1');
    });

    it('should return zero when there are no tasks completed in period', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      mockTaskRepository.findByUserId.mockResolvedValue([]);

      const result = await reportService.getTasksCompletedInPeriod('user1', startDate, endDate);

      expect(result).toBe(0);
    });
  });
});
