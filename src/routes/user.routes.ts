import z from "zod";
import { FastifyTypedInstance } from "../types/fastify";
import { withAuth } from "../middlewares/auth";
import { UserController } from "../controllers/UserController";

export async function userRoutes(
  app: FastifyTypedInstance,
  userController: UserController
) {
  app.post(
    "/users/register",
    {
      schema: {
        description: "Register a new user",
        tags: ["Users"],
        summary: "User registration",
        body: z.object({
          name: z.string().describe("User's full name"),
          email: z.email().describe("User's email address"),
          password: z
            .string()
            .min(6)
            .describe("User's password (minimum 6 characters)"),
        }),
        response: {
          201: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
            }),
          }),
          400: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    userController.register.bind(userController)
  );

  app.post(
    "/users/login",
    {
      schema: {
        description: "Authenticate user and generate access token",
        tags: ["Users"],
        summary: "User login",
        body: z.object({
          email: z.email().describe("User's email address"),
          password: z.string().describe("User's password"),
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            token: z.string(),
            user: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
            }),
          }),
          400: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    userController.login.bind(userController)
  );

  app.get(
    "/users/profile",
    withAuth({
      schema: {
        description: "Get current user profile",
        tags: ["Users"],
        summary: "Get profile",
        response: {
          200: z.object({
            success: z.boolean(),
            id: z.string(),
            name: z.string(),
            email: z.string(),
          }),
          404: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    }),
    userController.getProfile.bind(userController)
  );

  app.put(
    "/users/profile",
    withAuth({
      schema: {
        description: "Update current user profile",
        tags: ["Users"],
        summary: "Update profile",
        body: z.object({
          name: z.string().optional(),
          email: z.email().optional(),
          password: z.string().min(6).optional(),
        }),
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.object({
              id: z.string(),
              name: z.string(),
              email: z.string(),
            }),
          }),
          400: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    }),
    userController.updateProfile.bind(userController)
  );

  app.post(
    "/users/logout",
    withAuth({
      schema: {
        description: "Logout user and invalidate token",
        tags: ["Users"],
        summary: "User logout",
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
          500: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    }),
    userController.logout.bind(userController)
  );

  app.get(
    "/users",
    withAuth({
      schema: {
        description: "Get all users",
        tags: ["Users"],
        summary: "Get all users",
        response: {
          200: z.object({
            success: z.boolean(),
            message: z.string(),
            data: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                email: z.string(),
              })
            ),
          }),
        },
      },
    }),
    userController.getAllUsers.bind(userController)
  );
}
