import {
  addDoc,
  collection,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore"
import { getFirestoreCollection } from "@/lib/firebase/firestore-query"
import { db } from "@/lib/firebase/client"
import { registerUserMockData } from "./register-user-mock-data"
import type { RegisterUser } from "./types/register-user-types"

function parseTimestamp(value: unknown): string {
  if (typeof value === "string") return value
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>
    if ("seconds" in obj && "nanoseconds" in obj) {
      return new Date((obj.seconds as number) * 1000).toISOString()
    }
    if (typeof obj.toDate === "function") {
      return (obj.toDate as () => Date).call(null).toISOString()
    }
  }
  if (value) return String(value)
  return new Date().toISOString()
}

function parseRegistrationDate(item: Record<string, unknown>): string {
  const createdAt = item.createdAt as unknown
  const submittedAt = item.submittedAt as unknown
  if (createdAt !== undefined && createdAt !== null) {
    return parseTimestamp(createdAt)
  }
  if (submittedAt !== undefined && submittedAt !== null) {
    return parseTimestamp(submittedAt)
  }
  return new Date().toISOString()
}

export async function getRegisterUsers(): Promise<RegisterUser[]> {
  const data = await getFirestoreCollection<RegisterUser>("register_users", registerUserMockData)
  return data.map((item) => {
    const raw = item as unknown as Record<string, unknown>
    return {
      ...item,
      createdAt: parseRegistrationDate(raw),
    }
  })
}

export interface ServiceResult {
  id: string
  success: boolean
  error?: string
}

function generateId(): string {
  const num = Math.floor(Math.random() * 9999) + 1000
  return `RC-${num}`
}

export async function createRegisterUser(
  user: Omit<RegisterUser, "id">
): Promise<ServiceResult> {
  try {
    await addDoc(collection(db, "register_users"), {
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      content: user.content,
      createdAt: serverTimestamp(),
      submittedAt: serverTimestamp(),
    })
    return { id: generateId(), success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Failed to create register user:", message)
    return { id: "", success: false, error: message }
  }
}

export async function updateRegisterUser(user: RegisterUser): Promise<ServiceResult> {
  try {
    const snapshot = await getDocs(
      query(collection(db, "register_users"), where("email", "==", user.email))
    )
    if (!snapshot.empty) {
      await updateDoc(snapshot.docs[0].ref, {
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        content: user.content,
      })
    }
    return { id: user.id, success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Failed to update register user:", message)
    return { id: user.id, success: false, error: message }
  }
}

export async function deleteRegisterUser(
  email: string
): Promise<ServiceResult> {
  try {
    const snapshot = await getDocs(
      query(collection(db, "register_users"), where("email", "==", email))
    )
    if (!snapshot.empty) {
      await deleteDoc(snapshot.docs[0].ref)
    }
    return { id: email, success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Failed to delete register user:", message)
    return { id: email, success: false, error: message }
  }
}

export interface ConsultingStats {
  total: number
  today: number
  withPhone: number
  phonePercent: number
  withContent: number
  contentPercent: number
}

export function getConsultingStats(users: RegisterUser[]): ConsultingStats {
  const now = new Date()
  const todayStr = now.toISOString().split("T")[0]

  const today = users.filter((u) => {
    const d = new Date(u.createdAt)
    return d.toISOString().split("T")[0] === todayStr
  }).length

  const withPhone = users.filter((u) => {
    return u.phone && u.phone.trim().length > 0
  }).length

  const withContent = users.filter((u) => {
    return u.content && u.content.trim().length > 0
  }).length

  const total = users.length

  return {
    total,
    today,
    withPhone,
    phonePercent: total > 0 ? Math.round((withPhone / total) * 100) : 0,
    withContent,
    contentPercent: total > 0 ? Math.round((withContent / total) * 100) : 0,
  }
}