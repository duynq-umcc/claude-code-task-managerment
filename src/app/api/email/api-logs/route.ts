import { NextRequest, NextResponse } from "next/server"
import { getEmailApiLogsAdmin, deleteEmailApiLog } from "@/modules/email/services/email-api-log-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") ?? undefined
    const page = parseInt(searchParams.get("page") ?? "1", 10)
    const limit = parseInt(searchParams.get("limit") ?? "50", 10)
    const offset = (page - 1) * limit

    const result = await getEmailApiLogsAdmin({ search, offset, limit })

    return NextResponse.json({
      success: true,
      data: result.items,
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    })
  } catch (err) {
    const error = err as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu tham số id" }, { status: 400 })
    }
    const ok = await deleteEmailApiLog(id)
    return NextResponse.json({ success: ok })
  } catch (err) {
    const error = err as Error
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
