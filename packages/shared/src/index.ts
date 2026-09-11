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

export type CreateWorkspaceDto = Pick<Workspace, "name" | "slug">;

export type UpdateTaskDto = Partial<CreateTaskDto>;
export interface AuthCredentialsDto {
	email: string;
	password: string;
}

export interface AuthResponseDto {
	user: User;
	accessToken: string;
}
