import { seedMockDataCollections } from "@/lib/firebase/mock-data-seeder"

import { pricingMockData } from "./pricing-mock-data"

export function seedPricingMockData() {
  return seedMockDataCollections("pricing", [
    {
      collectionName: "pricingFeatures",
      documents: pricingMockData.features,
    },
    {
      collectionName: "pricingFaqs",
      documents: pricingMockData.faqs,
    },
  ])
}
