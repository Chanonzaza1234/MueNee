import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "MueNee (มื้อนี้) - ไม่ต้องรู้ชื่อเมนู แค่บอกว่าอยากกินแบบไหน",
  description:
    "Personalized Food Recommendation System ระบบช่วยเลือกเมนูอาหารตามวัตถุดิบ ประเภท รสชาติ และงบประมาณของคุณ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th" className={`${prompt.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F7F7F7] text-[#1F2937]">
        {children}
      </body>
    </html>
  );
}
