"use client"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { z } from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { statuses, sources } from "@/modules/customers/services/customer-mock-data"
import { createCustomer } from "@/modules/customers/services/customer-services"
import type { Customer } from "@/modules/customers/services/types/customer-types"

const customerFormSchema = z.object({
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

type CustomerFormData = z.infer<typeof customerFormSchema>

interface AddCustomerModalProps {
  onCustomerCreated?: () => Promise<void>
  trigger?: React.ReactNode
}

export function AddCustomerModal({ onCustomerCreated, trigger }: AddCustomerModalProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<CustomerFormData>({
    id: "",
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    status: "new",
    source: "website",
    totalSpent: 0,
    tags: [],
    notes: "",
    createdAt: new Date().toISOString().split("T")[0],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const generateCustomerId = () => {
    const prefix = "CUS"
    const number = Math.floor(Math.random() * 9999) + 1000
    return `${prefix}-${number}`
  }

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    try {
      const validatedData = customerFormSchema.parse({
        ...formData,
        id: generateCustomerId(),
      })

      const newCustomer: Customer = {
        id: validatedData.id,
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || undefined,
        company: validatedData.company || undefined,
        address: validatedData.address || undefined,
        status: validatedData.status,
        source: validatedData.source,
        totalSpent: validatedData.totalSpent,
        tags: validatedData.tags,
        notes: validatedData.notes || undefined,
        createdAt: validatedData.createdAt,
      }

      const result = await createCustomer(newCustomer)

      if (result.success) {
        toast.success("Customer created successfully")

        // Reset form fields
        setFormData({
          id: "",
          name: "",
          email: "",
          phone: "",
          company: "",
          address: "",
          status: "new",
          source: "website",
          totalSpent: 0,
          tags: [],
          notes: "",
          createdAt: new Date().toISOString().split("T")[0],
        })

        // Refetch from Firestore to ensure data consistency
        await onCustomerCreated?.()

        // Close dialog after toast is visible
        setTimeout(() => setOpen(false), 300)
      } else {
        // Firestore failed — show error directly on form, keep dialog open
        setErrors({ _form: result.error ?? "Failed to save to database. Please check your Firebase connection." })
        toast.error("Failed to save customer: " + (result.error ?? "Database error"))
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            newErrors[issue.path[0] as string] = issue.message
          }
        })
        setErrors(newErrors)
      } else {
        toast.error("Failed to create customer. Please try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      id: "",
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      status: "new",
      source: "website",
      totalSpent: 0,
      tags: [],
      notes: "",
      createdAt: new Date().toISOString().split("T")[0],
    })
    setErrors({})
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="default" size="sm" className="cursor-pointer">
            <Plus className="w-4 h-4" />
            Add Customer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Add a new customer to your CRM. Fill in the details below.
          </DialogDescription>
          {errors._form && (
            <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
              {errors._form}
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name & Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                placeholder="Nguyễn Văn A"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Phone & Company */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                placeholder="0912 345 678"
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                placeholder="Company name"
                value={formData.company}
                onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="123 Nguyễn Huệ, Q.1, TP.HCM"
              value={formData.address}
              onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
            />
          </div>

          {/* Status & Source */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value as CustomerFormData["status"] }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center">
                        {status.icon && (
                          <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        )}
                        {status.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Select
                value={formData.source}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, source: value as CustomerFormData["source"] }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  {sources.map((source) => (
                    <SelectItem key={source.value} value={source.value}>
                      <div className="flex items-center">
                        {source.icon && (
                          <source.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                        )}
                        {source.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Initial Spent */}
          <div className="space-y-2">
            <Label htmlFor="totalSpent">Initial Spent (VND)</Label>
            <Input
              id="totalSpent"
              type="number"
              min="0"
              placeholder="0"
              value={formData.totalSpent}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, totalSpent: Number(e.target.value) || 0 }))
              }
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about this customer..."
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-2">
            <Button type="button" variant="outline" onClick={handleCancel} disabled={submitting} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" disabled={submitting} className="cursor-pointer">
              {submitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Create Customer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
