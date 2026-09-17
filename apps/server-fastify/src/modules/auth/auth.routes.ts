import { FastifyPluginAsync } from "fastify";
import { authController } from "./auth.controller";

export const authRoutes: FastifyPluginAsync = async (fastify) => {
	fastify.post('/register', authController.register.bind(authController))
	fastify.post('/login', authController.login.bind(authController))
	fastify.post('/refresh', authController.refresh.bind(authController))
	fastify.post('/logout', authController.logout.bind(authController))

	fastify.get('/me', { onRequest: [fastify.authenticate] } ,authController.getMe.bind(authController))
}
