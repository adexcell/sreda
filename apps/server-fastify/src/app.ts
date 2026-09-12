import Fastify, { FastifyInstance } from "fastify";
import { healthRoutes } from "./modules/health/health.routes";
import { workspacesRoutes } from "./modules/workspaces/workspaces.routes";

export function buildApp(): FastifyInstance {
	const app = Fastify({
		logger: true,
	});

	app.register(healthRoutes);
	app.register(workspacesRoutes, { prefix: "/api/v1" });

	return app;
}
