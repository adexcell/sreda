import Fastify, { FastifyInstance } from "fastify";
import { ZodError } from "zod";
import type { ApiErrorResponse } from "@sreda/shared";
import { AppError } from "./common/errors/app-error";
import { healthRoutes } from "./modules/health/health.routes";
import { workspacesRoutes } from "./modules/workspaces/workspaces.routes";

export function buildApp(): FastifyInstance {
	const app = Fastify({
		logger: true,
	});

	app.setErrorHandler((error, _request, reply) => {
		if (error instanceof ZodError) {
			const response: ApiErrorResponse = {
				success: false,
				error: {
					code: "VALIDATION_ERROR",
					message: "Переданы некорректные данные",
					details: error.issues.map((err) => ({
						path: err.path.join("."),
						message: err.message,
					})),
				}
			}
			return reply.status(400).send(response);
		}

		if (error instanceof AppError) {
			const response: ApiErrorResponse = {
				success: false,
				error: {
					code: error.code,
					message: error.message,
					details: error.details,
				}
			}
			return reply.status(error.statusCode).send(response);
		}

		app.log.error(error);
		const response: ApiErrorResponse = {
			success: false,
			error: {
				code: "INTERNAL_SERVER_ERROR",
				message: "Произошла внутренняя ошибка сервера",
			}
		}
		return reply.status(500).send(response)
	});

	app.register(healthRoutes);
	app.register(workspacesRoutes, { prefix: "/api/v1" });

	return app;
}
