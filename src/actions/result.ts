/** Shared result shape for server actions (contracts/server-api.md). */
export type ErrorCode =
  "UNAUTHENTICATED" | "VALIDATION" | "NOT_FOUND" | "RATE_LIMITED" | "INTERNAL" | "DISABLED";

export type Result<T> = { ok: true; data: T } | { ok: false; error: ErrorCode; message: string };

export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const fail = (error: ErrorCode, message: string): Result<never> => ({
  ok: false,
  error,
  message,
});

export const MESSAGES: Record<ErrorCode, string> = {
  UNAUTHENTICATED: "Bạn cần đăng nhập để làm việc này.",
  VALIDATION: "Dữ liệu không hợp lệ.",
  NOT_FOUND: "Không tìm thấy.",
  RATE_LIMITED: "Bạn thao tác quá nhanh, vui lòng thử lại sau.",
  INTERNAL: "Đã có lỗi xảy ra. Vui lòng thử lại.",
  DISABLED: "Tính năng tài khoản chưa được cấu hình.",
};
