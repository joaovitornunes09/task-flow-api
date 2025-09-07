import { UserRepository } from "../repositories/UserRepository";
import { CategoryRepository } from "../repositories/CategoryRepository";
import { TaskRepository } from "../repositories/TaskRepository";
import { TaskCollaborationRepository } from "../repositories/TaskCollaborationRepository";

import { UserService } from "../services/UserService";
import { CategoryService } from "../services/CategoryService";
import { TaskService } from "../services/TaskService";
import { CollaborationService } from "../services/CollaborationService";
import { ReportService } from "../services/ReportService";
import { TokenBlacklistService } from "../services/TokenBlacklistService";

import { UserController } from "../controllers/UserController";
import { CategoryController } from "../controllers/CategoryController";
import { TaskController } from "../controllers/TaskController";
import { CollaborationController } from "../controllers/CollaborationController";
import { ReportController } from "../controllers/ReportController";

// Repositories
export const userRepository = new UserRepository();
export const categoryRepository = new CategoryRepository();
export const taskRepository = new TaskRepository();
export const taskCollaborationRepository = new TaskCollaborationRepository();

// Token service
export const tokenBlacklistService = new TokenBlacklistService();

// Services
let userService: UserService;
let categoryService: CategoryService;
let taskService: TaskService;
let collaborationService: CollaborationService;
let reportService: ReportService;

// Controllers
let userController: UserController;
let categoryController: CategoryController;
let taskController: TaskController;
let collaborationController: CollaborationController;
let reportController: ReportController;

export function initializeServices(jwtSign: (payload: any) => string) {
  userService = new UserService(userRepository, jwtSign);
  categoryService = new CategoryService(categoryRepository);
  taskService = new TaskService(taskRepository, taskCollaborationRepository);
  collaborationService = new CollaborationService(taskCollaborationRepository, taskRepository);
  reportService = new ReportService(taskRepository, categoryRepository, userRepository);

  userController = new UserController(userService, tokenBlacklistService);
  categoryController = new CategoryController(categoryService);
  taskController = new TaskController(taskService);
  collaborationController = new CollaborationController(collaborationService);
  reportController = new ReportController(reportService);
}

export const getControllers = () => ({
  userController,
  categoryController,
  taskController,
  collaborationController,
  reportController,
});
