import bcrypt from "bcryptjs";
import { LoginDto, RegisterDto, User } from "@sreda/shared";
import { ConflictError, UnauthorizedError } from "../../common/errors/app-error";
import { userRepository, UserRepository } from "../users/users.repository";

export class AuthService {
	constructor(private readonly userRepo: UserRepository = userRepository) {}

	async register(dto: RegisterDto): Promise<User> {
		const user = await this.userRepo.findByEmailWithPassword(dto.email);
		if (user) {
			throw new ConflictError(`Пользователь с email "${dto.email}" уже зарегистрирован`);
		}
		const hashedPassword = await bcrypt.hash(dto.password, 12);
		return this.userRepo.create(dto.email, dto.name, hashedPassword);
	}

	async login(dto: LoginDto): Promise<User> {
		const user = await this.userRepo.findByEmailWithPassword(dto.email);
		if (!user) {
			throw new UnauthorizedError('Неверный email или пароль');
		}
		const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
		if (!isPasswordValid) {
			throw new UnauthorizedError('Неверный email или пароль');
		}
		return {
			id: user.id,
			email: user.email,
			name: user.name,
			avatarUrl: user.avatarUrl || undefined,
			createdAt: user.createdAt.toISOString(),
			updatedAt: user.updatedAt.toISOString(),
		};
	}

	async validateUserById(id: string): Promise<User>{
		const user = await this.userRepo.findById(id);
		if (!user) {
			throw new UnauthorizedError('Пользователь не найден или сессия недействительна');
		}
		return user;
	}
}

export const authService = new AuthService();
