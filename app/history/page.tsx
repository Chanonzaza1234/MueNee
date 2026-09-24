import { auth } from "@/lib/auth"
import { PrismaClient } from "@prisma/client"
import { redirect } from "next/navigation"
import Link from "next/link"

const prisma = new PrismaClient()

export default async function HistoryPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect("/")
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: { menu: true }
      }
    }
  })

  return (
    <div className="min-h-screen bg-[#121212] p-4 sm:p-8 relative overflow-hidden font-sans text-white">
      {/* Radial Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(255,122,0,0.1)_0%,rgba(18,18,18,0)_70%)] pointer-events-none z-0"></div>

      <div className="max-w-4xl mx-auto relative z-10 pt-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <span className="text-3xl drop-shadow-[0_0_10px_rgba(255,122,0,0.5)]">📜</span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-wide">ประวัติการเลือกเมนูของคุณ</h1>
          </div>
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm font-bold bg-[#1A1A1A] px-4 py-2 rounded-xl border border-white/10 hover:border-[#FF7A00]/50">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            กลับไปหน้าหลัก
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="bg-[#1A1A1A]/80 backdrop-blur-xl p-12 rounded-[2rem] border border-white/10 text-center text-gray-400 font-medium">
            <div className="text-5xl mb-4 opacity-50">🍽️</div>
            คุณยังไม่มีประวัติการเลือกเมนู
          </div>
        ) : (
          <div className="space-y-6 pb-20">
            {orders.map((order) => (
              <div key={order.id} className="bg-[#1A1A1A]/80 backdrop-blur-xl p-6 sm:p-8 rounded-[2rem] border border-white/10 shadow-[0_0_30px_rgba(255,122,0,0.05)] hover:border-[#FF7A00]/50 transition-colors group">
                <div className="flex justify-between items-center border-b border-white/10 pb-4 mb-5">
                  <span className="text-gray-400 text-xs sm:text-sm font-medium flex items-center gap-2">
                    <span className="text-[#FF7A00]">📅</span> 
                    {new Date(order.createdAt).toLocaleDateString('th-TH', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                <ul className="space-y-4">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between items-center bg-[#2a2a2a]/50 p-4 rounded-xl border border-white/5">
                      <span className="font-bold text-base sm:text-lg text-white">
                        {item.menu.name}
                      </span>
                      <span className="text-[#FF7A00] font-black bg-[#FF7A00]/10 px-3 py-1 rounded-full border border-[#FF7A00]/20 text-sm">
                        ฿{item.menu.price}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
