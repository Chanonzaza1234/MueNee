import { getMenus } from "@/lib/excel";

export async function GET() {
    try {
        const menus = getMenus();

        return Response.json({
            success: true,
            count: menus.length,
            menus: menus.slice(0, 5),
        });
    } catch (error) {
        console.error(error);

        return Response.json(
            {
                success: false,
                message: "ไม่สามารถอ่านข้อมูลจาก Excel ได้",
            },
            { status: 500 }
        );
    }
}