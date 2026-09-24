import { getMenusFromDb } from "@/lib/menu";

import {
    RecommendationInput,
    filterByBudget,
    scoreMenu,
    selectTopRecommendations,
    selectDiscoveryMenu,
    applyHardFilters,
    applyRelaxedFilters,
    ScoredMenu
} from "@/lib/recommendation";

export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));

        const input: RecommendationInput = {
            ingredients: Array.isArray(body.ingredients) ? body.ingredients : [],
            categories: Array.isArray(body.categories) ? body.categories : [],
            flavors: Array.isArray(body.flavors) ? body.flavors : [],
            budget: body.budget === undefined || body.budget === null || body.budget === "" 
                ? undefined 
                : Number(body.budget),
        };

        // ตรวจสอบงบประมาณ
        if (input.budget !== undefined && (!Number.isFinite(input.budget) || input.budget <= 0)) {
            return Response.json(
                { success: false, message: "กรุณาระบุงบประมาณให้ถูกต้อง" },
                { status: 400 }
            );
        }

        // อ่านข้อมูลเมนูจากฐานข้อมูล
        const menus = await getMenusFromDb();

        // 1. กรองด้วยงบประมาณก่อน
        const budgetMenus = filterByBudget(menus, input.budget);

        if (budgetMenus.length === 0) {
            return Response.json(
                { success: true, recommendations: [], message: "ไม่พบเมนูที่ตรงกับเงื่อนไข" },
                { status: 200 }
            );
        }

        // 2. ใช้ Relaxed Filter (OR logic) เพื่อให้ได้ "แนวทาง" ตามที่ผู้ใช้ต้องการ
        const filteredMenus = applyRelaxedFilters(budgetMenus, input);
        
        let recommendations: ScoredMenu[] = [];
        let discovery: ScoredMenu | null = null;

        if (filteredMenus.length > 0) {
            // ให้คะแนนตามสัดส่วนที่ตรงกัน (ตรงมากได้คะแนนมาก)
            const scoredMenus = filteredMenus.map((menu) => scoreMenu(menu, input));
            recommendations = selectTopRecommendations(scoredMenus, 3);
            discovery = selectDiscoveryMenu(scoredMenus, recommendations);
        }

        return Response.json({
            success: true,
            recommendations,
            discovery,
        });
    } catch (error) {
        console.error("Recommendation API Error:", error);
        return Response.json(
            { success: false, message: "เกิดข้อผิดพลาดในการแนะนำเมนู กรุณาลองใหม่อีกครั้ง" },
            { status: 500 }
        );
    }
}