"use client"

import { useEffect, useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Eye, Mail, Phone, User, FileText, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { columns } from "@/modules/consulting-clients/components/columns"
import { DataTable } from "@/modules/consulting-clients/components/data-table"
import { ConsultingStatCards } from "@/modules/consulting-clients/components/consulting-stat-cards"
import { getRegisterUsers } from "@/modules/consulting-clients/services/consulting-client-services"
import { registerUserMockData } from "@/modules/consulting-clients/services/register-user-mock-data"
import type { RegisterUser } from "@/modules/consulting-clients/services/types/register-user-types"

export default function ConsultingClientsPage() {
  const [users, setUsers] = useState<RegisterUser[]>(registerUserMockData)
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<RegisterUser | null>(null)

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
            onRowClick={setSelectedUser}
          />
        </CardContent>
      </Card>

      {/* Row-click detail sheet */}
      <Sheet open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <SheetContent className="overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Chi tiết khách hàng tư vấn
            </SheetTitle>
            <SheetDescription>
              Thông tin đăng ký tư vấn của{" "}
              <span className="font-medium text-foreground">{selectedUser?.fullName}</span>
            </SheetDescription>
          </SheetHeader>

          {selectedUser && (
            <div className="flex flex-col gap-0 rounded-lg border">
              <DetailRow
                icon={User}
                label="Họ và tên"
                value={<span className="font-semibold">{selectedUser.fullName}</span>}
              />
              <Separator />
              <DetailRow
                icon={Mail}
                label="Email"
                value={
                  <a
                    href={`mailto:${selectedUser.email}`}
                    className="text-primary hover:underline break-all"
                  >
                    {selectedUser.email}
                  </a>
                }
              />
              <Separator />
              <DetailRow
                icon={Phone}
                label="Số điện thoại"
                value={
                  <a href={`tel:${selectedUser.phone}`} className="text-primary hover:underline">
                    {selectedUser.phone}
                  </a>
                }
              />
              <Separator />
              <DetailRow
                icon={Calendar}
                label="Ngày đăng ký"
                value={format(new Date(selectedUser.createdAt), "dd/MM/yyyy — HH:mm", {
                  locale: vi,
                })}
              />
              <Separator />
              <div className="p-4">
                <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  Nội dung cần tư vấn
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedUser.content}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <div className="flex flex-1 flex-col gap-0.5">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-sm font-medium leading-snug">{value}</span>
      </div>
    </div>
  )
}
