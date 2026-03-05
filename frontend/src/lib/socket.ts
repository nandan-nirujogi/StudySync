import { io, Socket } from "socket.io-client";

let _socket: Socket | null = null;

export function getSocket(): Socket {
  if (!_socket) {
    _socket = io("/", {
      auth: { token: localStorage.getItem("accessToken") },
      transports: ["websocket", "polling"],
      autoConnect: false,
    });
    _socket.on("connect", () => console.log("🔌 WS connected"));
    _socket.on("disconnect", (r) => console.log("🔌 WS disconnected:", r));
    _socket.on("connect_error", (e) => console.error("WS error:", e.message));
  }
  return _socket;
}

export function connectSocket() {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  _socket?.disconnect();
  _socket = null;
}

export const roomSocket = {
  join: (roomId: string) => getSocket().emit("room:join", { roomId }),
  leave: (roomId: string) => getSocket().emit("room:leave", { roomId }),
};

export const timerSocket = {
  start: (d: { subject: string; sessionId: string; roomId?: string }) =>
    getSocket().emit("timer:start", d),
  pause: (roomId?: string) => getSocket().emit("timer:pause", { roomId }),
  stop: (d: { durationSeconds: number; roomId?: string }) =>
    getSocket().emit("timer:stop", d),
};

export const tabSocket = {
  hidden: (roomId?: string) => getSocket().emit("tab:hidden", { roomId }),
  visible: (roomId?: string) => getSocket().emit("tab:visible", { roomId }),
};
