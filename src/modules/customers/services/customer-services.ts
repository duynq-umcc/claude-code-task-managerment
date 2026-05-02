import { addDoc, collection, updateDoc, deleteDoc, getDocs, query, where } from "firebase/firestore"
import { getFirestoreCollection } from "@/lib/firebase/firestore-query"
import { customerMockData } from "./customer-mock-data"
import type { Customer } from "./types/customer-types"

export async function getCustomers(): Promise<Customer[]> {
  return getFirestoreCollection<Customer>("customers", customerMockData)
}

export interface CreateCustomerResult {
  id: string
  success: boolean
  error?: string
}

export async function createCustomer(customer: Customer): Promise<CreateCustomerResult> {
  try {
    const { db } = await import("@/lib/firebase/client")
    const docRef = await addDoc(collection(db, "customers"), customer)
    return { id: docRef.id, success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Failed to save customer to Firestore:", message)
    return { id: customer.id, success: false, error: message }
  }
}

export async function updateCustomer(customer: Customer): Promise<CreateCustomerResult> {
  try {
    const { db } = await import("@/lib/firebase/client")
    const snapshot = await getDocs(
      query(collection(db, "customers"), where("id", "==", customer.id))
    )
    if (!snapshot.empty) {
      await updateDoc(snapshot.docs[0].ref, customer)
    }
    return { id: customer.id, success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Failed to update customer:", message)
    return { id: customer.id, success: false, error: message }
  }
}

export async function deleteCustomer(customerId: string): Promise<CreateCustomerResult> {
  try {
    const { db } = await import("@/lib/firebase/client")
    const snapshot = await getDocs(
      query(collection(db, "customers"), where("id", "==", customerId))
    )
    if (!snapshot.empty) {
      await deleteDoc(snapshot.docs[0].ref)
    }
    return { id: customerId, success: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("Failed to delete customer:", message)
    return { id: customerId, success: false, error: message }
  }
}

export interface CustomerStats {
  total: number
  active: number
  inactive: number
  new: number
  prospecting: number
  totalRevenue: number
  avgRevenue: number
}

export function getCustomerStats(customers: Customer[]): CustomerStats {
  const total = customers.length
  const active = customers.filter((c) => c.status === "active").length
  const inactive = customers.filter((c) => c.status === "inactive").length
  const newCustomers = customers.filter((c) => c.status === "new").length
  const prospecting = customers.filter((c) => c.status === "prospecting").length
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0)
  const avgRevenue = total > 0 ? totalRevenue / total : 0

  return { total, active, inactive, new: newCustomers, prospecting, totalRevenue, avgRevenue }
}