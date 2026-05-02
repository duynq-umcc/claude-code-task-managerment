import { seedMockDataCollections } from "@/lib/firebase/mock-data-seeder"

import { accounts, contacts, mails } from "./mail-mock-data"

const accountDocuments = accounts.map(({ label, email }) => ({
  label,
  email,
}))

export function seedMailMockData() {
  return seedMockDataCollections("mail", [
    {
      collectionName: "mails",
      documents: mails,
    },
    {
      collectionName: "mailAccounts",
      documents: accountDocuments,
      getDocumentId: (document) => String(document.email),
    },
    {
      collectionName: "contacts",
      documents: contacts,
      getDocumentId: (document) => String(document.email),
    },
  ])
}
