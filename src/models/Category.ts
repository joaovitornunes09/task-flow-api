export interface Category {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  color?: string;
  userId: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  color?: string;
}