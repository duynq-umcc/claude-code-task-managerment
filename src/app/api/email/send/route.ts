import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { sendEmail, sendEmailWithTemplate } from "@/lib/email"

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
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = SendEmailSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues.map((e) => e.message).join("; "),
        },
        { status: 400 }
      )
    }

    const data = parsed.data

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
        return NextResponse.json(
          { success: false, error: "Cần cung cấp nội dung email (html hoặc text)." },
          { status: 400 }
        )
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

    return NextResponse.json(result, { status: result.success ? 200 : 500 })
  } catch (err) {
    const error = err as Error
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
