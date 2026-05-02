"use client"

import type { Row } from "@tanstack/react-table"
import { MoreHorizontal, Eye, Pencil, Trash2, FileText, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { customerSchema } from "@/modules/customers/services/types/customer-types"
import { EditCustomerModal } from "./edit-customer-modal"
import { DeleteCustomerDialog } from "./delete-customer-dialog"

interface DataTableRowActionsProps<TData> {
  row: Row<TData>
  onCustomerUpdated?: () => Promise<void>
  onCustomerDeleted?: () => Promise<void>
}

export function DataTableRowActions<TData>({
  row,
  onCustomerUpdated,
  onCustomerDeleted,
}: DataTableRowActionsProps<TData>) {
  const parsed = customerSchema.safeParse(row.original)
  if (!parsed.success) {
    return null
  }
  const customer = parsed.data

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-muted cursor-pointer"
        >
          <MoreHorizontal />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem className="cursor-pointer">
          <Eye className="mr-2 h-4 w-4" />
          View Profile
        </DropdownMenuItem>

        {/* Edit — opens modal */}
        <EditCustomerModal
          customer={customer}
          onCustomerUpdated={onCustomerUpdated}
          trigger={
            <span className="flex items-center cursor-pointer">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Customer
            </span>
          }
        />

        <DropdownMenuItem className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          View Orders
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <Mail className="mr-2 h-4 w-4" />
          Send Email
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DeleteCustomerDialog
          customer={customer}
          onCustomerDeleted={onCustomerDeleted}
          trigger={
            <span className="flex items-center text-destructive cursor-pointer">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </span>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
