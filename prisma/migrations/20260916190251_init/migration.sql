/*
  Warnings:

  - You are about to drop the column `createdAt` on the `menus` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `menus` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "menu_categories_categoryId_idx";

-- DropIndex
DROP INDEX "menu_categories_menuId_idx";

-- DropIndex
DROP INDEX "menu_flavors_flavorId_idx";

-- DropIndex
DROP INDEX "menu_flavors_menuId_idx";

-- DropIndex
DROP INDEX "menu_ingredients_ingredientId_idx";

-- DropIndex
DROP INDEX "menu_ingredients_menuId_idx";

-- DropIndex
DROP INDEX "menus_name_key";

-- AlterTable
ALTER TABLE "menus" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ALTER COLUMN "texture" DROP NOT NULL,
ALTER COLUMN "texture" DROP DEFAULT,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;
