import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fastifyCookie from '@fastify/cookie';
import fastifyJwt from '@fastify/jwt';
import { ZodError } from "zod";
import type { ApiErrorResponse } from "@sreda/shared";
import { AppError, UnauthorizedError } from "./common/errors/app-error";
import { authRoutes } from "./modules/auth/auth.routes";
import { healthRoutes } from "./modules/health/health.routes";
import { workspacesRoutes } from "./modules/workspaces/workspaces.routes";

export function buildApp(): FastifyInstance {
	const app = Fastify({ logger: true });

	app.register(fastifyCookie, {
		secret: process.env.COOKIE_SECRET || 'cookie-secret-key-32-chars-long!',
	});

	app.register(fastifyJwt, {
		secret: process.env.JWT_SECRET || 'jwt-secret-key-32-chars-long!',
	});

	app.decorate('authenticate', async (request: FastifyRequest, _reply: FastifyReply) => {
		try {
			await request.jwtVerify();
		} catch (error) {
			throw new UnauthorizedError('Недействительный или просроченный токен авторизации');
		}
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
	app.register(authRoutes, { prefix: "/api/v1/auth" })
	app.register(workspacesRoutes, { prefix: "/api/v1" });

	return app;
}
