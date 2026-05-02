"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { columns } from "@/modules/consulting-clients/components/columns"
import { DataTable } from "@/modules/consulting-clients/components/data-table"
import { ConsultingStatCards } from "@/modules/consulting-clients/components/consulting-stat-cards"
import { getRegisterUsers } from "@/modules/consulting-clients/services/consulting-client-services"
import { registerUserMockData } from "@/modules/consulting-clients/services/register-user-mock-data"
import type { RegisterUser } from "@/modules/consulting-clients/services/types/register-user-types"

export default function ConsultingClientsPage() {
  const [users, setUsers] = useState<RegisterUser[]>(registerUserMockData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRegisterUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleRefresh = async () => {
    try {
      const list = await getRegisterUsers()
      setUsers(list)
    } catch (error) {
      console.error("Failed to refresh:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading data...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 px-4 lg:px-6">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">
          Consulting Clients
        </h1>
        <p className="text-muted-foreground">
          Manage and track consulting client registrations.
        </p>
      </div>

      {/* Stats Cards */}
      <ConsultingStatCards users={users} />

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registration List</CardTitle>
          <CardDescription>
            View, edit, and delete client consultation registrations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={users}
            columns={columns}
            onUserCreated={handleRefresh}
            onUserUpdated={handleRefresh}
            onUserDeleted={handleRefresh}
          />
        </CardContent>
      </Card>
    </div>
  )
}
