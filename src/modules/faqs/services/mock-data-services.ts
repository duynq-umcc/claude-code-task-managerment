import { seedMockDataCollections } from "@/lib/firebase/mock-data-seeder"

import { faqsMockData } from "./faqs-mock-data"

export function seedFaqsMockData() {
  return seedMockDataCollections("faqs", [
    {
      collectionName: "faqs",
      documents: faqsMockData.faqs,
    },
    {
      collectionName: "faqCategories",
      documents: faqsMockData.categories,
      getDocumentId: (document) => String(document.name),
    },
    {
      collectionName: "faqFeatures",
      documents: faqsMockData.features,
    },
  ])
}
