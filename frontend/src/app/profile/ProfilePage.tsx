import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import api, { statsApi } from "@/lib/api";

const ACHIEVEMENTS = [
  { key: "first_light", icon: "🌅", name: "First Light" },
  { key: "centurion", icon: "⚔️", name: "Centurion" },
  { key: "dawn_patrol", icon: "🌄", name: "Dawn Patrol" },
  { key: "night_owl", icon: "🦉", name: "Night Owl" },
  { key: "marathon", icon: "🏃", name: "Marathon" },
  { key: "consistency", icon: "🔥", name: "Consistency" },
];

const LEVELS = [
  { name: "Student", min: 1, max: 10 },
  { name: "Scholar", min: 11, max: 25 },
  { name: "Master", min: 26, max: 50 },
  { name: "Legend", min: 51, max: Infinity },
];

export function ProfilePage() {
  const { username } = useParams<{ username: string }>();

  const { data: user } = useQuery({
    queryKey: ["user", username],
    queryFn: async () => (await api.get(`/users/${username}`)).data,
  });

  const { data: subjects } = useQuery({
    queryKey: ["subjects", username],
    queryFn: async () => (await statsApi.subjects()).data,
    enabled: !!user,
  });

  const earnedKeys = new Set(
    (user?.achievements || []).map((a: any) => a.achievement?.key),
  );
  const currentLevel = LEVELS.find(
    (l) => (user?.level || 1) >= l.min && (user?.level || 1) <= l.max,
  );

  if (!user) return null;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start gap-6 mb-10"
      >
        <div className="w-16 h-16 bg-black text-white flex items-center justify-center font-display text-2xl font-bold flex-shrink-0">
          {user.username[0].toUpperCase()}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold mb-0.5">
            {user.username}
          </h1>
          <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-2">
            {currentLevel?.name} · Level {user.level}
          </div>
          {user.bio && (
            <p className="text-sm text-gray-500 max-w-md">{user.bio}</p>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-px bg-gray-100 border border-gray-100 mb-8">
        {[
          {
            l: "Total Hours",
            v: Math.floor((user.totalStudySeconds || 0) / 3600) + "h",
          },
          { l: "Streak", v: user.currentStreak + "d" },
          { l: "Longest", v: user.longestStreak + "d" },
        ].map(({ l, v }) => (
          <div key={l} className="bg-white p-5 text-center">
            <div className="font-display text-2xl font-bold mb-1">{v}</div>
            <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-gray-400">
              {l}
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-4">
          Achievements
        </div>
        <div className="grid grid-cols-6 gap-px bg-gray-100 border border-gray-100">
          {ACHIEVEMENTS.map((a) => (
            <div
              key={a.key}
              title={a.name}
              className={`bg-white p-4 text-center ${earnedKeys.has(a.key) ? "" : "opacity-25"}`}
            >
              <div className="text-2xl mb-1">{a.icon}</div>
              <div className="font-mono text-[8px] uppercase tracking-wider text-gray-400 leading-tight">
                {a.name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {subjects?.length > 0 && (
        <div>
          <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-4">
            Top Subjects
          </div>
          <div className="space-y-3">
            {subjects.slice(0, 6).map((s: any, i: number) => (
              <div key={s.subject} className="flex items-center gap-4">
                <span className="font-mono text-[10px] text-gray-300 w-4">
                  {i + 1}
                </span>
                <span className="text-sm flex-1 truncate">{s.subject}</span>
                <div className="w-24 h-0.5 bg-gray-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(s.totalSeconds / subjects[0].totalSeconds) * 100}%`,
                    }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    className="h-full bg-black"
                  />
                </div>
                <span className="font-mono text-xs text-gray-400 w-12 text-right">
                  {(s.totalSeconds / 3600).toFixed(1)}h
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
