import { User, CreateUserData, UpdateUserData } from "../models/User";

export interface AuthenticatedUser {
  user: User;
  token: string;
}

export interface IUserService {
  register(data: CreateUserData): Promise<User>;
  authenticate(email: string, password: string): Promise<AuthenticatedUser>;
  getUserById(id: string): Promise<User>;
  updateUser(id: string, data: UpdateUserData): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
}