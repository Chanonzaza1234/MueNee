import { prisma } from "./prisma";
import { Menu } from "./excel";


export async function getMenusFromDb(): Promise<Menu[]> {
  const menus = await prisma.menu.findMany({
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
      categories: {
        include: {
          category: true,
        },
      },
      flavors: {
        include: {
          flavor: true,
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  return menus.map((menu) => ({
    id: menu.id,
    name: menu.name,
    ingredients: menu.ingredients.map((mi) => mi.ingredient.name),
    categories: menu.categories.map((mc) => mc.category.name),
    flavors: menu.flavors.map((mf) => mf.flavor.name),
    texture: menu.texture,
    price: menu.price,
  }));
}
