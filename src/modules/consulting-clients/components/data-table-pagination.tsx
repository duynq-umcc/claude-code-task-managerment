"use client"

import type { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function DataTablePagination<TData>({ table }: { table: Table<TData> }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4">
      <div className="text-sm text-muted-foreground">
        Showing {table.getRowModel().rows.length} of{" "}
        {table.getFilteredRowModel().rows.length} records
      </div>

      <div className="flex items-center gap-4">
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(v) => table.setPageSize(Number(v))}
        >
          <SelectTrigger className="w-28 cursor-pointer">
            <SelectValue />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((size) => (
              <SelectItem key={size} value={`${size}`} className="cursor-pointer">
                {size} rows
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="cursor-pointer"
          >
            Prev
          </Button>
          <span className="px-2 text-sm">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="cursor-pointer"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
