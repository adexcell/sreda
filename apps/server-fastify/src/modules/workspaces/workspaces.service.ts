import type { CreateWorkspaceDto, Workspace } from "@sreda/shared"
import { ConflictError, NotFoundError } from "../../common/errors/app-error";
import { workspacesRepository, WorkspacesRepository } from "./workspaces.repository";


export class WorkspacesService {
	constructor(private readonly repo: WorkspacesRepository = workspacesRepository) {}

	async getAll(): Promise<Workspace[]> {
		return this.repo.findMany();
	}

	async getById(id: string): Promise<Workspace> {
		const workspace = await this.repo.findById(id)
		if (!workspace) {
			throw new NotFoundError('Workspace не найден');
		};
		return workspace;
	}

	async create(
		dto: CreateWorkspaceDto,
		ownerId: string = '00000000-0000-0000-0000-000000000001'
	): Promise<Workspace> {
		const exists = await this.repo.findBySlug(dto.slug);
		if (exists) {
			throw new ConflictError(`Workspace со slug '${dto.slug}' уже существует`);
		}

		return this.repo.create({
			name: dto.name,
			slug: dto.slug,
			ownerId,
		})
	}
}

export const workspacesService = new WorkspacesService();
