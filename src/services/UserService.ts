import { IUserService, AuthenticatedUser } from "../types/IUserService";
import { IUserRepository } from "../types/IUserRepository";
import { User, CreateUserData, UpdateUserData } from "../models/User";
import { hashPassword, verifyPassword } from "../utils/hash";

export class UserService implements IUserService {
  constructor(
    private userRepository: IUserRepository,
    private jwtSign: (payload: any) => string
  ) {}

  async register(data: CreateUserData): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const hashedPassword = await hashPassword(data.password);
    
    return await this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
  }

  async authenticate(email: string, password: string): Promise<AuthenticatedUser> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      throw new Error("Invalid email or password");
    }

    const token = this.jwtSign({
      id: user.id,
      email: user.email,
    });

    return { user, token };
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    if (data.password) {
      data.password = await hashPassword(data.password);
    }
    
    return await this.userRepository.update(id, data);
  }

  async deleteUser(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.findAll();
  }
}