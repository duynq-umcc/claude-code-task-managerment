import { z } from "zod"

export const EmailAutoReplyConfigSchema = z.object({
  id: z.string(),
  enabled: z.boolean(),
  subject: z.string(),
  body: z.string(),
  accentColor: z.string().default("#3b82f6"),
  updatedAt: z.string().optional(),
})

export type EmailAutoReplyConfig = z.infer<typeof EmailAutoReplyConfigSchema>

export interface EmailLog {
  id: string
  to: string
  fullName?: string
  subject: string
  type: "auto_reply" | "manual"
  status: "sent" | "failed"
  sentAt: string
  error?: string
}
