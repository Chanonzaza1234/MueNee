"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4 relative overflow-hidden font-sans">
      {/* Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,122,0,0.15)_0%,rgba(18,18,18,0)_65%)] pointer-events-none"></div>
      
      <div className="max-w-md w-full bg-[#1A1A1A]/80 backdrop-blur-2xl p-8 rounded-[2rem] shadow-[0_0_40px_rgba(255,122,0,0.1)] border border-white/10 relative z-10">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2 drop-shadow-[0_0_10px_rgba(255,122,0,0.5)]">🍳</div>
          <h2 className="text-3xl font-black text-white tracking-wide">เข้าสู่ระบบ</h2>
          <p className="text-gray-400 mt-2">ยินดีต้อนรับกลับสู่ NUEDEE</p>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-200 p-3 rounded-xl text-sm font-bold mb-6 text-center border border-red-500/50">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1.5">อีเมล</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#2a2a2a] text-white focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] outline-none transition-colors"
              placeholder="your@email.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-300 mb-1.5">รหัสผ่าน</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-[#2a2a2a] text-white focus:border-[#FF7A00] focus:ring-1 focus:ring-[#FF7A00] outline-none transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3.5 rounded-xl text-white font-black text-lg shadow-md transition-all mt-2 ${
              loading 
                ? "bg-gray-600 cursor-not-allowed" 
                : "bg-gradient-to-r from-[#FF7A00] to-[#FF5500] hover:shadow-[0_0_20px_rgba(255,122,0,0.4)] hover:-translate-y-0.5 active:translate-y-0"
            }`}
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <div className="mt-8 text-center text-gray-400 text-sm font-medium">
          ยังไม่มีบัญชีผู้ใช้?{" "}
          <Link href="/register" className="text-[#FF7A00] hover:text-white transition-colors font-bold">
            สมัครสมาชิก
          </Link>
        </div>
      </div>
    </div>
  );
}
