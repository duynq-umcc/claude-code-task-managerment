import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Clock,
  Minus,
  PlayCircle,
  ChevronsUp,
} from "lucide-react"

import tasksData from "./data/tasks.json"

import { taskSchema } from "./types/task-types"

export const categories = [
  {
    value: "bug",
    label: "Bug",
  },
  {
    value: "feature",
    label: "Feature",
  },
  {
    value: "documentation",
    label: "Docs",
  },
  {
    value: "improvement",
    label: "Improvement",
  },
  {
    value: "refactor",
    label: "Refactor",
  },
]

export const statuses = [
  {
    value: "pending",
    label: "Pending",
    icon: Clock,
  },
  {
    value: "todo",
    label: "Todo",
    icon: Circle,
  },
  {
    value: "in progress",
    label: "In Progress",
    icon: PlayCircle,
  },
  {
    value: "completed",
    label: "Completed",
    icon: CheckCircle2,
  },
]

export const priorities = [
  {
    label: "Minor",
    value: "minor",
    icon: ChevronDown,
  },
  {
    label: "Normal",
    value: "normal",
    icon: Minus,
  },
  {
    label: "Important",
    value: "important",
    icon: ChevronUp,
  },
  {
    label: "Critical",
    value: "critical",
    icon: ChevronsUp,
  },
]

export const taskMockData = taskSchema.array().parse(tasksData)
