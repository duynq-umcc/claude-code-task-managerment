"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { deleteCustomer } from "@/modules/customers/services/customer-services"
import type { Customer } from "@/modules/customers/services/types/customer-types"

interface DeleteCustomerDialogProps {
  customer: Customer
  onCustomerDeleted?: () => Promise<void>
  trigger?: React.ReactNode
}

export function DeleteCustomerDialog({ customer, onCustomerDeleted, trigger }: DeleteCustomerDialogProps) {
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const result = await deleteCustomer(customer.id)

      if (result.success) {
        toast.success(`Customer "${customer.name}" deleted successfully`)
        await onCustomerDeleted?.()
        setOpen(false)
      } else {
        toast.error("Failed to delete customer: " + (result.error ?? "Database error"))
      }
    } catch {
      toast.error("Failed to delete customer. Please try again.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="cursor-pointer w-full justify-start text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Customer</DialogTitle>
          <DialogDescription asChild>
            <div>
              <p>
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">{customer.name}</span>?
              </p>
              <p className="mt-2 text-muted-foreground">
                This action cannot be undone. All customer data will be permanently removed.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={deleting} className="cursor-pointer">
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            className="cursor-pointer"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            {deleting ? "Deleting..." : "Delete Customer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
