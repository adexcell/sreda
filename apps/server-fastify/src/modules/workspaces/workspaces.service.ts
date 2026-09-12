import type { CreateWorkspaceDto, Workspace } from "@sreda/shared"
import { ConflictError, NotFoundError } from "../../common/errors/app-error";
import { randomUUID } from "node:crypto";


export class WorkspacesService {
	private workspaces: Workspace[] = [
		{
			id: 'ws-1',
			name: 'Основной workspace',
			slug: 'main-workspace',
			ownerId: 'user-1',
			createdAt: new Date().toISOString(),
		},
	];
	
	async getAll(): Promise<Workspace[]> {
		return this.workspaces;
	}

	async getById(id: string): Promise<Workspace> {
		const workspace = this.workspaces.find((w) => w.id === id)
		if (!workspace) {
			throw new NotFoundError('Workspace не найден');
		};
		return workspace;
	}

	async create(dto: CreateWorkspaceDto): Promise<Workspace> {
		const exists = this.workspaces.some((w) => w.slug === dto.slug)
		if (exists) {
			throw new ConflictError('Workspace с таким slug уже существует');
		}

		const newWorkspace: Workspace = {
			id: randomUUID(),
			name: dto.name,
			slug: dto.slug,
			ownerId: 'user-1',
			createdAt: new Date().toISOString(),
		}

		this.workspaces.push(newWorkspace)

		return newWorkspace
	}
}

export const workspacesService = new WorkspacesService();
