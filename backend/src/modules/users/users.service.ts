import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByUsername(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        bio: true,
        level: true,
        totalStudySeconds: true,
        currentStreak: true,
        longestStreak: true,
        createdAt: true,
        achievements: { include: { achievement: true } },
      },
    });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  updateProfile(userId: string, dto: { bio?: string; avatarUrl?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: { id: true, username: true, bio: true, avatarUrl: true },
    });
  }
}
