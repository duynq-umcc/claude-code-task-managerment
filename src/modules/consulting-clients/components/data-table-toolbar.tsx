"use client"

import type { Table } from "@tanstack/react-table"
import { RefreshCcw, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { AddConsultingClientSheet } from "./add-consulting-client-sheet"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onUserCreated?: () => Promise<void>
}

export function DataTableToolbar<TData>({
  table,
  onUserCreated,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email..."
            value={
              (table.getColumn("fullName")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("fullName")?.setFilterValue(event.target.value)
            }
            className="ps-9 w-[200px] sm:w-[280px] cursor-text"
          />
        </div>
        {isFiltered && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.resetColumnFilters()}
            className="cursor-pointer px-3"
          >
            <RefreshCcw className="h-4 w-4" />
            <span className="ms-2 hidden sm:inline">Clear</span>
          </Button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <DataTableViewOptions table={table} />
        <AddConsultingClientSheet onUserCreated={onUserCreated} />
      </div>
    </div>
  )
}