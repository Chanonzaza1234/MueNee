"use client";

import { useState } from "react";
import Link from "next/link";
import { RecommendationSidebar } from "@/components/RecommendationSidebar";
import { AuthHeader } from "@/components/AuthHeader";

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
  const [isSaving, setIsSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleConfirmSelection = async (menu: Menu) => {
    setIsSaving(true);
    setSavedMessage("");
    try {
      const response = await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ menuId: menu.id, price: menu.price }),
      });
      const data = await response.json();
      if (data.success) {
        setSavedMessage("บันทึกการเลือกเมนูของคุณเรียบร้อยแล้ว!");
        window.dispatchEvent(new Event("historyUpdated"));
        setTimeout(() => setSavedMessage(""), 3000);
      } else {
        alert("เกิดข้อผิดพลาด: " + data.message);
      }
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึกประวัติ");
    } finally {
      setIsSaving(false);
    }
  };

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
    <>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
      <div className="relative min-h-screen bg-[#121212] text-white overflow-hidden font-sans selection:bg-[#FF7A00] selection:text-white">
        {/* Radial Gradient Background */}
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(255, 122, 0, 0.15) 0%, rgba(18, 18, 18, 1) 65%)"
          }}
        />

        {/* Vertical Text (Left Edge) */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 -rotate-90 origin-center z-0 hidden lg:block opacity-30 tracking-[0.4em] text-sm font-bold text-gray-400 select-none whitespace-nowrap">
          NUEDEE TO DAY
        </div>

        <div className="relative z-10 flex min-h-screen flex-col w-full">
          {/* Header / Navigation Bar */}
          <header className="w-full flex items-center justify-between px-6 lg:px-12 py-6 z-30 relative">
            {/* Logo & Navigation */}
            <div className="flex items-center gap-12">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-12 h-12 relative group-hover:scale-110 transition-transform duration-300">
                  <img src="/image/logo.png" alt="Logo" className="object-contain w-full h-full drop-shadow-[0_0_10px_rgba(255,122,0,0.4)]" />
                </div>
                <span className="text-2xl font-black tracking-wider text-white drop-shadow-md">NUEDEE</span>
              </Link>

              {/* Navigation removed as requested */}
            </div>

            {/* Action Buttons (Right) */}
            <AuthHeader />
          </header>

          {/* Error Toast */}
          {error && (
            <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-full bg-red-500/90 backdrop-blur-md border border-red-400 text-white text-sm font-bold shadow-[0_0_30px_rgba(239,68,68,0.5)] flex items-center justify-between gap-4 animate-in slide-in-from-top-4 fade-in">
              <span>⚠️ {error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded-md transition-colors cursor-pointer"
              >
                ปิด
              </button>
            </div>
          )}

          {/* Success Toast */}
          {savedMessage && (
            <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[200] bg-gradient-to-r from-emerald-500 to-emerald-600 border border-emerald-400 text-white px-8 py-3 rounded-full font-bold shadow-[0_0_30px_rgba(16,185,129,0.4)] animate-in slide-in-from-top-4 fade-in duration-300">
              {savedMessage}
            </div>
          )}

          <div className="flex-1 flex flex-col lg:flex-row w-full px-6 lg:px-12 gap-8 relative max-w-[1800px] mx-auto">
            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center relative w-full h-full min-h-[65vh] py-12">
              
              {/* Background Typography */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 pointer-events-none select-none w-full overflow-hidden flex justify-center">
                <h1 className="text-[25vw] md:text-[250px] xl:text-[320px] font-black tracking-tighter opacity-15"
                    style={{
                      color: 'transparent',
                      WebkitTextStroke: '2px rgba(255, 255, 255, 0.4)',
                      textShadow: '0 0 30px rgba(255, 122, 0, 0.1)'
                    }}>
                  NUEDEE
                </h1>
              </div>

              {/* Main Hero Image */}
              <div className="relative z-10 w-full max-w-[280px] sm:max-w-[400px] lg:max-w-[500px] animate-float drop-shadow-[0_40px_40px_rgba(0,0,0,0.6)]">
                {/* Fallback to emoji if image fails/missing for now, but using img tag as requested */}
                <div className="relative w-full aspect-square flex items-center justify-center">
                  <img 
                    src="/image/logo.png" 
                    alt="Main Hero Food" 
                    className="w-full h-auto object-contain scale-110 hover:scale-[1.15] transition-transform duration-700 ease-out"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  {/* Fallback Emoji Element */}
                  <div className="hidden absolute inset-0 flex items-center justify-center text-[150px] sm:text-[200px] drop-shadow-[0_20px_30px_rgba(255,122,0,0.3)]">
                    🥘
                  </div>
                </div>
              </div>

              {/* Main CTA Button */}
              <div className="relative z-20 mt-12 mb-4">
                <button
                  onClick={handleRandomRecommend}
                  disabled={loading}
                  className={`group relative overflow-hidden rounded-full px-10 sm:px-14 py-4 sm:py-5 backdrop-blur-xl bg-[#1A1A1A]/40 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 hover:bg-[#1A1A1A]/60 hover:border-white/20 active:scale-95 ${loading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer hover:shadow-[0_0_40px_rgba(255,122,0,0.4)]'}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FF7A00]/20 to-[#FF5500]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center gap-3 sm:gap-4">
                    <span className="text-white font-black text-lg sm:text-xl tracking-widest drop-shadow-md">
                      {loading ? 'LOADING...' : 'GO TO EAT'}
                    </span>
                    {!loading && (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-[#FF7A00] transition-colors duration-300">
                        <svg className="w-4 h-4 text-white group-hover:translate-x-0.5 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              </div>

              <div className="relative z-20 mt-2 mb-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-xs sm:text-sm font-bold hover:bg-white/10 hover:text-white hover:border-[#FF7A00]/50 transition-all cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.2)] flex items-center gap-2 mx-auto active:scale-95"
                >
                  <span className="text-[#FF7A00] drop-shadow-[0_0_5px_rgba(255,122,0,0.8)]">🌟</span> แนะนำสำหรับคุณ
                </button>
              </div>

              {/* Final Choice State (if user is just viewing main page with a selected choice) */}
              {finalChoice && !isResultOpen && !detailMenu && (
                <div className="relative z-20 mt-6 w-full max-w-sm animate-in slide-in-from-bottom-8 fade-in duration-500">
                  <div className="bg-[#1A1A1A]/80 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6 text-center space-y-4 shadow-[0_0_40px_rgba(16,185,129,0.15)] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none"></div>
                    <div className="relative z-10 space-y-2">
                      <span className="text-4xl block mb-3 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">🎉</span>
                      <h3 className="text-xl font-black text-white">
                        มื้อนี้เลือก: <span className="text-emerald-400">{finalChoice.name}</span>!
                      </h3>
                      <p className="text-xs font-semibold text-gray-400">
                        ราคาประมาณ <span className="text-emerald-400">{finalChoice.price}</span> บาท
                      </p>
                    </div>
                    <div className="pt-2 relative z-10">
                      <button
                        type="button"
                        onClick={() => setFinalChoice(null)}
                        className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                      >
                        เลือกเมนูอื่นใหม่
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </main>

          </div>

          {/* Footer Bar */}
          <footer className="w-full flex flex-col sm:flex-row items-center justify-between px-6 lg:px-12 py-6 z-30 gap-4 mt-auto border-t border-white/5 bg-[#121212]/50 backdrop-blur-md">
            <div className="text-gray-400 text-xs font-bold tracking-widest flex items-center gap-2">
              BY <span className="text-white font-black text-sm drop-shadow-[0_0_5px_rgba(255,255,255,0.5)]">MueNee</span>
            </div>
            
            <Link href="/filter" className="group flex items-center gap-3 bg-[#1A1A1A]/80 backdrop-blur-md border border-white/10 rounded-full pl-6 pr-2 py-2 hover:bg-[#2A2A2A] hover:border-[#FF7A00]/50 transition-all duration-300 cursor-pointer shadow-[0_0_15px_rgba(0,0,0,0.5)]">
               <span className="text-[10px] sm:text-xs font-bold text-gray-300 group-hover:text-white tracking-widest">
                 GO WITH THE FILTER OPTION
               </span>
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF7A00] to-[#FF5500] flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(255,122,0,0.4)]">
                 <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                 </svg>
               </div>
            </Link>
          </footer>
        </div>

        {/* Modals & Dialogs (Result) */}
        {isResultOpen && recommendations.length > 0 && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
            <div className="bg-[#1A1A1A]/95 backdrop-blur-3xl rounded-[2rem] max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-[0_0_60px_rgba(255,122,0,0.15)] border border-white/10 max-h-[90vh] overflow-y-auto relative">
              
              <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                    <span className="text-[#FF7A00] drop-shadow-[0_0_8px_rgba(255,122,0,0.5)]">🍱</span> เมนูที่แนะนำสำหรับคุณ
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1">
                    สุ่มและคัดสรรเมนูยอดนิยมมาให้คุณโดยเฉพาะ
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsResultOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 flex items-center justify-center font-bold transition-all hover:scale-105 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                {recommendations.map((menu, idx) => (
                  <div
                    key={menu.id}
                    onClick={() => setDetailMenu(menu)}
                    className="p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-[#FF7A00]/10 hover:border-[#FF7A00]/50 hover:shadow-[0_0_25px_rgba(255,122,0,0.15)] transition-all cursor-pointer flex flex-col justify-between space-y-4 group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="relative z-10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FF5500] text-white shadow-[0_0_10px_rgba(255,122,0,0.4)]">
                          อันดับ {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-[#FF7A00] drop-shadow-sm">
                          {menu.price} ฿
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-white group-hover:text-[#FF7A00] transition-colors line-clamp-2 pt-1">
                        {menu.name}
                      </h4>
                    </div>

                    <div className="relative z-10 space-y-3 pt-2">
                      <div className="flex flex-wrap gap-1.5">
                        {menu.categories.slice(0, 2).map((c) => (
                          <span
                            key={c}
                            className="text-[10px] px-2 py-1 rounded-md bg-white/10 border border-white/5 text-gray-300 font-medium"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                      <button
                        type="button"
                        className="w-full py-2 rounded-xl bg-transparent border border-[#FF7A00]/50 text-[#FF7A00] text-xs font-bold group-hover:bg-[#FF7A00] group-hover:text-white group-hover:border-transparent transition-all shadow-sm cursor-pointer"
                      >
                        ดูรายละเอียด
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {discovery && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-[#FF7A00]/10 to-[#FF5500]/5 border border-[#FF7A00]/30 space-y-3 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black px-3 py-1 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] border border-[#FF7A00]/30 flex items-center gap-1.5 shadow-sm">
                      <span className="drop-shadow-[0_0_5px_rgba(255,122,0,0.8)]">✨</span> ทางเลือกใหม่น่าลอง (Discovery)
                    </span>
                    <span className="text-sm font-bold text-[#FF7A00]">
                      {discovery.price} ฿
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-lg font-bold text-white drop-shadow-sm">
                        {discovery.name}
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        เมนูรสชาติโดดเด่นน่าลิ้มลอง
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDetailMenu(discovery)}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF5500] hover:shadow-[0_0_15px_rgba(255,122,0,0.4)] hover:scale-105 text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      ดูเมนูนี้
                    </button>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/5 relative z-10">
                <button
                  type="button"
                  onClick={handleRandomRecommend}
                  className="w-full sm:w-1/2 py-3.5 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF5500] hover:shadow-[0_0_20px_rgba(255,122,0,0.4)] text-white text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                  <span className="text-lg drop-shadow-md">🎲</span>
                  <span className="tracking-wide">สุ่มใหม่อีกครั้ง</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsResultOpen(false)}
                  className="w-full sm:w-1/2 py-3.5 rounded-xl border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/10 hover:text-white transition-all active:scale-95 cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modals & Dialogs (Detail) */}
        {detailMenu && (
          <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-[#1A1A1A]/95 backdrop-blur-3xl rounded-[2rem] max-w-md w-full p-6 sm:p-8 space-y-6 shadow-[0_0_60px_rgba(255,122,0,0.15)] border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-[#FF7A00]/10 blur-[50px] rounded-full pointer-events-none"></div>
              
              <div className="flex items-start justify-between border-b border-white/10 pb-4 relative z-10">
                <div>
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] border border-[#FF7A00]/30 tracking-wider">
                    รายละเอียดเมนู
                  </span>
                  <h3 className="text-2xl font-black text-white mt-3 leading-tight drop-shadow-sm">
                    {detailMenu.name}
                  </h3>
                </div>
                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#FF7A00] to-[#FF5500] drop-shadow-sm">
                  {detailMenu.price} ฿
                </span>
              </div>

              <div className="space-y-4 text-sm relative z-10">
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5">
                    <span>🧺</span> วัตถุดิบ:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {detailMenu.ingredients.map((ing) => (
                      <span
                        key={ing}
                        className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-[11px] font-medium"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5">
                    <span>🍳</span> หมวดหมู่ & รสชาติ:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {detailMenu.categories.map((c) => (
                      <span
                        key={c}
                        className="px-3 py-1 rounded-lg bg-[#FF7A00]/15 border border-[#FF7A00]/30 text-[#FF7A00] text-[11px] font-bold tracking-wide"
                      >
                        {c}
                      </span>
                    ))}
                    {detailMenu.flavors.map((f) => (
                      <span
                        key={f}
                        className="px-3 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-[11px] font-bold tracking-wide"
                      >
                        {f}
                      </span>
                    ))}
                    {detailMenu.texture && (
                      <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-[11px] font-medium tracking-wide">
                        เนื้อสัมผัส: {detailMenu.texture}
                      </span>
                    )}
                  </div>
                </div>

                {detailMenu.reasons && detailMenu.reasons.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 mb-2 flex items-center gap-1.5">
                      <span>🎯</span> จุดเด่นของเมนูนี้:
                    </p>
                    <ul className="list-disc list-inside text-[11px] text-gray-300 space-y-1.5 bg-white/5 p-4 rounded-xl border border-white/5 leading-relaxed">
                      {detailMenu.reasons.map((r, i) => (
                         <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-4 border-t border-white/5 relative z-10">
                <button
                  type="button"
                  onClick={() => {
                    setFinalChoice(detailMenu);
                    handleConfirmSelection(detailMenu);
                    setDetailMenu(null);
                    setIsResultOpen(false);
                  }}
                  disabled={isSaving}
                  className={`w-full py-3.5 rounded-xl text-white font-black text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                    isSaving 
                      ? "bg-[#FF7A00]/50 cursor-not-allowed" 
                      : "bg-gradient-to-r from-[#FF7A00] to-[#FF5500] hover:shadow-[0_0_25px_rgba(255,122,0,0.4)]"
                  }`}
                >
                  {isSaving ? "กำลังบันทึก..." : "เอาเมนูนี้เลย 🍽️"}
                </button>
                <button
                  type="button"
                  onClick={() => setDetailMenu(null)}
                  className="w-full py-3 rounded-xl border border-white/10 bg-white/5 text-gray-300 font-bold text-sm hover:bg-white/10 hover:text-white transition-all cursor-pointer"
                >
                  ย้อนกลับ
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modals & Dialogs (Sidebar Popup) */}
        {isSidebarOpen && (
          <div className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
            <div className="bg-[#1A1A1A]/95 backdrop-blur-3xl rounded-[2rem] max-w-sm w-full p-6 shadow-[0_0_60px_rgba(255,122,0,0.15)] border border-white/10 relative overflow-hidden flex flex-col max-h-[90vh]">
              <div className="flex justify-between items-center mb-4 relative z-20">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <span className="text-[#FF7A00]">🌟</span> แนะนำสำหรับคุณ
                </h3>
                <button
                  type="button"
                  onClick={() => setIsSidebarOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 flex items-center justify-center font-bold transition-all hover:scale-105 cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <div className="overflow-y-auto flex-1 custom-scrollbar w-full">
                <RecommendationSidebar />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}