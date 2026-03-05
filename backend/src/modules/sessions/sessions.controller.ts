import {
  Controller,
  Post,
  Put,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { SessionsService } from "./sessions.service";
import { StartSessionDto } from "./dto/start-session.dto";
import { StopSessionDto } from "./dto/stop-session.dto";

@Controller("sessions")
@UseGuards(JwtAuthGuard)
export class SessionsController {
  constructor(private sessions: SessionsService) {}

  @Post("start")
  start(@Request() req, @Body() dto: StartSessionDto) {
    return this.sessions.start(req.user.userId, dto);
  }

  @Put(":id/pause")
  pause(@Request() req, @Param("id") id: string) {
    return this.sessions.pause(req.user.userId, id);
  }

  @Put(":id/resume")
  resume(@Request() req, @Param("id") id: string) {
    return this.sessions.resume(req.user.userId, id);
  }

  @Put(":id/stop")
  stop(@Request() req, @Param("id") id: string, @Body() dto: StopSessionDto) {
    return this.sessions.stop(req.user.userId, id, dto);
  }

  @Get("current")
  current(@Request() req) {
    return this.sessions.getCurrent(req.user.userId);
  }

  @Get("history")
  history(@Request() req, @Query("page") page = 1) {
    return this.sessions.getHistory(req.user.userId, +page);
  }
}
