# Ví dụ Quy trình Xử lý Báo cáo Thực tế

Dưới đây là một kịch bản ("Scenario") cụ thể để mô tả dòng chảy dữ liệu từ khi người dùng bức xúc bấm nút Báo cáo cho đến khi Admin ra quyết định cuối cùng.

## Kịch bản: Báo cáo "Sai lệch mô tả công việc" và "Ép giá"

*   **Người báo cáo (Candidate):** Nguyễn Văn A (Sinh viên)
*   **Người bị báo cáo (Employer):** Quán Cà phê XYZ (Chủ quán)
*   **Sự việc:** Tin tuyển dụng ghi "Phục vụ bàn, 25k/h". Thực tế đến nơi bắt "Rửa bát và dọn nhà vệ sinh", cuối giờ chỉ trả 20k/h với lý do "thử việc".

---

### Bước 1: Người dùng gửi Báo cáo (User Submission)
Ngay sau khi nhận tiền và ra về, Tuấn mở App, vào lịch sử công việc, chọn **"Báo cáo"** (Report).

1.  **Chọn lý do:** Tuấn tích vào 2 ô:
    *   [x] Sai lệch mô tả công việc.
    *   [x] Trả thiếu tiền / Quỵt tiền.
2.  **Mô tả:** "Chủ quán lừa đảo. Tin ghi phục vụ nhưng bắt rửa bát dọn WC. Thỏa thuận 25k nhưng chỉ trả 20k. Thái độ rất thô lỗ."
3.  **Đính kèm bằng chứng (Evidence):**
    *   *Ảnh 1:* Screenshot đoạn chat trên App xác nhận "Lương cứng 25k, chỉ bưng bê".
    *   *Ảnh 2:* Ảnh chụp tờ ghi chép giờ làm và số tiền thực nhận (nếu có).
4.  **Gửi:** Bấm nút "Gửi báo cáo".

### Bước 2: Hệ thống Sàng lọc Tự động (System Filtering)
Hệ thống (Backend) tiếp nhận dữ liệu và chạy thuật toán kiểm tra nhanh:

1.  **Kiểm tra lịch sử:**
    *   Nhà tuyển dụng XYZ này trong tháng qua đã bị 2 người khác report với lý do tương tự ("Sai mô tả").
    *   -> Hệ thống gắn thẻ **"Cảnh báo cao" (High Priority/Flagged)**.
2.  **Tạm khóa (Tùy chọn):** Do bị report quá nhiều trong thời gian ngắn, hệ thống tạm thời **Ẩn** các tin tuyển dụng đang chạy của Quán XYZ để tránh thêm nạn nhân mới.
3.  **Tạo Ticket:** Tạo một phiếu hỗ trợ mã `#RPT-12345` và gửi thông báo cho Admin.

### Bước 3: Admin Tiếp nhận và Xử lý (Admin Processing)
Admin đăng nhập vào trang **Web Admin Dashboard**.

1.  **Thông báo:** Admin thấy thông báo đỏ: *"Ticket #RPT-12345: Quán XYZ bị báo cáo (Lần 3)"*.
2.  **Xem chi tiết:** Admin mở hồ sơ vụ việc:
    *   Đọc nội dung tố cáo của Tuấn.
    *   **Xem bằng chứng:** Admin xem ảnh chụp đoạn chat -> Xác nhận đúng là Chủ quán đã cam kết 25k/h.
    *   Xem lịch sử của Chủ quán: Đã có 2 vết đen trước đó.
3.  **Liên hệ (Nếu cần):**
    *   Admin có thể gọi điện cho Chủ quán để đối chất: "Tại sao cam kết 25k trả 20k?".
    *   *Trường hợp này bằng chứng chat quá rõ, Admin có thể bỏ qua bước gọi điện để xử lý nhanh.*

### Bước 4: Ra quyết định (Resolution)
Admin kết luận: **Nhà tuyển dụng Vi phạm**.

Admin chọn hành động xử phạt trên hệ thống:

1.  **Trừ điểm uy tín:** Trừ **-15 điểm** của Quán XYZ.
2.  **Cảnh cáo (Warning):** Gửi email/thông báo cảnh cáo cấp 2. "Nếu tái phạm sẽ khóa vĩnh viễn".
3.  **Giải quyết cho Ứng viên:**
    *   Gửi thông báo cho Tuấn: *"Báo cáo của bạn đã được xử lý. Chúng tôi đã xử phạt quán XYZ và hạ điểm uy tín của họ. Cảm ơn bạn đã đóng góp."*
    *   Cộng bù điểm uy tín cho Tuấn (an ủi): **+2 điểm**.
4.  **Đóng ticket:** Trạng thái chuyển sang "Resolved" (Đã giải quyết).

---

### Kết quả
*   **Tuấn:** Cảm thấy được hệ thống bảo vệ, tiếp tục sử dụng App.
*   **Quán XYZ:** Bị tụt hạng uy tín, tin đăng sau này sẽ ít người thấy hơn, phải tuân thủ luật chơi nếu muốn tuyển người tiếp.
