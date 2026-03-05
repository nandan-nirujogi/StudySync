export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl: string | null;
  bio: string;
  level: number;
  totalStudySeconds: number;
  currentStreak: number;
  longestStreak: number;
  lastActive: string | null;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Pick<
    User,
    | "id"
    | "username"
    | "email"
    | "level"
    | "totalStudySeconds"
    | "currentStreak"
    | "avatarUrl"
  >;
}

export type SessionStatus = "ACTIVE" | "PAUSED" | "COMPLETED";

export interface StudySession {
  id: string;
  userId: string;
  roomId: string | null;
  subject: string;
  memo: string;
  startTime: string;
  endTime: string | null;
  durationSeconds: number;
  pausedSeconds: number;
  distractionCount: number;
  status: SessionStatus;
  rating: number | null;
}

export interface RoomMember {
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  joinedAt: string;
  user?: Pick<User, "id" | "username" | "avatarUrl" | "level">;
}

export interface StudyRoom {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  maxMembers: number;
  createdById: string;
  tags: string[];
  inviteCode: string;
  isActive: boolean;
  members: RoomMember[];
  createdAt: string;
}

export interface LiveMember {
  userId: string;
  username: string;
  status: "studying" | "idle" | "away" | "offline";
  subject?: string;
  timerStartedAt?: number;
}

export interface DailyStat {
  date: string;
  totalSeconds: number;
  sessionCount: number;
  avgRating: number | null;
}

export interface SubjectStat {
  subject: string;
  totalSeconds: number;
  count: number;
}
