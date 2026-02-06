# Chi tiết Kịch bản Use Case (Detailed Scenarios)

Tài liệu này mô tả chi tiết từng bước tương tác (Step-by-step) của các Use Case quan trọng để đội Dev và Tester nắm rõ quy trình nghiệp vụ.

---

## 5. Use Case: Admin Xử lý Báo cáo (Handle Reports)

**Actor:** Admin
**Mục đích:** Xem xét và xử lý các hành vi vi phạm (Lừa đảo, Bùng kèo...) để làm sạch hệ thống.

**Thông tin Admin cần xem:**
Khi Admin bấm vào một Report, màn hình chi tiết phải hiển thị rõ các vùng thông tin sau:

1.  **Thông tin Vụ việc (Overview):**
    *   **Lý do báo cáo:** (VD: "Lừa đảo tiền cọc").
    *   **Thời gian:** 10:30 AM - 06/02/2026.
    *   **Đối tượng bị báo cáo:** Tin tuyển dụng #1234 hoặc User #5678.

2.  **Bằng chứng (Evidence):**
    *   **Ảnh chụp màn hình:** (Nếu người báo cáo có up).
    *   **Lịch sử Chat:** (Hệ thống tự trích xuất đoạn chat giữa 2 người này nếu có -> Cực kỳ quan trọng để verify).
    *   **Lịch sử GPS:** (Nếu báo cáo "Không đến làm việc", hệ thống hiển thị map check-in của ứng viên).

3.  **Thông tin Người bị tố cáo (Suspect Profile):**
    *   Họ tên, SĐT, Email.
    *   **Điểm uy tín (Reputation Score):** (Nếu điểm thấp sẵn -> Khả năng cao là đúng).
    *   **Lịch sử bị Report:** "Người này đã bị báo cáo 3 lần trong tháng này".

**Quy trình chi tiết:**

| Bước | Hành động của Admin | Phản hồi của Hệ thống | Ghi chú Kỹ thuật |
| :--- | :--- | :--- | :--- |
| 1 | Chọn menu **"Quản lý Báo cáo"** | Hiển thị danh sách các Report đang chờ (Status = PENDING), sắp xếp theo độ nghiêm trọng. | `GET /api/admin/reports?status=PENDING` |
| 2 | Bấm vào Report #888 của Nguyễn Văn A | Hiển thị màn hình **Chi tiết Báo cáo** (Gồm 3 vùng thông tin như trên). | `GET /api/admin/reports/888` |
| 3 | Xem xét bằng chứng (Ảnh/Chat) | Cho phép zoom ảnh, xem full log chat. | |
| 4 | **Quyết định Xử lý:** <br> - **Bỏ qua (Dismiss):** Nếu báo cáo sai/không đủ bằng chứng.<br> - **Cảnh báo:** Gửi noti nhắc nhở.<br> - **Khóa (Ban):** Khóa tài khoản vĩnh viễn. | Hiển thị popup xác nhận hành động + Lý do xử lý. | |
| 5 | Bấm "Xác nhận Khóa" | 1. Cập nhật status Report -> RESOLVED.<br>2. Cập nhật status User -> BANNED.<br>3. Gửi email thông báo cho User bị khóa. | DB Transaction (đảm bảo tính nhất quán). |

---

## Các Use Case khác (Đã định nghĩa trước đó...)
(Phần này sẽ được bổ sung dần các Use Case Check-in, Ứng tuyển...)
