"use client"

import type { Column } from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DataTableColumnHeaderProps<TData, TValue>
  extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>
  title: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("flex items-center", className)}>{title}</div>
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <Button
        variant="ghost"
        size="sm"
        className="-ms-3 h-8 cursor-pointer px-2 hover:bg-accent"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        <span>{title}</span>
        {column.getIsSorted() === "desc" ? (
          <ArrowDown className="ms-1.5 h-3.5 w-3.5 shrink-0" />
        ) : column.getIsSorted() === "asc" ? (
          <ArrowUp className="ms-1.5 h-3.5 w-3.5 shrink-0" />
        ) : (
          <ChevronsUpDown className="ms-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
        )}
      </Button>
    </div>
  )
}
