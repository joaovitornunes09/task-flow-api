import { ReportController } from '../controllers/ReportController';
import { IReportService } from '../types/IReportService';
import { FastifyRequest, FastifyReply } from 'fastify';
import { TaskStatus } from '../models/Task';
import { parseISO } from 'date-fns';

describe('ReportController', () => {
  let reportController: ReportController;
  let mockReportService: jest.Mocked<IReportService>;
  let mockRequest: Partial<FastifyRequest>;
  let mockReply: Partial<FastifyReply>;

  const mockUserReport = {
    totalTasks: 15,
    tasksByStatus: {
      [TaskStatus.TODO]: 5,
      [TaskStatus.IN_PROGRESS]: 2,
      [TaskStatus.COMPLETED]: 8,
    },
    overdueTasks: 1,
    completedThisMonth: 3,
    tasksByCategory: [
      { categoryId: 'cat1', categoryName: 'Trabalho', count: 10 },
      { categoryId: 'cat2', categoryName: 'Pessoal', count: 5 },
    ],
  };

  const mockTeamReport = [
    {
      userId: 'user1',
      userName: 'João Silva',
      assignedTasks: 10,
      completedTasks: 7,
      overdueTasks: 1,
    },
    {
      userId: 'user2',
      userName: 'Maria Santos',
      assignedTasks: 12,
      completedTasks: 9,
      overdueTasks: 0,
    },
  ];

  beforeEach(() => {
    mockReportService = {
      getUserTaskReport: jest.fn(),
      getTeamReport: jest.fn(),
      getTasksCompletedInPeriod: jest.fn(),
    };

    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };

    mockRequest = {
      user: { id: 'user1', name: 'João Silva', email: 'joao@exemplo.com' },
      body: {},
      params: {},
      query: {},
    };

    reportController = new ReportController(mockReportService);
  });

  describe('getUserReport', () => {
    it('should get user report successfully', async () => {
      mockReportService.getUserTaskReport.mockResolvedValue(mockUserReport);

      await reportController.getUserReport(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReportService.getUserTaskReport).toHaveBeenCalledWith('user1');
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'User report retrieved successfully',
        data: mockUserReport,
      });
    });

    it('should handle error when getting user report', async () => {
      mockReportService.getUserTaskReport.mockRejectedValue(new Error('Erro interno do servidor'));

      await reportController.getUserReport(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to generate user report',
      });
    });
  });

  describe('getTeamReport', () => {
    it('should get team report successfully', async () => {
      const userIds = ['user1', 'user2'];
      mockRequest.body = { userIds };
      mockReportService.getTeamReport.mockResolvedValue(mockTeamReport);

      await reportController.getTeamReport(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReportService.getTeamReport).toHaveBeenCalledWith(userIds);
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Team report retrieved successfully',
        data: mockTeamReport,
      });
    });

    it('should handle error when getting team report', async () => {
      mockRequest.body = { userIds: ['user1', 'user2'] };
      mockReportService.getTeamReport.mockRejectedValue(new Error('Usuários não encontrados'));

      await reportController.getTeamReport(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(500);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to generate team report',
      });
    });
  });

  describe('getCompletedTasksInPeriod', () => {
    it('should get completed tasks count in period successfully', async () => {
      const mockQuery = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };
      mockRequest.query = mockQuery;
      mockReportService.getTasksCompletedInPeriod.mockResolvedValue(5);

      await reportController.getCompletedTasksInPeriod(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReportService.getTasksCompletedInPeriod).toHaveBeenCalledWith(
        'user1',
        parseISO('2024-01-01'),
        parseISO('2024-01-31')
      );
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Completed tasks count retrieved successfully',
        data: {
          userId: 'user1',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          completedTasks: 5,
        },
      });
    });

    it('should get count for specific user when provided', async () => {
      const mockQuery = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
        userId: 'user2',
      };
      mockRequest.query = mockQuery;
      mockReportService.getTasksCompletedInPeriod.mockResolvedValue(3);

      await reportController.getCompletedTasksInPeriod(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReportService.getTasksCompletedInPeriod).toHaveBeenCalledWith(
        'user2',
        parseISO('2024-01-01'),
        parseISO('2024-01-31')
      );
      expect(mockReply.status).toHaveBeenCalledWith(200);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: true,
        message: 'Completed tasks count retrieved successfully',
        data: {
          userId: 'user2',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          completedTasks: 3,
        },
      });
    });

    it('should handle error when getting completed tasks count', async () => {
      const mockQuery = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };
      mockRequest.query = mockQuery;
      mockReportService.getTasksCompletedInPeriod.mockRejectedValue(new Error('Data inválida'));

      await reportController.getCompletedTasksInPeriod(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Data inválida',
      });
    });

    it('should handle generic error', async () => {
      const mockQuery = {
        startDate: '2024-01-01',
        endDate: '2024-01-31',
      };
      mockRequest.query = mockQuery;
      mockReportService.getTasksCompletedInPeriod.mockRejectedValue('Erro desconhecido');

      await reportController.getCompletedTasksInPeriod(mockRequest as FastifyRequest, mockReply as FastifyReply);

      expect(mockReply.status).toHaveBeenCalledWith(400);
      expect(mockReply.send).toHaveBeenCalledWith({
        success: false,
        message: 'Failed to get completed tasks count',
      });
    });
  });
});