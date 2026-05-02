import { getFirestoreCollection } from "@/lib/firebase/firestore-query"

import { taskMockData } from "./task-mock-data"
import type { Task } from "./types/task-types"

export async function getTasks(): Promise<Task[]> {
  return getFirestoreCollection<Task>("tasks", taskMockData)
}

export function getTaskStats(tasks: Task[]) {
  const total = tasks.length

  return {
    total,
    completed: tasks.filter((task) => task.status === "completed").length,
    inProgress: tasks.filter((task) => task.status === "in progress").length,
    pending: tasks.filter((task) => task.status === "pending").length,
  }
}
