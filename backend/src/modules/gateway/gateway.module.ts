import { Module } from "@nestjs/common";
import { StudySyncGateway } from "./studysync.gateway";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  providers: [StudySyncGateway],
  exports: [StudySyncGateway],
})
export class GatewayModule {}
