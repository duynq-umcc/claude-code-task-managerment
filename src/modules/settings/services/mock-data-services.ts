import { seedMockDataCollections } from "@/lib/firebase/mock-data-seeder"

import { settingsMockData } from "./settings-mock-data"

export function seedSettingsMockData() {
  return seedMockDataCollections("settings", [
    {
      collectionName: "currentPlans",
      documents: [
        {
          id: "professional",
          ...settingsMockData.currentPlan,
        },
      ],
    },
    {
      collectionName: "billingHistories",
      documents: settingsMockData.billingHistory,
    },
  ])
}
