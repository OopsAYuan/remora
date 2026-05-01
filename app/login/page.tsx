"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setLoading(false);
    if (res.ok) {
      router.replace("/");
    } else {
      setError(true);
      setPassword("");
    }
  }

  return (
    <div className="min-h-screen bg-[#111318] flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-500 text-center mb-6">
          Remora
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="密码"
          autoFocus
          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/25 outline-none focus:border-amber-500/50 transition-colors"
        />
        {error && (
          <p className="text-xs text-red-400 text-center">密码错误</p>
        )}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 disabled:opacity-40 text-black text-sm font-semibold transition-colors"
        >
          {loading ? "验证中…" : "进入"}
        </button>
      </form>
    </div>
  );
}
