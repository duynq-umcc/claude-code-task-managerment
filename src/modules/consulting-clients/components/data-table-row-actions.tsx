"use client"

import type { Row } from "@tanstack/react-table"
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { RegisterUser } from "@/modules/consulting-clients/services/types/register-user-types"
import { ConsultingDetailSheet } from "./consulting-detail-sheet"
import { ConsultingEditSheet } from "./consulting-edit-sheet"
import { ConsultingDeleteDialog } from "./consulting-delete-dialog"

interface DataTableRowActionsProps {
  row: Row<RegisterUser>
  onRefresh?: () => Promise<void>
}

export function DataTableRowActions({ row, onRefresh }: DataTableRowActionsProps) {
  const user = row.original

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted cursor-pointer"
        >
          <MoreHorizontal />
          <span className="sr-only">Mở menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <ConsultingDetailSheet user={user} />

        <ConsultingEditSheet user={user} onUserUpdated={onRefresh} />

        <DropdownMenuSeparator />

        <ConsultingDeleteDialog user={user} onUserDeleted={onRefresh} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
