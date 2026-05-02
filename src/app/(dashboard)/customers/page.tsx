"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { columns } from "@/modules/customers/components/columns"
import { DataTable } from "@/modules/customers/components/data-table"
import { CustomerStatCards } from "@/modules/customers/components/customer-stat-cards"
import { getCustomers } from "@/modules/customers/services/customer-services"
import { customerMockData } from "@/modules/customers/services/customer-mock-data"
import type { Customer } from "@/modules/customers/services/types/customer-types"

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(customerMockData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const list = await getCustomers()
        setCustomers(list)
      } catch (error) {
        console.error("Failed to load customers:", error)
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [])

  const handleRefresh = async () => {
    try {
      const list = await getCustomers()
      setCustomers(list)
    } catch (error) {
      console.error("Failed to refresh customers:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading customers...</div>
      </div>
    )
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col gap-2 px-4 md:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Manage and nurture your customer relationships with a powerful CRM.
        </p>
      </div>

      {/* Mobile view placeholder */}
      <div className="md:hidden px-4 md:px-6">
        <div className="flex items-center justify-center h-96 border rounded-lg bg-muted/20">
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold mb-2">Customers Dashboard</h3>
            <p className="text-muted-foreground">
              Please use a larger screen to view the full customers interface.
            </p>
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden h-full flex-1 flex-col space-y-6 px-4 md:px-6 md:flex">
        {/* Stats Cards */}
        <CustomerStatCards customers={customers} />

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Management</CardTitle>
            <CardDescription>
              View, filter, and manage all your customers in one place
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable
              data={customers}
              columns={columns}
              onCustomerCreated={handleRefresh}
              onCustomerUpdated={handleRefresh}
              onCustomerDeleted={handleRefresh}
            />
          </CardContent>
        </Card>
      </div>
    </>
  )
}
