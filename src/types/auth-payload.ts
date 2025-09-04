// Interface genérica para payload de autenticação
export interface AuthenticatedPayload {
  id: string;
  email: string;
}

// Interface para dados básicos do usuário autenticado
export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
}

declare module "fastify" {
  interface FastifyRequest {
    authPayload: AuthenticatedPayload;
    user: AuthenticatedUser;
  }
}

export {};
