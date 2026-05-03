import { z } from "zod"

export const registerUserSchema = z.object({
  id: z.string(),
  fullName: z.string().min(2, "Họ và tên phải có ít nhất 2 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().min(10, "Số điện thoại phải có ít nhất 10 số").regex(/^[0-9+\s()-]+$/, "Số điện thoại không hợp lệ"),
  content: z.string().min(10, "Nội dung phải có ít nhất 10 ký tự"),
  createdAt: z.string(),
  submittedAt: z.string().optional(),
})

export type RegisterUser = z.infer<typeof registerUserSchema>
