"use client"

import { useState } from "react"
import { z } from "zod"
import { toast } from "sonner"
import { Plus, Loader2 } from "lucide-react"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import type { RegisterUser } from "@/modules/consulting-clients/services/types/register-user-types"
import { createRegisterUser } from "@/modules/consulting-clients/services/consulting-client-services"

const addFormSchema = z.object({
  fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(10, "Số điện thoại phải có ít nhất 10 số"),
  content: z.string().min(10, "Nội dung phải có ít nhất 10 ký tự"),
})

type AddFormValues = z.infer<typeof addFormSchema>

interface AddConsultingClientSheetProps {
  onUserCreated?: () => Promise<void>
  trigger?: React.ReactNode
}

export function AddConsultingClientSheet({
  onUserCreated,
  trigger,
}: AddConsultingClientSheetProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<AddFormValues>({
    fullName: "",
    email: "",
    phone: "",
    content: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    try {
      const validated = addFormSchema.parse(formData)

      const result = await createRegisterUser({
        ...validated,
        submittedAt: new Date().toISOString(),
      })

      if (result.success) {
        toast.success("Thêm khách hàng thành công", {
          description: `Đã thêm khách hàng "${validated.fullName}".`,
        })
        setFormData({ fullName: "", email: "", phone: "", content: "" })
        await onUserCreated?.()
        setOpen(false)
      } else {
        toast.error("Thêm thất bại", {
          description: result.error ?? "Đã xảy ra lỗi. Vui lòng thử lại.",
        })
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        err.issues.forEach((issue) => {
          if (issue.path[0]) {
            newErrors[issue.path[0] as string] = issue.message
          }
        })
        setErrors(newErrors)
      } else {
        toast.error("Đã xảy ra lỗi. Vui lòng thử lại.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({ fullName: "", email: "", phone: "", content: "" })
    setErrors({})
    setOpen(false)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button size="sm" className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Thêm khách hàng
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Thêm khách hàng tư vấn
          </SheetTitle>
          <SheetDescription>
            Điền thông tin đăng ký tư vấn của khách hàng mới.
          </SheetDescription>
        </SheetHeader>

        {errors._form && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {errors._form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="add-fullName">
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="add-fullName"
              placeholder="Nguyễn Văn A"
              value={formData.fullName}
              onChange={(e) =>
                setFormData((p) => ({ ...p, fullName: e.target.value }))
              }
              className={errors.fullName ? "border-red-500" : ""}
            />
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="add-email"
              type="email"
              placeholder="nguyenvana@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData((p) => ({ ...p, email: e.target.value }))
              }
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-phone">
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              id="add-phone"
              type="tel"
              placeholder="0901 234 567"
              value={formData.phone}
              onChange={(e) =>
                setFormData((p) => ({ ...p, phone: e.target.value }))
              }
              className={errors.phone ? "border-red-500" : ""}
            />
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="add-content">
              Nội dung cần tư vấn <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="add-content"
              placeholder="Mô tả nhu cầu tư vấn của khách hàng..."
              rows={5}
              value={formData.content}
              onChange={(e) =>
                setFormData((p) => ({ ...p, content: e.target.value }))
              }
              className={errors.content ? "border-red-500" : ""}
            />
            {errors.content && (
              <p className="text-sm text-red-500">{errors.content}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={submitting}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={submitting} className="cursor-pointer">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang thêm...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm khách hàng
                </>
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}