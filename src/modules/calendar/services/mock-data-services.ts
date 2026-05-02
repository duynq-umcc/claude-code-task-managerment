import { seedMockDataCollections } from "@/lib/firebase/mock-data-seeder"

import { calendars, eventDates, events } from "./calendar-mock-data"

export function seedCalendarMockData() {
  return seedMockDataCollections("calendar", [
    {
      collectionName: "events",
      documents: events,
    },
    {
      collectionName: "eventDates",
      documents: eventDates,
      getDocumentId: (_, index) => `event-date-${index + 1}`,
    },
    {
      collectionName: "calendars",
      documents: calendars,
    },
  ])
}
