import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase/client"
import { EmailAutoReplyConfig, EmailLog } from "./types/email-types"

const CONFIG_ID = "consulting_clients_auto_reply"
const CONFIG_COLLECTION = "email_config"
const LOG_COLLECTION = "email_logs"

export async function getAutoReplyConfig(): Promise<EmailAutoReplyConfig> {
  try {
    const snap = await getDoc(doc(db, CONFIG_COLLECTION, CONFIG_ID))
    if (snap.exists()) {
      return snap.data() as EmailAutoReplyConfig
    }
  } catch {
    // fallback
  }
  return {
    id: CONFIG_ID,
    enabled: false,
    subject: "Cảm ơn bạn đã đăng ký tư vấn!",
    body: `Kính chào {{fullName}},\n\nCảm ơn bạn đã gửi yêu cầu tư vấn. Chúng tôi đã nhận được thông tin và sẽ liên hệ với bạn trong thời gian sớm nhất.\n\nThông tin của bạn:\n- Họ tên: {{fullName}}\n- Email: {{email}}\n- Số điện thoại: {{phone}}\n- Nội dung: {{content}}\n\nTrân trọng,\nClaude Code Task Managerment`,
    accentColor: "#3b82f6",
  }
}

export async function saveAutoReplyConfig(
  config: Omit<EmailAutoReplyConfig, "id" | "updatedAt">
): Promise<void> {
  await setDoc(
    doc(db, CONFIG_COLLECTION, CONFIG_ID),
    {
      ...config,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  )
}

export async function logEmail(log: Omit<EmailLog, "id" | "sentAt">): Promise<void> {
  await addDoc(collection(db, LOG_COLLECTION), {
    ...log,
    sentAt: serverTimestamp(),
  })
}

function parseTimestamp(value: unknown): string {
  if (typeof value === "string") return value
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>
    if ("seconds" in obj && "nanoseconds" in obj) {
      return new Date((obj.seconds as number) * 1000).toISOString()
    }
  }
  if (value) return String(value)
  return new Date().toISOString()
}

export async function getEmailLogs(): Promise<EmailLog[]> {
  try {
    const q = query(collection(db, LOG_COLLECTION), orderBy("sentAt", "desc"))
    const snapshot = await getDocs(q)
    return snapshot.docs.map((d) => {
      const data = d.data() as Record<string, unknown>
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
    })
  } catch {
    return []
  }
}
