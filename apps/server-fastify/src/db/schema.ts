import { pgTable, uuid, varchar, text, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	name: varchar('name', { length: 100 }).notNull(),
	avatarUrl: text('avatar_url'),
	passwordHash: text('password_hash').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const workspaces = pgTable('workspaces', {
	id: uuid('id').primaryKey().defaultRandom(),
	name: varchar('name', { length: 50 }).notNull(),
	slug: varchar('slug', { length: 50 }).notNull().unique(),
	ownerId: uuid('owner_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const tasks = pgTable('tasks', {
	id: uuid('id').primaryKey().defaultRandom(),
	workspaceId: uuid('workspace_id').references(() => workspaces.id, { onDelete: 'cascade' }).notNull(),
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	status: varchar('status', { length: 30 }).default('todo').notNull(),
	priority: varchar('priority', { length: 30 }).default('no_priority').notNull(),
	creatorId: uuid('creator_id').references(() => users.id, { onDelete: 'cascade'}).notNull(),
	assigneeId: uuid('assignee_id').references(() => users.id, { onDelete: 'set null'}),
	order: doublePrecision('order').default(0).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
	workspaces: many(workspaces),
	createdTasks: many(tasks, { relationName: 'createdTasks' }),
	assignedTasks: many(tasks, { relationName: 'assignedTasks' }),
}));

export const workspacesRelations = relations(workspaces, ({ one, many }) => ({
	owner: one(users, {
		fields: [workspaces.ownerId],
		references: [users.id],
	}),
	tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
	workspace: one(workspaces, {
		fields: [tasks.workspaceId],
		references: [workspaces.id],
	}),
	creator: one(users, {
		fields: [tasks.creatorId],
		references: [users.id],
	}),
	assignee: one(users, {
		fields: [tasks.assigneeId],
		references: [users.id],
	}),
}));

