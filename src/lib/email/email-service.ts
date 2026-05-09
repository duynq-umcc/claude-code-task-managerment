import nodemailer, { Transporter } from "nodemailer"
import { EmailOptions, EmailResult, EmailConfig } from "./email-types"

function getConfig(): EmailConfig {
  const host = process.env.EMAIL_SMTP_HOST ?? "smtp.gmail.com"
  const port = parseInt(process.env.EMAIL_SMTP_PORT ?? "587", 10)
  const secure = port === 465

  return {
    host,
    port,
    secure,
    user: process.env.EMAIL_SMTP_USER ?? "",
    pass: process.env.EMAIL_SMTP_PASS ?? "",
    from: process.env.EMAIL_FROM ?? process.env.EMAIL_SMTP_USER ?? "",
  }
}

function createTransporter(config: EmailConfig): Transporter {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  })
}

export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  const config = getConfig()

  if (!config.user || !config.pass) {
    return {
      success: false,
      error: "Cấu hình email (EMAIL_SMTP_USER / EMAIL_SMTP_PASS) chưa được thiết lập.",
    }
  }

  const transporter = createTransporter(config)

  const toAddresses = Array.isArray(options.to) ? options.to.join(", ") : options.to
  const ccAddresses = options.cc
    ? Array.isArray(options.cc) ? options.cc.join(", ") : options.cc
    : undefined
  const bccAddresses = options.bcc
    ? Array.isArray(options.bcc) ? options.bcc.join(", ") : options.bcc
    : undefined

  try {
    const info = await transporter.sendMail({
      from: options.from ?? config.from,
      to: toAddresses,
      cc: ccAddresses,
      bcc: bccAddresses,
      replyTo: options.replyTo,
      subject: options.subject,
      text: options.text,
      html: options.html,
    })

    return {
      success: true,
      messageId: info.messageId,
    }
  } catch (err) {
    const error = err as Error
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function sendEmailWithTemplate(
  options: Omit<EmailOptions, "html" | "text">,
  template: {
    title: string
    body: string
    footer?: string
    accentColor?: string
  }
): Promise<EmailResult> {
  const {
    title,
    body,
    footer = "© " + new Date().getFullYear() + " Claude Code Task Managerment",
    accentColor = "#3b82f6",
  } = template

  const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:ui-sans-serif,system-ui,-apple-system,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;width:100%;">
          <!-- Header -->
          <tr>
            <td style="background:${accentColor};padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${title}</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;color:#374151;font-size:15px;line-height:1.6;">
              ${body}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:16px 32px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:12px;text-align:center;">
              ${footer}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const text = `${title}\n\n${body.replace(/<[^>]+>/g, "")}\n\n${footer}`

  return sendEmail({ ...options, html, text })
}
