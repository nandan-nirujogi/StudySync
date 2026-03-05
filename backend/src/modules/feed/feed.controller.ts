import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { FeedService } from "./feed.service";

@Controller("feed")
@UseGuards(JwtAuthGuard)
export class FeedController {
  constructor(private feed: FeedService) {}

  @Get() getFeed(@Query("page") page = 1) {
    return this.feed.getFeed(+page);
  }
  @Get("room/:roomId") getRoomFeed(
    @Param("roomId") roomId: string,
    @Query("page") page = 1,
  ) {
    return this.feed.getRoomFeed(roomId, +page);
  }
  @Post(":activityId/encourage") encourage(
    @Request() req,
    @Param("activityId") id: string,
  ) {
    return this.feed.toggleEncouragement(req.user.userId, id);
  }
}
