import { getMenusFromDb } from "@/lib/menu";

import {
    RecommendationInput,
    filterByBudget,
    scoreMenu,
    selectTopRecommendations,
    selectDiscoveryMenu,
} from "@/lib/recommendation";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const input: RecommendationInput = {
            ingredients: Array.isArray(body.ingredients)
                ? body.ingredients
                : [],

            categories: Array.isArray(body.categories)
                ? body.categories
                : [],

            flavors: Array.isArray(body.flavors)
                ? body.flavors
                : [],

            budget:
                body.budget === undefined ||
                    body.budget === null ||
                    body.budget === ""
                    ? undefined
                    : Number(body.budget),
        };

        // ตรวจสอบงบประมาณ
        if (
            input.budget !== undefined &&
            (!Number.isFinite(input.budget) || input.budget <= 0)
        ) {
            return Response.json(
                {
                    success: false,
                    message: "กรุณาระบุงบประมาณให้ถูกต้อง",
                },
                { status: 400 }
            );
        }

        // อ่านข้อมูลเมนูจาก Excel
        const menus = await getMenusFromDb();

        // Filter เมนูตามงบ
        const budgetMenus = filterByBudget(
            menus,
            input.budget
        );

        // ไม่พบเมนู
        if (budgetMenus.length === 0) {
            return Response.json(
                {
                    success: false,
                    message: "ไม่พบเมนูที่ตรงกับเงื่อนไข",
                },
                { status: 200 }
            );
        }

        // คำนวณคะแนนทุกเมนู
        const scoredMenus = budgetMenus.map((menu) =>
            scoreMenu(menu, input)
        );

        // เลือก Top 3
        const recommendations = selectTopRecommendations(
            scoredMenus,
            3
        );

        // เลือก Discovery
        const discovery = selectDiscoveryMenu(
            scoredMenus,
            recommendations
        );

        return Response.json({
            success: true,
            recommendations,
            discovery,
        });
    } catch (error) {
        console.error("Recommendation API Error:", error);

        return Response.json(
            {
                success: false,
                message: "เกิดข้อผิดพลาดในการแนะนำเมนู",
            },
            { status: 500 }
        );
    }
}