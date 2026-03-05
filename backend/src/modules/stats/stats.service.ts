import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class StatsService {
  constructor(private prisma: PrismaService) {}

  async getDaily(userId: string, days = 7) {
    const rows: any[] = await this.prisma.$queryRaw`
      SELECT
        TO_CHAR("startTime", 'YYYY-MM-DD')  AS date,
        SUM("durationSeconds")::int          AS "totalSeconds",
        COUNT(*)::int                        AS "sessionCount",
        ROUND(AVG(rating)::numeric, 1)       AS "avgRating"
      FROM "StudySession"
      WHERE
        "userId"   = ${userId}
        AND status = 'COMPLETED'
        AND "startTime" >= NOW() - (${days} || ' days')::interval
      GROUP BY date
      ORDER BY date ASC
    `;
    return rows;
  }

  async getWeekly(userId: string) {
    const rows: any[] = await this.prisma.$queryRaw`
      SELECT
        SUM("durationSeconds")::int   AS "totalSeconds",
        COUNT(*)::int                 AS sessions,
        ROUND(AVG(rating)::numeric,1) AS "avgRating"
      FROM "StudySession"
      WHERE
        "userId"   = ${userId}
        AND status = 'COMPLETED'
        AND "startTime" >= NOW() - INTERVAL '7 days'
    `;
    return rows[0] ?? { totalSeconds: 0, sessions: 0, avgRating: null };
  }

  async getSubjects(userId: string) {
    const rows: any[] = await this.prisma.$queryRaw`
      SELECT
        subject,
        SUM("durationSeconds")::int AS "totalSeconds",
        COUNT(*)::int               AS count
      FROM "StudySession"
      WHERE "userId" = ${userId} AND status = 'COMPLETED'
      GROUP BY subject
      ORDER BY "totalSeconds" DESC
      LIMIT 10
    `;
    return rows;
  }

  async getHeatmap(userId: string) {
    const rows: any[] = await this.prisma.$queryRaw`
      SELECT
        TO_CHAR("startTime", 'YYYY-MM-DD') AS date,
        SUM("durationSeconds")::int         AS "totalSeconds"
      FROM "StudySession"
      WHERE
        "userId"   = ${userId}
        AND status = 'COMPLETED'
        AND "startTime" >= NOW() - INTERVAL '365 days'
      GROUP BY date
      ORDER BY date ASC
    `;
    return rows;
  }
}
