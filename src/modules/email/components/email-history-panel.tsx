"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Loader2,
  RefreshCw,
  Search,
  History,
  Trash2,
  ChevronDown,
  Filter,
  X,
} from "lucide-react"
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { emailHistoryColumns } from "./email-history-columns"
import {
  getEmailLogsApi,
  deleteEmailLogApi,
  clearAllEmailLogsApi,
} from "../services/email-logs-api"
import type { EmailLog } from "../services/types/email-types"

interface EmailLogsApiResponse {
  success: boolean
  data: EmailLog[]
  total: number
  page: number
  limit: number
  totalPages: number
  error?: string
}

function StatCard({
  label,
  value,
  variant = "default",
}: {
  label: string
  value: number
  variant?: "default" | "success" | "error"
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-card">
      <div
        className={`text-2xl font-bold ${
          variant === "success"
            ? "text-green-600"
            : variant === "error"
            ? "text-red-600"
            : ""
        }`}
      >
        {value}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  )
}

type FilterType = "all" | "auto_reply" | "manual"
type FilterStatus = "all" | "sent" | "failed"

export function EmailHistoryPanel() {
  const [logs, setLogs] = useState<EmailLog[]>([])
  const [loading, setLoading] = useState(true)
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [columnVisibility] = useState<VisibilityState>({})
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all")
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [clearAllOpen, setClearAllOpen] = useState(false)
  const [clearing, setClearing] = useState(false)

  const loadLogs = useCallback(async (overrides?: { search?: string; type?: FilterType; status?: FilterStatus; page?: number }) => {
    setLoading(true)
    try {
      const searchVal = overrides?.search !== undefined ? overrides.search : globalFilter
      const typeVal = overrides?.type !== undefined ? overrides.type : filterType
      const statusVal = overrides?.status !== undefined ? overrides.status : filterStatus
      const pageVal = overrides?.page !== undefined ? overrides.page : page

      const params: Record<string, string> = { limit: "50" }
      if (searchVal.trim()) params.search = searchVal.trim()
      if (typeVal !== "all") params.type = typeVal
      if (statusVal !== "all") params.status = statusVal
      params.page = String(pageVal)

      const res: EmailLogsApiResponse = await getEmailLogsApi(params)
      if (res.success) {
        setLogs(res.data)
        setTotal(res.total)
        setTotalPages(res.totalPages)
      } else {
        toast.error(res.error || "Không thể tải lịch sử email.")
        setLogs([])
      }
    } catch {
      toast.error("Lỗi kết nối khi tải lịch sử email.")
    } finally {
      setLoading(false)
    }
  }, [globalFilter, filterType, filterStatus, page])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  function handleFilterChange(type?: FilterType, status?: FilterStatus) {
    if (type !== undefined) setFilterType(type)
    if (status !== undefined) setFilterStatus(status)
    setPage(1)
  }

  function handleSearchChange(val: string) {
    setGlobalFilter(val)
    setPage(1)
  }

  useEffect(() => {
    const t = setTimeout(() => {
      loadLogs({ search: globalFilter, type: filterType, status: filterStatus, page })
    }, 300)
    return () => clearTimeout(t)
  }, [globalFilter, filterType, filterStatus, page, loadLogs])

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await deleteEmailLogApi(id)
      if (res.success) {
        toast.success("Đã xóa bản ghi.")
        loadLogs()
      } else {
        toast.error("Không thể xóa bản ghi.")
      }
    } catch {
      toast.error("Lỗi kết nối khi xóa.")
    } finally {
      setDeletingId(null)
    }
  }

  async function handleClearAll() {
    setClearing(true)
    try {
      const res = await clearAllEmailLogsApi()
      if (res.success) {
        toast.success(`Đã xóa ${res.deleted} bản ghi.`)
        setClearAllOpen(false)
        loadLogs()
      } else {
        toast.error("Không thể xóa tất cả bản ghi.")
      }
    } catch {
      toast.error("Lỗi kết nối khi xóa.")
    } finally {
      setClearing(false)
    }
  }

  const stats = useMemo(() => {
    const totalCount = total
    const sent = logs.filter((l) => l.status === "sent").length
    const failed = logs.filter((l) => l.status === "failed").length
    const autoReply = logs.filter((l) => l.type === "auto_reply").length
    const manual = logs.filter((l) => l.type === "manual").length
    return { total: totalCount, sent, failed, autoReply, manual }
  }, [logs, total])

  const table = useReactTable({
    data: logs,
    columns: emailHistoryColumns,
    state: { sorting, columnVisibility, globalFilter },
    onSortingChange: setSorting,
    onColumnVisibilityChange: () => {},
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: { pagination: { pageSize: 50 } },
  })

  const currentPage = page

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard label="Tổng số gửi" value={stats.total} />
        <StatCard label="Thành công" value={stats.sent} variant="success" />
        <StatCard label="Thất bại" value={stats.failed} variant="error" />
        <StatCard label="Tự động" value={stats.autoReply} />
        <StatCard label="Thủ công" value={stats.manual} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1 flex-wrap w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-72 max-w-full">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm email, tên, tiêu đề..."
              value={globalFilter}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-9"
            />
            {globalFilter && (
              <button
                onClick={() => handleSearchChange("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Button
            variant={showFilters ? "secondary" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-3.5 w-3.5" />
            Bộ lọc
            {(filterType !== "all" || filterStatus !== "all") && (
              <span className="ml-1 h-2 w-2 rounded-full bg-blue-500" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-destructive hover:text-destructive"
            onClick={() => setClearAllOpen(true)}
            disabled={total === 0 || loading}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Xóa tất cả
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => loadLogs()} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Filter row */}
      {showFilters && (
        <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30">
          <span className="text-sm text-muted-foreground">Loại:</span>
          <Select
            value={filterType}
            onValueChange={(v) => handleFilterChange(v as FilterType)}
          >
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="auto_reply">Tự động</SelectItem>
              <SelectItem value="manual">Thủ công</SelectItem>
            </SelectContent>
          </Select>

          <span className="text-sm text-muted-foreground">Trạng thái:</span>
          <Select
            value={filterStatus}
            onValueChange={(v) => handleFilterChange(filterType, v as FilterStatus)}
          >
            <SelectTrigger className="w-36 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="sent">Thành công</SelectItem>
              <SelectItem value="failed">Thất bại</SelectItem>
            </SelectContent>
          </Select>

          {(filterType !== "all" || filterStatus !== "all") && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs gap-1"
              onClick={() => handleFilterChange("all", "all")}
            >
              <X className="h-3 w-3" />
              Xóa lọc
            </Button>
          )}

          <span className="ml-auto text-xs text-muted-foreground">
            {total} kết quả
          </span>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[700px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    colSpan={header.colSpan}
                    className="whitespace-nowrap"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <tbody
            ref={(el) => {
              if (!el) return
              el.addEventListener("click", (e) => {
                const btn = (e.target as HTMLElement).closest("[data-delete-id]")
                if (btn) {
                  const id = (btn as HTMLElement).dataset.deleteId
                  if (id) handleDelete(id)
                }
              })
            }}
          >
            {loading ? (
              <tr>
                <td colSpan={emailHistoryColumns.length} className="h-32 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </td>
              </tr>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-muted/50 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="whitespace-nowrap px-4 py-2">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={emailHistoryColumns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <History className="h-8 w-8" />
                    <p className="text-sm">Chưa có lịch sử gửi email nào.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {currentPage} / {totalPages} — {total} kết quả
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1 || loading}
            >
              Trước
            </Button>
            {(() => {
              const delta = 2
              const range: (number | "...")[] = []
              for (
                let i = Math.max(1, currentPage - delta);
                i <= Math.min(totalPages, currentPage + delta);
                i++
              ) {
                range.push(i)
              }
              if (range[0] !== 1) {
                if (range[0] !== 2) range.unshift("...")
                range.unshift(1)
              }
              if (range[range.length - 1] !== totalPages) {
                if (range[range.length - 1] !== totalPages - 1) range.push("...")
                range.push(totalPages)
              }
              return range.map((p, idx) =>
                p === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={currentPage === p ? "default" : "outline"}
                    size="sm"
                    className="w-9"
                    onClick={() => setPage(p as number)}
                    disabled={loading}
                  >
                    {p}
                  </Button>
                )
              )
            })()}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages || loading}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {totalPages <= 1 && total > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {total} kết quả
        </p>
      )}

      {/* Clear all dialog */}
      <AlertDialog open={clearAllOpen} onOpenChange={setClearAllOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa tất cả lịch sử email?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này sẽ xóa vĩnh viễn {total} bản ghi lịch sử gửi email. Không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearAll}
              disabled={clearing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Xóa tất cả
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
