import type { FastifyPluginAsync } from "fastify";
import { workspacesController } from "./workspaces.controller";

export const workspacesRoutes: FastifyPluginAsync = async (fastify) => {
	fastify.get('/workspaces', workspacesController.getWorkspaces.bind(workspacesController));
	fastify.get('/workspaces/:id', workspacesController.getWorkspaceById.bind(workspacesController));

	fastify.post('/workspaces', { onRequest: [fastify.authenticate] }, workspacesController.createWorkspace.bind(workspacesController));
};
