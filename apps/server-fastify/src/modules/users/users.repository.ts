import { eq } from 'drizzle-orm';
import type { User } from '@sreda/shared';
import { db } from '../../db';
import { users } from '../../db/schema';

// Тип строки БД (включая passwordHash)
export type UserDBRow = typeof users.$inferSelect;

export class UserRepository {
	async findByEmailWithPassword(email: string): Promise<UserDBRow | null> {
		const [row] = await db
			.select()
			.from(users)
			.where(eq(users.email, email.toLowerCase().trim()))
			.limit(1);
		
		return row || null;
	}

	async findById(id: string): Promise<User | null> {
		const [row] = await db
			.select()
			.from(users)
			.where(eq(users.id, id))
			.limit(1);

		return row ? this.mapToEntity(row) : null;
	}

	async create(email: string, name: string, passwordHash: string): Promise<User> {
		const [row] = await db
			.insert(users)
			.values({
				email: email.toLowerCase().trim(),
				name,
				passwordHash,
			})
			.returning();

		return this.mapToEntity(row);
	}

	private mapToEntity(row: UserDBRow): User {
		return {
			id: row.id,
			email: row.email,
			name: row.name,
			avatarUrl: row.avatarUrl || undefined,
			createdAt: row.createdAt.toISOString(),
			updatedAt: row.updatedAt.toISOString(),
		}
	}
}

export const userRepository = new UserRepository();
