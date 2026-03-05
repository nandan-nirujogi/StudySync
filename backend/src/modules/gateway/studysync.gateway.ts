import {
  WebSocketGateway, WebSocketServer,
  SubscribeMessage, MessageBody,
  ConnectedSocket, OnGatewayConnection,
  OnGatewayDisconnect, OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger }         from '@nestjs/common';
import { JwtService }     from '@nestjs/jwt';
import { ConfigService }  from '@nestjs/config';

export type UserStatus = 'studying' | 'idle' | 'away' | 'offline';

interface PresenceEntry {
  socketId:        string;
  userId:          string;
  username:        string;
  status:          UserStatus;
  subject?:        string;
  timerStartedAt?: number;
  rooms:           Set<string>;
}

const presence = new Map<string, PresenceEntry>();

function getRoomPresence(roomId: string): PresenceEntry[] {
  return [...presence.values()].filter((p) => p.rooms.has(roomId));
}

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  transports: ['websocket', 'polling'],
})
export class StudySyncGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger('WsGateway');

  constructor(private jwt: JwtService, private config: ConfigService) {}

  afterInit() {
    this.logger.log('WebSocket Gateway initialised');
  }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.split(' ')[1];
      if (!token) { client.disconnect(); return; }

      const payload = this.jwt.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      }) as { sub: string; username: string };

      client.data.userId   = payload.sub;
      client.data.username = payload.username;

      presence.set(payload.sub, {
        socketId: client.id,
        userId:   payload.sub,
        username: payload.username,
        status:   'idle',
        rooms:    new Set(),
      });
      this.logger.log(`✅ Connected: ${payload.username}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const { userId, username } = client.data;
    if (!userId) return;
    const entry = presence.get(userId);
    if (entry) {
      for (const roomId of entry.rooms) {
        this.server.to(`room:${roomId}`).emit('member:left', { userId, username });
      }
      presence.delete(userId);
    }
    this.logger.log(`❌ Disconnected: ${username}`);
  }

  @SubscribeMessage('room:join')
  handleRoomJoin(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    const { userId, username } = client.data;
    client.join(`room:${data.roomId}`);
    presence.get(userId)?.rooms.add(data.roomId);
    client.to(`room:${data.roomId}`).emit('member:joined', { userId, username, status: 'idle' });
    const members = getRoomPresence(data.roomId).map((p) => ({
      userId: p.userId, username: p.username, status: p.status,
      subject: p.subject, timerStartedAt: p.timerStartedAt,
    }));
    client.emit('room:state', { members });
  }

  @SubscribeMessage('room:leave')
  handleRoomLeave(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    const { userId, username } = client.data;
    client.leave(`room:${data.roomId}`);
    presence.get(userId)?.rooms.delete(data.roomId);
    client.to(`room:${data.roomId}`).emit('member:left', { userId, username });
  }

  @SubscribeMessage('timer:start')
  handleTimerStart(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId?: string; subject: string; sessionId: string }) {
    const { userId, username } = client.data;
    const entry = presence.get(userId);
    if (entry) { entry.status = 'studying'; entry.subject = data.subject; entry.timerStartedAt = Date.now(); }
    if (data.roomId) {
      this.server.to(`room:${data.roomId}`).emit('member:timer:start', { userId, username, subject: data.subject, startedAt: Date.now() });
    }
  }

  @SubscribeMessage('timer:pause')
  handleTimerPause(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId?: string }) {
    const { userId, username } = client.data;
    const entry = presence.get(userId);
    if (entry) entry.status = 'idle';
    if (data.roomId) this.server.to(`room:${data.roomId}`).emit('member:timer:pause', { userId, username });
  }

  @SubscribeMessage('timer:stop')
  handleTimerStop(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId?: string; durationSeconds: number }) {
    const { userId, username } = client.data;
    const entry = presence.get(userId);
    if (entry) { entry.status = 'idle'; entry.subject = undefined; entry.timerStartedAt = undefined; }
    if (data.roomId) this.server.to(`room:${data.roomId}`).emit('member:timer:stop', { userId, username, durationSeconds: data.durationSeconds });
  }

  @SubscribeMessage('tab:hidden')
  handleTabHidden(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId?: string }) {
    const { userId } = client.data;
    const entry = presence.get(userId);
    if (entry) entry.status = 'away';
    if (data.roomId) this.server.to(`room:${data.roomId}`).emit('member:away', { userId });
  }

  @SubscribeMessage('tab:visible')
  handleTabVisible(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId?: string }) {
    const { userId } = client.data;
    const entry = presence.get(userId);
    const status: UserStatus = entry?.timerStartedAt ? 'studying' : 'idle';
    if (entry) entry.status = status;
    if (data.roomId) this.server.to(`room:${data.roomId}`).emit('member:returned', { userId, status });
  }

  @SubscribeMessage('feed:encourage')
  handleEncourage(@ConnectedSocket() client: Socket, @MessageBody() data: { activityId: string; targetUserId: string }) {
    const { userId, username } = client.data;
    const target = presence.get(data.targetUserId);
    if (target?.socketId) {
      this.server.to(target.socketId).emit('notification:encouragement', { from: { userId, username }, activityId: data.activityId });
    }
  }

  emitToUser(userId: string, event: string, data: any) {
    const entry = presence.get(userId);
    if (entry?.socketId) this.server.to(entry.socketId).emit(event, data);
  }

  emitToRoom(roomId: string, event: string, data: any) {
    this.server.to(`room:${roomId}`).emit(event, data);
  }

  getRoomMembers(roomId: string) { return getRoomPresence(roomId); }
}