import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { sendEmail, sendEmailWithTemplate } from "@/lib/email"
import { logEmailServer } from "@/modules/email/services/email-log-service"
import { logEmailApiCall } from "@/modules/email/services/email-api-log-service"

const SendEmailSchema = z.object({
  to: z.string().min(1, "Người nhận không được để trống").or(z.array(z.string().min(1)).min(1)),
  subject: z.string().min(1, "Tiêu đề không được để trống"),
  html: z.string().optional(),
  text: z.string().optional(),
  plainBody: z.string().optional(),
  templateTitle: z.string().optional(),
  templateAccentColor: z.string().optional(),
  from: z.string().optional(),
  replyTo: z.string().optional(),
  cc: z.string().optional(),
  bcc: z.string().optional(),
  fullName: z.string().optional(),
})

async function doLog(
  to: string,
  subject: string,
  type: "manual" | "auto_reply",
  status: "sent" | "failed",
  fullName?: string,
  error?: string
) {
  try {
    await logEmailServer({ to, fullName, subject, type, status, error })
  } catch (err) {
    console.error("[logEmailServer] Failed to write email log to Firestore:", err)
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
    const parsed = SendEmailSchema.safeParse(rawBody)

    if (!parsed.success) {
      const body = {
        success: false,
        error: parsed.error.issues.map((e) => e.message).join("; "),
      }
      const response = NextResponse.json(body, { status: 400 })
      doApiLog({
        endpoint: "/api/email/send",
        method: "POST",
        statusCode: 400,
        requestBody: rawBody,
        responseBody: body,
      })
      return response
    }

    const data = parsed.data
    const toAddresses = Array.isArray(data.to)
      ? data.to
      : data.to.split(",").map((s) => s.trim())
    const toString = toAddresses.join(", ")

    let result
    if (data.templateTitle) {
      result = await sendEmailWithTemplate(
        {
          to: data.to as string | string[],
          subject: data.subject,
          from: data.from,
          replyTo: data.replyTo,
          cc: data.cc,
          bcc: data.bcc,
        },
        {
          title: data.templateTitle,
          body: data.plainBody ?? "",
          accentColor: data.templateAccentColor,
        }
      )
    } else {
      if (!data.html && !data.text) {
        const body = { success: false, error: "Cần cung cấp nội dung email (html hoặc text)." }
        const response = NextResponse.json(body, { status: 400 })
        doApiLog({
          endpoint: "/api/email/send",
          method: "POST",
          statusCode: 400,
          requestBody: rawBody,
          responseBody: body,
        })
        return response
      }
      result = await sendEmail({
        to: data.to as string | string[],
        subject: data.subject,
        html: data.html,
        text: data.text,
        from: data.from ?? undefined,
        replyTo: data.replyTo ?? undefined,
        cc: data.cc ?? undefined,
        bcc: data.bcc ?? undefined,
      })
    }

    doLog(
      toString,
      data.subject,
      "manual",
      result.success ? "sent" : "failed",
      data.fullName,
      result.error
    )

    const status = result.success ? 200 : 500
    const response = NextResponse.json(result, { status })
    doApiLog({
      endpoint: "/api/email/send",
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
      endpoint: "/api/email/send",
      method: "POST",
      statusCode: 500,
      requestBody: rawBody,
      error: error.message,
    })
    return response
  }
}
