import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { sendEmailWithTemplate } from "@/lib/email"
import { getAutoReplyConfigAdmin } from "@/modules/email/services/email-config-service-admin"
import { logEmailServer } from "@/modules/email/services/email-log-service"
import { logEmailApiCall } from "@/modules/email/services/email-api-log-service"

const TriggerSchema = z.object({
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  content: z.string(),
})

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function interpolate(template: string, data: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => escapeHtml(data[key] ?? `{{${key}}}`))
}

async function doLog(
  to: string,
  subject: string,
  type: "auto_reply",
  status: "sent" | "failed",
  fullName: string,
  error?: string
) {
  try {
    await logEmailServer({ to, fullName, subject, type, status, error })
  } catch (err) {
    console.error("[logEmailServer] Failed to write to Firestore:", err)
  }
}

async function doApiLog(payload: Parameters<typeof logEmailApiCall>[0]) {
  try {
    await logEmailApiCall(payload)
  } catch (err) {
    console.error("[logEmailApiCall] Failed:", err)
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.clone().json()

  try {
    const parsed = TriggerSchema.safeParse(rawBody)

    if (!parsed.success) {
      const body = { success: false, error: "Dữ liệu không hợp lệ." }
      const response = NextResponse.json(body, { status: 400 })
      doApiLog({
        endpoint: "/api/email/auto-reply/trigger",
        method: "POST",
        statusCode: 400,
        requestBody: rawBody,
        responseBody: body,
      })
      return response
    }

    const { fullName, email, phone, content } = parsed.data

    let config
    try {
      config = await getAutoReplyConfigAdmin()
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      const body = { success: false, error: `Không đọc được cấu hình auto-reply: ${error}` }
      const response = NextResponse.json(body, { status: 500 })
      doApiLog({
        endpoint: "/api/email/auto-reply/trigger",
        method: "POST",
        statusCode: 500,
        requestBody: rawBody,
        error: body.error,
      })
      return response
    }

    if (!config.enabled) {
      const body = { success: true, skipped: true, reason: "Auto-reply disabled" }
      const response = NextResponse.json(body)
      doApiLog({
        endpoint: "/api/email/auto-reply/trigger",
        method: "POST",
        statusCode: 200,
        requestBody: rawBody,
        responseBody: body,
      })
      return response
    }

    const bodyInterpolated = interpolate(config.body, { fullName, email, phone, content })

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

    doLog(
      email,
      config.subject,
      "auto_reply",
      result.success ? "sent" : "failed",
      fullName,
      result.error
    )

    const status = result.success ? 200 : 500
    const response = NextResponse.json(result, { status })
    doApiLog({
      endpoint: "/api/email/auto-reply/trigger",
      method: "POST",
      statusCode: status,
      requestBody: rawBody,
      responseBody: result as unknown as Record<string, unknown>,
    })
    return response
  } catch (err) {
    const error = err as Error
    const body = { success: false, error: error.message }
    const response = NextResponse.json(body, { status: 500 })
    doApiLog({
      endpoint: "/api/email/auto-reply/trigger",
      method: "POST",
      statusCode: 500,
      requestBody: rawBody,
      error: error.message,
    })
    return response
  }
}
