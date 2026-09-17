import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

type ExcelRow = {
  id?: number;
  name?: string;
  ingredients?: string;
  categories?: string;
  flavors?: string;
  texture?: string;
  price?: number;
};

function splitValues(value: string | undefined): string[] {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function main() {
  console.log("🌱 Starting seed...");

  const filePath = path.join(
    process.cwd(),
    "data",
    "menus.xlsx"
  );

  if (!fs.existsSync(filePath)) {
    throw new Error(`ไม่พบไฟล์ ${filePath}`);
  }

  const file = fs.readFileSync(filePath);

  const workbook = XLSX.read(file, {
    type: "buffer",
  });

  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  const rows = XLSX.utils.sheet_to_json<ExcelRow>(
    worksheet
  );

  console.log(`📄 Found ${rows.length} menus in Excel`);

  for (const row of rows) {
    const menuId = Number(row.id);
    const name = String(row.name || "").trim();

    if (!menuId || !name) {
      continue;
    }

    const ingredients = splitValues(row.ingredients);
    const categories = splitValues(row.categories);
    const flavors = splitValues(row.flavors);

    const menu = await prisma.menu.upsert({
      where: {
        id: menuId,
      },
      update: {
        name,
        texture: row.texture?.trim() || null,
        price: Number(row.price || 0),
      },
      create: {
        id: menuId,
        name,
        texture: row.texture?.trim() || null,
        price: Number(row.price || 0),
      },
    });

    // ลบความสัมพันธ์เดิมก่อนสร้างใหม่
    await prisma.menuIngredient.deleteMany({
      where: {
        menuId: menu.id,
      },
    });

    await prisma.menuCategory.deleteMany({
      where: {
        menuId: menu.id,
      },
    });

    await prisma.menuFlavor.deleteMany({
      where: {
        menuId: menu.id,
      },
    });

    // Ingredients
    for (const ingredientName of ingredients) {
      const ingredient = await prisma.ingredient.upsert({
        where: {
          name: ingredientName,
        },
        update: {},
        create: {
          name: ingredientName,
        },
      });

      await prisma.menuIngredient.create({
        data: {
          menuId: menu.id,
          ingredientId: ingredient.id,
        },
      });
    }

    // Categories
    for (const categoryName of categories) {
      const category = await prisma.category.upsert({
        where: {
          name: categoryName,
        },
        update: {},
        create: {
          name: categoryName,
        },
      });

      await prisma.menuCategory.create({
        data: {
          menuId: menu.id,
          categoryId: category.id,
        },
      });
    }

    // Flavors
    for (const flavorName of flavors) {
      const flavor = await prisma.flavor.upsert({
        where: {
          name: flavorName,
        },
        update: {},
        create: {
          name: flavorName,
        },
      });

      await prisma.menuFlavor.create({
        data: {
          menuId: menu.id,
          flavorId: flavor.id,
        },
      });
    }

    console.log(`✅ Imported: ${name}`);
  }

  console.log("🎉 Seed completed!");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });