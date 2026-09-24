import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getPersonalizedRecommendations } from "@/lib/recommendation"

export async function GET() {
  const session = await auth()
  const userId = session?.user?.id

  try {
    const menus = await getPersonalizedRecommendations(userId)
    return NextResponse.json({ success: true, recommendations: menus })
  } catch (error) {
    console.error("Error fetching personalized recommendations", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
