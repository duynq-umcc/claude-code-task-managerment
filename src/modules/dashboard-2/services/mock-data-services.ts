import { seedMockDataCollections } from "@/lib/firebase/mock-data-seeder"

import { dashboard2MockData } from "./dashboard-2-mock-data"

export function seedDashboard2MockData() {
  return seedMockDataCollections("dashboard-2", [
    {
      collectionName: "businessDashboards",
      documents: [
        {
          id: "default",
          ...dashboard2MockData.dashboardData,
        },
      ],
    },
  ])
}
