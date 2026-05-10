import { NextRequest, NextResponse } from "next/server"
import { getEmailLogsAdmin, deleteEmailLog, deleteAllEmailLogs } from "@/modules/email/services/email-log-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const status = searchParams.get("status")
    const search = searchParams.get("search")
    const page = parseInt(searchParams.get("page") ?? "1", 10)
    const limit = parseInt(searchParams.get("limit") ?? "50", 10)
    const offset = (page - 1) * limit

    const logs = await getEmailLogsAdmin({ type, status, search, offset, limit })

    return NextResponse.json({
      success: true,
      data: logs.items,
      total: logs.total,
      page,
      limit,
      totalPages: Math.ceil(logs.total / limit),
    })
  } catch (err) {
    const error = err as Error
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const clearAll = searchParams.get("clearAll")

    if (clearAll === "true") {
      const count = await deleteAllEmailLogs()
      return NextResponse.json({ success: true, deleted: count })
    }

    if (id) {
      const ok = await deleteEmailLog(id)
      return NextResponse.json({ success: ok, deleted: ok ? 1 : 0 })
    }

    return NextResponse.json(
      { success: false, error: "Thiếu tham số id hoặc clearAll" },
      { status: 400 }
    )
  } catch (err) {
    const error = err as Error
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
