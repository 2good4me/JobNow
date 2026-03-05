# NHIỆM VỤ DÀNH CHO CODEX: XÂY DỰNG UI NHÀ TUYỂN DỤNG TỪ RAW HTML

Chào Codex, bạn được giao nhiệm vụ chuyển đổi các bản thiết kế gốc (dưới dạng file HTML tĩnh có chứa các class Tailwind) thành các React Component chuẩn mực cho dự án **JobNow**.

## 1. Ngữ cảnh & Nguồn tài nguyên
Tôi đã thay mặt bạn tải sẵn các đoạn mã HTML/Tailwind gốc từ công cụ Stitch MCP và lưu ở thư mục `docs/stitch_screens/`. Dự án sử dụng **React 18, Vite, TanStack Router, và Tailwind CSS**.

Danh sách file HTML gốc bạn cần sử dụng làm nguyên liệu:
- `docs/stitch_screens/applicants.html` (Màn hình quản lý ứng viên)
- `docs/stitch_screens/post_job_step1.html` -> `step4.html` (4 màn hình của quá trình đăng tin)
- `docs/stitch_screens/profile.html` (Màn hình tài khoản)

## 2. Nhiệm vụ của bạn (Chỉ tập trung xử lý UI)
Hãy đọc nội dung các file HTML trên và refactor chúng thành các file React Router (đuôi `.tsx`) tại các đường dẫn sau:

1. **Quản lý Ứng viên:**
   - Đọc: `docs/stitch_screens/applicants.html`
   - Ghi vào: `apps/web/src/routes/employer/applicants.tsx`
   - *Yêu cầu: Dùng mock data array cho danh sách ứng viên.*

2. **Wizard Đăng Tin Tuyển Dụng:**
   - Đọc: Các file từ `post_job_step1.html` đến `post_job_step4.html`.
   - Ghi vào: `apps/web/src/routes/employer/post-job.tsx`
   - *Yêu cầu: Ghép các màn hình này thành một luồng (Wizard) hoặc một trang cuộn dài. Giữ nguyên các hiệu ứng UI.*

3. **Hồ sơ Công ty:**
   - Đọc: `docs/stitch_screens/profile.html`
   - Ghi vào: `apps/web/src/routes/employer/profile.tsx`
   - *Yêu cầu: Xử lý phần avatar, thống kê rating, menu cài đặt.*

## 3. Quy tắc Code (Bắt buộc tuân thủ)
- **Tách Component:** Nếu có các đoạn UI lặp lại (ví dụ Applicant Card, Job Form Input), hãy chủ động tách ra thành các file nhỏ trong `apps/web/src/components/ui/`.
- **Styling:** Tuân thủ 100% Tailwind CSS. Không dùng CSS thuần hoặc logic styled-components.
- **Data:** Mọi dữ liệu (tên người, số liệu) hiện tại cứ dùng Hard-code (Mock data) ngay trong component để chạy giao diện trước. Backend Agent sẽ lo phần kết nối API sau.
- **Icons:** Thay thế các thẻ `<svg>` dài dòng trong HTML bằng các icon tương ứng từ thư viện `lucide-react` để code ngắn gọn và dễ bảo trì hơn.

Hãy bắt đầu bằng cách đọc tệp `docs/stitch_screens/applicants.html` và thi công route `employer/applicants.tsx` đầu tiên.
