import { seedMockDataCollections } from "@/lib/firebase/mock-data-seeder"

import { userMockData } from "./user-mock-data"

export function seedUsersMockData() {
  return seedMockDataCollections("users", [
    {
      collectionName: "users",
      documents: userMockData,
    },
  ])
}
