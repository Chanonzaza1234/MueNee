"use client"
import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export function AuthHeader() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === "loading") {
    return <div className="text-white/50 text-sm">กำลังโหลด...</div>
  }

  if (session) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/history" className="text-xs sm:text-sm font-bold text-white hover:text-orange-100">
          ประวัติการสั่ง
        </Link>
        <div className="w-8 h-8 rounded-full bg-white/20 overflow-hidden flex items-center justify-center text-white font-bold cursor-pointer">
          {session.user?.name?.[0]?.toUpperCase() || "U"}
        </div>
        <button onClick={() => signOut()} className="text-xs sm:text-sm bg-red-500/80 hover:bg-red-500 text-white px-3 py-1.5 rounded-lg transition cursor-pointer">
          ออก
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 sm:gap-4">
      <button onClick={() => signIn()} className="px-5 sm:px-7 py-2 sm:py-2.5 rounded-full bg-white text-black text-xs sm:text-sm font-bold hover:bg-gray-200 transition-all active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.2)] whitespace-nowrap cursor-pointer">
        Log In
      </button>
      <button onClick={() => router.push("/register")} className="px-5 sm:px-7 py-2 sm:py-2.5 rounded-full bg-[#1A1A1A]/80 backdrop-blur-md text-white text-xs sm:text-sm font-bold border border-[#FF7A00]/70 hover:bg-[#FF7A00]/10 hover:border-[#FF7A00] shadow-[0_0_15px_rgba(255,122,0,0.2)] hover:shadow-[0_0_25px_rgba(255,122,0,0.5)] transition-all active:scale-95 whitespace-nowrap cursor-pointer">
        Sign Up
      </button>
    </div>
  )
}
