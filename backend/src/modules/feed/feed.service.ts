import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ActivityType }  from '@prisma/client';

@Injectable()
export class FeedService {
  constructor(private prisma: PrismaService) {}

  createActivity(userId: string, type: ActivityType, data: any, roomId?: string) {
    return this.prisma.activity.create({ data: { userId, roomId: roomId ?? null, type, data } });
  }

  getFeed(page = 1, limit = 20) {
    return this.prisma.activity.findMany({
      include: { user: { select: { id: true, username: true, avatarUrl: true, level: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit, take: limit,
    });
  }

  getRoomFeed(roomId: string, page = 1, limit = 20) {
    return this.prisma.activity.findMany({
      where:   { roomId },
      include: { user: { select: { id: true, username: true, avatarUrl: true, level: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit, take: limit,
    });
  }

  async toggleEncouragement(userId: string, activityId: string) {
    const existing = await this.prisma.encouragement.findUnique({
      where: { userId_activityId: { userId, activityId } },
    });
    if (existing) {
      await this.prisma.encouragement.delete({ where: { userId_activityId: { userId, activityId } } });
      return this.prisma.activity.update({ where: { id: activityId }, data: { encouragementCount: { decrement: 1 } } });
    } else {
      await this.prisma.encouragement.create({ data: { userId, activityId } });
      return this.prisma.activity.update({ where: { id: activityId }, data: { encouragementCount: { increment: 1 } } });
    }
  }
}