import { seedMockDataCollections } from "@/lib/firebase/mock-data-seeder"

import { taskMockData } from "./task-mock-data"

export function seedTasksMockData() {
  return seedMockDataCollections("tasks", [
    {
      collectionName: "tasks",
      documents: taskMockData,
    },
  ])
}
