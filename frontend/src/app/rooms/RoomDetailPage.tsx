import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, Lock } from "lucide-react";
import { roomsApi } from "@/lib/api";
import { roomSocket } from "@/lib/socket";
import { useRoomStore } from "@/store/roomStore";
import { useAuthStore } from "@/store/authStore";
import { Timer } from "@/components/timer/Timer";
import { formatTime } from "@/store/timerStore";
import type { StudyRoom } from "@/types";

const DOT: Record<string, string> = {
  studying: "bg-black",
  idle: "bg-gray-400",
  away: "bg-gray-200",
  offline: "bg-gray-100",
};

export function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { setActiveRoom, liveMembers } = useRoomStore();
  const user = useAuthStore((s) => s.user);

  const { data: room } = useQuery<StudyRoom>({
    queryKey: ["room", id],
    queryFn: async () => (await roomsApi.get(id!)).data,
  });

  useEffect(() => {
    if (!id) return;
    roomSocket.join(id);
    return () => {
      roomSocket.leave(id);
    };
  }, [id]);

  useEffect(() => {
    if (room) setActiveRoom(room);
    return () => setActiveRoom(null);
  }, [room]);

  const members = Object.values(liveMembers);

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <button
        onClick={() => navigate("/rooms")}
        className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors mb-6 font-mono text-xs tracking-wider uppercase"
      >
        <ArrowLeft size={12} /> Rooms
      </button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {room?.isPrivate && <Lock size={12} className="text-gray-400" />}
            <h1 className="font-display text-3xl font-bold">{room?.name}</h1>
          </div>
          {room?.description && (
            <p className="text-sm text-gray-500 mt-1">{room.description}</p>
          )}
          <div className="flex gap-1.5 mt-3">
            {room?.tags?.map((t) => (
              <span
                key={t}
                className="font-mono text-[9px] uppercase tracking-wider border border-gray-200 px-2 py-1 text-gray-400"
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400">
            {members.filter((m) => m.status === "studying").length} studying now
          </div>
          <div className="font-mono text-[10px] text-gray-300 mt-0.5">
            {members.length} / {room?.maxMembers} in room
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Timer roomId={id} />
        </div>

        <div className="border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400">
              Live Members
            </span>
            <span className="font-mono text-[10px] text-gray-300">
              {members.length}
            </span>
          </div>
          <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
            {members.length === 0 && (
              <div className="p-5 text-xs text-gray-300 font-mono text-center">
                Waiting for members…
              </div>
            )}
            {members.map((m, i) => (
              <motion.div
                key={m.userId}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 px-5 py-3"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT[m.status] ?? "bg-gray-200"}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm flex items-center gap-1">
                    <span className="truncate">{m.username}</span>
                    {m.userId === user?.id && (
                      <span className="font-mono text-[9px] text-gray-300">
                        (you)
                      </span>
                    )}
                  </div>
                  {m.subject && (
                    <div className="font-mono text-[10px] text-gray-400 truncate">
                      {m.subject}
                    </div>
                  )}
                </div>
                {m.timerStartedAt && (
                  <span className="font-mono text-xs text-gray-400 flex-shrink-0">
                    {formatTime(
                      Math.floor((Date.now() - m.timerStartedAt) / 1000),
                    )}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
