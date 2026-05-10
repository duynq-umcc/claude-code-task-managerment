"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AutoReplyConfigPanel } from "@/modules/email/components/auto-reply-config-panel"
import { EmailComposePanel } from "@/modules/email/components/email-compose-panel"
import { EmailHistoryPanel } from "@/modules/email/components/email-history-panel"
import { EmailApiHistoryPanel } from "@/modules/email/components/email-api-history-panel"
import { Mail, Settings2, History, Terminal } from "lucide-react"

export default function EmailPage() {
  const [activeTab, setActiveTab] = useState("compose")

  return (
    <div className="@container/main flex flex-1 flex-col">
      <div className="px-4 md:px-6 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Email</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Quản lý gởi email tự động và soạn thảo email thủ công cho Consulting Clients.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="compose" className="gap-1.5">
              <Mail className="h-4 w-4" />
              Soạn email
            </TabsTrigger>
            <TabsTrigger value="auto-reply" className="gap-1.5">
              <Settings2 className="h-4 w-4" />
              Cấu hình Auto-reply
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="h-4 w-4" />
              Lịch sử gửi email
            </TabsTrigger>
            <TabsTrigger value="api-history" className="gap-1.5">
              <Terminal className="h-4 w-4" />
              Lịch sử API
            </TabsTrigger>
          </TabsList>

          <TabsContent value="compose">
            <EmailComposePanel />
          </TabsContent>

          <TabsContent value="auto-reply">
            <AutoReplyConfigPanel />
          </TabsContent>

          <TabsContent value="history">
            <EmailHistoryPanel key="history" />
          </TabsContent>

          <TabsContent value="api-history">
            <EmailApiHistoryPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
