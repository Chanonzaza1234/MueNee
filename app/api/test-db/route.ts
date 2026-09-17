import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const menuCount = await prisma.menu.count();

    const menus = await prisma.menu.findMany({
      take: 5,
      orderBy: {
        id: "asc",
      },
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
    });

    return Response.json({
      success: true,
      message: "เชื่อมต่อ PostgreSQL สำเร็จ",
      menuCount,
      menus,
    });
  } catch (error) {
    console.error("Database Error:", error);

    return Response.json(
      {
        success: false,
        message: "เชื่อมต่อ PostgreSQL ไม่สำเร็จ",
      },
      { status: 500 }
    );
  }
}