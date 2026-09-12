import type { FastifyPluginAsync } from "fastify";
import { workspacesController } from "./workspaces.controller";

export const workspacesRoutes: FastifyPluginAsync = async (fastify) => {
	fastify.get('/workspaces', workspacesController.getWorkspaces);
	fastify.get('/workspaces/:id', workspacesController.getWorkspaceById);
	fastify.post('/workspaces', workspacesController.createWorkspace);
};
