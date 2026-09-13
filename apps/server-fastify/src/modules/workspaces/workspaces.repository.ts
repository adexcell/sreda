import { eq } from 'drizzle-orm';
import type { Workspace } from '@sreda/shared';
import { db } from '../../db';
import { workspaces } from '../../db/schema';

export class WorkspacesRepository {
	async findMany(): Promise<Workspace[]> {
		const rows = await db.select().from(workspaces);
		return rows.map(row => this.mapToEntity(row));
	}

	async findById(id: string): Promise<Workspace | null> {
		const [row] = await db
			.select()
			.from(workspaces)
			.where(eq(workspaces.id, id))
			.limit(1);
		
		return row ? this.mapToEntity(row) : null;
	}

	async findBySlug(slug: string): Promise<Workspace | null> {
		const [row] = await db
			.select()
			.from(workspaces)
			.where(eq(workspaces.slug, slug))
			.limit(1);
		
		return row ? this.mapToEntity(row) : null;
	}

	async create(data: {
		name: string,
		slug: string,
		ownerId: string,
	}): Promise<Workspace> {
		const [row] = await db
			.insert(workspaces)
			.values({
				name: data.name,
				slug: data.slug,
				ownerId: data.ownerId,
			})
			.returning();

		return this.mapToEntity(row);
	}

	private mapToEntity(row: typeof workspaces.$inferSelect): Workspace {
		return {
			id: row.id,
			name: row.name,
			slug: row.slug,
			ownerId: row.ownerId,
			createdAt: row.createdAt.toISOString()
		};
	}
}

export const workspacesRepository = new WorkspacesRepository();
