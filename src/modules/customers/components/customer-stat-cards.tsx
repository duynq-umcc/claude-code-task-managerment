"use client"

import { ArrowUp, Users, CheckCircle2, UserPlus, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { getCustomerStats } from "@/modules/customers/services/customer-services"
import type { Customer } from "@/modules/customers/services/types/customer-types"

interface CustomerStatCardsProps {
  customers: Customer[]
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function CustomerStatCards({ customers }: CustomerStatCardsProps) {
  const stats = getCustomerStats(customers)

  const cards = [
    {
      label: "Total Customers",
      value: stats.total,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950",
      percentage: stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0,
      trend: "up",
    },
    {
      label: "Active Customers",
      value: stats.active,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950",
      percentage: stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0,
      trend: "up",
    },
    {
      label: "New Customers",
      value: stats.new,
      icon: UserPlus,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950",
      percentage: stats.total > 0 ? Math.round((stats.new / stats.total) * 100) : 0,
      trend: "up",
    },
    {
      label: "Total Revenue",
      value: stats.totalRevenue,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
      percentage: stats.avgRevenue,
      isCurrency: true,
      trend: "up",
    },
  ]

  return (
    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{card.label}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {card.isCurrency ? formatCurrency(card.value) : card.value}
                  </span>
                  <span className="flex items-center gap-0.5 text-sm text-green-500">
                    <ArrowUp className="size-3.5" />
                    {card.percentage}%
                  </span>
                </div>
              </div>
              <div className={`rounded-lg p-3 ${card.bgColor}`}>
                <card.icon className={`size-6 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}