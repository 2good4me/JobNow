# Báo cáo kết quả kiểm thử tự động (E2E) - JobNow Project

## 1. Tổng quan hệ thống Test
- **Công cụ:** Playwright Test.
- **Cấu hình:** 
  - Tự động khởi động Web Server (Port 3000) và API Server (Port 3001) qua `pnpm run dev`.
  - Giả lập thiết bị di động (iPhone/Android Viewport: 390x844).
  - Xuất báo cáo dưới dạng HTML.

## 2. Các kịch bản đã triển khai
1. **Employer Registration:** Đăng ký tài khoản Nhà tuyển dụng mới.
2. **Candidate Registration:** Đăng ký tài khoản Người tìm việc mới.

## 3. Kết quả hiện tại (Status: 🔴 Failing)
Cả 2 kịch bản đều đang gặp lỗi **Timeout (Quá thời gian chờ)** tại bước đầu tiên.

### Chi tiết lỗi:
- **Vấn đề:** Playwright không tìm thấy các thành phần UI (thẻ `h3`, nút chọn Role) sau khi truy cập vào `/register`.
- **Dấu hiệu đặc biệt:** Nhật ký debug cho thấy `Found h3 texts: []` (Không tìm thấy thẻ h3 nào trên trang).
- **Phân tích nguyên nhân:**
  1. **Tốc độ Server:** Môi trường phát triển (Vite/Turbo) có thể mất quá nhiều thời gian để compile lần đầu, vượt quá ngưỡng timeout 90 giây.
  2. **Hydration/Loading:** Trang web có thể đang dừng ở trạng thái Loading (Skeleton) hoặc Splash screen quá lâu.
  3. **Firebase Init:** Có thể có lỗi kết nối Firebase Auth trong môi trường test dẫn đến trang không render được form.

## 4. Hành động tiếp theo đề xuất
- [ ] Chạy server bằng tay trước (`pnpm run dev`) rồi mới chạy test để loại trừ độ trễ khởi động.
- [ ] Kiểm tra lại file `apps/web/src/routes/register.tsx` để xem có điều kiện render nào (như `if (loading) return null`) đang chặn hiển thị không.
- [ ] Bổ sung kịch bản Test cho Luồng Đăng tin (Job Posting) và Ứng tuyển (Applying) sau khi sửa được lỗi Đăng ký.
