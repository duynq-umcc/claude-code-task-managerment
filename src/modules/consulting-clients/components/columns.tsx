"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

import type { RegisterUser } from "@/modules/consulting-clients/services/types/register-user-types"
import { ConsultingDetailSheet } from "./consulting-detail-sheet"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"

export const columns: ColumnDef<RegisterUser>[] = [
  {
    id: "stt",
    accessorFn: (_, rowIndex) => rowIndex + 1,
    header: "No.",
    cell: ({ row }) => (
      <span className="font-medium text-muted-foreground">
        {row.id ? parseInt(row.id) + 1 : ""}
      </span>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 60,
  },
  {
    accessorKey: "fullName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Full Name" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("fullName")}</span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.getValue("email")}
      </span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "phone",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Phone Number" />
    ),
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("phone")}</span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "content",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Consultation Content" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground line-clamp-2 max-w-xs" title={row.getValue("content")}>
        {row.getValue("content")}
      </span>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Registration Date" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {format(new Date(row.getValue("createdAt")), "dd/MM/yyyy HH:mm", {
          locale: vi,
        })}
      </span>
    ),
    enableSorting: true,
    sortingFn: "datetime",
  },
  {
    id: "detail",
    header: "",
    cell: ({ row }) => <RowDetailButton row={row} />,
    enableSorting: false,
    enableHiding: false,
    size: 50,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
]

function RowDetailButton({ row }: { row: { original: RegisterUser } }) {
  return (
    <ConsultingDetailSheet user={row.original}>
      <Button
        variant="ghost"
        size="sm"
        className="flex h-8 w-8 p-0 cursor-pointer"
        title="Xem chi tiết"
      >
        <Eye className="h-4 w-4" />
      </Button>
    </ConsultingDetailSheet>
  )
}
