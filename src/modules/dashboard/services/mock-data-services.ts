import { seedMockDataCollections } from "@/lib/firebase/mock-data-seeder"

import { dashboardMockData } from "./dashboard-mock-data"

export function seedDashboardMockData() {
  return seedMockDataCollections("dashboard", [
    {
      collectionName: "dashboardRows",
      documents: dashboardMockData.data,
    },
    {
      collectionName: "pastPerformances",
      documents: dashboardMockData.pastPerformanceData,
    },
    {
      collectionName: "keyPersonnel",
      documents: dashboardMockData.keyPersonnelData,
    },
    {
      collectionName: "focusDocuments",
      documents: dashboardMockData.focusDocumentsData,
    },
  ])
}
