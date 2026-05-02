"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

import type { RegisterUser } from "@/modules/consulting-clients/services/types/register-user-types"
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
    accessorKey: "submittedAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Registration Date" />
    ),
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {format(new Date(row.getValue("submittedAt")), "dd/MM/yyyy HH:mm", {
          locale: vi,
        })}
      </span>
    ),
    enableSorting: true,
    sortingFn: "datetime",
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <DataTableRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
]
