"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Loader2, Save, Eye, RefreshCw, Send, CheckCircle2, XCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import type { EmailAutoReplyConfig } from "../services/types/email-types"

interface AutoReplyConfigPanelProps {
  onConfigChange?: (config: EmailAutoReplyConfig) => void
}

const DEFAULT_CONFIG: Omit<EmailAutoReplyConfig, "id"> = {
  enabled: false,
  subject: "Cảm ơn bạn đã đăng ký tư vấn!",
  body: `Kính chào {{fullName}},

Cảm ơn bạn đã gửi yêu cầu tư vấn. Chúng tôi đã nhận được thông tin và sẽ liên hệ với bạn trong thời gian sớm nhất.

Thông tin của bạn:
- Họ tên: {{fullName}}
- Email: {{email}}
- Số điện thoại: {{phone}}
- Nội dung: {{content}}

Trân trọng,
Claude Code Task Managerment`,
  accentColor: "#3b82f6",
}

export function AutoReplyConfigPanel({ onConfigChange }: AutoReplyConfigPanelProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const [config, setConfig] = useState<EmailAutoReplyConfig>({
    id: "",
    ...DEFAULT_CONFIG,
  })
  const [loadError, setLoadError] = useState<string | null>(null)
  const [testEmail, setTestEmail] = useState("")
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  function loadConfig() {
    setLoading(true)
    setLoadError(null)
    fetch("/api/email/auto-reply/config")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setConfig(data.data)
        } else {
          setLoadError(data.error || "Không thể tải cấu hình.")
          toast.error(data.error || "Không thể tải cấu hình auto-reply.")
        }
      })
      .catch((err) => {
        const msg = "Lỗi kết nối khi tải cấu hình."
        setLoadError(msg)
        toast.error(msg)
        console.error("[loadConfig]", err)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadConfig()
  }, [])

  function handleSave() {
    setSaving(true)
    fetch("/api/email/auto-reply/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enabled: config.enabled,
        subject: config.subject,
        body: config.body,
        accentColor: config.accentColor,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          toast.success("Lưu cấu hình thành công!")
          onConfigChange?.(config)
        } else {
          toast.error(data.error || "Lưu cấu hình thất bại.")
        }
      })
      .catch(() => {
        toast.error("Lưu cấu hình thất bại.")
      })
      .finally(() => setSaving(false))
  }

  async function handleTest() {
    if (!testEmail.trim() || !testEmail.includes("@")) {
      toast.error("Vui lòng nhập địa chỉ email hợp lệ để test.")
      return
    }
    setTesting(true)
    setTestResult(null)
    try {
      const res = await fetch("/api/email/auto-reply/config/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail.trim() }),
      })
      const data = await res.json()
      if (data.success) {
        setTestResult({ success: true, message: `Đã gửi email test đến ${testEmail}. Kiểm tra hộp thư.` })
        toast.success(`Đã gửi email test đến ${testEmail}`)
      } else {
        setTestResult({ success: false, message: data.error || "Gửi thất bại." })
        toast.error(data.error || "Gửi email test thất bại.")
      }
    } catch {
      toast.error("Lỗi kết nối khi gửi email test.")
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error banner */}
      {loadError && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/30 dark:border-red-900">
          <XCircle className="h-5 w-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700 dark:text-red-400">Lỗi khi tải cấu hình</p>
            <p className="text-xs text-red-600 dark:text-red-500">{loadError}</p>
          </div>
          <Button variant="outline" size="sm" onClick={loadConfig} className="shrink-0">
            <RefreshCw className="h-3 w-3" />
            Thử lại
          </Button>
        </div>
      )}

      {/* Status bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Cấu hình phản hồi tự động</h2>
          <p className="text-sm text-muted-foreground">
            Gửi email tự động đến khách hàng ngay sau khi họ đăng ký tư vấn trên landing page.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {config.enabled ? (
            <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Đang bật
            </Badge>
          ) : (
            <Badge variant="secondary" className="gap-1">
              <AlertCircle className="h-3 w-3" />
              Đang tắt
            </Badge>
          )}
          <Switch
            checked={config.enabled}
            onCheckedChange={(v) => setConfig((c) => ({ ...c, enabled: v }))}
          />
          <span className="text-sm font-medium">{config.enabled ? "Bật" : "Tắt"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ar-subject">Tiêu đề email</Label>
            <Input
              id="ar-subject"
              value={config.subject}
              onChange={(e) => setConfig((c) => ({ ...c, subject: e.target.value }))}
              placeholder="Cảm ơn bạn đã đăng ký!"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ar-body">Nội dung email</Label>
            <Textarea
              id="ar-body"
              rows={12}
              value={config.body}
              onChange={(e) => setConfig((c) => ({ ...c, body: e.target.value }))}
              placeholder="Nội dung với biến {{fullName}}, {{email}}, {{phone}}, {{content}}"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Biến: <code className="bg-muted px-1 rounded">{"{{fullName}}"}</code>{" "}
              <code className="bg-muted px-1 rounded">{"{{email}}"}</code>{" "}
              <code className="bg-muted px-1 rounded">{"{{phone}}"}</code>{" "}
              <code className="bg-muted px-1 rounded">{"{{content}}"}</code> — sẽ được thay bằng
              thông tin thực của khách.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ar-color">Màu header</Label>
            <div className="flex gap-2 items-center">
              <Input
                id="ar-color"
                type="color"
                value={config.accentColor}
                onChange={(e) => setConfig((c) => ({ ...c, accentColor: e.target.value }))}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                value={config.accentColor}
                onChange={(e) => setConfig((c) => ({ ...c, accentColor: e.target.value }))}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button onClick={handleSave} disabled={saving || !!loadError} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Lưu cấu hình
            </Button>

            {/* Test button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" disabled={!!loadError} className="gap-1.5">
                  <Send className="h-3.5 w-3.5" />
                  Gửi test
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Gửi email test auto-reply</AlertDialogTitle>
                  <AlertDialogDescription>
                    Nhập địa chỉ email để nhận một email phản hồi tự động với nội dung hiện tại.
                    Email sẽ gửi ngay lập tức mà không cần đăng ký.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2 pt-2">
                  <Input
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => {
                      setTestEmail(e.target.value)
                      setTestResult(null)
                    }}
                  />
                  {testResult && (
                    <div className={`flex items-center gap-2 text-sm ${testResult.success ? "text-green-600" : "text-red-600"}`}>
                      {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      {testResult.message}
                    </div>
                  )}
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => { setTestResult(null); setTestEmail("") }}>Đóng</AlertDialogCancel>
                  <AlertDialogAction onClick={handleTest} disabled={testing || !testEmail.trim()}>
                    {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    Gửi test
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Xem trước email</Label>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => setPreview(!preview)}>
              <Eye className="h-3 w-3" />
              {preview ? "Ẩn" : "Hiện"}
            </Button>
          </div>

          {preview ? (
            <div className="rounded-lg border overflow-hidden">
              <div
                className="p-4 text-white font-semibold text-sm"
                style={{ backgroundColor: config.accentColor }}
              >
                {config.subject || "(Tiêu đề email)"}
              </div>
              <div className="p-4 text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed bg-background">
                {config.body.split("\n").map((line, i) => {
                  if (line.startsWith("{{") && line.endsWith("}}")) {
                    return (
                      <span key={i} className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1 rounded text-xs mr-1">
                        {line}
                      </span>
                    )
                  }
                  return (
                    <span key={i}>
                      {line}
                      <br />
                    </span>
                  )
                })}
              </div>
              <div className="p-3 border-t text-xs text-muted-foreground text-center bg-muted/30">
                © {new Date().getFullYear()} Claude Code Task Managerment
              </div>
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Eye className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nhấn "Hiện" để xem trước email với nội dung hiện tại.
                </p>
              </CardContent>
            </Card>
          )}

          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                Luồng hoạt động
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1">
              <p>1. Khách hàng điền form đăng ký tư vấn trên landing page</p>
              <p>2. Dữ liệu được ghi vào Firestore (collection: <code className="bg-muted px-1 rounded">register_users</code>)</p>
              <p>3. API <code className="bg-muted px-1 rounded">/api/email/auto-reply</code> được gọi tự động</p>
              <p>4. Nếu auto-reply <strong>bật</strong> → gửi email đến khách hàng ngay lập tức</p>
              <p className="mt-2 text-amber-700 dark:text-amber-400">
                <strong>Lưu ý:</strong> Sau khi bật/tắt, nhấn <strong>Lưu cấu hình</strong> để áp dụng.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
