"use client"

import { useState } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Eye, Mail, Phone, User, FileText, Calendar } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"

import type { RegisterUser } from "@/modules/consulting-clients/services/types/register-user-types"

interface ConsultingDetailSheetProps {
  user: RegisterUser
  trigger?: React.ReactNode
}

export function ConsultingDetailSheet({ user, trigger }: ConsultingDetailSheetProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      {trigger ? (
        <SheetTitle className="sr-only">Chi tiết khách hàng tư vấn</SheetTitle>
      ) : (
        <SheetTitle className="sr-only">Chi tiết khách hàng tư vấn</SheetTitle>
      )}
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Chi tiết khách hàng tư vấn
          </SheetTitle>
          <SheetDescription>
            Thông tin đăng ký tư vấn của{" "}
            <span className="font-medium text-foreground">{user.fullName}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-0 rounded-lg border">
          <DetailRow
            icon={User}
            label="Họ và tên"
            value={<span className="font-semibold">{user.fullName}</span>}
          />
          <Separator />
          <DetailRow
            icon={Mail}
            label="Email"
            value={
              <a
                href={`mailto:${user.email}`}
                className="text-primary hover:underline break-all"
              >
                {user.email}
              </a>
            }
          />
          <Separator />
          <DetailRow
            icon={Phone}
            label="Số điện thoại"
            value={
              <a href={`tel:${user.phone}`} className="text-primary hover:underline">
                {user.phone}
              </a>
            }
          />
          <Separator />
          <DetailRow
            icon={Calendar}
            label="Ngày đăng ký"
            value={format(new Date(user.createdAt), "dd/MM/yyyy — HH:mm", {
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
              {user.content}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
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
