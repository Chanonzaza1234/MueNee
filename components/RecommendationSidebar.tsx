"use client"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

type Menu = {
  id: number;
  name: string;
  price: number;
}

export function RecommendationSidebar() {
  const { data: session } = useSession()
  const [recommendations, setRecommendations] = useState<Menu[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const res = await fetch("/api/recommendations/personalized")
        const data = await res.json()
        if (data.success) {
          setRecommendations(data.recommendations)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchRecommendations()

    const handleHistoryUpdated = () => {
      setLoading(true)
      fetchRecommendations()
    }
    
    window.addEventListener("historyUpdated", handleHistoryUpdated)
    return () => window.removeEventListener("historyUpdated", handleHistoryUpdated)
  }, [session])

  return (
    <aside className="w-80 hidden lg:block flex-shrink-0">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg p-6 sticky top-24 border border-white/20">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xl">✨</span>
          <h2 className="text-xl font-bold text-white drop-shadow-md">แนะนำสำหรับคุณ</h2>
        </div>
        
        {loading ? (
          <div className="text-white/70">กำลังประมวลผลเมนู...</div>
        ) : (
          <div className="flex flex-col gap-4">
            {recommendations.map((menu) => (
              <div key={menu.id} className="flex gap-4 items-center p-3 rounded-xl hover:bg-white/20 transition cursor-pointer group border border-transparent hover:border-white/30 bg-white/5">
                <div className="w-16 h-16 bg-gradient-to-br from-[#F4512C] to-[#D83B18] rounded-lg flex-shrink-0 flex items-center justify-center text-2xl">
                  🍱
                </div>
                <div>
                  <h4 className="font-semibold text-white drop-shadow-sm group-hover:text-orange-200">{menu.name}</h4>
                  <p className="text-sm text-white/80">฿{menu.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}
