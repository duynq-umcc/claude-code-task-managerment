import type { EmailApiLog } from "./types/email-api-types"

export interface EmailApiLogsResponse {
  success: boolean
  data: EmailApiLog[]
  total: number
  page: number
  limit: number
  totalPages: number
  error?: string
}

export async function getEmailApiLogs(params: {
  search?: string
  page?: number
  limit?: number
}): Promise<EmailApiLogsResponse> {
  const sp = new URLSearchParams()
  if (params.search) sp.set("search", params.search)
  if (params.page) sp.set("page", String(params.page))
  if (params.limit) sp.set("limit", String(params.limit))

  const res = await fetch(`/api/email/api-logs?${sp.toString()}`, { cache: "no-store" })
  return res.json()
}

export async function deleteEmailApiLog(id: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/email/api-logs?id=${encodeURIComponent(id)}`, { method: "DELETE" })
  return res.json()
}
