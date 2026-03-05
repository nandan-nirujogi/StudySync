import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SessionStatus } from "@prisma/client";
import { StartSessionDto } from "./dto/start-session.dto";
import { StopSessionDto } from "./dto/stop-session.dto";

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  async start(userId: string, dto: StartSessionDto) {
    const active = await this.prisma.studySession.findFirst({
      where: { userId, status: { in: ["ACTIVE", "PAUSED"] } },
    });
    if (active)
      throw new BadRequestException("You already have an active session");

    return this.prisma.studySession.create({
      data: {
        userId,
        roomId: dto.roomId ?? null,
        subject: dto.subject,
        startTime: new Date(),
        status: "ACTIVE",
      },
    });
  }

  async pause(userId: string, sessionId: string) {
    await this.findActiveOrThrow(userId, sessionId, "ACTIVE");
    return this.prisma.studySession.update({
      where: { id: sessionId },
      data: { status: "PAUSED", pausedAt: new Date() },
    });
  }

  async resume(userId: string, sessionId: string) {
    const s = await this.findActiveOrThrow(userId, sessionId, "PAUSED");
    const extraPausedSecs = s.pausedAt
      ? Math.floor((Date.now() - s.pausedAt.getTime()) / 1000)
      : 0;
    return this.prisma.studySession.update({
      where: { id: sessionId },
      data: {
        status: "ACTIVE",
        pausedAt: null,
        pausedSeconds: { increment: extraPausedSecs },
      },
    });
  }

  async stop(userId: string, sessionId: string, dto: StopSessionDto) {
    const s = await this.prisma.studySession.findFirst({
      where: { id: sessionId, userId, status: { in: ["ACTIVE", "PAUSED"] } },
    });
    if (!s) throw new NotFoundException("Session not found");

    const endTime = new Date();
    const totalSecs = Math.floor(
      (endTime.getTime() - s.startTime.getTime()) / 1000,
    );
    const studySecs = Math.max(0, totalSecs - (s.pausedSeconds ?? 0));

    const [session] = await this.prisma.$transaction([
      this.prisma.studySession.update({
        where: { id: sessionId },
        data: {
          status: "COMPLETED",
          endTime,
          durationSeconds: studySecs,
          subject: dto.subject ?? s.subject,
          memo: dto.memo ?? "",
          rating: dto.rating ?? null,
        },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: {
          totalStudySeconds: { increment: studySecs },
          lastStudyDate: endTime,
          lastActive: endTime,
        },
      }),
    ]);
    return session;
  }

  getCurrent(userId: string) {
    return this.prisma.studySession.findFirst({
      where: { userId, status: { in: ["ACTIVE", "PAUSED"] } },
    });
  }

  async getHistory(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [sessions, total] = await this.prisma.$transaction([
      this.prisma.studySession.findMany({
        where: { userId, status: "COMPLETED" },
        orderBy: { startTime: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.studySession.count({
        where: { userId, status: "COMPLETED" },
      }),
    ]);
    return { sessions, total, page, pages: Math.ceil(total / limit) };
  }

  recordDistraction(userId: string, sessionId: string) {
    return this.prisma.studySession.updateMany({
      where: { id: sessionId, userId },
      data: { distractionCount: { increment: 1 } },
    });
  }

  private async findActiveOrThrow(
    userId: string,
    sessionId: string,
    status: SessionStatus,
  ) {
    const s = await this.prisma.studySession.findFirst({
      where: { id: sessionId, userId, status },
    });
    if (!s)
      throw new NotFoundException(`No ${status.toLowerCase()} session found`);
    return s;
  }
}
