"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Loader2,
  Send,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Plus,
  User,
  X,
  CheckCircle2,
  XCircle,
  Mail,
  RotateCcw,
  Columns,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RichTextEditor } from "./rich-text-editor"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { getRegisterUsers } from "@/modules/consulting-clients/services/consulting-client-services"
import type { RegisterUser } from "@/modules/consulting-clients/services/types/register-user-types"

interface ComposeResult {
  success: boolean
  messageId?: string
  error?: string
}

export function EmailComposePanel() {
  const [clients, setClients] = useState<RegisterUser[]>([])
  const [loadingClients, setLoadingClients] = useState(true)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(false)
  const [showCcBcc, setShowCcBcc] = useState(false)
  const [result, setResult] = useState<ComposeResult | null>(null)

  // Form fields
  const [to, setTo] = useState("")
  const [toRecipients, setToRecipients] = useState<{ label: string; value: string }[]>([])
  const [subject, setSubject] = useState("")
  const [body, setBody] = useState("")
  const [accentColor, setAccentColor] = useState("#3b82f6")
  const [cc, setCc] = useState("")
  const [bcc, setBcc] = useState("")
  const [replyTo, setReplyTo] = useState("")
  const [openClientPopover, setOpenClientPopover] = useState(false)

  useEffect(() => {
    getRegisterUsers()
      .then(setClients)
      .catch(() => setClients([]))
      .finally(() => setLoadingClients(false))
  }, [])

  function addRecipient(email: string, name: string) {
    if (toRecipients.find((r) => r.value === email)) return
    setToRecipients((prev) => [...prev, { label: name || email, value: email }])
    setOpenClientPopover(false)
  }

  function removeRecipient(email: string) {
    setToRecipients((prev) => prev.filter((r) => r.value !== email))
  }

  function resetForm() {
    setToRecipients([])
    setSubject("")
    setBody("")
    setAccentColor("#3b82f6")
    setCc("")
    setBcc("")
    setReplyTo("")
    setResult(null)
    setPreview(false)
    setShowCcBcc(false)
  }

  async function handleSend() {
    if (toRecipients.length === 0 || !subject.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const payload: Record<string, string> = {
        to: toRecipients.map((r) => r.value).join(", "),
        subject: subject.trim(),
        html: body,
      }
      // Pass full name of primary recipient for log
      if (toRecipients.length > 0 && toRecipients[0].label !== toRecipients[0].value) {
        payload.fullName = toRecipients[0].label
      }
      if (cc.trim()) payload.cc = cc.trim()
      if (bcc.trim()) payload.bcc = bcc.trim()
      if (replyTo.trim()) payload.replyTo = replyTo.trim()

      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data: ComposeResult = await res.json()
      setResult(data)

      if (data.success) {
        toast.success(`Đã gửi email đến ${toRecipients.length} người nhận.`)
      } else {
        toast.error(data.error || "Gửi email thất bại.")
      }
    } catch {
      toast.error("Lỗi kết nối đến server.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Soạn email thủ công</h2>
          <p className="text-sm text-muted-foreground">
            Gửi email tùy chỉnh đến khách hàng Consulting Clients hoặc bất kỳ địa chỉ nào.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1" onClick={resetForm}>
          <RotateCcw className="h-3 w-3" />
          Làm mới
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Compose form */}
        <div className="lg:col-span-3 space-y-4">
          {/* To field with client picker */}
          <div className="space-y-2">
            <Label>Người nhận</Label>
            <div className="flex gap-2 flex-wrap">
              {toRecipients.map((r) => (
                <Badge key={r.value} variant="secondary" className="gap-1 pr-1">
                  <User className="h-3 w-3" />
                  {r.label}
                  <button
                    onClick={() => removeRecipient(r.value)}
                    className="ml-1 hover:text-destructive rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <Popover open={openClientPopover} onOpenChange={setOpenClientPopover}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7 gap-1">
                    <Plus className="h-3 w-3" />
                    Chọn từ danh sách
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Tìm khách hàng..." />
                    <CommandList>
                      <CommandEmpty>
                        {loadingClients ? (
                          <div className="flex items-center justify-center py-4">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        ) : (
                          "Không tìm thấy khách hàng."
                        )}
                      </CommandEmpty>
                      <CommandGroup heading="Consulting Clients">
                        {clients.map((c) => (
                          <CommandItem
                            key={c.id}
                            value={c.email}
                            onSelect={() => addRecipient(c.email, c.fullName)}
                            className="gap-2"
                          >
                            <User className="h-4 w-4 shrink-0" />
                            <div className="flex flex-col min-w-0">
                              <span className="truncate text-sm font-medium">{c.fullName}</span>
                              <span className="truncate text-xs text-muted-foreground">{c.email}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <Input
                placeholder="hoặc nhập email..."
                type="email"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && to.trim()) {
                    e.preventDefault()
                    addRecipient(to.trim(), "")
                    setTo("")
                  }
                }}
                className="flex-1 min-w-40 h-7 text-sm"
              />
              {to.trim() && (
                <Button
                  size="sm"
                  className="h-7 gap-1"
                  onClick={() => {
                    addRecipient(to.trim(), "")
                    setTo("")
                  }}
                >
                  <Plus className="h-3 w-3" />
                  Thêm
                </Button>
              )}
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="compose-subject">Tiêu đề</Label>
            <Input
              id="compose-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Chủ đề email..."
            />
          </div>

          {/* CC / BCC toggle */}
          <button
            onClick={() => setShowCcBcc(!showCcBcc)}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showCcBcc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showCcBcc ? "Ẩn" : "Hiện"} CC / BCC / Reply-To
          </button>

          {showCcBcc && (
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs" htmlFor="compose-cc">CC</Label>
                <Input
                  id="compose-cc"
                  type="email"
                  value={cc}
                  onChange={(e) => setCc(e.target.value)}
                  placeholder="cc@example.com"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs" htmlFor="compose-bcc">BCC</Label>
                <Input
                  id="compose-bcc"
                  type="email"
                  value={bcc}
                  onChange={(e) => setBcc(e.target.value)}
                  placeholder="bcc@example.com"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs" htmlFor="compose-reply">Reply-To</Label>
                <Input
                  id="compose-reply"
                  type="email"
                  value={replyTo}
                  onChange={(e) => setReplyTo(e.target.value)}
                  placeholder="reply@example.com"
                />
              </div>
            </div>
          )}

          {/* Color + Preview toggle */}
          <div className="flex items-center gap-3">
            <Label className="text-sm whitespace-nowrap">Màu header:</Label>
            <Input
              type="color"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-10 h-8 p-1 cursor-pointer"
            />
            <Input
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-28 text-sm"
            />
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => setPreview(!preview)}
            >
              {preview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
              {preview ? "Ẩn preview" : "Xem preview"}
            </Button>
          </div>

          {/* Body */}
          <div className="space-y-2">
            <Label htmlFor="compose-body">Nội dung</Label>
            <RichTextEditor
              value={body}
              onChange={setBody}
              placeholder="Nhập nội dung email..."
              minHeight={320}
              className="text-sm"
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={loading || toRecipients.length === 0 || !subject.trim()}
            size="lg"
            className="gap-2 w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang gởi...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Gởi email
              </>
            )}
          </Button>

          {/* Result */}
          {result && (
            <Card className={cn(result.success ? "border-green-500" : "border-red-500")}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-2">
                  {result.success ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {result.success ? "Gửi thành công!" : "Gửi thất bại"}
                    </p>
                    {result.messageId && (
                      <p className="text-xs text-muted-foreground">ID: {result.messageId}</p>
                    )}
                    {result.error && (
                      <p className="text-xs text-red-600">{result.error}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Preview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Columns className="h-4 w-4 text-muted-foreground" />
            <Label className="text-sm">Preview email</Label>
          </div>
          <div className="rounded-lg border overflow-hidden shadow-sm">
            <div
              className="p-4 text-white font-semibold text-sm"
              style={{ backgroundColor: accentColor }}
            >
              {subject || "(Tiêu đề email)"}
            </div>
            <div
              className="p-4 text-sm text-muted-foreground leading-relaxed bg-background min-h-48 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-1 [&_a]:text-blue-600 [&_a]:underline"
              dangerouslySetInnerHTML={{ __html: body || "<em style='color:#9ca3af'>(Nội dung email)</em>" }}
            />
            <div className="p-3 border-t text-xs text-muted-foreground text-center bg-muted/30">
              © {new Date().getFullYear()} Claude Code Task Managerment
            </div>
          </div>

          {toRecipients.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Người nhận ({toRecipients.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {toRecipients.map((r) => (
                  <div key={r.value} className="flex items-center gap-2 text-xs">
                    <Mail className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="font-medium">{r.label}</span>
                    <span className="text-muted-foreground">{r.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
