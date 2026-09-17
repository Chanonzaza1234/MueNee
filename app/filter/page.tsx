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

// ~50 Thai & common ingredients
const ALL_INGREDIENTS = [
  "หมู",
  "หมูสับ",
  "หมูสามชั้น",
  "ไก่",
  "อกไก่",
  "น่องไก่",
  "เนื้อวัว",
  "เนื้อสับ",
  "ตับหมู",
  "กุ้ง",
  "ปลาหมึก",
  "ปลา",
  "ปลาทู",
  "ไข่ไก่",
  "ไข่เป็ด",
  "เต้าหู้",
  "เห็ด",
  "ข้าว",
  "ข้าวโพด",
  "เส้นใหญ่",
  "เส้นหมี่",
  "บะหมี่",
  "วุ้นเส้น",
  "มาม่า",
  "กะเพรา",
  "คะน้า",
  "ผักบุ้ง",
  "กะหล่ำปลี",
  "แครอท",
  "ถั่วฝักยาว",
  "แตงกวา",
  "มะเขือเทศ",
  "มะเขือ",
  "หอมหัวใหญ่",
  "ต้นหอม",
  "ผักชี",
  "พริก",
  "กระเทียม",
  "ขิง",
  "ตะไคร้",
  "ใบมะกรูด",
  "พริกแกง",
  "น้ำปลา",
  "ซีอิ๊ว",
  "ซอสหอยนางรม",
  "น้ำตาล",
  "มะนาว",
  "กะทิ",
  "ถั่วลิสง",
  "ชีส",
  "ผัก",
];

// Popular ~10-12 ingredients for default compact view
const POPULAR_INGREDIENTS = [
  "หมู",
  "ไก่",
  "ไข่ไก่",
  "เนื้อวัว",
  "กุ้ง",
  "ปลาหมึก",
  "ตับหมู",
  "ปลา",
  "เต้าหู้",
  "ผัก",
  "เห็ด",
  "พริก",
];

const FOOD_CATEGORIES = [
  "ผัด",
  "ทอด",
  "ต้ม",
  "แกง",
  "ย่าง",
  "อาหารเส้น",
  "จานเดียว",
];

const FLAVORS = [
  "เผ็ด",
  "หวาน",
  "เค็ม",
  "เปรี้ยว",
  "นัว",
  "จืด",
  "รสอ่อน",
  "รสจัด",
];

const QUICK_BUDGETS = [50, 100, 120, 200];

export default function FilterPage() {
  // State for user selections
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [ingredientSearch, setIngredientSearch] = useState("");
  const [showAllIngredients, setShowAllIngredients] = useState(false);

  const [categories, setCategories] = useState<string[]>([]);
  const [flavors, setFlavors] = useState<string[]>([]);
  const [budgetType, setBudgetType] = useState<"none" | "preset" | "custom">("none");
  const [budget, setBudget] = useState<number | undefined>(undefined);
  const [customBudgetInput, setCustomBudgetInput] = useState("");

  // Mobile Selection Summary Expansion State
  const [isMobileSummaryExpanded, setIsMobileSummaryExpanded] = useState(false);

  // Results & UI State
  const [recommendations, setRecommendations] = useState<Menu[]>([]);
  const [discovery, setDiscovery] = useState<Menu | null>(null);
  const [isResultOpen, setIsResultOpen] = useState(false);
  const [detailMenu, setDetailMenu] = useState<Menu | null>(null);
  const [finalChoice, setFinalChoice] = useState<Menu | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEmpty, setIsEmpty] = useState(false);

  // Toggle helper for categories / flavors
  const toggleItem = (
    item: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  // Toggle ingredient
  const toggleIngredient = (name: string) => {
    if (selectedIngredients.includes(name)) {
      setSelectedIngredients(selectedIngredients.filter((i) => i !== name));
    } else {
      setSelectedIngredients([...selectedIngredients, name]);
    }
  };

  const removeIngredient = (name: string) => {
    setSelectedIngredients(selectedIngredients.filter((i) => i !== name));
  };

  // Budget Handlers
  const handleSelectNoBudget = () => {
    setBudgetType("none");
    setBudget(undefined);
    setCustomBudgetInput("");
  };

  const handleSelectPresetBudget = (amount: number) => {
    setBudgetType("preset");
    setBudget(amount);
    setCustomBudgetInput("");
  };

  const handleSelectCustomBudget = () => {
    setBudgetType("custom");
    if (customBudgetInput) {
      setBudget(Number(customBudgetInput));
    } else {
      setBudget(undefined);
    }
  };

  const handleCustomBudgetChange = (value: string) => {
    setCustomBudgetInput(value);
    const num = Number(value);
    if (value && !isNaN(num) && num > 0) {
      setBudget(num);
    } else {
      setBudget(undefined);
    }
  };

  // Filtered ingredients based on search
  const isSearching = ingredientSearch.trim().length > 0;
  const filteredIngredients = ALL_INGREDIENTS.filter((ingredient) =>
    ingredient.toLowerCase().includes(ingredientSearch.trim().toLowerCase())
  );

  // Check if anything has been selected
  const hasSelections =
    selectedIngredients.length > 0 ||
    categories.length > 0 ||
    flavors.length > 0 ||
    (budgetType !== "none" && budget !== undefined);

  // Summary items for compact mobile view
  const summaryTokens: string[] = [
    ...selectedIngredients,
    ...categories,
    ...flavors,
    budgetType === "preset" || (budgetType === "custom" && budget)
      ? `${budget} บาท`
      : "",
  ].filter(Boolean);

  // Submit Recommendation
  const handleRecommend = async () => {
    setError("");
    setIsEmpty(false);
    setRecommendations([]);
    setDiscovery(null);
    setFinalChoice(null);

    // Validate custom budget if entered
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
        headers: {
          "Content-Type": "application/json",
        },
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

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedIngredients([]);
    setIngredientSearch("");
    setShowAllIngredients(false);
    setCategories([]);
    setFlavors([]);
    setBudgetType("none");
    setBudget(undefined);
    setCustomBudgetInput("");
    setIsEmpty(false);
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7F7] text-[#1F2937]">
      {/* ==================================================
          HEADER
      ================================================== */}
      <header className="sticky top-0 z-40 bg-[#F4512C] text-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-1.5 text-white/90 hover:text-white px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-xs sm:text-sm font-semibold"
              title="กลับหน้าแรก"
            >
              <span>←</span>
              <span>หน้าแรก</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center border border-white/20 shadow-inner">
                <span className="text-lg">🍳</span>
              </div>
              <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-white drop-shadow-xs">
                MueNee
              </span>
            </div>
          </div>
          <p className="text-xs text-orange-100 font-medium hidden sm:block">
            เลือกตัวกรองเมนูอาหาร
          </p>
        </div>
      </header>

      {/* ==================================================
          MAIN CONTAINER
      ================================================== */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 sm:py-8 pb-32 sm:pb-28 flex flex-col gap-6">
        {/* HERO / MAIN TITLE */}
        <div className="text-center space-y-2 py-2">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#1F2937] tracking-tight">
            เลือกความต้องการของคุณ
          </h1>
          <p className="text-sm sm:text-base text-[#6B7280] font-normal max-w-md mx-auto">
            ไม่ต้องรู้ชื่อเมนู แค่บอกว่าอยากกินแบบไหน
          </p>
        </div>

        {/* MOBILE COMPACT SUMMARY CARD (< 1024px) */}
        <div className="lg:hidden">
          <div className="bg-white rounded-2xl border border-orange-200 shadow-xs p-4 transition-all">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-[#F4512C] flex items-center gap-1">
                  <span>🍽️</span> มื้อนี้เลือก
                </span>
                {hasSelections ? (
                  <p className="text-sm font-semibold text-[#1F2937] truncate mt-0.5">
                    {summaryTokens.join(" • ")}
                  </p>
                ) : (
                  <p className="text-xs text-[#6B7280] italic mt-0.5">
                    ยังไม่ได้เลือกเงื่อนไข
                  </p>
                )}
              </div>

              {hasSelections && (
                <button
                  type="button"
                  onClick={() => setIsMobileSummaryExpanded(!isMobileSummaryExpanded)}
                  aria-expanded={isMobileSummaryExpanded}
                  aria-controls="mobile-selection-summary"
                  className="px-2.5 py-1.5 rounded-xl bg-orange-50 text-[#F4512C] text-xs font-bold border border-orange-200 shrink-0 hover:bg-orange-100 transition-colors"
                >
                  {isMobileSummaryExpanded ? "ซ่อน ▲" : "ดูสรุป ▼"}
                </button>
              )}
            </div>

            {/* Mobile Expanded Breakdown */}
            {isMobileSummaryExpanded && hasSelections && (
              <div
                id="mobile-selection-summary"
                className="mt-3 pt-3 border-t border-orange-100 space-y-2 text-xs animate-in fade-in"
              >
                {selectedIngredients.length > 0 && (
                  <div>
                    <span className="font-bold text-gray-700">🧺 วัตถุดิบ: </span>
                    <span className="text-gray-900">{selectedIngredients.join(", ")}</span>
                  </div>
                )}
                {categories.length > 0 && (
                  <div>
                    <span className="font-bold text-gray-700">🍳 ประเภท: </span>
                    <span className="text-gray-900">{categories.join(", ")}</span>
                  </div>
                )}
                {flavors.length > 0 && (
                  <div>
                    <span className="font-bold text-gray-700">🌶️ รสชาติ: </span>
                    <span className="text-gray-900">{flavors.join(", ")}</span>
                  </div>
                )}
                <div>
                  <span className="font-bold text-gray-700">💰 งบประมาณ: </span>
                  <span className="text-gray-900">
                    {budgetType === "none" || budget === undefined
                      ? "ไม่จำกัดงบประมาณ"
                      : `${budget} บาท`}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DESKTOP 2-COLUMN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_340px] gap-6 items-start">
          {/* LEFT: MAIN FORM CONTENT CARD */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-4 sm:p-6 md:p-8 space-y-6">
            {/* 🧺 วัตถุดิบที่มี */}
            <section className="space-y-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#1F2937] flex items-center gap-2">
                  <span>🧺</span> วัตถุดิบที่มี
                </h2>
                <p className="text-xs sm:text-sm text-[#6B7280]">
                  มีอะไรในครัวบ้าง? (เลือกได้หลายรายการ)
                </p>
              </div>

              {/* Selected Ingredients Bar */}
              <div className="p-3 bg-orange-50/40 rounded-xl border border-orange-100 space-y-1.5">
                <span className="text-xs font-bold text-[#1F2937] block">
                  วัตถุดิบที่เลือก:
                </span>
                <div className="flex flex-wrap gap-1.5 min-h-[34px] items-center">
                  {selectedIngredients.length > 0 ? (
                    selectedIngredients.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => removeIngredient(item)}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F4512C] hover:bg-[#E03E1A] text-white text-xs sm:text-sm font-semibold shadow-2xs transition-colors group cursor-pointer"
                        title={`คลิกเพื่อลบ ${item}`}
                      >
                        <span>✓</span>
                        <span>{item}</span>
                        <span className="ml-1 text-xs font-bold text-white/80 group-hover:text-white">✕</span>
                      </button>
                    ))
                  ) : (
                    <span className="text-xs text-[#6B7280] italic">
                      ยังไม่ได้เลือกวัตถุดิบ
                    </span>
                  )}
                </div>
              </div>

              {/* Search or Expanded / Default Ingredients List */}
              {showAllIngredients || isSearching ? (
                <div className="space-y-3">
                  {/* Real-time Search Input */}
                  <div className="relative">
                    <input
                      type="text"
                      value={ingredientSearch}
                      onChange={(e) => setIngredientSearch(e.target.value)}
                      placeholder="🔍 ค้นหาวัตถุดิบ... (เช่น หมู, ไข่, คะน้า)"
                      className="w-full px-4 py-2.5 pl-10 rounded-xl border border-orange-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#F4512C]/20 bg-white"
                    />
                    <span className="absolute left-3.5 top-3 text-sm text-gray-400">
                      🔍
                    </span>
                    {ingredientSearch && (
                      <button
                        type="button"
                        onClick={() => setIngredientSearch("")}
                        className="absolute right-3 top-2.5 text-xs text-gray-400 hover:text-gray-600 px-2 py-0.5 rounded-md"
                      >
                        ล้าง
                      </button>
                    )}
                  </div>

                  {/* Scroll Container for Ingredients */}
                  <div className="max-h-[240px] sm:max-h-[260px] md:max-h-[280px] overflow-y-auto overflow-x-hidden p-2.5 rounded-xl border border-orange-200/80 bg-orange-50/20 scrollbar-thin">
                    {filteredIngredients.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                        {filteredIngredients.map((ing) => {
                          const isSelected = selectedIngredients.includes(ing);
                          return (
                            <button
                              key={ing}
                              type="button"
                              onClick={() => toggleIngredient(ing)}
                              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 min-h-[42px] flex items-center justify-center text-center ${
                                isSelected
                                  ? "bg-[#F4512C] text-white shadow-xs border border-[#F4512C]"
                                  : "bg-white text-[#1F2937] border border-orange-200/80 hover:border-[#F4512C] hover:bg-orange-50/50"
                              }`}
                            >
                              {isSelected ? `✓ ${ing} ✕` : `+ ${ing}`}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-sm text-[#6B7280]">
                        ไม่พบวัตถุดิบที่ค้นหา
                      </div>
                    )}
                  </div>

                  {/* Collapse / Close Full List Button */}
                  <div className="flex justify-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowAllIngredients(false);
                        setIngredientSearch("");
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-100/70 hover:bg-orange-200/70 text-[#F4512C] text-xs sm:text-sm font-bold transition-colors"
                    >
                      <span>ย่อรายการ</span>
                      <span>▲</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Default Popular Ingredients Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                    {POPULAR_INGREDIENTS.map((ing) => {
                      const isSelected = selectedIngredients.includes(ing);
                      return (
                        <button
                          key={ing}
                          type="button"
                          onClick={() => toggleIngredient(ing)}
                          className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 min-h-[44px] flex items-center justify-center text-center ${
                            isSelected
                              ? "bg-[#F4512C] text-white shadow-xs border border-[#F4512C]"
                              : "bg-white text-[#1F2937] border border-orange-200/80 hover:border-[#F4512C] hover:bg-orange-50/50"
                          }`}
                        >
                          {isSelected ? `✓ ${ing} ✕` : `+ ${ing}`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Expand Button */}
                  <div className="flex justify-center pt-1">
                    <button
                      type="button"
                      onClick={() => setShowAllIngredients(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-100/70 hover:bg-orange-200/70 text-[#F4512C] text-xs sm:text-sm font-bold transition-colors"
                    >
                      <span>ดูวัตถุดิบเพิ่มเติม ({ALL_INGREDIENTS.length} รายการ)</span>
                      <span>▼</span>
                    </button>
                  </div>
                </div>
              )}
            </section>

            <hr className="border-[#E5E7EB]" />

            {/* 🍳 ประเภทอาหาร */}
            <section className="space-y-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#1F2937] flex items-center gap-2">
                  <span>🍳</span> ประเภทอาหาร
                </h2>
                <p className="text-xs sm:text-sm text-[#6B7280]">
                  เลือกหมวดหมู่ที่ถูกใจ (เลือกได้หลายข้อ)
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {FOOD_CATEGORIES.map((cat) => {
                  const isSelected = categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleItem(cat, categories, setCategories)}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 min-h-[48px] flex items-center justify-center text-center ${
                        isSelected
                          ? "bg-[#F4512C] text-white shadow-xs scale-102"
                          : "bg-white text-[#1F2937] border border-[#E5E7EB] hover:border-[#F4512C] hover:bg-orange-50/30"
                      }`}
                    >
                      {isSelected && <span className="mr-1.5">✓</span>}
                      {cat}
                    </button>
                  );
                })}
              </div>
            </section>

            <hr className="border-[#E5E7EB]" />

            {/* 🌶️ รสชาติ */}
            <section className="space-y-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#1F2937] flex items-center gap-2">
                  <span>🌶️</span> รสชาติ
                </h2>
                <p className="text-xs sm:text-sm text-[#6B7280]">
                  อยากให้มื้อนี้รสชาติแบบไหน (เลือกได้หลายข้อ)
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {FLAVORS.map((flav) => {
                  const isSelected = flavors.includes(flav);
                  return (
                    <button
                      key={flav}
                      type="button"
                      onClick={() => toggleItem(flav, flavors, setFlavors)}
                      className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-150 min-h-[48px] flex items-center justify-center text-center ${
                        isSelected
                          ? "bg-[#F4512C] text-white shadow-xs scale-102"
                          : "bg-white text-[#1F2937] border border-[#E5E7EB] hover:border-[#F4512C] hover:bg-orange-50/30"
                      }`}
                    >
                      {isSelected && <span className="mr-1.5">✓</span>}
                      {flav}
                    </button>
                  );
                })}
              </div>
            </section>

            <hr className="border-[#E5E7EB]" />

            {/* 💰 งบประมาณ */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-[#1F2937] flex items-center gap-2">
                  <span>💰</span> งบประมาณ
                </h2>
                <span className="text-xs font-medium text-[#6B7280] bg-gray-100 px-2 py-0.5 rounded-full">
                  Optional
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5 items-center">
                {/* No Budget Option */}
                <button
                  type="button"
                  onClick={handleSelectNoBudget}
                  className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px] flex items-center gap-2 ${
                    budgetType === "none"
                      ? "bg-[#1F2937] text-white shadow-xs"
                      : "bg-white text-[#1F2937] border border-[#E5E7EB] hover:bg-gray-50"
                  }`}
                >
                  <span>{budgetType === "none" ? "●" : "○"}</span>
                  ไม่จำกัดงบประมาณ
                </button>

                {/* Quick Preset Buttons */}
                {QUICK_BUDGETS.map((amount) => {
                  const isSelected = budgetType === "preset" && budget === amount;
                  return (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleSelectPresetBudget(amount)}
                      className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
                        isSelected
                          ? "bg-[#F4512C] text-white shadow-xs scale-102"
                          : "bg-white text-[#1F2937] border border-[#E5E7EB] hover:border-[#F4512C] hover:bg-orange-50/30"
                      }`}
                    >
                      {amount} บาท
                    </button>
                  );
                })}

                {/* Custom Budget Button */}
                <button
                  type="button"
                  onClick={handleSelectCustomBudget}
                  className={`px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px] ${
                    budgetType === "custom"
                      ? "bg-[#F4512C] text-white shadow-xs scale-102"
                      : "bg-white text-[#1F2937] border border-[#E5E7EB] hover:border-[#F4512C] hover:bg-orange-50/30"
                  }`}
                >
                  กำหนดเอง
                </button>
              </div>

              {/* Custom Budget Input Box */}
              {budgetType === "custom" && (
                <div className="p-3.5 bg-orange-50/60 rounded-xl border border-orange-200 flex flex-col sm:flex-row items-center gap-3 animate-in fade-in">
                  <span className="text-sm font-semibold text-[#1F2937] whitespace-nowrap">
                    งบสูงสุด:
                  </span>
                  <div className="relative w-full sm:w-48">
                    <input
                      type="number"
                      min="1"
                      value={customBudgetInput}
                      onChange={(e) => handleCustomBudgetChange(e.target.value)}
                      placeholder="เช่น 80"
                      autoFocus
                      className="w-full px-3 py-2 pr-12 rounded-xl border border-[#F4512C] text-sm font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#F4512C]/20"
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-semibold text-gray-500">
                      บาท
                    </span>
                  </div>
                  <span className="text-xs text-[#6B7280]">
                    (ระบบจะไม่แนะนำเมนูที่ราคาสูงกว่างบนี้)
                  </span>
                </div>
              )}

              {budgetType === "none" && (
                <p className="text-xs text-[#6B7280]">
                  💡 ขณะนี้เลือก: <span className="font-semibold">ไม่จำกัดงบประมาณ</span> (แสดงเมนูทุกช่วงราคา)
                </p>
              )}
            </section>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center justify-between animate-in fade-in">
                <span>⚠️ {error}</span>
                <button
                  type="button"
                  onClick={() => setError("")}
                  className="text-xs font-bold text-red-600 hover:underline"
                >
                  ปิด
                </button>
              </div>
            )}

            {/* Empty State Notice */}
            {isEmpty && (
              <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3 animate-in fade-in">
                <span className="text-3xl">🍽️</span>
                <p className="text-base font-bold text-amber-900">
                  ไม่พบเมนูที่ตรงกับเงื่อนไข
                </p>
                <p className="text-xs sm:text-sm text-amber-700">
                  ลองลดข้อจำกัดวัตถุดิบ หรือเพิ่มงบประมาณดูใหม่อีกครั้ง
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold transition-colors shadow-xs"
                >
                  ลองปรับเงื่อนไข
                </button>
              </div>
            )}
          </div>

          {/* DESKTOP STICKY SELECTION SUMMARY (>= 1024px) */}
          <aside className="hidden lg:block sticky top-20">
            <div className="bg-white rounded-2xl border border-orange-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-orange-100 pb-3">
                <h3 className="text-base font-extrabold text-[#1F2937] flex items-center gap-2">
                  <span>🍽️</span> มื้อนี้เลือก
                </h3>
                {hasSelections && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs text-gray-400 hover:text-[#F4512C] font-semibold transition-colors cursor-pointer"
                  >
                    ล้าง
                  </button>
                )}
              </div>

              {hasSelections ? (
                <div className="space-y-3.5 text-xs">
                  {/* Ingredients Summary */}
                  <div>
                    <p className="font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                      <span>🧺</span> วัตถุดิบ ({selectedIngredients.length}):
                    </p>
                    {selectedIngredients.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {selectedIngredients.map((item) => (
                          <span
                            key={item}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 text-[#F4512C] border border-orange-200 font-semibold"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">ไม่ระบุ</span>
                    )}
                  </div>

                  {/* Categories Summary */}
                  <div>
                    <p className="font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                      <span>🍳</span> ประเภท ({categories.length}):
                    </p>
                    {categories.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {categories.map((cat) => (
                          <span
                            key={cat}
                            className="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 border border-red-200 font-semibold"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">ไม่ระบุ</span>
                    )}
                  </div>

                  {/* Flavors Summary */}
                  <div>
                    <p className="font-bold text-gray-700 mb-1.5 flex items-center gap-1">
                      <span>🌶️</span> รสชาติ ({flavors.length}):
                    </p>
                    {flavors.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {flavors.map((f) => (
                          <span
                            key={f}
                            className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-semibold"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">ไม่ระบุ</span>
                    )}
                  </div>

                  {/* Budget Summary */}
                  <div>
                    <p className="font-bold text-gray-700 mb-1 flex items-center gap-1">
                      <span>💰</span> งบประมาณ:
                    </p>
                    <p className="font-semibold text-gray-900 bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-200">
                      {budgetType === "none" || budget === undefined
                        ? "ไม่จำกัดงบประมาณ"
                        : `ไม่เกิน ${budget} บาท`}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-[#6B7280] space-y-1">
                  <p className="font-medium text-gray-500">ยังไม่ได้เลือกเงื่อนไข</p>
                  <p className="text-[11px] text-gray-400">
                    เลือกวัตถุดิบ ประเภท หรือรสชาติที่คุณต้องการได้เลย
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Selected final choice banner if user picked */}
        {finalChoice && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-center space-y-2 shadow-xs animate-in fade-in">
            <span className="text-3xl">🎉</span>
            <h3 className="text-lg font-bold text-emerald-900">
              มื้อนี้เลือก: {finalChoice.name}!
            </h3>
            <p className="text-sm text-emerald-700">
              ราคาประมาณ {finalChoice.price} บาท • ขอให้อร่อยกับมื้อนี้นะครับ
            </p>
            <button
              type="button"
              onClick={() => setFinalChoice(null)}
              className="text-xs text-emerald-800 underline font-semibold mt-1"
            >
              เลือกเมนูอื่น
            </button>
          </div>
        )}
      </main>

      {/* ==================================================
          FLOATING FIXED CTA BUTTON
      ================================================== */}
      {!isResultOpen && !detailMenu && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-[360px] md:w-[380px] z-50 pointer-events-auto [bottom:calc(16px+env(safe-area-inset-bottom,0px))] sm:[bottom:24px] animate-in fade-in">
          <button
            type="button"
            onClick={handleRecommend}
            disabled={loading}
            aria-label="มื้อนี้เอาเมนูอะไรดี"
            className={`w-full py-4 px-6 rounded-2xl text-white font-extrabold text-base sm:text-lg shadow-xl border border-white/20 transition-all duration-200 flex items-center justify-center gap-2.5 min-h-[56px] ${
              loading
                ? "bg-gray-400 cursor-not-allowed opacity-90 shadow-none"
                : "bg-[#F4512C] hover:bg-[#E03E1A] active:scale-[0.98] shadow-orange-600/35 hover:shadow-orange-600/45 cursor-pointer"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                กำลังหาเมนูให้คุณ...
              </>
            ) : (
              <>
                <span className="text-2xl">🍽️</span>
                มื้อนี้เอาเมนูอะไรดี?
              </>
            )}
          </button>
        </div>
      )}

      {/* ==================================================
          RECOMMENDATION RESULT MODAL (z-[100])
      ================================================== */}
      {isResultOpen && recommendations.length > 0 && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 space-y-6 shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#1F2937] flex items-center gap-2">
                  <span>🍱</span> เมนูที่แนะนำสำหรับคุณ
                </h2>
                <p className="text-xs sm:text-sm text-[#6B7280]">
                  วิเคราะห์จากความต้องการของคุณแล้ว
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsResultOpen(false)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center font-bold text-lg transition-colors cursor-pointer"
                aria-label="ปิดผลลัพธ์"
              >
                ✕
              </button>
            </div>

            {/* Top 3 Recommendations List */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#1F2937] flex items-center gap-1.5">
                <span className="text-orange-500">★</span> เมนูตรงใจคุณที่สุด
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {recommendations.map((menu, idx) => (
                  <div
                    key={menu.id}
                    onClick={() => setDetailMenu(menu)}
                    className="p-4 rounded-2xl border border-orange-100 bg-orange-50/30 hover:bg-orange-50 hover:border-orange-300 transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-[#F4512C] text-white">
                          อันดับ {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-[#F4512C]">
                          {menu.price} ฿
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-[#1F2937] group-hover:text-[#F4512C] transition-colors pt-1">
                        {menu.name}
                      </h4>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {menu.categories.slice(0, 2).map((c) => (
                          <span
                            key={c}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-white border border-gray-200 text-gray-600 font-medium"
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

            {/* Discovery Menu Section */}
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
                      เมนูที่มีเอกลักษณ์แตกต่างและน่าจะถูกปากคุณ
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

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResultOpen(false)}
                className="w-full py-3 rounded-xl border border-gray-300 text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-colors cursor-pointer"
              >
                ปรับเงื่อนไขใหม่
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          MENU DETAIL MODAL (z-[100])
      ================================================== */}
      {detailMenu && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-gray-100">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-[#F4512C]">
                  รายละเอียดเมนู
                </span>
                <h3 className="text-xl font-extrabold text-[#1F2937] mt-1">
                  {detailMenu.name}
                </h3>
              </div>
              <span className="text-lg font-extrabold text-[#F4512C] bg-orange-50 px-3 py-1 rounded-xl border border-orange-200">
                {detailMenu.price} ฿
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-bold text-gray-500 mb-1">🧺 วัตถุดิบ:</p>
                <div className="flex flex-wrap gap-1.5">
                  {detailMenu.ingredients.map((ing) => (
                    <span
                      key={ing}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 text-xs font-medium"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-gray-500 mb-1">🍳 หมวดหมู่ & รสชาติ:</p>
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
                    <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-medium">
                      เนื้อสัมผัส: {detailMenu.texture}
                    </span>
                  )}
                </div>
              </div>

              {detailMenu.reasons && detailMenu.reasons.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1">🎯 เหตุผลที่แนะนำ:</p>
                  <ul className="list-disc list-inside text-xs text-gray-700 space-y-1 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
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
                className="w-full py-3 rounded-xl bg-[#F4512C] hover:bg-[#E03E1A] text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
              >
                เอาเมนูนี้เลย 🍽️
              </button>
              <button
                type="button"
                onClick={() => setDetailMenu(null)}
                className="w-full py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold text-sm hover:bg-gray-100 transition-colors cursor-pointer"
              >
                ย้อนกลับ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          FOOTER
      ================================================== */}
      <footer className="mt-auto border-t border-gray-200 bg-white py-6 text-center text-xs text-[#6B7280]">
        <div className="max-w-4xl mx-auto px-4 space-y-1">
          <p className="font-semibold text-gray-800">
            MueNee (มื้อนี้) • Personalized Food Recommendation System
          </p>
          <p>“ไม่ต้องรู้ชื่อเมนู แค่บอกว่าอยากกินแบบไหน”</p>
        </div>
      </footer>
    </div>
  );
}
