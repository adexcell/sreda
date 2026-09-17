import { z } from "zod";

export const registerSchema = z.object({
	email: z.string().email('Некорректный формат email'),
	name: z.string().min(2, 'Имя должно содержать минимум 2 символа').max(50),
	password: z.string().min(6, 'Пароль должен содержать минимум 6 символов').max(50),
})

export type RegisterDto = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
	email: z.string().email('Некорректный формат email'),
	password: z.string().min(6, 'Пароль обязателен').max(50),
})

export type LoginDto = z.infer<typeof loginSchema>;

export const createWorkspaceSchema = z.object({
	name: z.string().min(2, 'Название должно содержать минимум 2 символа').max(50),
	slug: z
		.string()
		.min(2)
		.max(50)
		.regex(/^[a-z0-9-]+$/, 'Slug должен содержать только латинские буквы, цифры и дефисы'),
});

export type CreateWorkspaceDto = z.infer<typeof createWorkspaceSchema>

export type UserRole = "owner" | "admin" | "member" | "viewer";

export interface User {
	id: string;
	email: string;
	name: string;
	avatarUrl?: string;
	createdAt: string;
	updatedAt: string;
}

export interface Workspace {
	id: string;
	name: string;
	slug: string;
	ownerId: string;
	createdAt: string;
}

export type TaskStatus = "backlog" | "todo" | "in_progress" | "in_review" | "done" | "canceled";
export type TaskPriority = "no_priority" | "low" | "medium" | "high" | "urgent";

export interface Task {
	id: string;
	workspaceId: string;
	title: string;
	description?: string;
	status: TaskStatus;
	priority: TaskPriority;
	assigneeId?: string;
	creatorId: string;
	order: number;
	createdAt: string;
	updatedAt: string;
}

export interface ApiSuccessResponse<T> {
	success: true;
	data: T;
}

export interface ApiErrorResponse {
	success: false;
	error: {
		code: string;
		message: string;
		details?: unknown;
	};
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type CreateTaskDto = Optional<
	Omit<Task, "id" | "createdAt" | "updatedAt" | "creatorId">,
	"status" | "priority" | "order"
>;

export type UpdateTaskDto = Partial<CreateTaskDto>;
export interface AuthCredentialsDto {
	email: string;
	password: string;
}

export interface AuthResponseDto {
	user: User;
	accessToken: string;
}
