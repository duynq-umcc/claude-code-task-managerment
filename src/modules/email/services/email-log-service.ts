import "server-only"
import { FieldValue, type DocumentSnapshot, type Query } from "firebase-admin/firestore"
import { adminDb } from "@/lib/firebase/admin"
import type { EmailLog } from "./types/email-types"

const LOG_COLLECTION = "email_logs"

export async function logEmailServer(
  log: Omit<EmailLog, "id" | "sentAt">
): Promise<void> {
  const data: Record<string, unknown> = { ...log, sentAt: FieldValue.serverTimestamp() }
  // Remove undefined fields — Firestore does not accept undefined values
  for (const key of Object.keys(data)) {
    if (data[key] === undefined) delete data[key]
  }
  await adminDb().collection(LOG_COLLECTION).add(data)
}

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

function mapDoc(d: DocumentSnapshot): EmailLog {
  const data = d.data()!
  return {
    id: d.id,
    to: String(data.to ?? ""),
    fullName: data.fullName ? String(data.fullName) : undefined,
    subject: String(data.subject ?? ""),
    type: (data.type as "auto_reply" | "manual") ?? "manual",
    status: (data.status as "sent" | "failed") ?? "failed",
    sentAt: parseTimestamp(data.sentAt),
    error: data.error ? String(data.error) : undefined,
  }
}

interface GetEmailLogsOptions {
  type?: string | null
  status?: string | null
  search?: string | null
  offset?: number
  limit?: number
}

interface GetEmailLogsResult {
  items: EmailLog[]
  total: number
}

export async function getEmailLogsAdmin(
  options: GetEmailLogsOptions = {}
): Promise<GetEmailLogsResult> {
  const { type, status, search, offset = 0, limit = 50 } = options
  const col = adminDb().collection(LOG_COLLECTION)

  // Firestore composite index required for (type == AND status == AND orderBy sentAt)
  // We build query conditionally to avoid index errors
  let query: Query
  if (type && status) {
    query = col.where("type", "==", type).where("status", "==", status).orderBy("sentAt", "desc")
  } else if (type) {
    query = col.where("type", "==", type).orderBy("sentAt", "desc")
  } else if (status) {
    query = col.where("status", "==", status).orderBy("sentAt", "desc")
  } else {
    query = col.orderBy("sentAt", "desc")
  }

  const snapshot = await query.get()
  let items = snapshot.docs.map(mapDoc)

  if (search) {
    const q = search.toLowerCase()
    items = items.filter(
      (item) =>
        item.to.toLowerCase().includes(q) ||
        (item.fullName?.toLowerCase().includes(q)) ||
        item.subject.toLowerCase().includes(q)
    )
  }

  const total = items.length
  items = items.slice(offset, offset + limit)

  return { items, total }
}

export async function deleteEmailLog(id: string): Promise<boolean> {
  try {
    await adminDb().collection(LOG_COLLECTION).doc(id).delete()
    return true
  } catch {
    return false
  }
}

export async function deleteAllEmailLogs(): Promise<number> {
  const snapshot = await adminDb().collection(LOG_COLLECTION).get()
  const batch = adminDb().batch()
  snapshot.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
  return snapshot.size
}
