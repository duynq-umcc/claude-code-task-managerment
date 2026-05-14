"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { Loader2, UserPlus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { db } from "@/lib/firebase/client"

const registerFormSchema = z.object({
  fullName: z.string().min(2, {
    message: "Họ và tên phải có ít nhất 2 ký tự.",
  }),
  email: z.string().email({
    message: "Vui lòng nhập địa chỉ email hợp lệ.",
  }),
  phone: z
    .string()
    .min(10, {
      message: "Số điện thoại phải có ít nhất 10 số.",
    })
    .regex(/^[0-9+\s()-]+$/, {
      message: "Số điện thoại không hợp lệ.",
    }),
  content: z.string().min(10, {
    message: "Nội dung cần tư vấn phải có ít nhất 10 ký tự.",
  }),
})

type RegisterFormValues = z.infer<typeof registerFormSchema>

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      content: "",
    },
  })

  async function onSubmit(values: RegisterFormValues) {
    setIsSubmitting(true)
    try {
      await addDoc(collection(db, "register_users"), {
        ...values,
        createdAt: serverTimestamp(),
        submittedAt: serverTimestamp(),
      })
      toast.success("Đăng ký thành công!", {
        description: "Chúng tôi sẽ liên hệ với bạn sớm nhất có thể.",
      })
      form.reset()

      // Trigger auto-reply email (non-blocking)
      const apiBase = process.env.NEXT_PUBLIC_APP_URL ?? ""
      fetch(`${apiBase}/api/email/auto-reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.skipped) {
            // auto-reply is off — silent, no user-facing notification
          } else if (data.success) {
            toast.success("Email phản hồi tự động đã được gửi!", {
              description: "Vui lòng kiểm tra hộp thư để xem nội dung phản hồi.",
            })
          } else {
            toast.error("Gửi email phản hồi thất bại", {
              description: data.error || "Đã xảy ra lỗi khi gửi email phản hồi tự động.",
            })
          }
        })
        .catch((err) => {
          // Network error or API unreachable — user should know
          console.error("[auto-reply] Fetch error:", err)
          toast.error("Không thể kết nối API phản hồi tự động", {
            description: "Vui lòng kiểm tra lại sau hoặc liên hệ hỗ trợ.",
          })
        })
    } catch (error) {
      toast.error("Đăng ký thất bại", {
        description: "Đã xảy ra lỗi khi gửi thông tin. Vui lòng thử lại.",
      })
      console.error("Registration error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="contact" className="py-16 sm:py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12 sm:mb-16">
          <Badge variant="outline" className="mb-4">
            Đăng ký tư vấn
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Bắt đầu hành trình của bạn
          </h2>
          <p className="text-lg text-muted-foreground">
            Để lại thông tin, chúng tôi sẽ liên hệ và tư vấn giải pháp phù hợp
            nhất cho bạn.
          </p>
        </div>

        <div className="mx-auto max-w-xl">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <UserPlus className="h-5 w-5" />
                Đăng ký tư vấn miễn phí
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nguyễn Văn A"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="nguyenvana@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Số điện thoại</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="0901 234 567"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nội dung cần tư vấn</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Mô tả ngắn về nhu cầu hoặc câu hỏi của bạn..."
                            rows={5}
                            className="min-h-[120px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full cursor-pointer"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="me-2 h-4 w-4 animate-spin" />
                        Đang gửi...
                      </>
                    ) : (
                      "Gửi đăng ký"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
