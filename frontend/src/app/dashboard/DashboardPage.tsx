import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { format, subDays } from "date-fns";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { statsApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Timer } from "@/components/timer/Timer";
import type { DailyStat, SubjectStat } from "@/types";

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  const { data: daily } = useQuery<DailyStat[]>({
    queryKey: ["stats", "daily"],
    queryFn: async () => (await statsApi.daily(7)).data,
  });
  const { data: weekly } = useQuery({
    queryKey: ["stats", "weekly"],
    queryFn: async () => (await statsApi.weekly()).data,
  });
  const { data: subjects } = useQuery<SubjectStat[]>({
    queryKey: ["stats", "subjects"],
    queryFn: async () => (await statsApi.subjects()).data,
  });

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const date = format(subDays(new Date(), 6 - i), "yyyy-MM-dd");
    const found = daily?.find((d) => d.date === date);
    return {
      day: format(subDays(new Date(), 6 - i), "EEE"),
      hours: found ? +(found.totalSeconds / 3600).toFixed(1) : 0,
    };
  });

  const greeting =
    new Date().getHours() < 12
      ? "morning"
      : new Date().getHours() < 18
        ? "afternoon"
        : "evening";

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-gray-400 mb-1">
          {format(new Date(), "EEEE, MMMM d")}
        </div>
        <h1 className="font-display text-3xl font-bold">
          Good {greeting}, <em className="text-gray-400">{user?.username}</em>
        </h1>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="lg:col-span-2"
        >
          <Timer />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-px"
        >
          {[
            {
              label: "Total Hours",
              value: Math.floor((user?.totalStudySeconds || 0) / 3600) + "h",
            },
            { label: "Current Streak", value: `${user?.currentStreak || 0}d` },
            {
              label: "This Week",
              value: `${((weekly?.totalSeconds || 0) / 3600).toFixed(1)}h`,
            },
            { label: "Sessions", value: weekly?.sessions ?? 0 },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="border border-gray-100 p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400">
                {label}
              </span>
              <span className="font-display font-bold text-xl">{value}</span>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 border border-gray-100 p-6"
        >
          <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-4">
            Daily Study Hours · Last 7 Days
          </div>
          <ResponsiveContainer width="100%" height={110}>
            <BarChart data={chartData} barCategoryGap="30%">
              <XAxis
                dataKey="day"
                tick={{ fontFamily: "DM Mono", fontSize: 10, fill: "#aaa" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  border: "1px solid #eee",
                  borderRadius: 0,
                  fontFamily: "DM Mono",
                  fontSize: 11,
                }}
                cursor={{ fill: "#f5f5f5" }}
              />
              <Bar dataKey="hours" fill="#000" radius={0} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border border-gray-100 p-6"
        >
          <div className="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 mb-4">
            Top Subjects
          </div>
          <div className="space-y-3">
            {(subjects || []).slice(0, 5).map((s, i) => {
              const max = subjects?.[0]?.totalSeconds || 1;
              return (
                <div key={s.subject}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs truncate max-w-[110px]">
                      {s.subject}
                    </span>
                    <span className="font-mono text-xs text-gray-400">
                      {(s.totalSeconds / 3600).toFixed(1)}h
                    </span>
                  </div>
                  <div className="h-0.5 bg-gray-100">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(s.totalSeconds / max) * 100}%` }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                      className="h-full bg-black"
                    />
                  </div>
                </div>
              );
            })}
            {!subjects?.length && (
              <p className="font-mono text-xs text-gray-300">No sessions yet</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
