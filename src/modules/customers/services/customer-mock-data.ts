import {
  CheckCircle2,
  Clock,
  Circle,
  Star,
  Users,
  TrendingUp,
  UserPlus,
  XCircle,
  Target,
  Globe,
  Share2,
  Megaphone,
  HelpCircle,
} from "lucide-react"

import customersData from "./data/customers.json"
import { customerSchema } from "./types/customer-types"

export const statuses = [
  { value: "active", label: "Active", icon: CheckCircle2 },
  { value: "inactive", label: "Inactive", icon: XCircle },
  { value: "new", label: "New", icon: UserPlus },
  { value: "prospecting", label: "Prospecting", icon: Target },
]

export const sources = [
  { value: "website", label: "Website", icon: Globe },
  { value: "referral", label: "Referral", icon: Share2 },
  { value: "social", label: "Social Media", icon: Users },
  { value: "ads", label: "Ads", icon: Megaphone },
  { value: "other", label: "Other", icon: HelpCircle },
]

export const customerTags = [
  { value: "vip", label: "VIP", color: "text-yellow-600" },
  { value: "enterprise", label: "Enterprise", color: "text-purple-600" },
  { value: "startup", label: "Startup", color: "text-blue-600" },
  { value: "partner", label: "Partner", color: "text-green-600" },
  { value: "healthcare", label: "Healthcare", color: "text-red-600" },
  { value: "education", label: "Education", color: "text-indigo-600" },
  { value: "retail", label: "Retail", color: "text-pink-600" },
  { value: "fintech", label: "FinTech", color: "text-cyan-600" },
  { value: "logistics", label: "Logistics", color: "text-orange-600" },
  { value: "tech", label: "Tech", color: "text-gray-600" },
  { value: "fashion", label: "Fashion", color: "text-pink-500" },
  { value: "fmcg", label: "FMCG", color: "text-teal-600" },
  { value: "automotive", label: "Automotive", color: "text-slate-600" },
  { value: "construction", label: "Construction", color: "text-amber-600" },
  { value: "travel", label: "Travel", color: "text-emerald-600" },
  { value: "real-estate", label: "Real Estate", color: "text-rose-600" },
  { value: "saas", label: "SaaS", color: "text-violet-600" },
  { value: "beauty", label: "Beauty", color: "text-fuchsia-600" },
  { value: "pet", label: "Pet", color: "text-amber-500" },
  { value: "security", label: "Security", color: "text-stone-600" },
  { value: "energy", label: "Energy", color: "text-lime-600" },
  { value: "ecommerce", label: "E-Commerce", color: "text-sky-600" },
  { value: "agriculture", label: "Agriculture", color: "text-green-500" },
]

export const customerMockData = customerSchema.array().parse(customersData)