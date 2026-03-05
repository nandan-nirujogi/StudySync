import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { SessionsModule } from "./modules/sessions/sessions.module";
import { RoomsModule } from "./modules/rooms/rooms.module";
import { FeedModule } from "./modules/feed/feed.module";
import { StatsModule } from "./modules/stats/stats.module";
import { GatewayModule } from "./modules/gateway/gateway.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: "../.env" }),
    ThrottlerModule.forRoot([
      { name: "short", ttl: 1000, limit: 15 },
      { name: "medium", ttl: 10000, limit: 60 },
      { name: "long", ttl: 60000, limit: 250 },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    SessionsModule,
    RoomsModule,
    FeedModule,
    StatsModule,
    GatewayModule,
  ],
})
export class AppModule {}
