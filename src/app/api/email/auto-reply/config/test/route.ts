import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { sendEmailWithTemplate } from "@/lib/email"
import { getAutoReplyConfigAdmin } from "@/modules/email/services/email-config-service-admin"

const TestSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = TestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues.map((e) => e.message).join("; ") },
        { status: 400 }
      )
    }

    const { email } = parsed.data

    let config
    try {
      config = await getAutoReplyConfigAdmin()
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      console.error("[testAutoReply] Config read error:", error)
      return NextResponse.json(
        { success: false, error: `Không đọc được cấu hình: ${error}` },
        { status: 500 }
      )
    }

    const bodyInterpolated = config.body.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      const map: Record<string, string> = {
        fullName: "Người dùng Test",
        email,
        phone: "0901234567",
        content: "Đây là email test auto-reply.",
      }
      return map[key] ?? `{{${key}}}`
    })

    const result = await sendEmailWithTemplate(
      {
        to: email,
        subject: config.subject,
      },
      {
        title: config.subject,
        body: bodyInterpolated.replace(/\n/g, "<br>"),
        accentColor: config.accentColor,
      }
    )

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error"
    console.error("[testAutoReply] Error:", error)
    return NextResponse.json({ success: false, error: error }, { status: 500 })
  }
}
