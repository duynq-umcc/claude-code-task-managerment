import { seedMockDataCollections } from "@/lib/firebase/mock-data-seeder"

import { chatMockData } from "./chat-mock-data"
import type { Message } from "./types/chat-types"

const messageDocuments = Object.entries(chatMockData.messages).flatMap(
  ([conversationId, messages]) =>
    messages.map((message: Message) => ({
      ...message,
      conversationId,
    }))
)

export function seedChatMockData() {
  return seedMockDataCollections("chat", [
    {
      collectionName: "conversations",
      documents: chatMockData.conversations,
    },
    {
      collectionName: "messages",
      documents: messageDocuments,
      getDocumentId: (document) => `${document.conversationId}-${document.id}`,
    },
    {
      collectionName: "chatUsers",
      documents: chatMockData.users,
    },
  ])
}
