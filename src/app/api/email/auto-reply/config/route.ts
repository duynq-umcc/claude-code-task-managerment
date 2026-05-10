import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAutoReplyConfigAdmin, saveAutoReplyConfigAdmin } from "@/modules/email/services/email-config-service-admin"

const UpdateConfigSchema = z.object({
  enabled: z.boolean(),
  subject: z.string().min(1, "Tiêu đề không được để trống"),
  body: z.string().min(1, "Nội dung không được để trống"),
  accentColor: z.string().default("#3b82f6"),
})

export async function GET() {
  try {
    const config = await getAutoReplyConfigAdmin()
    return NextResponse.json({ success: true, data: config })
  } catch (err) {
    const error = err as Error
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = UpdateConfigSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues.map((e) => e.message).join("; ") },
        { status: 400 }
      )
    }

    await saveAutoReplyConfigAdmin(parsed.data)

    return NextResponse.json({ success: true })
  } catch (err) {
    const error = err as Error
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
