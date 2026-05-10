"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { CheckCircle2, XCircle, Clock, Mail, User, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Button } from "@/components/ui/button"
import type { EmailLog } from "../services/types/email-types"

function formatDate(iso: string): string {
  try {
    return format(new Date(iso), "dd/MM/yyyy HH.mm", { locale: vi })
  } catch {
    return iso
  }
}

export const emailHistoryColumns: ColumnDef<EmailLog>[] = [
  {
    id: "stt",
    accessorFn: (_, rowIndex) => rowIndex + 1,
    header: "STT",
    cell: ({ row }) => (
      <span className="text-muted-foreground text-sm">{row.index + 1}</span>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 60,
  },
  {
    accessorKey: "sentAt",
    header: "Thời gian gửi",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="text-sm">{formatDate(row.getValue("sentAt"))}</span>
      </div>
    ),
    enableSorting: true,
    size: 160,
  },
  {
    accessorKey: "to",
    header: "Email người nhận",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 min-w-0">
        <Mail className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
        <span className="truncate text-sm font-mono">{row.getValue("to")}</span>
      </div>
    ),
    enableSorting: false,
    size: 240,
  },
  {
    accessorKey: "fullName",
    header: "Họ và tên người nhận",
    cell: ({ row }) => {
      const name = row.getValue("fullName") as string | undefined
      if (!name) return <span className="text-muted-foreground text-sm">—</span>
      return (
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate">{name}</span>
        </div>
      )
    },
    enableSorting: false,
    size: 200,
  },
  {
    accessorKey: "subject",
    header: "Tiêu đề",
    cell: ({ row }) => (
      <span className="text-sm truncate block max-w-[280px]" title={row.getValue("subject")}>
        {row.getValue("subject")}
      </span>
    ),
    enableSorting: false,
    size: 280,
  },
  {
    accessorKey: "type",
    header: "Loại",
    cell: ({ row }) => {
      const type = row.getValue("type") as string
      return (
        <Badge
          variant={type === "auto_reply" ? "default" : "secondary"}
          className="text-xs whitespace-nowrap"
        >
          {type === "auto_reply" ? "Tự động" : "Thủ công"}
        </Badge>
      )
    },
    enableSorting: true,
    size: 120,
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const error = row.original.error

      if (status === "sent") {
        return (
          <div className="flex items-center gap-1.5 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">Thành công</span>
          </div>
        )
      }

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5 text-red-600 cursor-help">
              <XCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Lỗi</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs" side="left">
            <div className="space-y-1.5">
              <p className="font-semibold text-xs">Chi tiết lỗi</p>
              {error ? (
                <>
                  <p className="text-xs text-muted-foreground">Mã lỗi:</p>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded block">{error}</code>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Không có chi tiết.</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      )
    },
    enableSorting: true,
    size: 140,
  },
  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => {
      return (
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation()
          }}
          data-delete-id={row.original.id}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="sr-only">Xóa</span>
        </Button>
      )
    },
    enableSorting: false,
    enableHiding: false,
    size: 80,
  },
]
