"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Send, CheckCircle2, XCircle, Loader2, Info } from "lucide-react"

interface SendResult {
  success: boolean
  messageId?: string
  error?: string
}

export default function MailTestPage() {
  const [activeTab, setActiveTab] = useState("template")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)

  // Template fields
  const [to, setTo] = useState("")
  const [subject, setSubject] = useState("")
  const [templateTitle, setTemplateTitle] = useState("Thư từ Claude Code Task Managerment")
  const [plainBody, setPlainBody] = useState("")
  const [accentColor, setAccentColor] = useState("#3b82f6")
  const [replyTo, setReplyTo] = useState("")

  // Raw HTML fields
  const [htmlBody, setHtmlBody] = useState("")
  const [cc, setCc] = useState("")

  async function handleSend() {
    if (!to.trim() || !subject.trim()) return

    setLoading(true)
    setResult(null)

    try {
      const payload: Record<string, string> = {
        to: to.trim(),
        subject: subject.trim(),
        replyTo: replyTo.trim(),
      }

      if (activeTab === "template") {
        payload.templateTitle = templateTitle
        payload.plainBody = plainBody
        payload.templateAccentColor = accentColor
      } else {
        payload.html = htmlBody
      }

      if (cc.trim()) payload.cc = cc.trim()

      const res = await fetch("/api/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data: SendResult = await res.json()
      setResult(data)
    } catch {
      setResult({ success: false, error: "Lỗi kết nối đến server." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="@container/main flex flex-1 flex-col">
      <div className="px-4 md:px-6 py-6 max-w-4xl mx-auto w-full space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Email Test</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Gửi thử email qua Gmail SMTP. Cấu hình trong <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.local</code>.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Soạn email</CardTitle>
            <CardDescription>
              Chế độ <strong>Template</strong> dùng HTML có sẵn với header/footer.
              Chế độ <strong>Raw HTML</strong> gửi nội dung tự do.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="template">Template</TabsTrigger>
                <TabsTrigger value="raw">Raw HTML</TabsTrigger>
              </TabsList>

              <TabsContent value="template" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="to">Người nhận *</Label>
                    <Input
                      id="to"
                      type="email"
                      placeholder="recipient@example.com"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Tiêu đề *</Label>
                    <Input
                      id="subject"
                      placeholder="Chủ đề email..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="templateTitle">Tiêu đề template</Label>
                    <Input
                      id="templateTitle"
                      placeholder="Tiêu đề hiển thị trong email"
                      value={templateTitle}
                      onChange={(e) => setTemplateTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accentColor">Màu header</Label>
                    <div className="flex gap-2">
                      <Input
                        id="accentColor"
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="plainBody">Nội dung</Label>
                  <Textarea
                    id="plainBody"
                    placeholder="Nhập nội dung email (hỗ trợ xuống dòng)..."
                    rows={6}
                    value={plainBody}
                    onChange={(e) => setPlainBody(e.target.value)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="raw" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="to-raw">Người nhận *</Label>
                    <Input
                      id="to-raw"
                      type="email"
                      placeholder="recipient@example.com"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject-raw">Tiêu đề *</Label>
                    <Input
                      id="subject-raw"
                      placeholder="Chủ đề email..."
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cc-raw">CC (tùy chọn)</Label>
                    <Input
                      id="cc-raw"
                      type="email"
                      placeholder="cc@example.com"
                      value={cc}
                      onChange={(e) => setCc(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="replyTo-raw">Reply-To (tùy chọn)</Label>
                    <Input
                      id="replyTo-raw"
                      type="email"
                      placeholder="reply@example.com"
                      value={replyTo}
                      onChange={(e) => setReplyTo(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="htmlBody">HTML body</Label>
                  <Textarea
                    id="htmlBody"
                    placeholder="<h1>Xin chào!</h1><p>Nội dung...</p>"
                    rows={8}
                    value={htmlBody}
                    onChange={(e) => setHtmlBody(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-4">
              <Button
                onClick={handleSend}
                disabled={loading || !to.trim() || !subject.trim()}
                className="gap-2"
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
            </div>
          </CardContent>
        </Card>

        {result && (
          <Card className={result.success ? "border-green-500" : "border-red-500"}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <CardTitle className="text-base">
                  {result.success ? "Gởi thành công!" : "Gởi thất bại"}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {result.success && result.messageId && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Message ID:</p>
                  <code className="text-xs bg-muted px-2 py-1 rounded break-all">{result.messageId}</code>
                </div>
              )}
              {result.error && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Lỗi:</p>
                  <Badge variant="destructive">{result.error}</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
          <CardContent className="pt-4">
            <div className="flex gap-2 text-sm text-blue-800 dark:text-blue-300">
              <Info className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="font-medium">Cấu hình Gmail App Password</p>
                <p className="text-muted-foreground text-xs">
                  Thêm vào <code className="bg-muted px-1 rounded">.env.local</code>:
                </p>
                <pre className="bg-muted rounded p-2 text-xs overflow-x-auto mt-1">
{`EMAIL_SMTP_HOST=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_SMTP_USER=your-email@gmail.com
EMAIL_SMTP_PASS=yyxjcbczkbptismr
EMAIL_FROM=your-email@gmail.com`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
