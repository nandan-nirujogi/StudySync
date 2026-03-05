import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await authApi.login(form);
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex flex-1 bg-black text-white flex-col justify-between p-16">
        <span className="font-display font-bold text-xl">StudySync</span>
        <div>
          <h1 className="font-display text-6xl font-black leading-[0.9] mb-6">
            Focus
            <br />
            <em className="text-gray-700">Together.</em>
          </h1>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            Join thousands of students tracking study time, building streaks,
            and holding each other accountable.
          </p>
        </div>
        <span className="font-mono text-[10px] text-gray-800 tracking-[0.2em] uppercase">
          Free. Local. No Docker.
        </span>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm"
        >
          <h2 className="font-display font-bold text-2xl mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-8">
            Sign in to continue your streak
          </p>
          <form onSubmit={submit} className="space-y-4">
            {[
              {
                key: "email",
                label: "Email",
                type: "email",
                ph: "you@example.com",
              },
              {
                key: "password",
                label: "Password",
                type: "password",
                ph: "••••••••",
              },
            ].map(({ key, label, type, ph }) => (
              <div key={key}>
                <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 block mb-1.5">
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [key]: e.target.value }))
                  }
                  placeholder={ph}
                  required
                  className="w-full border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>
            ))}
            {error && <p className="font-mono text-xs text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 font-mono text-xs tracking-[0.15em] uppercase disabled:opacity-40 hover:bg-gray-900 transition-colors mt-2"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>
          <p className="text-sm text-gray-400 text-center mt-6">
            No account?{" "}
            <Link
              to="/register"
              className="text-black underline underline-offset-2"
            >
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
