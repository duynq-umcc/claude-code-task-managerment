"use client"

import { useState, useEffect, useCallback } from "react"
import { format, differenceInSeconds } from "date-fns"
import { vi } from "date-fns/locale"
import {
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Zap,
  Mail,
  User,
  Phone,
  FileText,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

interface Registration {
  id: string
  fullName: string
  email: string
  phone: string
  content: string
  createdAt: string
  submittedAt: string
}

interface EmailLog {
  id: string
  to: string
  fullName?: string
  subject: string
  type: "auto_reply" | "manual"
  status: "sent" | "failed"
  sentAt: string
  error?: string
}

interface ApiLog {
  id: string
  endpoint: string
  method: string
  statusCode: number
  requestBody?: Record<string, unknown>
  responseBody?: Record<string, unknown>
  error?: string
  timestamp: string
}

type ReplyStatus = "pending" | "sent" | "failed" | "skipped" | "unknown"

function statusIcon(status: ReplyStatus) {
  switch (status) {
    case "sent":
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case "failed":
      return <XCircle className="h-4 w-4 text-red-600" />
    case "skipped":
      return <AlertCircle className="h-4 w-4 text-amber-500" />
    case "pending":
      return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
    default:
      return <AlertCircle className="h-4 w-4 text-muted-foreground" />
  }
}

function statusLabel(status: ReplyStatus) {
  switch (status) {
    case "sent": return "Đã gửi"
    case "failed": return "Thất bại"
    case "skipped": return "Bị bỏ qua"
    case "pending": return "Chưa xử lý"
    default: return "Không rõ"
  }
}

function statusVariant(status: ReplyStatus): "default" | "destructive" | "secondary" | "outline" {
  switch (status) {
    case "sent": return "default"
    case "failed": return "destructive"
    case "skipped": return "secondary"
    case "pending": return "outline"
    default: return "outline"
  }
}

function formatDate(iso: string): string {
  try {
    return format(new Date(iso), "dd/MM/yyyy HH.mm.ss", { locale: vi })
  } catch {
    return iso
  }
}

function timeAgo(iso: string): string {
  try {
    const diff = differenceInSeconds(new Date(), new Date(iso))
    if (diff < 60) return `${diff}s trước`
    if (diff < 3600) return `${Math.floor(diff / 60)}p trước`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h trước`
    return format(new Date(iso), "dd/MM/yyyy", { locale: vi })
  } catch {
    return ""
  }
}

function matchReplyStatus(
  reg: Registration,
  emailLogs: EmailLog[],
  apiLogs: ApiLog[]
): ReplyStatus {
  const regTime = new Date(reg.createdAt).getTime()

  // Check API logs first (more immediate — captures "skipped" and "enabled" state)
  const apiCall = apiLogs.find((log) => {
    if (!log.requestBody) return false
    const reqEmail = log.requestBody.email as string | undefined
    if (!reqEmail) return false
    const apiTime = new Date(log.timestamp).getTime()
    const timeDiff = Math.abs(apiTime - regTime)
    return reqEmail.toLowerCase() === reg.email.toLowerCase() && timeDiff < 60000
  })

  if (apiCall) {
    if (apiCall.statusCode === 200 && apiCall.responseBody) {
      const resp = apiCall.responseBody as Record<string, unknown>
      if (resp.skipped === true) return "skipped"
      if (resp.success === true) return "sent"
      return "failed"
    }
    if (apiCall.statusCode >= 400) return "failed"
  }

  // Check email logs
  const emailLog = emailLogs.find((log) => {
    const logEmail = log.to?.toLowerCase()
    const logTime = new Date(log.sentAt).getTime()
    const timeDiff = Math.abs(logTime - regTime)
    return logEmail === reg.email.toLowerCase() && log.type === "auto_reply" && timeDiff < 60000
  })

  if (emailLog) {
    return emailLog.status === "sent" ? "sent" : "failed"
  }

  // Has it been more than 60s since registration?
  const diff = differenceInSeconds(new Date(), new Date(reg.createdAt))
  if (diff > 60) return "unknown"

  return "pending"
}

export function AutoReplyFlowPanel() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([])
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [triggeringId, setTriggeringId] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [regRes, emailRes, apiRes] = await Promise.all([
        fetch("/api/email/registrations", { cache: "no-store" }),
        fetch("/api/email/logs?type=auto_reply&limit=50", { cache: "no-store" }),
        fetch("/api/email/api-logs?limit=50", { cache: "no-store" }),
      ])

      const [regData, emailData, apiData] = await Promise.all([
        regRes.json(),
        emailRes.json(),
        apiRes.json(),
      ])

      if (regData.success) setRegistrations(regData.data)
      else toast.error("Không tải được danh sách đăng ký: " + (regData.error || ""))

      if (emailData.success) setEmailLogs(emailData.data)
      if (apiData.success) {
        setApiLogs(
          apiData.data.filter(
            (log: ApiLog) =>
              log.endpoint === "/api/email/auto-reply" ||
              log.endpoint === "/api/email/auto-reply/trigger"
          )
        )
      }
      setLastRefresh(new Date())
    } catch {
      toast.error("Lỗi kết nối khi tải dữ liệu.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAll()
    const interval = setInterval(loadAll, 10000)
    return () => clearInterval(interval)
  }, [loadAll])

  async function handleTrigger(reg: Registration) {
    setTriggeringId(reg.id)
    try {
      const res = await fetch("/api/email/auto-reply/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: reg.fullName,
          email: reg.email,
          phone: reg.phone,
          content: reg.content,
        }),
      })
      const data = await res.json()
      if (data.success && !data.skipped) {
        toast.success(`Đã gửi email phản hồi đến ${reg.email}`)
        await loadAll()
      } else if (data.skipped) {
        toast.warning("Auto-reply đang tắt. Bật trong Cấu hình Auto-reply.")
      } else {
        toast.error("Gửi thất bại: " + (data.error || "Lỗi không xác định"))
      }
    } catch {
      toast.error("Lỗi kết nối khi gửi email phản hồi.")
    } finally {
      setTriggeringId(null)
    }
  }

  const filtered = registrations.filter((r) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      r.fullName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.phone.includes(q)
    )
  })

  // Stats
  const total = registrations.length
  const sent = filtered.filter((r) => matchReplyStatus(r, emailLogs, apiLogs) === "sent").length
  const failed = filtered.filter((r) => matchReplyStatus(r, emailLogs, apiLogs) === "failed").length
  const pending = filtered.filter((r) => ["pending", "unknown"].includes(matchReplyStatus(r, emailLogs, apiLogs))).length
  const skipped = filtered.filter((r) => matchReplyStatus(r, emailLogs, apiLogs) === "skipped").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">Theo dõi luồng Auto-reply</h2>
          <p className="text-sm text-muted-foreground">
            Giám sát toàn bộ quy trình: đăng ký → trigger auto-reply → gửi email
          </p>
          {lastRefresh && (
            <p className="text-xs text-muted-foreground mt-1">
              Cập nhật lúc {format(lastRefresh, "HH.mm:ss")} · Tự động làm mới mỗi 10s
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={loadAll} disabled={loading}>
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Flow diagram */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-4">
          <div className="flex items-center justify-center gap-0 flex-wrap">
            {[
              { icon: FileText, label: "Đăng ký\ntrên Landing", color: "text-blue-600" },
              { icon: Clock, label: "Dữ liệu vào\nregister_users", color: "text-blue-500" },
              { icon: Zap, label: "Auto-reply\nAPI được gọi", color: "text-amber-600" },
              { icon: Mail, label: "Email được\ngửi đến khách", color: "text-green-600" },
            ].map(({ icon: Icon, label, color }, i) => (
              <div key={i} className="flex items-center gap-2 px-4 py-2">
                <div className={`flex flex-col items-center gap-1 ${color}`}>
                  <Icon className="h-5 w-5" />
                  <span className="text-xs text-center whitespace-pre-line font-medium">{label}</span>
                </div>
                {i < 3 && <div className="text-muted-foreground/50">→</div>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Tổng đăng ký", value: total, icon: FileText, color: "" },
          { label: "Đã gửi", value: sent, icon: CheckCircle2, color: "text-green-600" },
          { label: "Thất bại", value: failed, icon: XCircle, color: "text-red-600" },
          { label: "Chưa xử lý", value: pending + skipped, icon: AlertCircle, color: "text-amber-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-lg border bg-card">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Icon className="h-4 w-4" />
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm theo tên, email, số điện thoại..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Registrations table */}
      {loading && registrations.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              {search ? "Không tìm thấy đăng ký nào phù hợp." : "Chưa có đăng ký nào trong register_users."}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {search ? "Thử từ khóa khác." : "Đăng ký trên landing page để xuất hiện tại đây."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((reg) => {
            const status = matchReplyStatus(reg, emailLogs, apiLogs)
            const matchedEmailLog = emailLogs.find(
              (log) =>
                log.to?.toLowerCase() === reg.email.toLowerCase() &&
                log.type === "auto_reply" &&
                Math.abs(new Date(log.sentAt).getTime() - new Date(reg.createdAt).getTime()) < 60000
            )

            return (
              <Card key={reg.id} className="overflow-hidden">
                {/* Card header row */}
                <div className="flex items-start gap-4 p-4 flex-wrap sm:flex-nowrap">
                  {/* Status badge */}
                  <div className="shrink-0 pt-0.5">
                    {statusIcon(status)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{reg.fullName}</span>
                      <Badge variant={statusVariant(status)} className="text-xs gap-1">
                        {statusLabel(status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        <span className="font-mono">{reg.email}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {reg.phone}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(reg.createdAt)} · {formatDate(reg.createdAt)}
                      </span>
                    </div>
                    {reg.content && (
                      <div className="flex items-start gap-1 text-xs text-muted-foreground mt-1">
                        <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                        <span className="line-clamp-1">{reg.content}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="shrink-0 flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-amber-600 border-amber-200 hover:text-amber-700 hover:bg-amber-50 dark:border-amber-800 dark:hover:bg-amber-950"
                      onClick={() => handleTrigger(reg)}
                      disabled={triggeringId === reg.id}
                    >
                      {triggeringId === reg.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <PlayCircle className="h-3.5 w-3.5" />
                      )}
                      Gửi lại
                    </Button>
                  </div>
                </div>

                {/* Expanded: email log detail */}
                {matchedEmailLog && (
                  <div className="px-4 pb-4 border-t bg-muted/20">
                    <div className="mt-3 flex items-start gap-2 text-xs">
                      {matchedEmailLog.status === "sent" ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-red-600 mt-0.5 shrink-0" />
                      )}
                      <div>
                        <span className="text-muted-foreground">
                          Email log · {formatDate(matchedEmailLog.sentAt)} · {matchedEmailLog.subject}
                        </span>
                        {matchedEmailLog.error && (
                          <p className="text-red-600 mt-0.5">Lỗi: {matchedEmailLog.error}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Expanded: API log detail */}
                {(() => {
                  const apiLog = apiLogs.find(
                    (log) =>
                      log.requestBody &&
                      (log.requestBody.email as string)?.toLowerCase() === reg.email.toLowerCase() &&
                      Math.abs(new Date(log.timestamp).getTime() - new Date(reg.createdAt).getTime()) < 60000
                  )
                  if (!apiLog) return null
                  return (
                    <div className="px-4 pb-4 border-t bg-muted/10">
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className={`font-mono font-semibold ${
                            apiLog.statusCode < 400 ? "text-green-600" : "text-red-600"
                          }`}>
                            {apiLog.method} {apiLog.endpoint}
                          </span>
                          <span>→ HTTP {apiLog.statusCode}</span>
                          <span>· {formatDate(apiLog.timestamp)}</span>
                        </div>
                        {apiLog.error && (
                          <p className="text-xs text-red-600">Response error: {apiLog.error}</p>
                        )}
                        {!!(apiLog.responseBody as Record<string, unknown>)?.error && (
                          <p className="text-xs text-red-600">
                            Message: {String((apiLog.responseBody as Record<string, unknown>).error)}
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })()}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
