import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

export function RegisterPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { data } = await authApi.register(form);
      setAuth(data.user, data.accessToken, data.refreshToken);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "username", label: "Username", type: "text", ph: "your_username" },
    { key: "email", label: "Email", type: "email", ph: "you@example.com" },
    {
      key: "password",
      label: "Password",
      type: "password",
      ph: "8+ characters",
    },
  ] as const;

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <Link to="/" className="font-display font-bold text-xl block mb-10">
          StudySync
        </Link>
        <h2 className="font-display font-bold text-2xl mb-1">Create account</h2>
        <p className="text-sm text-gray-500 mb-8">
          Start your study journey — free forever
        </p>
        <form onSubmit={submit} className="space-y-4">
          {fields.map(({ key, label, type, ph }) => (
            <div key={key}>
              <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-gray-400 block mb-1.5">
                {label}
              </label>
              <input
                type={type}
                value={form[key]}
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
            className="w-full bg-black text-white py-3 font-mono text-xs tracking-[0.15em] uppercase disabled:opacity-40 hover:bg-gray-900 mt-2"
          >
            {loading ? "Creating…" : "Create Account"}
          </button>
        </form>
        <p className="text-sm text-gray-400 text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-black underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
