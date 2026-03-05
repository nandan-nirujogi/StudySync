import {
  Injectable, NotFoundException,
  ForbiddenException, ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import * as bcrypt from 'bcryptjs';

function makeInviteCode() {
  return Math.random().toString(36).slice(2, 12).toUpperCase();
}

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateRoomDto) {
    return this.prisma.studyRoom.create({
      data: {
        name:        dto.name,
        description: dto.description ?? '',
        isPrivate:   dto.isPrivate   ?? false,
        password:    dto.password ? await bcrypt.hash(dto.password, 10) : null,
        maxMembers:  dto.maxMembers  ?? 20,
        tags:        dto.tags        ?? [],
        inviteCode:  makeInviteCode(),
        createdById: userId,
        members: { create: { userId, role: 'OWNER' } },
      },
      include: { members: true },
    });
  }

  async findAll(search?: string, page = 1, limit = 20) {
    const where: any = { isActive: true, isPrivate: false };
    if (search) {
      where.OR = [
        { name:        { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [rooms, total] = await this.prisma.$transaction([
      this.prisma.studyRoom.findMany({
        where,
        include: { members: { select: { userId: true, role: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.studyRoom.count({ where }),
    ]);
    return { rooms, total, page, pages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    const room = await this.prisma.studyRoom.findUnique({
      where:   { id },
      include: {
        members: {
          include: { user: { select: { id: true, username: true, avatarUrl: true, level: true } } },
        },
      },
    });
    if (!room) throw new NotFoundException('Room not found');
    const { password: _, ...safe } = room as any;
    return safe;
  }

  async join(userId: string, roomId: string, password?: string) {
    const room = await this.prisma.studyRoom.findUnique({ where: { id: roomId } });
    if (!room || !room.isActive) throw new NotFoundException('Room not found');

    const memberCount = await this.prisma.roomMember.count({ where: { roomId } });
    if (memberCount >= room.maxMembers) throw new ForbiddenException('Room is full');

    const alreadyIn = await this.prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
    if (alreadyIn) throw new ConflictException('Already a member of this room');

    if (room.isPrivate && room.password) {
      if (!password || !(await bcrypt.compare(password, room.password))) {
        throw new ForbiddenException('Incorrect room password');
      }
    }
    return this.prisma.roomMember.create({ data: { roomId, userId, role: 'MEMBER' } });
  }

  async leave(userId: string, roomId: string) {
    const member = await this.prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId } },
    });
    if (!member) throw new NotFoundException('Not a member');
    return this.prisma.roomMember.delete({
      where: { roomId_userId: { roomId, userId } },
    });
  }

  async delete(userId: string, roomId: string) {
    const room = await this.prisma.studyRoom.findUnique({ where: { id: roomId } });
    if (!room) throw new NotFoundException();
    if (room.createdById !== userId) throw new ForbiddenException('Only the owner can delete');
    return this.prisma.studyRoom.delete({ where: { id: roomId } });
  }
}