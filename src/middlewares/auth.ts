import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../lib/prisma";
import { AuthenticatedPayload } from "../types/auth-payload";

export async function baseAuthMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({
        message: "Access token is required",
      });
    }

    const token = authHeader.substring(7);

    const decoded = request.server.jwt.verify(token) as AuthenticatedPayload;

    request.authPayload = decoded;
  } catch (error) {
    return reply.status(401).send({
      message: "Invalid or expired token",
    });
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  await baseAuthMiddleware(request, reply);

  if (request.authPayload) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: request.authPayload.id },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      if (!user) {
        return reply.status(401).send({
          message: "User not found",
        });
      }

      request.user = user;
    } catch (error) {
      return reply.status(401).send({
        message: "Failed to load user data",
      });
    }
  }
}

export function withAuth<T extends { schema?: Record<string, unknown> }>(options: T) {
  return {
    ...options,
    preHandler: authMiddleware,
    schema: {
      ...(options.schema || {}),
      security: [{ bearerAuth: [] }],
    },
  };
}
