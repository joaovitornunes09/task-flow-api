export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date | null;
  categoryId?: string | null;
  assignedUserId: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskUser {
  id: string;
  name: string;
  email: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
}

export interface TaskWithDetails extends Task {
  assignedUser: TaskUser;
  category?: TaskCategory | null;
  createdBy: TaskUser;
}

export interface CreateTaskData {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: Date;
  categoryId?: string;
  assignedUserId: string;
  createdById: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  categoryId?: string;
  assignedUserId?: string;
}