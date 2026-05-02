"use client"

import { useState } from "react"
import { z } from "zod"
import { toast } from "sonner"
import { Pencil, Loader2 } from "lucide-react"

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
import { updateRegisterUser } from "@/modules/consulting-clients/services/consulting-client-services"

const editFormSchema = z.object({
  fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(10, "Số điện thoại phải có ít nhất 10 số"),
  content: z.string().min(10, "Nội dung phải có ít nhất 10 ký tự"),
})

type EditFormValues = z.infer<typeof editFormSchema>

interface ConsultingEditSheetProps {
  user: RegisterUser
  onUserUpdated?: () => Promise<void>
  trigger?: React.ReactNode
}

export function ConsultingEditSheet({
  user,
  onUserUpdated,
  trigger,
}: ConsultingEditSheetProps) {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<EditFormValues>({
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    content: user.content,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrors({})

    try {
      const validated = editFormSchema.parse(formData)
      const result = await updateRegisterUser({ ...validated, id: user.id, submittedAt: user.submittedAt })

      if (result.success) {
        toast.success("Cập nhật thành công", {
          description: `Thông tin của "${validated.fullName}" đã được cập nhật.`,
        })
        await onUserUpdated?.()
        setOpen(false)
      } else {
        toast.error("Cập nhật thất bại", {
          description: result.error ?? "Đã xảy ra lỗi khi cập nhật. Vui lòng thử lại.",
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer w-full justify-start"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Chỉnh sửa
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Chỉnh sửa khách hàng
          </SheetTitle>
          <SheetDescription>
            Cập nhật thông tin đăng ký tư vấn của khách hàng.
          </SheetDescription>
        </SheetHeader>

        {errors._form && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
            {errors._form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="edit-fullName">
              Họ và tên <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-fullName"
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
            <Label htmlFor="edit-email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-email"
              type="email"
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
            <Label htmlFor="edit-phone">
              Số điện thoại <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-phone"
              type="tel"
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
            <Label htmlFor="edit-content">
              Nội dung cần tư vấn <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="edit-content"
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
              onClick={() => setOpen(false)}
              disabled={submitting}
              className="cursor-pointer"
            >
              Hủy
            </Button>
            <Button type="submit" disabled={submitting} className="cursor-pointer">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Pencil className="w-4 h-4 mr-2" />
                  Lưu thay đổi
                </>
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  )
}
