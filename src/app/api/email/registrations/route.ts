import { NextRequest, NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase/admin"

function parseTimestamp(value: unknown): string {
  if (!value) return new Date().toISOString()
  if (typeof value === "string") return value
  if (typeof value === "number") return new Date(value).toISOString()
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>
    if ("seconds" in obj && "nanoseconds" in obj) {
      return new Date((obj.seconds as number) * 1000).toISOString()
    }
    if ("toDate" in value && typeof (value as { toDate: unknown }).toDate === "function") {
      return (value as { toDate: () => Date }).toDate().toISOString()
    }
  }
  return String(value)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") ?? undefined
    const page = parseInt(searchParams.get("page") ?? "1", 10)
    const limit = parseInt(searchParams.get("limit") ?? "20", 10)
    const offset = (page - 1) * limit

    const col = adminDb().collection("register_users")
    const snapshot = await col.orderBy("createdAt", "desc").get()

    let items = snapshot.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        fullName: data.fullName ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        content: data.content ?? "",
        createdAt: parseTimestamp(data.createdAt),
        submittedAt: parseTimestamp(data.submittedAt),
      }
    })

    if (search) {
      const q = search.toLowerCase()
      items = items.filter(
        (item) =>
          item.fullName.toLowerCase().includes(q) ||
          item.email.toLowerCase().includes(q) ||
          item.phone.includes(q)
      )
    }

    const total = items.length
    items = items.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (err) {
    const error = err as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
