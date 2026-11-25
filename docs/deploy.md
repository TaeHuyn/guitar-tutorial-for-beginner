# Triển khai lên Vercel + Supabase

## 1. Chỉ phần học và công cụ (không tài khoản)

1. Đẩy repo lên GitHub, tạo dự án trên Vercel từ repo đó (framework: Next.js, mặc định).
2. Không cần biến môi trường. Tiến độ người học được lưu trên thiết bị của họ.

## 2. Bật tài khoản

### Supabase

1. Tạo dự án trên https://supabase.com (gói miễn phí đủ cho MVP). Chọn region gần Việt Nam (Singapore).
2. Áp dụng schema:

   ```bash
   npx supabase link --project-ref <project-ref>
   ```

   ```bash
   npx supabase db push
   ```

3. **Authentication → URL Configuration**
   - Site URL: `https://<ten-mien-cua-ban>`
   - Redirect URLs: `https://<ten-mien-cua-ban>/auth/callback` và (cho preview) `https://*-<team>.vercel.app/auth/callback`
4. **Authentication → Providers**
   - Email: bật, dùng magic link (không mật khẩu).
   - Google: bật, nhập Client ID/Secret từ Google Cloud Console (OAuth client loại *Web application*,
     Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`).
5. **Email**: cấu hình SMTP riêng (Resend, Postmark…) trước khi ra mắt — SMTP mặc định của Supabase giới hạn
   rất thấp.

### Vercel — Environment Variables

| Biến | Giá trị | Phạm vi |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon key | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key (**bí mật**) | Production, Preview |
| `NEXT_PUBLIC_SITE_URL` | `https://<ten-mien-cua-ban>` | Production |

Không commit các khóa này. `SUPABASE_SERVICE_ROLE_KEY` chỉ được dùng ở server (xóa tài khoản, ghi số liệu
ẩn danh).

## 3. Sau khi triển khai

- Mở trang trên điện thoại → "Thêm vào màn hình chính" để cài như ứng dụng.
- Tắt mạng và mở Lên dây / Đếm nhịp / Hợp âm để kiểm tra offline.
- Chỉ tiêu thành công: chạy `supabase/queries/success-metrics.sql` trong SQL editor của Supabase.
