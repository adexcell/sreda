import type { FastifyReply, FastifyRequest } from 'fastify';
import { loginSchema, registerSchema, type ApiResponse, type AuthResponseDto, type User } from '@sreda/shared';
import { UnauthorizedError } from '../../common/errors/app-error';
import { authService } from './auth.service';

const REFRESH_TOKEN_COOKIE = 'refreshToken';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export class AuthController {
  async register(request: FastifyRequest, reply: FastifyReply): Promise<ApiResponse<AuthResponseDto>> {
    const validatedBody = registerSchema.parse(request.body);
    const user = await authService.register(validatedBody);

    const tokens = this.generateTokens(request.server, user);
    this.setRefreshTokenCookie(reply, tokens.refreshToken);

    reply.status(201);
    return {
      success: true,
      data: {
        user,
        accessToken: tokens.accessToken,
      },
    };
  }

  async login(request: FastifyRequest, reply: FastifyReply): Promise<ApiResponse<AuthResponseDto>> {
    const validatedBody = loginSchema.parse(request.body);
    const user = await authService.login(validatedBody);

    const tokens = this.generateTokens(request.server, user);
    this.setRefreshTokenCookie(reply, tokens.refreshToken);

    return {
      success: true,
      data: {
        user,
        accessToken: tokens.accessToken,
      },
    };
  }

  async refresh(request: FastifyRequest, reply: FastifyReply): Promise<ApiResponse<AuthResponseDto>> {
    const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh токен отсутствует');
    }

    try {
      // Верифицируем refresh токен
      const payload = request.server.jwt.verify<{ id: string; email: string }>(refreshToken);
      const user = await authService.validateUserById(payload.id);

      // Генерируем новую пару токенов (Token Rotation)
      const tokens = this.generateTokens(request.server, user);
      this.setRefreshTokenCookie(reply, tokens.refreshToken);

      return {
        success: true,
        data: {
          user,
          accessToken: tokens.accessToken,
        },
      };
    } catch {
      throw new UnauthorizedError('Недействительный refresh токен');
    }
  }

  async logout(_request: FastifyRequest, reply: FastifyReply): Promise<ApiResponse<{ message: string }>> {
    reply.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/' });
    return {
      success: true,
      data: { message: 'Вы успешно вышли из системы' },
    };
  }

  async getMe(request: FastifyRequest): Promise<ApiResponse<User>> {
    const user = await authService.validateUserById(request.user.id);
    return {
      success: true,
      data: user,
    };
  }

  private generateTokens(fastify: FastifyRequest['server'], user: User) {
    const accessToken = fastify.jwt.sign(
      { id: user.id, email: user.email },
      { expiresIn: '15m' } // 15 минут
    );

    const refreshToken = fastify.jwt.sign(
      { id: user.id, email: user.email },
      { expiresIn: '7d' } // 7 дней
    );

    return { accessToken, refreshToken };
  }

  private setRefreshTokenCookie(reply: FastifyReply, token: string) {
    reply.setCookie(REFRESH_TOKEN_COOKIE, token, {
      path: '/',
      httpOnly: true, // Защита от XSS (недоступно из document.cookie)
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SEVEN_DAYS_MS / 1000,
    });
  }
}

export const authController = new AuthController();
