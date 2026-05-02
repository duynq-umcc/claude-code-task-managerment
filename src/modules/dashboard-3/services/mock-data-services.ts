import { seedMockDataCollections } from "@/lib/firebase/mock-data-seeder"

import {
  activityFeed,
  audienceData,
  campaigns,
  channelData,
  contentPipeline,
  metrics,
  socialMixData,
  topPosts,
} from "./dashboard-3-mock-data"

export function seedDashboard3MockData() {
  return seedMockDataCollections("dashboard-3", [
    {
      collectionName: "marketingMetrics",
      documents: metrics,
      getDocumentId: (document) => String(document.title),
    },
    {
      collectionName: "audiencePoints",
      documents: audienceData,
      getDocumentId: (document) => String(document.date),
    },
    {
      collectionName: "channelPerformances",
      documents: channelData,
      getDocumentId: (document) => String(document.channel),
    },
    {
      collectionName: "socialMixes",
      documents: socialMixData,
      getDocumentId: (document) => String(document.name),
    },
    {
      collectionName: "campaigns",
      documents: campaigns,
      getDocumentId: (document) => String(document.name),
    },
    {
      collectionName: "contentPipelines",
      documents: contentPipeline,
      getDocumentId: (document) => String(document.stage),
    },
    {
      collectionName: "topPosts",
      documents: topPosts,
      getDocumentId: (document) => String(document.title),
    },
    {
      collectionName: "activityFeeds",
      documents: activityFeed,
      getDocumentId: (document) => String(document.title),
    },
  ])
}
