"use client"

import { useState } from "react"
import { Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import type { RegisterUser } from "@/modules/consulting-clients/services/types/register-user-types"
import { deleteRegisterUser } from "@/modules/consulting-clients/services/consulting-client-services"

interface ConsultingDeleteDialogProps {
  user: RegisterUser
  onUserDeleted?: () => Promise<void>
  trigger?: React.ReactNode
}

export function ConsultingDeleteDialog({
  user,
  onUserDeleted,
  trigger,
}: ConsultingDeleteDialogProps) {
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const result = await deleteRegisterUser(user.email)

      if (result.success) {
        toast.success("Xóa thành công", {
          description: `Đã xóa khách hàng "${user.fullName}".`,
        })
        await onUserDeleted?.()
        setOpen(false)
      } else {
        toast.error("Xóa thất bại", {
          description: result.error ?? "Đã xảy ra lỗi. Vui lòng thử lại.",
        })
      }
    } catch {
      toast.error("Đã xảy ra lỗi. Vui lòng thử lại.")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            variant="ghost"
            size="sm"
            className="cursor-pointer w-full justify-start text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Xóa
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận xóa khách hàng</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div>
              Bạn có chắc chắn muốn xóa khách hàng{" "}
              <span className="font-semibold text-foreground">{user.fullName}</span>?
              <p className="mt-2 text-muted-foreground">
                Hành động này không thể hoàn tác. Tất cả thông tin đăng ký tư vấn
                của khách hàng này sẽ bị xóa vĩnh viễn.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel asChild>
            <Button
              variant="outline"
              disabled={deleting}
              className="cursor-pointer"
            >
              Hủy
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="cursor-pointer"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa khách hàng
                </>
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
