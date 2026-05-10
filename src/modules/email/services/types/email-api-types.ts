export interface EmailApiLog {
  id: string
  endpoint: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  statusCode: number
  requestBody?: Record<string, unknown>
  responseBody?: Record<string, unknown>
  error?: string
  emailLogId?: string
  timestamp: string
}
