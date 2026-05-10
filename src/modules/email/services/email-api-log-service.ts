import "server-only"
import { FieldValue } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase/admin"
import type { EmailApiLog } from "./types/email-api-types"

const API_LOG_COLLECTION = "email_api_logs"

export async function logEmailApiCall(
  log: Omit<EmailApiLog, "id" | "timestamp">
): Promise<void> {
  try {
    const data: Record<string, unknown> = { ...log, timestamp: FieldValue.serverTimestamp() }
    for (const key of Object.keys(data)) {
      if (data[key] === undefined) delete data[key]
    }
    await adminDb().collection(API_LOG_COLLECTION).add(data)
  } catch (err) {
    console.error("[logEmailApiCall] Firestore write error:", err)
    throw err
  }
}

export async function getEmailApiLogsAdmin(options: {
  search?: string
  offset?: number
  limit?: number
} = {}): Promise<{ items: EmailApiLog[]; total: number }> {
  const { search, offset = 0, limit = 50 } = options
  const col = adminDb().collection(API_LOG_COLLECTION)
  const snapshot = await col.orderBy("timestamp", "desc").get()

  function parseTimestamp(value: unknown): string {
    if (!value) return new Date().toISOString()
    if (typeof value === "string") return value
    if (typeof value === "number") return new Date(value).toISOString()
    if (typeof value === "object") {
      const obj = value as Record<string, unknown>
      if ("seconds" in obj && "nanoseconds" in obj) {
        return new Date((obj.seconds as number) * 1000).toISOString()
      }
      if ("toDate" in value && typeof (value as { toDate: unknown }).toDate === "function") {
        return (value as { toDate: () => Date }).toDate().toISOString()
      }
    }
    return String(value)
  }

  let items = snapshot.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      endpoint: String(data.endpoint ?? ""),
      method: (data.method as EmailApiLog["method"]) ?? "POST",
      statusCode: data.statusCode as number,
      requestBody: data.requestBody ? JSON.parse(JSON.stringify(data.requestBody)) : undefined,
      responseBody: data.responseBody ? JSON.parse(JSON.stringify(data.responseBody)) : undefined,
      error: data.error ? String(data.error) : undefined,
      emailLogId: data.emailLogId ? String(data.emailLogId) : undefined,
      timestamp: parseTimestamp(data.timestamp),
    } as EmailApiLog
  })

  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (item) =>
        item.endpoint.toLowerCase().includes(q) ||
        item.method.toLowerCase().includes(q) ||
        (item.requestBody && JSON.stringify(item.requestBody).toLowerCase().includes(q))
    )
  }

  const total = items.length
  items = items.slice(offset, offset + limit)
  return { items, total }
}

export async function deleteEmailApiLog(id: string): Promise<boolean> {
  try {
    await adminDb().collection(API_LOG_COLLECTION).doc(id).delete()
    return true
  } catch {
    return false
  }
}
