import type { EmailLog } from "./types/email-types"

export interface EmailLogsResponse {
  success: boolean
  data: EmailLog[]
  total: number
  page: number
  limit: number
  totalPages: number
  error?: string
}

export interface EmailLogsParams {
  type?: "auto_reply" | "manual"
  status?: "sent" | "failed"
  search?: string
  page?: number
  limit?: number
}

export async function getEmailLogsApi(params: EmailLogsParams = {}): Promise<EmailLogsResponse> {
  const sp = new URLSearchParams()
  if (params.type) sp.set("type", params.type)
  if (params.status) sp.set("status", params.status)
  if (params.search) sp.set("search", params.search)
  if (params.page) sp.set("page", String(params.page))
  if (params.limit) sp.set("limit", String(params.limit))

  const res = await fetch(`/api/email/logs?${sp.toString()}`, {
    cache: "no-store",
  })
  return res.json()
}

export async function deleteEmailLogApi(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/email/logs?id=${encodeURIComponent(id)}`, { method: "DELETE" })
  return res.json()
}

export async function clearAllEmailLogsApi(): Promise<{ success: boolean; deleted?: number }> {
  const res = await fetch("/api/email/logs?clearAll=true", { method: "DELETE" })
  return res.json()
}
