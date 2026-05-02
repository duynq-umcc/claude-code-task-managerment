"use client"

import { User } from "firebase/auth"
import { useEffect, useState } from "react"
import { auth } from "@/lib/firebase/client"

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      setUser(authUser)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return { user, loading }
}
