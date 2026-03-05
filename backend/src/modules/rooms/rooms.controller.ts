import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RoomsService } from "./rooms.service";
import { CreateRoomDto } from "./dto/create-room.dto";

@Controller("rooms")
@UseGuards(JwtAuthGuard)
export class RoomsController {
  constructor(private rooms: RoomsService) {}

  @Post() create(@Request() req, @Body() dto: CreateRoomDto) {
    return this.rooms.create(req.user.userId, dto);
  }
  @Get() findAll(@Query("search") s?: string, @Query("page") p = 1) {
    return this.rooms.findAll(s, +p);
  }
  @Get(":id") findById(@Param("id") id: string) {
    return this.rooms.findById(id);
  }
  @Post(":id/join") join(
    @Request() req,
    @Param("id") id: string,
    @Body("password") pw?: string,
  ) {
    return this.rooms.join(req.user.userId, id, pw);
  }
  @Post(":id/leave") leave(@Request() req, @Param("id") id: string) {
    return this.rooms.leave(req.user.userId, id);
  }
  @Delete(":id") delete(@Request() req, @Param("id") id: string) {
    return this.rooms.delete(req.user.userId, id);
  }
}
