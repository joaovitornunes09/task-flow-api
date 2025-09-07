import { FastifyRequest, FastifyReply } from "fastify";
import { fromUnixTime } from "date-fns";
import { IUserService } from "../types/IUserService";
import { CreateUserData, UpdateUserData } from "../models/User";
import { TokenBlacklistService } from "../services/TokenBlacklistService";

export class UserController {
  constructor(private userService: IUserService, private tokenBlacklistService: TokenBlacklistService) {}

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const user = await this.userService.register(request.body as CreateUserData);
      return reply.status(201).send({
        success: true,
        message: "User created successfully",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : "Registration failed",
      });
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = request.body as { email: string; password: string };
      const result = await this.userService.authenticate(email, password);

      return reply.status(200).send({
        success: true,
        message: "Login successful",
        token: result.token,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : "Login failed",
      });
    }
  }

  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.id;
      const user = await this.userService.getUserById(userId);

      return reply.status(200).send({
        success: true,
        id: user.id,
        name: user.name,
        email: user.email,
      });
    } catch (error) {
      return reply.status(404).send({
        success: false,
        message: "User not found",
      });
    }
  }

  async updateProfile(request: FastifyRequest, reply: FastifyReply) {
    try {
      const userId = request.user.id;
      const user = await this.userService.updateUser(userId, request.body as UpdateUserData);

      return reply.status(200).send({
        success: true,
        message: "Profile updated successfully",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      return reply.status(400).send({
        success: false,
        message: error instanceof Error ? error.message : "Update failed",
      });
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const token = request.token;
      const decoded = request.server.jwt.verify(token) as any;
      const expiresAt = fromUnixTime(decoded.exp);
      
      await this.tokenBlacklistService.addTokenToBlacklist(token, expiresAt);

      return reply.status(200).send({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Failed to logout",
      });
    }
  }

  async getAllUsers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const users = await this.userService.getAllUsers();
      return reply.status(200).send({
        success: true,
        message: "Users retrieved successfully",
        data: users.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
        })),
      });
    } catch (error) {
      return reply.status(500).send({
        success: false,
        message: "Failed to retrieve users",
      });
    }
  }
}
