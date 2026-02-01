# Biểu đồ Hoạt động (Activity Flow)

Tài liệu này mô tả luồng công việc (Workflow) và các điểm ra quyết định (Decision Points) của hệ thống dưới dạng văn bản từng bước.

## 1. Luồng Hoạt động: Quy trình Tuyển dụng (Recruitment Process)
**Mục tiêu:** Mô tả từ lúc Ứng viên nộp đơn đến khi được nhận.

*   **Bước 1: Nộp đơn**
    *   Candidate xem chi tiết tin tuyển dụng.
    *   Candidate bấm nút "Ứng tuyển ngay".
    *   Hệ thống kiểm tra: Hồ sơ có đủ thông tin chưa?
        *   *Nếu thiếu:* Yêu cầu Candidate cập nhật hồ sơ -> Quay lại Bước 1.
        *   *Nếu đủ:* Chuyển đơn sang trạng thái `PENDING` (Chờ duyệt).

*   **Bước 2: Sàng lọc**
    *   Employer nhận thông báo có đơn mới.
    *   Employer xem hồ sơ Candidate (Kinh nghiệm, Đánh giá cũ).
    *   **Quyết định (Rẽ nhánh):**
        *   *Nhánh A (Duyệt):* Employer bấm "Chấp nhận" -> Hệ thống gửi thông báo "Chúc mừng" cho Candidate -> Đơn chuyển sang `APPROVED`.
        *   *Nhánh B (Từ chối):* Employer bấm "Từ chối" -> Hệ thống báo tin buồn -> Quy trình kết thúc.

---

## 2. Luồng Hoạt động: Quy trình Đi làm & Chấm công (Daily Work Flow)
**Mục tiêu:** Kiểm soát việc nhân viên có mặt tại điểm làm việc.

*   **Bước 1: Bắt đầu ca làm**
    *   Candidate đến địa điểm làm việc.
    *   Candidate bấm nút "Check-in".
    *   **Hệ thống kiểm tra vị trí (Decision):**
        *   *Nếu sai vị trí (>200m):* Báo lỗi, yêu cầu thử lại.
        *   *Nếu đúng vị trí:* Ghi nhận Check-in thành công -> Bắt đầu tính giờ làm.

*   **Bước 2: Kết thúc ca làm**
    *   Candidate hoàn thành công việc.
    *   Candidate bấm nút "Check-out".
    *   Hệ thống ghi nhận giờ về.
    *   Candidate (Tùy chọn): Chụp ảnh báo cáo kết quả công việc.

---

## 3. Luồng Hoạt động: Kết thúc & Đánh giá (Completion Flow)
**Mục tiêu:** Hoàn tất hợp đồng và tích điểm uy tín.

*   **Bước 1: Xác nhận hoàn thành**
    *   Sau khi ca làm kết thúc, Employer bấm nút "Xác nhận hoàn thành".
    *   **Quyết định thanh toán (Nếu có):**
        *   Hệ thống kiểm tra trạng thái thanh toán lương.
        *   Nếu chưa trả -> Nhắc Employer thanh toán.

*   **Bước 2: Đánh giá chéo (Review)**
    *   Hệ thống mở khóa chức năng đánh giá cho cả 2 bên.
    *   **Employer:** Đánh giá nhân viên (Thái độ, Kỹ năng).
    *   **Candidate:** Đánh giá chủ (Sòng phẳng, Tôn trọng).

*   **Bước 3: Cộng điểm uy tín**
    *   Hệ thống tự động cộng điểm cho cả 2 bên dựa trên đánh giá 5 sao.
    *   Quy trình kết thúc.
