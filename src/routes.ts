
import { initializeServices, getControllers } from "./lib/instances";
import { userRoutes } from "./routes/user.routes";
import { categoryRoutes } from "./routes/category.routes";
import { taskRoutes } from "./routes/task.routes";
import { collaborationRoutes } from "./routes/collaboration.routes";
import { reportRoutes } from "./routes/report.routes";
import { FastifyTypedInstance } from "./types/fastify";

export async function routes(app: FastifyTypedInstance) {
  initializeServices((payload) => app.jwt.sign(payload));
  const controllers = getControllers();

  await app.register(async (app) => {
    await userRoutes(app, controllers.userController);
    await categoryRoutes(app, controllers.categoryController);
    await taskRoutes(app, controllers.taskController);
    await collaborationRoutes(app, controllers.collaborationController);
    await reportRoutes(app, controllers.reportController);
  });
}
