import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, User, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useTimerStore, formatTime } from "@/store/timerStore";
import { disconnectSocket } from "@/lib/socket";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/rooms", icon: Users, label: "Rooms" },
];

export function Layout() {
  const { user, logout } = useAuthStore();
  const { status, elapsedSeconds, subject } = useTimerStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    disconnectSocket();
    logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <aside className="w-56 flex-shrink-0 border-r border-gray-100 flex flex-col">
        <div className="px-6 py-5 border-b border-gray-100">
          <span className="font-display font-bold text-lg tracking-tight">
            StudySync
          </span>
        </div>

        {status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mx-3 mt-3 p-3 bg-black text-white overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-1">
              <motion.span
                animate={{ opacity: status === "running" ? [1, 0.3, 1] : 0.4 }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-1.5 h-1.5 rounded-full bg-white"
              />
              <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-gray-500">
                {status === "running" ? "Studying" : "Paused"}
              </span>
            </div>
            <div className="font-mono text-2xl font-light tabular-nums">
              {formatTime(elapsedSeconds)}
            </div>
            {subject && (
              <div className="font-mono text-[10px] text-gray-600 truncate mt-0.5">
                {subject}
              </div>
            )}
          </motion.div>
        )}

        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-500 hover:text-black hover:bg-gray-50"
                }`
              }
            >
              <Icon size={14} />
              <span>{label}</span>
            </NavLink>
          ))}
          {user && (
            <NavLink
              to={`/profile/${user.username}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-black text-white"
                    : "text-gray-500 hover:text-black hover:bg-gray-50"
                }`
              }
            >
              <User size={14} />
              <span>Profile</span>
            </NavLink>
          )}
        </nav>

        {user && (
          <div className="border-t border-gray-100 p-4 flex items-center justify-between">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {user.username}
              </div>
              <div className="font-mono text-[10px] text-gray-400 tracking-wider">
                Lv {user.level}
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Logout"
              className="text-gray-300 hover:text-black transition-colors p-1"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-y-auto bg-white">
        <Outlet />
      </main>
    </div>
  );
}
