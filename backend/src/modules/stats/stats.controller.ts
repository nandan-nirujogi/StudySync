import { Controller, Get, Query, UseGuards, Request } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { StatsService } from "./stats.service";

@Controller("stats")
@UseGuards(JwtAuthGuard)
export class StatsController {
  constructor(private stats: StatsService) {}

  @Get("daily") daily(@Request() req, @Query("days") days = 7) {
    return this.stats.getDaily(req.user.userId, +days);
  }
  @Get("weekly") weekly(@Request() req) {
    return this.stats.getWeekly(req.user.userId);
  }
  @Get("subjects") subjects(@Request() req) {
    return this.stats.getSubjects(req.user.userId);
  }
  @Get("heatmap") heatmap(@Request() req) {
    return this.stats.getHeatmap(req.user.userId);
  }
}
