import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Lock, Users, X } from "lucide-react";
import { roomsApi } from "@/lib/api";
import type { StudyRoom } from "@/types";

export function RoomsPage() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newRoom, setNewRoom] = useState({
    name: "",
    description: "",
    isPrivate: false,
    tags: "",
  });
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["rooms", search],
    queryFn: async () => (await roomsApi.list({ search })).data,
  });

  const createMut = useMutation({
    mutationFn: () =>
      roomsApi.create({
        ...newRoom,
        tags: newRoom.tags
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean),
      }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["rooms"] });
      setShowCreate(false);
      navigate(`/rooms/${res.data.id}`);
    },
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-1">
            Rooms
          </div>
          <h1 className="font-display text-3xl font-bold">Study Rooms</h1>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-black text-white px-5 py-2.5 font-mono text-xs tracking-[0.12em] uppercase hover:bg-gray-900 transition-colors"
        >
          <Plus size={12} /> New Room
        </button>
      </div>

      <div className="relative mb-6">
        <Search
          size={13}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search rooms…"
          className="w-full border border-gray-100 pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
        />
      </div>

      <div className="space-y-px">
        {(data?.rooms || []).map((room: StudyRoom, i: number) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => navigate(`/rooms/${room.id}`)}
            className="border border-gray-100 p-5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                {room.isPrivate && <Lock size={10} className="text-gray-400" />}
                <span className="font-medium text-sm">{room.name}</span>
              </div>
              {room.description && (
                <p className="text-xs text-gray-400 truncate max-w-md">
                  {room.description}
                </p>
              )}
              {room.tags?.length > 0 && (
                <div className="flex gap-1.5 mt-2">
                  {room.tags.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="font-mono text-[9px] uppercase tracking-wider border border-gray-200 px-1.5 py-0.5 text-gray-400"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-5 ml-4">
              <div className="flex items-center gap-1.5 text-gray-400 font-mono text-xs">
                <Users size={11} /> {room.members?.length ?? 0}/
                {room.maxMembers}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  roomsApi
                    .join(room.id)
                    .then(() => navigate(`/rooms/${room.id}`));
                }}
                className="font-mono text-[10px] uppercase tracking-wider text-gray-400 border border-gray-200 px-3 py-1.5 opacity-0 group-hover:opacity-100 hover:border-black hover:text-black transition-all"
              >
                Join
              </button>
            </div>
          </motion.div>
        ))}
        {data?.rooms?.length === 0 && (
          <div className="text-center py-16 text-gray-300 font-mono text-sm">
            No rooms yet. Be the first.
          </div>
        )}
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-bold text-xl">Create Room</h3>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-gray-400 hover:text-black"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="space-y-4">
                {[
                  { k: "name", l: "Room Name", ph: "e.g. CS Finals Grind" },
                  { k: "description", l: "Description", ph: "Optional…" },
                  {
                    k: "tags",
                    l: "Tags (comma separated)",
                    ph: "coding, exams, math",
                  },
                ].map(({ k, l, ph }) => (
                  <div key={k}>
                    <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 block mb-1.5">
                      {l}
                    </label>
                    <input
                      value={newRoom[k as keyof typeof newRoom] as string}
                      onChange={(e) =>
                        setNewRoom((p) => ({ ...p, [k]: e.target.value }))
                      }
                      placeholder={ph}
                      className="w-full border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                ))}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newRoom.isPrivate}
                    onChange={(e) =>
                      setNewRoom((p) => ({ ...p, isPrivate: e.target.checked }))
                    }
                    className="w-4 h-4"
                  />
                  <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400">
                    Private Room
                  </span>
                </label>
              </div>
              <button
                onClick={() => createMut.mutate()}
                disabled={!newRoom.name || createMut.isPending}
                className="w-full bg-black text-white py-3 font-mono text-xs tracking-[0.15em] uppercase mt-6 disabled:opacity-40 hover:bg-gray-900"
              >
                {createMut.isPending ? "Creating…" : "Create Room"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
