import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private users: UsersService) {}

  @Get(":username")
  findByUsername(@Param("username") username: string) {
    return this.users.findByUsername(username);
  }

  @UseGuards(JwtAuthGuard)
  @Put("profile")
  update(@Request() req, @Body() dto: { bio?: string; avatarUrl?: string }) {
    return this.users.updateProfile(req.user.userId, dto);
  }
}
