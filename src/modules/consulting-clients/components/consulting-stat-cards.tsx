"use client"

import { Users, CalendarCheck, Phone, FileText } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getConsultingStats } from "@/modules/consulting-clients/services/consulting-client-services"
import type { RegisterUser } from "@/modules/consulting-clients/services/types/register-user-types"

interface ConsultingStatCardsProps {
  users: RegisterUser[]
}

export function ConsultingStatCards({ users }: ConsultingStatCardsProps) {
  const stats = getConsultingStats(users)

  const cards = [
    {
      label: "Total Registrations",
      value: stats.total,
      sub: null,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "Today",
      value: stats.today,
      sub: null,
      icon: CalendarCheck,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
    {
      label: "With Phone Number",
      value: stats.withPhone,
      sub: `${stats.phonePercent}%`,
      icon: Phone,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      label: "With Message",
      value: stats.withContent,
      sub: `${stats.contentPercent}%`,
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950",
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-muted-foreground text-sm font-medium truncate">
                  {card.label}
                </p>
                <div className="mt-1 flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{card.value}</p>
                  {card.sub && (
                    <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {card.sub}
                    </p>
                  )}
                </div>
              </div>
              <div className={`shrink-0 rounded-lg p-3 ${card.bgColor}`}>
                <card.icon className={`size-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}