import "server-only"
import { adminDb } from "@/lib/firebase/admin"
import type { EmailAutoReplyConfig } from "./types/email-types"

const CONFIG_ID = "consulting_clients_auto_reply"
const CONFIG_COLLECTION = "email_config"

const DEFAULT_CONFIG: EmailAutoReplyConfig = {
  id: CONFIG_ID,
  enabled: false,
  subject: "Cảm ơn bạn đã đăng ký tư vấn!",
  body: `Kính chào {{fullName}},

Cảm ơn bạn đã gửi yêu cầu tư vấn. Chúng tôi đã nhận được thông tin và sẽ liên hệ với bạn trong thời gian sớm nhất.

Thông tin của bạn:
- Họ tên: {{fullName}}
- Email: {{email}}
- Số điện thoại: {{phone}}
- Nội dung: {{content}}

Trân trọng,
Claude Code Task Managerment`,
  accentColor: "#3b82f6",
}

export async function getAutoReplyConfigAdmin(): Promise<EmailAutoReplyConfig> {
  try {
    const db = adminDb()
    const snap = await db.collection(CONFIG_COLLECTION).doc(CONFIG_ID).get()
    if (snap.exists) {
      const data = snap.data()!
      return {
        id: CONFIG_ID,
        enabled: data.enabled ?? false,
        subject: data.subject ?? DEFAULT_CONFIG.subject,
        body: data.body ?? DEFAULT_CONFIG.body,
        accentColor: data.accentColor ?? DEFAULT_CONFIG.accentColor,
        updatedAt: data.updatedAt ?? undefined,
      }
    }
  } catch (err) {
    console.error("[getAutoReplyConfigAdmin] Firestore read error:", err)
    throw err // Re-throw — don't silently fall back
  }
  // Document doesn't exist yet — use default but flag it
  console.warn("[getAutoReplyConfigAdmin] No config found in Firestore, using default. Auto-reply is DISABLED.")
  return { ...DEFAULT_CONFIG }
}

export async function saveAutoReplyConfigAdmin(
  config: Omit<EmailAutoReplyConfig, "id">
): Promise<void> {
  try {
    const db = adminDb()
    await db
      .collection(CONFIG_COLLECTION)
      .doc(CONFIG_ID)
      .set(
        {
          ...config,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )
    console.log(`[saveAutoReplyConfigAdmin] Saved. enabled=${config.enabled}`)
  } catch (err) {
    console.error("[saveAutoReplyConfigAdmin] Firestore write error:", err)
    throw err
  }
}

export async function testAutoReply(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const config = await getAutoReplyConfigAdmin()
    const result = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/api/email/auto-reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "Người dùng Test",
        email,
        phone: "0901234567",
        content: "Đây là email test auto-reply.",
      }),
    })
    const data = await result.json()
    return data
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error"
    console.error("[testAutoReply]", error)
    return { success: false, error }
  }
}
