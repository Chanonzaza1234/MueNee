"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

const ALL_INGREDIENTS = [
  "หมู", "หมูสับ", "หมูสามชั้น", "ไก่", "อกไก่", "น่องไก่", "เนื้อวัว", "เนื้อสับ", "ตับหมู",
  "กุ้ง", "ปลาหมึก", "ปลา", "ปลาทู", "ไข่ไก่", "ไข่เป็ด", "เต้าหู้", "เห็ด", "ข้าว", "ข้าวโพด",
  "เส้นใหญ่", "เส้นหมี่", "บะหมี่", "วุ้นเส้น", "มาม่า", "กะเพรา", "คะน้า", "ผักบุ้ง", "กะหล่ำปลี",
  "แครอท", "ถั่วฝักยาว", "แตงกวา", "มะเขือเทศ", "มะเขือ", "หอมหัวใหญ่", "ต้นหอม", "ผักชี",
  "พริก", "กระเทียม", "ขิง", "ตะไคร้", "ใบมะกรูด", "พริกแกง", "น้ำปลา", "ซีอิ๊ว", "ซอสหอยนางรม",
  "น้ำตาล", "มะนาว", "กะทิ", "ถั่วลิสง", "ชีส", "ผัก"
];

const POPULAR_INGREDIENTS = [
  "หมู", "ไก่", "ไข่ไก่", "เนื้อวัว", "กุ้ง", "ปลาหมึก", "ตับหมู", "ปลา", "เต้าหู้", "ผัก", "เห็ด", "พริก"
];

const CATEGORIES = ["ผัด", "ทอด", "ต้ม", "แกง", "ย่าง", "อาหารเส้น", "จานเดียว"];
const FLAVORS = ["เผ็ด", "หวาน", "เค็ม", "เปรี้ยว", "นัว", "จืด", "รสอ่อน", "รสจัด"];
const QUICK_BUDGETS = [50, 100, 120, 200];

export default function FilterOptionPage() {
    const router = useRouter();

    // Original States
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const [ingredientSearch, setIngredientSearch] = useState("");
    const [showAllIngredients, setShowAllIngredients] = useState(false);

    const [categories, setCategories] = useState<string[]>([]);
    const [flavors, setFlavors] = useState<string[]>([]);
    const [budgetType, setBudgetType] = useState<"none" | "preset" | "custom">("none");
    const [budget, setBudget] = useState<number | undefined>(undefined);
    const [customBudgetInput, setCustomBudgetInput] = useState("");

    // Results & UI State
    const [recommendations, setRecommendations] = useState<Menu[]>([]);
    const [discovery, setDiscovery] = useState<Menu | null>(null);
    const [isResultOpen, setIsResultOpen] = useState(false);
    const [detailMenu, setDetailMenu] = useState<Menu | null>(null);
    const [finalChoice, setFinalChoice] = useState<Menu | null>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [isEmpty, setIsEmpty] = useState(false);

    // Helpers
    const toggleItem = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
        setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
    };

    const toggleIngredient = (name: string) => toggleItem(name, selectedIngredients, setSelectedIngredients);

    const handleSelectPresetBudget = (amount: number) => {
        setBudgetType("preset");
        setBudget(amount);
        setCustomBudgetInput("");
    };

    const isSearching = ingredientSearch.trim().length > 0;
    const filteredIngredients = ALL_INGREDIENTS.filter(ing => ing.toLowerCase().includes(ingredientSearch.trim().toLowerCase()));

    // Submit Recommendation (original logic)
    const handleRecommend = async () => {
        setError("");
        setIsEmpty(false);
        setRecommendations([]);
        setDiscovery(null);
        setFinalChoice(null);

        if (budgetType === "custom" && customBudgetInput) {
            const num = Number(customBudgetInput);
            if (isNaN(num) || num <= 0) {
                setError("กรุณาระบุงบประมาณเป็นตัวเลขที่มากกว่า 0");
                return;
            }
        }

        try {
            setLoading(true);
            const response = await fetch("/api/recommend", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ingredients: selectedIngredients,
                    categories,
                    flavors,
                    budget: budget,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                if (data.message === "ไม่พบเมนูที่ตรงกับเงื่อนไข") {
                    setIsEmpty(true);
                } else {
                    setError(data.message || "เกิดข้อผิดพลาด กรุณาลองใหม่");
                }
                return;
            }

            const recList = data.recommendations || [];
            if (recList.length === 0) {
                setIsEmpty(true);
                return;
            }

            setRecommendations(recList);
            setDiscovery(data.discovery || null);
            setIsResultOpen(true);
        } catch (err) {
            console.error(err);
            setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSelection = async (menu: Menu) => {
        try {
            await fetch("/api/history", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ menuId: menu.id, price: menu.price }),
            });
            window.dispatchEvent(new Event("historyUpdated"));
        } catch (err) {
            console.error(err);
        }
    };

    // Shared Button Style
    const btnClass = (isActive: boolean) => 
        `px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 border-2 outline-none flex items-center justify-center text-center cursor-pointer ${
            isActive 
            ? "bg-[#FF7A00]/15 border-[#FF7A00] text-[#FF7A00] shadow-[0_0_15px_rgba(255,122,0,0.3)]"
            : "bg-[#2a2a2a] border-transparent text-gray-200 hover:bg-[#383838] hover:-translate-y-0.5"
        }`;

    return (
        <div className="min-h-screen bg-[#121212] text-white flex flex-col relative overflow-x-hidden font-sans pb-32">
            {/* Radial Glow */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-radial-gradient from-[rgba(255,122,0,0.15)] to-[rgba(18,18,18,0)] from-0% to-65% rounded-full pointer-events-none z-0" 
                 style={{ background: 'radial-gradient(circle, rgba(255, 122, 0, 0.15) 0%, rgba(18, 18, 18, 0) 65%)' }}
            />

            {/* Header */}
            <header className="flex flex-col items-start p-6 md:px-12 relative z-10 gap-3">
                <div className="flex items-center gap-3">
                    <img src="/image/logo.png" alt="Logo" className="w-12 h-12 object-contain" />
                    <h1 className="text-2xl font-black tracking-widest">NUEDEE</h1>
                </div>
                <button onClick={() => router.push('/')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors cursor-pointer text-sm font-medium py-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                    ย้อนกลับ
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-4xl mx-auto px-6 relative z-10 flex flex-col gap-10">
                {/* Error/Empty Messages */}
                {error && (
                    <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/50 text-red-200 text-sm font-bold text-center animate-in fade-in">
                        ⚠️ {error}
                    </div>
                )}
                {isEmpty && (
                    <div className="p-4 rounded-xl bg-orange-500/20 border border-orange-500/50 text-orange-200 text-sm font-bold text-center animate-in fade-in">
                        ไม่พบเมนูที่ตรงกับเงื่อนไข ลองปรับเปลี่ยนการค้นหาดูนะ!
                    </div>
                )}

                {/* Section 1: Ingredients */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">🧺 วัตถุดิบตามใจฉัน</h2>
                    
                    {/* Search */}
                    {(showAllIngredients || isSearching) && (
                        <div className="relative mb-4">
                            <input
                                type="text"
                                value={ingredientSearch}
                                onChange={(e) => setIngredientSearch(e.target.value)}
                                placeholder="ค้นหาวัตถุดิบ..."
                                className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-700 bg-[#1A1A1A] text-white focus:outline-none focus:border-[#FF7A00]"
                            />
                            <span className="absolute left-3.5 top-3.5 text-gray-500">🔍</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {(!showAllIngredients && !isSearching ? POPULAR_INGREDIENTS : filteredIngredients).map(ing => (
                            <button key={ing} onClick={() => toggleIngredient(ing)} className={btnClass(selectedIngredients.includes(ing))}>
                                {selectedIngredients.includes(ing) ? `✓ ${ing}` : ing}
                            </button>
                        ))}
                        
                        {!showAllIngredients && !isSearching && (
                            <button 
                                onClick={() => setShowAllIngredients(true)} 
                                className="px-4 py-3 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-2 border-2 border-dashed border-gray-600 text-[#FF7A00] hover:bg-[#FF7A00]/10 hover:border-[#FF7A00] cursor-pointer"
                            >
                                เพิ่มเติม
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 9l6 6 6-6" />
                                </svg>
                            </button>
                        )}
                    </div>
                    {showAllIngredients && (
                        <div className="flex justify-center mt-2">
                             <button onClick={() => { setShowAllIngredients(false); setIngredientSearch(""); }} className="text-sm font-bold text-[#FF7A00] cursor-pointer hover:underline">
                                 ซ่อนวัตถุดิบ
                             </button>
                        </div>
                    )}
                </section>

                {/* Section 2: Categories */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">🍳 ประเภทอาหาร</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {CATEGORIES.map(cat => (
                            <button key={cat} onClick={() => toggleItem(cat, categories, setCategories)} className={btnClass(categories.includes(cat))}>
                                {categories.includes(cat) ? `✓ ${cat}` : cat}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Section 3: Flavors */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">🌶️ รสชาติ</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {FLAVORS.map(flv => (
                            <button key={flv} onClick={() => toggleItem(flv, flavors, setFlavors)} className={btnClass(flavors.includes(flv))}>
                                {flavors.includes(flv) ? `✓ ${flv}` : flv}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Section 4: Budget */}
                <section className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">💰 งบประมาณ (บาท)</h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        <button onClick={() => { setBudgetType("none"); setBudget(undefined); setCustomBudgetInput(""); }} className={btnClass(budgetType === "none")}>
                            ไม่จำกัด
                        </button>
                        {QUICK_BUDGETS.map(amt => (
                            <button key={amt} onClick={() => handleSelectPresetBudget(amt)} className={btnClass(budgetType === "preset" && budget === amt)}>
                                {amt}
                            </button>
                        ))}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                        <input
                            type="number"
                            placeholder="ระบุเอง..."
                            value={customBudgetInput}
                            onChange={(e) => {
                                setCustomBudgetInput(e.target.value);
                                setBudgetType("custom");
                                const val = Number(e.target.value);
                                setBudget(val > 0 ? val : undefined);
                            }}
                            className={`w-full sm:w-64 px-4 py-3 rounded-2xl bg-[#2a2a2a] text-white border-2 outline-none focus:border-[#FF7A00] transition-colors ${budgetType === 'custom' ? 'border-[#FF7A00]' : 'border-transparent'}`}
                        />
                    </div>
                </section>
            </main>

            {/* Bottom Action */}
            <div className="fixed bottom-0 left-0 w-full p-6 flex justify-center bg-[#121212]/70 backdrop-blur-xl border-t border-white/10 z-30">
                <button 
                    onClick={handleRecommend}
                    disabled={loading}
                    className="w-full max-w-md py-4 rounded-full bg-gradient-to-br from-[#FF9933] to-[#FF5500] text-white text-lg font-black tracking-widest shadow-[0_8px_30px_rgba(255,122,0,0.4)] hover:shadow-[0_12px_40px_rgba(255,122,0,0.5)] hover:-translate-y-1 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {loading ? "PROCESSING..." : "GO TO EAT"}
                </button>
            </div>

            {/* Result Modal */}
            {isResultOpen && recommendations.length > 0 && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
                    <div className="bg-[#1A1A1A]/95 backdrop-blur-3xl rounded-[2rem] max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-[0_0_60px_rgba(255,122,0,0.15)] border border-white/10 max-h-[90vh] overflow-y-auto relative">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-3">
                                    <span className="text-[#FF7A00] drop-shadow-[0_0_8px_rgba(255,122,0,0.5)]">🍱</span> เมนูที่แนะนำสำหรับคุณ
                                </h2>
                                <p className="text-xs sm:text-sm text-gray-400 mt-1">จากเงื่อนไขที่คุณเลือก</p>
                            </div>
                            <button onClick={() => setIsResultOpen(false)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 flex items-center justify-center font-bold transition-all cursor-pointer">✕</button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
                            {recommendations.map((menu, idx) => (
                                <div key={menu.id} onClick={() => setDetailMenu(menu)} className="p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-[#FF7A00]/10 hover:border-[#FF7A00]/50 hover:shadow-[0_0_25px_rgba(255,122,0,0.15)] transition-all cursor-pointer flex flex-col justify-between space-y-4 group">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-gradient-to-r from-[#FF7A00] to-[#FF5500] text-white shadow-[0_0_10px_rgba(255,122,0,0.4)]">อันดับ {idx + 1}</span>
                                            <span className="text-xs font-bold text-[#FF7A00]">{menu.price} ฿</span>
                                        </div>
                                        <h4 className="text-base font-bold text-white group-hover:text-[#FF7A00] transition-colors">{menu.name}</h4>
                                    </div>
                                    <button className="w-full py-2 rounded-xl border border-[#FF7A00]/50 text-[#FF7A00] text-xs font-bold group-hover:bg-[#FF7A00] group-hover:text-white transition-all">ดูรายละเอียด</button>
                                </div>
                            ))}
                        </div>

                        {discovery && (
                            <div className="p-5 rounded-2xl bg-gradient-to-r from-[#FF7A00]/10 to-[#FF5500]/5 border border-[#FF7A00]/30 space-y-3 relative z-10">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black px-3 py-1 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] border border-[#FF7A00]/30">✨ ทางเลือกใหม่น่าลอง</span>
                                    <span className="text-sm font-bold text-[#FF7A00]">{discovery.price} ฿</span>
                                </div>
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <h4 className="text-lg font-bold text-white">{discovery.name}</h4>
                                    <button onClick={() => setDetailMenu(discovery)} className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF5500] text-white text-xs font-bold transition-all cursor-pointer">ดูเมนูนี้</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {detailMenu && (
                <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-[#1A1A1A]/95 backdrop-blur-3xl rounded-[2rem] max-w-md w-full p-6 sm:p-8 space-y-6 shadow-[0_0_60px_rgba(255,122,0,0.15)] border border-white/10 relative">
                        <div className="flex items-start justify-between border-b border-white/10 pb-4 relative z-10">
                            <div>
                                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-[#FF7A00]/20 text-[#FF7A00] border border-[#FF7A00]/30">รายละเอียดเมนู</span>
                                <h3 className="text-2xl font-black text-white mt-3">{detailMenu.name}</h3>
                            </div>
                            <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#FF7A00] to-[#FF5500]">{detailMenu.price} ฿</span>
                        </div>
                        <div className="space-y-4 text-sm relative z-10">
                            <div>
                                <p className="text-xs font-bold text-gray-400 mb-2">🧺 วัตถุดิบ:</p>
                                <div className="flex flex-wrap gap-2">{detailMenu.ingredients.map(ing => <span key={ing} className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-200 text-[11px] font-medium">{ing}</span>)}</div>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 mb-2">🍳 หมวดหมู่ & รสชาติ:</p>
                                <div className="flex flex-wrap gap-2">
                                    {detailMenu.categories.map(c => <span key={c} className="px-3 py-1 rounded-lg bg-[#FF7A00]/15 border border-[#FF7A00]/30 text-[#FF7A00] text-[11px] font-bold">{c}</span>)}
                                    {detailMenu.flavors.map(f => <span key={f} className="px-3 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-[11px] font-bold">{f}</span>)}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-white/5 relative z-10">
                            <button onClick={() => { setFinalChoice(detailMenu); handleConfirmSelection(detailMenu); setDetailMenu(null); setIsResultOpen(false); alert("เลือกเมนูนี้แล้ว!"); router.push('/'); }} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF7A00] to-[#FF5500] text-white font-black text-sm shadow-md transition-all cursor-pointer">เอาเมนูนี้เลย 🍽️</button>
                            <button onClick={() => setDetailMenu(null)} className="w-full py-3 rounded-xl border border-white/10 bg-white/5 text-gray-300 font-bold text-sm hover:bg-white/10 transition-all cursor-pointer">ย้อนกลับ</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
