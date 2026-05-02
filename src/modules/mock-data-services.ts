import "server-only"

import type { SeedFeatureResult } from "@/lib/firebase/mock-data-seeder"
import { seedCalendarMockData } from "@/modules/calendar/services/mock-data-services"
import { seedChatMockData } from "@/modules/chat/services/mock-data-services"
import { seedDashboardMockData } from "@/modules/dashboard/services/mock-data-services"
import { seedDashboard2MockData } from "@/modules/dashboard-2/services/mock-data-services"
import { seedDashboard3MockData } from "@/modules/dashboard-3/services/mock-data-services"
import { seedFaqsMockData } from "@/modules/faqs/services/mock-data-services"
import { seedMailMockData } from "@/modules/mail/services/mock-data-services"
import { seedPricingMockData } from "@/modules/pricing/services/mock-data-services"
import { seedSettingsMockData } from "@/modules/settings/services/mock-data-services"
import { seedTasksMockData } from "@/modules/tasks/services/mock-data-services"
import { seedUsersMockData } from "@/modules/users/services/mock-data-services"

export const mockDataFeatures = [
  { id: "tasks", label: "Tasks", seed: seedTasksMockData },
  { id: "users", label: "Users", seed: seedUsersMockData },
  { id: "chat", label: "Chat", seed: seedChatMockData },
  { id: "calendar", label: "Calendar", seed: seedCalendarMockData },
  { id: "mail", label: "Mail", seed: seedMailMockData },
  { id: "dashboard", label: "Dashboard", seed: seedDashboardMockData },
  { id: "dashboard-2", label: "Dashboard 2", seed: seedDashboard2MockData },
  { id: "dashboard-3", label: "Dashboard 3", seed: seedDashboard3MockData },
  { id: "faqs", label: "FAQs", seed: seedFaqsMockData },
  { id: "pricing", label: "Pricing", seed: seedPricingMockData },
  { id: "settings", label: "Settings", seed: seedSettingsMockData },
]

export async function seedFeatureMockData(
  featureId: string
): Promise<SeedFeatureResult[]> {
  if (featureId === "all") {
    return Promise.all(mockDataFeatures.map((feature) => feature.seed()))
  }

  const feature = mockDataFeatures.find((item) => item.id === featureId)

  if (!feature) {
    throw new Error(`Unknown mock data feature: ${featureId}`)
  }

  return [await feature.seed()]
}
