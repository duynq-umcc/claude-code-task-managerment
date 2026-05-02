"use client"

import type { Table } from "@tanstack/react-table"
import { RefreshCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DataTableViewOptions } from "./data-table-view-options"
import { AddCustomerModal } from "./add-customer-modal"

import { statuses, sources } from "@/modules/customers/services/customer-mock-data"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onCustomerCreated?: () => Promise<void>
}

export function DataTableToolbar<TData>({
  table,
  onCustomerCreated,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const statusFilter = table.getColumn("status")?.getFilterValue() as string | undefined
  const sourceFilter = table.getColumn("source")?.getFilterValue() as string | undefined

  const handleStatusChange = (value: string) => {
    const column = table.getColumn("status")
    if (value === "all") {
      column?.setFilterValue(undefined)
    } else {
      column?.setFilterValue(value)
    }
  }

  const handleSourceChange = (value: string) => {
    const column = table.getColumn("source")
    if (value === "all") {
      column?.setFilterValue(undefined)
    } else {
      column?.setFilterValue(value)
    }
  }

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Status Filter */}
        <Select
          value={statusFilter || "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">All Status</SelectItem>
            {statuses.map((status) => (
              <SelectItem
                key={status.value}
                value={status.value}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  {status.icon && (
                    <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  )}
                  {status.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Source Filter */}
        <Select
          value={sourceFilter || "all"}
          onValueChange={handleSourceChange}
        >
          <SelectTrigger className="w-full cursor-pointer">
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all" className="cursor-pointer">All Sources</SelectItem>
            {sources.map((source) => (
              <SelectItem
                key={source.value}
                value={source.value}
                className="cursor-pointer"
              >
                <div className="flex items-center">
                  {source.icon && (
                    <source.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  )}
                  {source.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search and Actions Section */}
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Search customers..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="w-[200px] lg:w-[300px] cursor-text"
          />
          <Button
            variant="outline"
            onClick={() => table.resetColumnFilters()}
            className="px-3 cursor-pointer"
            disabled={!isFiltered}
          >
            <RefreshCcw className="h-4 w-4" />
            <span className="hidden lg:block">Reset Filters</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <DataTableViewOptions table={table} />
          <AddCustomerModal onCustomerCreated={onCustomerCreated} />
        </div>
      </div>
    </div>
  )
}