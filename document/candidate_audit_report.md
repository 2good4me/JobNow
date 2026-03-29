# [Kiểm định] Báo cáo Audit hệ thống JobNow: Vai trò Ứng viên

**Người thực hiện:** Senior Solution Architect & UX Expert
**Ngày thực hiện:** 2026-03-28
**Phạm vi:** Frontend (Hồ sơ, Ví, Xác thực), Backend (Rút tiền, Uy tín), Độ ổn định.

---

## 1. UX & Các khoảng cách về giao diện

### Hồ sơ ứng viên (`profile/index.tsx`)
*   **[GAP] Hiển thị Điểm uy tín**: Thiết kế yêu cầu **Vòng tròn tiến trình (Circular Progress Ring)** (Điểm số bên trong). Hiện tại đang sử dụng thanh tiến trình ngang.
*   **[GAP] Trạng thái Xác thực**: Không có huy hiệu (badge) hiển thị trên ảnh đại diện khi đã xác thực. Dashboard cũng thiếu huy hiệu này.
*   **[GAP] Trung thực với thiết kế**: Thiết kế yêu cầu ảnh đại diện đè lên dải màu nền (cover). Hiện tại đang chia đôi header đơn giản.
*   **[THIẾU] Cảnh báo eKYC**: Không có lời nhắc nổi bật cho người dùng chưa xác thực (thiếu Thẻ cảnh báo Amber Alert Card).

### Ví (`wallet.tsx`)
*   **[GAP] Chỉ báo trạng thái**: Danh sách giao dịch thiếu một số quy ước màu sắc hoặc dấu chấm trạng thái cụ thể.
*   **[UI/UX] Cảm giác "Premium"**: Thẻ số dư đang dùng gradient xanh lá, trong khi thiết kế hệ thống yêu cầu gradient Xanh Navy/Đậm để tạo cảm giác "Fintech".

### Luồng eKYC (`verification/index.tsx`)
*   **[THIẾU] Bước chân dung**: Thiết kế yêu cầu Bước 1 (CCCD) -> Bước 2 (Chân dung) -> Bước 3 (Xem thông tin OCR). Luồng hiện tại nhảy thẳng từ tải CCCD sang Thành công.
*   **[GAP CHỨC NĂNG] Xem trước OCR**: Người dùng không thể kiểm tra hoặc sửa thông tin đã trích xuất trước khi gửi hồ sơ.

---

## 2. Kiểm định Logic Backend

### Hệ thống uy tín (`reputation.ts`)
*   **[ƯU ĐIỂM]** Cập nhật transactional được sử dụng chính xác để đảm bảo nhất quán dữ liệu.
*   **[ƯU ĐIỂM]** Logic phục hồi chuỗi (streak recovery) (10 hành động tích cực hồi 50% điểm trừ) đã được triển khai tốt.
*   **[QUAN SÁT]** Khóa khử trùng lặp (Deduplication keys) dựa trên `applicationId`, ngăn chặn race conditions khi cập nhật trạng thái.

### Rút tiền & Ví
*   **[NHẤT QUÁN]** Tên thuộc tính: Đã sửa từ `wallet_balance` thành `balance` để đồng bộ với giao diện `UserProfile`.
*   **[BẢO MẬT]** Firebase rules giới hạn quyền ghi lên `role` và `balance` (chỉ cho phép Cloud Functions).

---

## 3. Nợ kỹ thuật & Độ ổn định

### An toàn kiểu dữ liệu (Type Safety)
*   **[NGHIÊM TRỌNG]** Thuộc tính thiếu trong `UserProfile` từng gây lỗi runtime (ví dụ: `balance`).
*   **[LINTING]** Hơn 15 imports/biến dư thừa được xác định trong `ts_errors.txt`.
*   **[ROUTING]** Lỗi `NavigateOptions` trong `employer/shift-management.tsx` chặn tiến trình build.

---

## 4. Kiến nghị ưu tiên

1.  **Ngay lập tức (Cao)**: Sửa tất cả lỗi `tsc` và imports dư thừa để làm sạch bản build.
2.  **Đánh bóng UX (Trung bình)**: Đồng bộ UI Hồ sơ và Điểm uy tín theo đúng bản thiết kế.
3.  **Sẵn sàng tính năng (Trung bình)**: Hoàn thiện luồng eKYC 3 bước với Portrait stub và OCR preview.
4.  **Tinh gọn (Thấp)**: Đưa các logic UI lặp lại vào các thành phần dùng chung (Shared features).
