import {
  Injectable, ConflictException,
  UnauthorizedException, NotFoundException,
} from '@nestjs/common';
import { JwtService }    from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma:  PrismaService,
    private jwt:     JwtService,
    private config:  ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.prisma.user.findFirst({
      where: { OR: [{ email: dto.email }, { username: dto.username }] },
    });
    if (exists) {
      throw new ConflictException(
        exists.email === dto.email.toLowerCase()
          ? 'Email already in use'
          : 'Username already taken',
      );
    }
    const user = await this.prisma.user.create({
      data: {
        username: dto.username.toLowerCase(),
        email:    dto.email.toLowerCase(),
        password: await bcrypt.hash(dto.password, 12),
      },
    });
    return this.buildTokens(user);
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) return null;
    const ok = await bcrypt.compare(password, user.password);
    return ok ? user : null;
  }

  async login(user: any) {
    await this.prisma.user.update({
      where: { id: user.id },
      data:  { lastActive: new Date() },
    });
    return this.buildTokens(user);
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where:  { id: userId },
      select: {
        id: true, username: true, email: true,
        avatarUrl: true, bio: true, level: true,
        totalStudySeconds: true, currentStreak: true,
        longestStreak: true, lastActive: true, createdAt: true,
        achievements: { include: { achievement: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async refresh(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.buildTokens(user);
  }

  private buildTokens(user: any) {
    const payload = { sub: user.id, username: user.username };
    return {
      accessToken: this.jwt.sign(payload),
      refreshToken: this.jwt.sign(payload, {
        secret:    this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '30d'),
      }),
      user: {
        id: user.id, username: user.username, email: user.email,
        level: user.level, totalStudySeconds: user.totalStudySeconds,
        currentStreak: user.currentStreak, avatarUrl: user.avatarUrl,
      },
    };
  }
}