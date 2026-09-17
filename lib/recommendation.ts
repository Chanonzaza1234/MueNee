import { Menu } from "./excel";

export type RecommendationInput = {
    ingredients: string[];
    categories: string[];
    flavors: string[];
    budget?: number;
};

export type ScoredMenu = Menu & {
    score: number;
    reasons: string[];
};

/* =========================
   Budget Filter
========================= */

export function filterByBudget(
  menus: Menu[],
  budget?: number
): Menu[] {
  if (budget === undefined) {
    return menus;
  }

  return menus.filter((menu) => menu.price <= budget);
}

/* =========================
   Ingredient Score
========================= */

export function calculateIngredientScore(
    menu: Menu,
    selectedIngredients: string[]
): number {
    if (selectedIngredients.length === 0) {
        return 40;
    }

    const matchedIngredients = selectedIngredients.filter(
        (ingredient) => menu.ingredients.includes(ingredient)
    );

    const score =
        (matchedIngredients.length / selectedIngredients.length) * 40;

    return Math.round(score);
}

/* =========================
   Category Score
========================= */

export function calculateCategoryScore(
    menu: Menu,
    selectedCategories: string[]
): number {
    if (selectedCategories.length === 0) {
        return 25;
    }

    const matchedCategories = selectedCategories.filter(
        (category) => menu.categories.includes(category)
    );

    const score =
        (matchedCategories.length / selectedCategories.length) * 25;

    return Math.round(score);
}

/* =========================
   Flavor Score
========================= */

export function calculateFlavorScore(
    menu: Menu,
    selectedFlavors: string[]
): number {
    if (selectedFlavors.length === 0) {
        return 20;
    }

    const matchedFlavors = selectedFlavors.filter(
        (flavor) => menu.flavors.includes(flavor)
    );

    const score =
        (matchedFlavors.length / selectedFlavors.length) * 20;

    return Math.round(score);
}

/* =========================
   Budget Score
========================= */

export function calculateBudgetScore(
    menu: Menu,
    budget?: number
): number {
    if (budget === undefined) {
        return 15;
    }

    return menu.price <= budget ? 15 : 0;
}

/* =========================
   Score Menu
========================= */

export function scoreMenu(
    menu: Menu,
    input: RecommendationInput
): ScoredMenu {
    const ingredientScore = calculateIngredientScore(
        menu,
        input.ingredients
    );

    const categoryScore = calculateCategoryScore(
        menu,
        input.categories
    );

    const flavorScore = calculateFlavorScore(
        menu,
        input.flavors
    );

    const budgetScore = calculateBudgetScore(
        menu,
        input.budget
    );

    const score =
        ingredientScore +
        categoryScore +
        flavorScore +
        budgetScore;

    const reasons: string[] = [];

    /* Ingredient Reason */

    if (input.ingredients.length > 0) {
        const matchedIngredients = input.ingredients.filter(
            (ingredient) => menu.ingredients.includes(ingredient)
        );

        if (matchedIngredients.length > 0) {
            reasons.push(
                `มีวัตถุดิบที่เลือก: ${matchedIngredients.join(", ")}`
            );
        }
    }

    /* Category Reason */

    if (input.categories.length > 0) {
        const matchedCategories = input.categories.filter(
            (category) => menu.categories.includes(category)
        );

        if (matchedCategories.length > 0) {
            reasons.push(
                `เป็น${matchedCategories.join(", ")}`
            );
        }
    }

    /* Flavor Reason */

    if (input.flavors.length > 0) {
        const matchedFlavors = input.flavors.filter(
            (flavor) => menu.flavors.includes(flavor)
        );

        if (matchedFlavors.length > 0) {
            reasons.push(
                `ตรงกับรสชาติ: ${matchedFlavors.join(", ")}`
            );
        }
    }

    /* Budget Reason */

    if (input.budget === undefined) {
        reasons.push("ไม่จำกัดงบประมาณ");
    } else if (menu.price <= input.budget) {
        reasons.push("อยู่ในงบ");
    }

    return {
        ...menu,
        score,
        reasons,
    };
}

/* =========================
   Top Recommendations
========================= */

export function selectTopRecommendations(
    menus: ScoredMenu[],
    count: number = 3
): ScoredMenu[] {
    if (menus.length <= count) {
        return [...menus].sort(
            () => Math.random() - 0.5
        );
    }

    const sortedMenus = [...menus].sort(
        (a, b) => b.score - a.score
    );

    const highestScore = sortedMenus[0].score;

    const candidates = sortedMenus.filter(
        (menu) => menu.score >= highestScore - 15
    );

    const shuffled = [...candidates].sort(
        () => Math.random() - 0.5
    );

    return shuffled.slice(0, count);
}

/* =========================
   Discovery Menu
========================= */

export function selectDiscoveryMenu(
    menus: ScoredMenu[],
    topRecommendations: ScoredMenu[]
): ScoredMenu | null {
    if (topRecommendations.length === 0) {
        return null;
    }

    const topIds = new Set(
        topRecommendations.map((menu) => menu.id)
    );

    const candidates = menus.filter(
        (menu) => !topIds.has(menu.id)
    );

    if (candidates.length === 0) {
        return null;
    }

    /* คำนวณความแตกต่างจาก Top 3 */

    const calculateDifference = (
        menu: ScoredMenu,
        referenceMenus: ScoredMenu[]
    ): number => {
        let totalDifference = 0;

        for (const reference of referenceMenus) {
            const ingredientOverlap =
                menu.ingredients.filter((item: string) =>
                    reference.ingredients.includes(item)
                ).length;

            const categoryOverlap =
                menu.categories.filter((item: string) =>
                    reference.categories.includes(item)
                ).length;

            const flavorOverlap =
               menu.flavors.filter((item: string) =>
                    reference.flavors.includes(item)
                ).length;

            const ingredientDifference =
                menu.ingredients.length === 0
                    ? 1
                    : 1 -
                    ingredientOverlap /
                    Math.max(
                        menu.ingredients.length,
                        reference.ingredients.length
                    );

            const categoryDifference =
                menu.categories.length === 0
                    ? 1
                    : 1 -
                    categoryOverlap /
                    Math.max(
                        menu.categories.length,
                        reference.categories.length
                    );

            const flavorDifference =
                menu.flavors.length === 0
                    ? 1
                    : 1 -
                    flavorOverlap /
                    Math.max(
                        menu.flavors.length,
                        reference.flavors.length
                    );

            const difference =
                ingredientDifference * 0.4 +
                categoryDifference * 0.35 +
                flavorDifference * 0.25;

            totalDifference += difference;
        }

        return (
            (totalDifference / referenceMenus.length) * 100
        );
    };

    /* Discovery Score */

    const discoveryCandidates = candidates.map((menu) => {
        const differenceScore = calculateDifference(
            menu,
            topRecommendations
        );

        const discoveryScore =
            menu.score * 0.7 +
            differenceScore * 0.3;

        return {
            menu,
            differenceScore,
            discoveryScore,
        };
    });

    /* เรียงคะแนน */

    discoveryCandidates.sort(
        (a, b) => b.discoveryScore - a.discoveryScore
    );

    const highestScore =
        discoveryCandidates[0].discoveryScore;

    /* สร้างกลุ่มคะแนนใกล้เคียงเพื่อให้ผลไม่ตายตัว */

    const pool = discoveryCandidates.filter(
        (item) =>
            item.discoveryScore >= highestScore - 10
    );

    const randomItem =
        pool[Math.floor(Math.random() * pool.length)];

    return randomItem.menu;
}