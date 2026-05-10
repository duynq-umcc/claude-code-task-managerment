"use client"

import { useState, useEffect, useCallback } from "react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
  Terminal,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { getEmailApiLogs, deleteEmailApiLog } from "../services/email-api-logs-api"
import type { EmailApiLog } from "../services/types/email-api-types"

function statusColor(code: number) {
  if (code >= 200 && code < 300) return "text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900 dark:text-green-400"
  if (code >= 400 && code < 500) return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-900 dark:text-amber-400"
  return "text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-900 dark:text-red-400"
}

function methodColor(method: string) {
  switch (method) {
    case "POST": return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950"
    case "GET": return "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950"
    case "PUT": return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950"
    case "DELETE": return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950"
    default: return "text-muted-foreground bg-muted"
  }
}

function JsonView({ data }: { data: unknown }) {
  return (
    <pre className="text-xs bg-muted rounded p-3 overflow-auto max-h-60 font-mono whitespace-pre-wrap break-all">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}

interface ApiResponse {
  success: boolean
  data: EmailApiLog[]
  total: number
  page: number
  limit: number
  totalPages: number
  error?: string
}

export function EmailApiHistoryPanel() {
  const [logs, setLogs] = useState<EmailApiLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res: ApiResponse = await getEmailApiLogs({
        search: search.trim() || undefined,
        page,
        limit: 50,
      })
      if (res.success) {
        setLogs(res.data)
        setTotal(res.total)
        setTotalPages(res.totalPages)
      } else {
        toast.error(res.error || "Không thể tải lịch sử API.")
        setLogs([])
      }
    } catch {
      toast.error("Lỗi kết nối khi tải lịch sử API.")
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [search])

  async function handleDelete(id: string) {
    setDeletingId(id)
    try {
      const res = await deleteEmailApiLog(id)
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Lịch sử API Email</h2>
          <p className="text-sm text-muted-foreground">
            Chi tiết request/response của các lần gọi API gửi email.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm endpoint, method..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={loadLogs} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground border rounded-lg">
            <Terminal className="h-8 w-8" />
            <p className="text-sm">Chưa có lịch sử API nào.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="rounded-lg border overflow-hidden">
              {/* Row header */}
              <div
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
              >
                <button className="text-muted-foreground shrink-0">
                  {expandedId === log.id ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>

                <Badge
                  className={`shrink-0 text-xs font-mono ${methodColor(log.method)}`}
                >
                  {log.method}
                </Badge>

                <code className="text-sm font-mono truncate flex-1">{log.endpoint}</code>

                <Badge
                  className={`shrink-0 text-xs font-mono ${statusColor(log.statusCode)}`}
                >
                  {log.statusCode}
                </Badge>

                <span className="text-xs text-muted-foreground shrink-0">
                  {format(new Date(log.timestamp), "dd/MM/yyyy HH.mm:ss", { locale: vi })}
                </span>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(log.id)
                  }}
                  disabled={deletingId === log.id}
                >
                  <Loader2 className={`h-3.5 w-3.5 ${deletingId === log.id ? "animate-spin" : ""}`} />
                  <span className="sr-only">Xóa</span>
                </Button>
              </div>

              {/* Expanded details */}
              {expandedId === log.id && (
                <div className="px-4 pb-4 border-t bg-muted/20">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Request */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <span className="text-blue-600 dark:text-blue-400">REQUEST</span>
                        <ArrowRight className="h-3 w-3" />
                        <span className="uppercase">{log.method}</span>
                        <code className="font-mono">{log.endpoint}</code>
                      </div>
                      <JsonView data={log.requestBody ?? {}} />
                    </div>

                    {/* Response */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <span className={`${log.statusCode < 400 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                          RESPONSE
                        </span>
                        <code className="font-mono">{log.statusCode}</code>
                        {log.error && (
                          <span className="text-red-500 font-normal">— {log.error}</span>
                        )}
                      </div>
                      <JsonView data={log.responseBody ?? { error: log.error }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Trang {page} / {totalPages} — {total} kết quả
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || loading}
            >
              Trước
            </Button>
            {(() => {
              const range: (number | "...")[] = []
              for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) {
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
                  <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                ) : (
                  <Button
                    key={p}
                    variant={page === p ? "default" : "outline"}
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
              disabled={page >= totalPages || loading}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {totalPages <= 1 && total > 0 && (
        <p className="text-sm text-muted-foreground text-center">{total} kết quả</p>
      )}
    </div>
  )
}
