import { z } from "zod"

export const customerSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  company: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(["active", "inactive", "new", "prospecting"]),
  source: z.enum(["website", "referral", "social", "ads", "other"]),
  totalSpent: z.number().min(0).default(0),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
  createdAt: z.string(),
})

export type Customer = z.infer<typeof customerSchema>
