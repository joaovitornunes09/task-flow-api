import { fastify } from "fastify"
import { fastifyCors } from "@fastify/cors"
import {
  validatorCompiler,
  serializerCompiler,
  jsonSchemaTransform,
} from "fastify-type-provider-zod"
import { fastifySwagger } from "@fastify/swagger"
import { fastifySwaggerUi } from "@fastify/swagger-ui"
import { routes } from "./routes"
import { ZodTypeProvider } from "fastify-type-provider-zod"
import fastifyJwt from "@fastify/jwt"
import "dotenv/config"

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, { origin: "*" })

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Task Flow API",
      description: "API for managing tasks",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  transform: jsonSchemaTransform
})

app.register(fastifySwaggerUi, {
  routePrefix: "/docs"
})

app.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || "fallback-secret-key"
})

// Health check endpoint
app.get("/health", async (request, reply) => {
  return { status: "ok", timestamp: new Date().toISOString() }
})

app.register(routes)

const port = Number(process.env.PORT) || 3333

app.listen({ host: '0.0.0.0', port }).then(() => {
  console.log(`HTTP server running on http://localhost:${port}`)
})
