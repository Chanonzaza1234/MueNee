import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

type ExcelRow = {
    id?: number;
    name?: string;
    ingredients?: string;
    categories?: string;
    flavors?: string;
    texture?: string;
    price?: number;
};

export type Menu = {
    id: number;
    name: string;
    ingredients: string[];
    categories: string[];
    flavors: string[];
    texture: string | null;
    price: number;
};

export function getMenus(): Menu[] {
    const filePath = path.join(process.cwd(), "data", "menus.xlsx");

    const file = fs.readFileSync(filePath);

    const workbook = XLSX.read(file, {
        type: "buffer",
    });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);

    return rows.map((row) => ({
        id: Number(row.id),
        name: String(row.name || ""),
        ingredients: String(row.ingredients || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),

        categories: String(row.categories || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),

        flavors: String(row.flavors || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),

        texture: String(row.texture || ""),
        price: Number(row.price || 0),
    }));
}