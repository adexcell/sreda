import type { Workspace } from "@sreda/shared"

export class WorkspacesService {
	async getAll(): Promise<Workspace[]> {
		return [
			{
				id: 'ws-1',
				name: 'Основной workspace',
				slug: 'main-workspace',
				ownerId: 'user-1',
				createdAt: new Date().toISOString(),
			}
		];
	}
}

export const workspacesService = new WorkspacesService();
