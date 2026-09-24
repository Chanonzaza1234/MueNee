import { Menu } from "./excel";
import { prisma } from "@/lib/prisma";
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
   Hard & Relaxed Filters
========================= */

export function applyHardFilters(
  menus: Menu[],
  input: RecommendationInput
): Menu[] {
  let filtered = menus;

  if (input.ingredients.length > 0) {
    filtered = filtered.filter((menu) =>
      menu.ingredients.some((ing) => input.ingredients.includes(ing))
    );
  }

  if (input.categories.length > 0) {
    filtered = filtered.filter((menu) =>
      menu.categories.some((cat) => input.categories.includes(cat))
    );
  }

  return filtered;
}

export function applyRelaxedFilters(
  menus: Menu[],
  input: RecommendationInput
): Menu[] {
  const noFilters = input.ingredients.length === 0 && input.categories.length === 0 && input.flavors.length === 0;
  if (noFilters) return menus;

  return menus.filter((menu) => {
    const matchIng =
      input.ingredients.length > 0 &&
      menu.ingredients.some((ing) => 
        input.ingredients.some(i => ing.includes(i) || i.includes(ing))
      );
    const matchCat =
      input.categories.length > 0 &&
      menu.categories.some((cat) => 
        input.categories.some(c => cat.includes(c) || c.includes(cat))
      );
    const matchFlav =
      input.flavors.length > 0 &&
      menu.flavors.some((flav) => 
        input.flavors.some(f => flav.includes(f) || f.includes(flav))
      );

    return matchIng || matchCat || matchFlav;
  });
}

/* =========================
   Ingredient Score
========================= */

export function calculateIngredientScore(
    menu: Menu,
    selectedIngredients: string[]
): number {
    if (selectedIngredients.length === 0) {
        return 0; // ไม่มีคะแนนโบนัสถ้าไม่ได้เลือก
    }

    const matchedIngredients = selectedIngredients.filter(
        (ingredient) => menu.ingredients.some(ing => ing.includes(ingredient) || ingredient.includes(ing))
    );

    const score =
        (matchedIngredients.length / selectedIngredients.length) * 50; // น้ำหนักสูงสุด 50

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
        return 0;
    }

    const matchedCategories = selectedCategories.filter(
        (category) => menu.categories.some(cat => cat.includes(category) || category.includes(cat))
    );

    const score =
        (matchedCategories.length / selectedCategories.length) * 30; // น้ำหนัก 30

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
        return 0;
    }

    const matchedFlavors = selectedFlavors.filter(
        (flavor) => menu.flavors.some(f => f.includes(flavor) || flavor.includes(f))
    );

    const score =
        (matchedFlavors.length / selectedFlavors.length) * 30; // น้ำหนัก 30

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
        return 10;
    }

    // Budget ถูก Hard filter ไปแล้ว ดังนั้นถ้าผ่านเข้ามาได้จะได้ 10 คะแนนเต็ม
    return 10;
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
            (ingredient) => menu.ingredients.some(ing => ing.includes(ingredient) || ingredient.includes(ing))
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
            (category) => menu.categories.some(cat => cat.includes(category) || category.includes(cat))
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
            (flavor) => menu.flavors.some(f => f.includes(flavor) || flavor.includes(f))
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

/* =========================
   Personalized Recommendations (New)
========================= */

export async function getPersonalizedRecommendations(userId?: string) {
  const defaultMenus = async () => prisma.menu.findMany({
    take: 5,
    include: {
      flavors: { include: { flavor: true } },
      categories: { include: { category: true } },
      ingredients: { include: { ingredient: true } }
    }
  });

  if (!userId) return defaultMenus();

  const userOrders = await prisma.orderItem.findMany({
    where: { order: { userId } },
    include: {
      menu: {
        include: { 
          flavors: true,
          categories: true,
          ingredients: true
        }
      }
    }
  });

  if (userOrders.length === 0) return defaultMenus();

  // Calculate frequency maps for user's preferences
  const flavorFreq: Record<number, number> = {};
  const categoryFreq: Record<number, number> = {};
  const ingredientFreq: Record<number, number> = {};
  
  userOrders.forEach(item => {
    item.menu.flavors.forEach(mf => {
      flavorFreq[mf.flavorId] = (flavorFreq[mf.flavorId] || 0) + item.quantity;
    });
    item.menu.categories.forEach(mc => {
      categoryFreq[mc.categoryId] = (categoryFreq[mc.categoryId] || 0) + item.quantity;
    });
    item.menu.ingredients.forEach(mi => {
      ingredientFreq[mi.ingredientId] = (ingredientFreq[mi.ingredientId] || 0) + item.quantity;
    });
  });

  // Fetch all menus to score them
  const allMenus = await prisma.menu.findMany({
    include: {
      flavors: { include: { flavor: true } },
      categories: { include: { category: true } },
      ingredients: { include: { ingredient: true } }
    }
  });

  // Calculate a personalized score for each menu
  const scoredMenus = allMenus.map(menu => {
    let score = 0;
    menu.flavors.forEach(mf => { score += (flavorFreq[mf.flavorId] || 0) * 2; }); // Flavor has weight 2
    menu.categories.forEach(mc => { score += (categoryFreq[mc.categoryId] || 0) * 1.5; }); // Category weight 1.5
    menu.ingredients.forEach(mi => { score += (ingredientFreq[mi.ingredientId] || 0) * 1; }); // Ingredient weight 1
    
    return { menu, score };
  });

  // Sort by score descending and return top 5
  scoredMenus.sort((a, b) => b.score - a.score);
  
  // Filter out menus the user has already ordered recently to provide variety? 
  // Let's just return the highest scored ones.
  return scoredMenus.slice(0, 5).map(sm => sm.menu);
}