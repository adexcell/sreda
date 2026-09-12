import type { FastifyReply, FastifyRequest } from "fastify";
import type { ApiResponse, Workspace } from "@sreda/shared";
import { workspacesService } from "./workspaces.service";

export class WorkspacesController {
	async getWorkspaces(
		_request: FastifyRequest,
		_reply: FastifyReply,
	): Promise<ApiResponse<Workspace[]>> {
		const workspaces = await workspacesService.getAll();
		return {
			success: true,
			data: workspaces,
		}
	}
}

export const workspacesController = new WorkspacesController();
