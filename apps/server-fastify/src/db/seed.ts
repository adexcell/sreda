import * as dotenv from 'dotenv';
import { db }  from './index';
import { users, workspaces } from './schema';

dotenv.config();

export const SEED_USER_ID = '00000000-0000-0000-0000-000000000001';

async function seed() {
	console.log('🚀 Starting seed...');

	await db
		.insert(users)
		.values({
			id: SEED_USER_ID,
			email: 'admin@sreda.dev',
			name: 'Супер Админ',
			passwordHash: 'admin',
		})
		.onConflictDoNothing();

	await db
		.insert(workspaces)
		.values({
			id: '00000000-0000-0000-0000-000000000010',
      name: 'Основной воркспейс',
      slug: 'main-workspace',
      ownerId: SEED_USER_ID,
		})
		.onConflictDoNothing();

	console.log('🚀 Seed finished! DB should have the user and workspace');
	process.exit(0);
}

seed().catch((err) => {
	console.error('❌ Seed failed:', err);
	process.exit(1);
});
