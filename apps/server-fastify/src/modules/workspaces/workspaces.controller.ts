import type { FastifyReply, FastifyRequest } from "fastify";
import { createWorkspaceSchema, type ApiResponse, type Workspace } from "@sreda/shared";
import { workspacesService } from "./workspaces.service";

export class WorkspacesController {
	async getWorkspaces(
		_request: FastifyRequest,
		_reply: FastifyReply,
	): Promise<ApiResponse<Workspace[]>> {
		const workspaces = await workspacesService.getAll();
		return { success: true, data: workspaces }
	}

	async getWorkspaceById(
		request: FastifyRequest<{ Params: { id: string } }>,
		_reply: FastifyReply
	): Promise<ApiResponse<Workspace>> {
		const { id } = request.params;
		const workspace = await workspacesService.getById(id);
		return { success: true, data: workspace };
	}

	async createWorkspace(
		request: FastifyRequest,
		reply: FastifyReply
	): Promise<ApiResponse<Workspace>> {
		const validateBody = createWorkspaceSchema.parse(request.body);
		const newWorkspace = await workspacesService.create(validateBody, request.user.id);

		reply.status(201);
		return { success: true, data: newWorkspace };
	}
}

export const workspacesController = new WorkspacesController();
