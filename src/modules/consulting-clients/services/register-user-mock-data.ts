import { registerUserSchema } from "./types/register-user-types"

const rawMockData = [
  {
    id: "RC-1001",
    fullName: "Nguyễn Văn Minh",
    email: "minh.nguyen@company.vn",
    phone: "0901 234 567",
    content: "Tôi muốn tư vấn về giải pháp quản lý nhân sự cho công ty 50 người. Xin hỏi chi phí triển khai và thời gian bắt đầu như thế nào?",
    submittedAt: "2026-04-15T10:30:00Z",
  },
  {
    id: "RC-1002",
    fullName: "Trần Thị Lan",
    email: "lan.tran@startup.io",
    phone: "0912 345 678",
    content: "Công ty chúng tôi đang mở rộng, cần một hệ thống CRM để quản lý khách hàng. Bạn có thể demo sản phẩm không?",
    submittedAt: "2026-04-16T14:22:00Z",
  },
  {
    id: "RC-1003",
    fullName: "Lê Hoàng Nam",
    email: "nam.hoang@enterprise.com",
    phone: "0933 456 789",
    content: "Chúng tôi cần tích hợp hệ thống ERP với CRM hiện tại. Liệu giải pháp của bạn có hỗ trợ API không?",
    submittedAt: "2026-04-17T09:15:00Z",
  },
  {
    id: "RC-1004",
    fullName: "Phạm Thu Hà",
    email: "ha.pham@edu.org.vn",
    phone: "0944 567 890",
    content: "Trường học chúng tôi cần phần mềm quản lý học sinh và điểm. Bạn có gói dịch vụ cho giáo dục không?",
    submittedAt: "2026-04-18T11:45:00Z",
  },
  {
    id: "RC-1005",
    fullName: "Đặng Minh Tuấn",
    email: "tuan.dang@tech.vn",
    phone: "0955 678 901",
    content: "Công ty startup 10 người, cần giải pháp quản lý dự án và giao việc. Có thể dùng thử miễn phí không?",
    submittedAt: "2026-04-19T16:00:00Z",
  },
  {
    id: "RC-1006",
    fullName: "Ngô Thị Mai",
    email: "mai.ngo@retail.vn",
    phone: "0966 789 012",
    content: "Chuỗi cửa hàng của tôi cần hệ thống quản lý bán hàng và tồn kho. Xin báo giá chi tiết.",
    submittedAt: "2026-04-20T08:30:00Z",
  },
  {
    id: "RC-1007",
    fullName: "Bùi Đức Anh",
    email: "anh.bui@agency.vn",
    phone: "0977 890 123",
    content: "Agency của tôi cần công cụ quản lý khách hàng và dự án. Bạn có giải pháp phù hợp không?",
    submittedAt: "2026-04-21T13:20:00Z",
  },
  {
    id: "RC-1008",
    fullName: "Vũ Minh Châu",
    email: "chau.vu@health.vn",
    phone: "0988 901 234",
    content: "Phòng khám của chúng tôi cần phần mềm quản lý bệnh nhân và lịch hẹn. Bác sĩ có thể dùng thử không?",
    submittedAt: "2026-04-22T10:00:00Z",
  },
]

export const registerUserMockData = registerUserSchema.array().parse(rawMockData)