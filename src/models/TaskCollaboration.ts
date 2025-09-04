import { CollaborationRole } from '@prisma/client';

export { CollaborationRole };

export interface TaskCollaboration {
  id: string;
  taskId: string;
  userId: string;
  role: CollaborationRole;
  createdAt: Date;
}

export interface CreateTaskCollaborationData {
  taskId: string;
  userId: string;
  role: CollaborationRole;
}