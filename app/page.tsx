"use client";

import { useState } from "react";
import Link from "next/link";

type Menu = {
  id: number;
  name: string;
  ingredients: string[];
  categories: string[];
  flavors: string[];
  texture: string;
  price: number;
  score: number;
  reasons: string[];
};

export default function LandingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [recommendations, setRecommendations] = useState<Menu[]>([]);
  const [discovery, setDiscovery] = useState<Menu | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [detailMenu, setDetailMenu] = useState<Menu | null>(null);
  const [finalChoice, setFinalChoice] = useState<Menu | null>(null);

  // Randomize / Direct Recommend without filter
  const handleRandomRecommend = async () => {
    setError("");
    setRecommendations([]);
    setDiscovery(null);
    setFinalChoice(null);

    try {
      setLoading(true);

      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredients: [],
          categories: [],
          flavors: [],
          budget: undefined,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message || "เกิดข้อผิดพลาดในการแนะนำเมนู กรุณาลองใหม่อีกครั้ง");
        return;
      }

      const recList = data.recommendations || [];
      if (recList.length === 0) {
        setError("ไม่พบเมนูในระบบ กรุณาลองใหม่อีกครั้ง");
        return;
      }

      setRecommendations(recList);
      setDiscovery(data.discovery || null);
      setIsResultOpen(true);
    } catch (err) {
      console.error("Recommend error:", err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-[#FDF8F5] text-[#1F2937]"
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 35%, rgba(255,234,177,0.9), rgba(255,169,90,0.88) 18%, rgba(255,98,42,0.9) 38%, rgba(234,21,20,0.92) 60%, rgba(118,0,0,0.96) 100%)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-[#1F2937]/30" aria-hidden="true" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="w-full border-b border-white/15 bg-white/10 backdrop-blur-sm sticky top-0 z-30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 sm:h-18 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl sm:text-3xl select-none" role="img" aria-label="กระทะไข่ดาว">
                🍳
              </span>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm">
                  MueNee
                </span>
              </div>
            </div>

            <Link
              href="/filter"
              className="text-xs sm:text-sm font-bold text-white hover:text-orange-100 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20 flex items-center gap-1.5 backdrop-blur-sm"
            >
              <span>🔎</span>
              <span>ตัวกรองเมนู</span>
            </Link>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-14 max-w-xl mx-auto w-full">
          <div className="w-full text-center space-y-7 sm:space-y-8 rounded-[2rem] border border-white/20 bg-black/15 p-5 sm:p-8 shadow-2xl backdrop-blur-sm">
            <div className="inline-flex items-center justify-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#F4512C] to-[#D83B18] shadow-lg shadow-orange-500/25 flex items-center justify-center border-4 border-white/80">
                <span className="text-4xl sm:text-5xl select-none" role="img" aria-label="🍳">
                  🍳
                </span>
              </div>
            </div>

            <div className="space-y-3 px-2">
              <div className="inline-block px-3 py-1 rounded-full bg-orange-100/85 border border-orange-200 text-[#D83B18] text-xs font-extrabold tracking-wide uppercase shadow-sm">
                Personalized Food Recommendation
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                มื้อนี้อยากกินอะไรดี?
              </h1>
              <p className="text-base sm:text-lg text-orange-50 font-medium max-w-md mx-auto leading-relaxed drop-shadow-sm">
                ให้ MueNee ช่วยเลือกเมนูที่เหมาะกับคุณ
              </p>
              <p className="text-xs sm:text-sm text-orange-100/90 italic drop-shadow-sm">
                “ไม่ต้องรู้ชื่อเมนู แค่บอกว่าอยากกินแบบไหน”
              </p>
            </div>

            <div className="space-y-3.5 pt-2 sm:pt-4 w-full">
              <button
                type="button"
                onClick={handleRandomRecommend}
                disabled={loading}
                className={`w-full py-4 sm:py-4.5 px-6 rounded-2xl text-white font-extrabold text-lg sm:text-xl shadow-lg transition-all duration-200 flex items-center justify-between min-h-[64px] border border-orange-400/30 ${
                  loading
                    ? "bg-stone-400 cursor-not-allowed opacity-90 shadow-none"
                    : "bg-gradient-to-r from-[#F4512C] to-[#EA3E18] hover:from-[#EA3E18] hover:to-[#D83B18] shadow-orange-600/30 hover:shadow-orange-600/40 active:scale-[0.99] cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl">🎲</span>
                  <span className="tracking-wide">สุ่มเลย</span>
                </div>
                <div className="flex items-center font-bold text-xl sm:text-2xl">
                  {loading ? (
                    <svg
                      className="animate-spin h-6 w-6 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      />
                    </svg>
                  ) : (
                    <span>→</span>
                  )}
                </div>
              </button>

              <Link
                href="/filter"
                className="w-full py-4 sm:py-4.5 px-6 rounded-2xl bg-white/95 hover:bg-orange-50 text-[#431407] hover:text-[#D83B18] font-extrabold text-lg sm:text-xl shadow-md hover:shadow-lg border-2 border-orange-200/80 transition-all duration-200 flex items-center justify-between min-h-[64px] active:scale-[0.99]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl sm:text-3xl">🔎</span>
                  <span className="tracking-wide">เลือกตัวกรอง</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold text-[#D83B18]">→</span>
              </Link>
            </div>

            {error && (
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center justify-between animate-in fade-in">
                <span>⚠️ {error}</span>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
                >
                  ปิด
                </button>
              </div>
            )}

            {finalChoice && (
              <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-5 sm:p-6 text-center space-y-2 shadow-sm animate-in fade-in">
                <span className="text-3xl sm:text-4xl block">🎉</span>
                <h3 className="text-lg sm:text-xl font-black text-emerald-950">
                  มื้อนี้เลือก: {finalChoice.name}!
                </h3>
                <p className="text-sm font-semibold text-emerald-800">
                  ราคาประมาณ {finalChoice.price} บาท • ขอให้อร่อยกับมื้อนี้นะครับ
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setFinalChoice(null)}
                    className="text-xs text-emerald-900 underline font-bold hover:text-emerald-700 cursor-pointer"
                  >
                    เลือกเมนูอื่นใหม่
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {isResultOpen && recommendations.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-[#431407] flex items-center gap-2">
                    <span>🍱</span> เมนูที่แนะนำสำหรับคุณ
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500">
                    สุ่มและคัดสรรเมนูยอดนิยมมาให้คุณโดยเฉพาะ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResultOpen(false)}
                  className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold text-lg transition-colors cursor-pointer"
                  aria-label="ปิดผลลัพธ์"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-[#431407] flex items-center gap-1.5">
                  <span className="text-[#F4512C]">★</span> เมนูแนะนำอันดับต้น
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recommendations.map((menu, idx) => (
                    <div
                      key={menu.id}
                      onClick={() => setDetailMenu(menu)}
                      className="p-4 rounded-2xl border border-orange-100 bg-orange-50/40 hover:bg-orange-50 hover:border-orange-300 transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F4512C] text-white">
                            อันดับ {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-[#D83B18]">
                            {menu.price} ฿
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-[#431407] group-hover:text-[#F4512C] transition-colors pt-1">
                          {menu.name}
                        </h4>
                      </div>

                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {menu.categories.slice(0, 2).map((c) => (
                            <span
                              key={c}
                              className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-stone-200 text-stone-600 font-medium"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                        <button
                          type="button"
                          className="w-full py-1.5 rounded-xl bg-white border border-orange-200 text-[#F4512C] text-xs font-bold hover:bg-[#F4512C] hover:text-white transition-colors"
                        >
                          ดูรายละเอียด
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {discovery && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-amber-500 text-white flex items-center gap-1 shadow-2xs">
                      <span>✨</span> ทางเลือกใหม่น่าลอง (Discovery)
                    </span>
                    <span className="text-xs font-bold text-amber-900">
                      {discovery.price} ฿
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-base font-bold text-amber-950">
                        {discovery.name}
                      </h4>
                      <p className="text-xs text-amber-800">
                        เมนูรสชาติโดดเด่นน่าลิ้มลอง
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetailMenu(discovery)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
                    >
                      ดูเมนูนี้
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleRandomRecommend}
                  className="w-full sm:w-1/2 py-3 rounded-xl bg-[#F4512C] hover:bg-[#EA3E18] text-white text-sm font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>🎲</span>
                  <span>สุ่มใหม่อีกครั้ง</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsResultOpen(false)}
                  className="w-full sm:w-1/2 py-3 rounded-xl border border-stone-300 text-stone-700 text-sm font-semibold hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}

        {detailMenu && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-stone-200">
              <div className="flex items-start justify-between border-b border-stone-100 pb-3">
                <div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-[#D83B18]">
                    รายละเอียดเมนู
                  </span>
                  <h3 className="text-xl font-extrabold text-[#431407] mt-1">
                    {detailMenu.name}
                  </h3>
                </div>
                <span className="text-lg font-extrabold text-[#D83B18] bg-orange-50 px-3 py-1 rounded-xl border border-orange-200">
                  {detailMenu.price} ฿
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs font-bold text-stone-500 mb-1">🧺 วัตถุดิบ:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detailMenu.ingredients.map((ing) => (
                      <span
                        key={ing}
                        className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 text-xs font-medium"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-stone-500 mb-1">🍳 หมวดหมู่ & รสชาติ:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {detailMenu.categories.map((c) => (
                      <span
                        key={c}
                        className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 border border-orange-200 text-xs font-medium"
                      >
                        {c}
                      </span>
                    ))}
                    {detailMenu.flavors.map((f) => (
                      <span
                        key={f}
                        className="px-2.5 py-1 rounded-lg bg-red-50 text-red-800 border border-red-200 text-xs font-medium"
                      >
                        {f}
                      </span>
                    ))}
                    {detailMenu.texture && (
                      <span className="px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-xs font-medium">
                        เนื้อสัมผัส: {detailMenu.texture}
                      </span>
                    )}
                  </div>
                </div>

                {detailMenu.reasons && detailMenu.reasons.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-stone-500 mb-1">🎯 จุดเด่นของเมนูนี้:</p>
                    <ul className="list-disc list-inside text-xs text-stone-700 space-y-1 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                      {detailMenu.reasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setFinalChoice(detailMenu);
                    setDetailMenu(null);
                    setIsResultOpen(false);
                  }}
                  className="w-full py-3 rounded-xl bg-[#F4512C] hover:bg-[#EA3E18] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
                >
                  เอาเมนูนี้เลย 🍽️
                </button>
                <button
                  type="button"
                  onClick={() => setDetailMenu(null)}
                  className="w-full py-2.5 rounded-xl border border-stone-300 text-stone-600 font-semibold text-sm hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  ย้อนกลับ
                </button>
              </div>
            </div>
          </div>
        )}

        <footer className="mt-auto border-t border-orange-100/70 bg-white/60 py-6 text-center text-xs text-stone-500">
          <div className="max-w-4xl mx-auto px-4 space-y-1">
            <p className="font-bold text-[#431407]">
              MueNee (มื้อนี้) • Personalized Food Recommendation System
            </p>
            <p>“ไม่ต้องรู้ชื่อเมนู แค่บอกว่าอยากกินแบบไหน”</p>
          </div>
        </footer>
      </div>
    </div>
  );
}