import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = 
	process.env.DATABASE_URL || 'postgresql://sreda_user:sreda_password@localhost:5432/sreda_db';

// Пулл соединений с бд
const client = postgres(connectionString);

// Экспорт Drizzle DB с переданной схемой (для работы Relational Queries)
export const db = drizzle(client, { schema });


