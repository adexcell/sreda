export class AppError extends Error {
	constructor(
		public readonly message: string,
		public readonly statusCode: number = 500,
		public readonly code: string = 'INTERNAL_SERVER_ERROR',
		public readonly details?: unknown
	) {
		super(message);
		this.name = this.constructor.name;
		Error.captureStackTrace(this, this.constructor);
	}
}

export class NotFoundError extends AppError {
	constructor(message: string = 'Ресурс не найден', details?: unknown) {
		super(message, 404, 'NOT_FOUND', details);
	}
}

export class ValidationError extends AppError {
	constructor(message: string = 'Ошибка валидации входных данных', details?: unknown) {
		super(message, 400, 'VALIDATION_ERROR', details);
	}
}

export class ConflictError extends AppError {
	constructor(message: string = 'Ресурс с такими данными уже существует', details?: unknown) {
		super(message, 409, 'CONFLICT', details);
	}
}
