import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      )
    }

    const { menuId, price } = await request.json()

    if (!menuId) {
      return NextResponse.json(
        { success: false, message: "Menu ID is required" },
        { status: 400 }
      )
    }

    // สร้าง Order (ประวัติ) ใหม่ โดยมียอดรวมตามราคาเมนู
    const order = await prisma.order.create({
      data: {
        userId: session.user.id,
        totalAmount: price || 0,
        items: {
          create: {
            menuId: Number(menuId),
            quantity: 1,
          }
        }
      }
    })

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (error) {
    console.error("Save history error:", error)
    return NextResponse.json(
      { success: false, message: "Failed to save history" },
      { status: 500 }
    )
  }
}
