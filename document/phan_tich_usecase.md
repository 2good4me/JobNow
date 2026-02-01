# Phân tích Chi tiết Biểu đồ Use Case

Tài liệu này xác định rõ các quy tắc (rules) của biểu đồ Use Case theo chuẩn UML và áp dụng vào hệ thống Việc làm GPS để liệt kê danh sách Actor và Hành động.

## 1. Quy tắc (Rules) của Biểu đồ Use Case

Để vẽ đúng và chuẩn, chúng ta cần tuân thủ các nguyên tắc sau:

### 1.1. Actor (Tác nhân)
*   **Định nghĩa:** Là người hoặc một hệ thống bên ngoài tương tác với hệ thống.
*   **Ký hiệu:** Hình người que (Stickman).
*   **Quy tắc:**
    *   Actor là **vai trò** (Role), không phải người cụ thể. Một người có thể đóng 2 vai (vừa là Candidate vừa là Employer nếu dùng 2 tài khoản).
    *   Actor nằm **ngoài** biên hệ thống (System Boundary).

### 1.2. Use Case (Ca sử dụng)
*   **Định nghĩa:** Một chức năng cụ thể mà hệ thống thực hiện để mang lại giá trị cho Actor.
*   **Ký hiệu:** Hình bầu dục (Ellipse).
*   **Quy tắc:**
    *   Tên phải bắt đầu bằng **Động từ** (VD: *Đăng tin*, *Tìm việc*).
    *   Phải mang lại **kết quả trọn vẹn** (VD: "Nhập mật khẩu" không phải là Use Case, mà là một bước nhỏ của "Đăng nhập").

### 1.3. Quan hệ (Relationships)
Đây là phần quan trọng để biểu đồ không bị rối và thể hiện đúng logic.

1.  **Association (Liên kết):** Đường thẳng nối Actor với Use Case.
    *   *Ý nghĩa:* Actor tham gia thực hiện chức năng đó.
2.  **Include (Bao gồm):** Mũi tên nét đứt `<<include>>`.
    *   *Ý nghĩa:* Hành động A **bắt buộc** phải thực hiện hành động B (A chứa B).
    *   *Ví dụ:* "Đăng tin" `<<include>>` "Kiểm tra từ khóa cấm". (Muốn đăng được tin thì hệ thống bắt buộc phải kiểm tra từ khóa).
3.  **Extend (Mở rộng):** Mũi tên nét đứt `<<extend>>`.
    *   *Ý nghĩa:* Hành động B **có thể** xảy ra khi thực hiện A (trong điều kiện nhất định), nhưng không bắt buộc.
    *   *Ví dụ:* "Thanh toán" `<<extend>>` "Đăng tin". (Chỉ khi nào chọn tin VIP mới cần thanh toán, tin thường thì không cần).
4.  **Generalization (Tổng quát hóa):** Mũi tên tam giác đặc.
    *   *Ý nghĩa:* Quan hệ Cha - Con (Thừa kế).
    *   *Ví dụ:* "Người dùng" là cha của "Candidate" và "Employer" (Cả 2 đều kế thừa chức năng Đăng nhập).

---

## 2. Các Actor và Hành động Chính trong Hệ thống

Dựa trên các quy tắc trên, hệ thống của chúng ta được phân rã như sau:

### 2.1. Actor: Candidate (Người tìm việc)
*   **Đăng ký / Đăng nhập:** Truy cập vào App.
*   **Quản lý Hồ sơ (Profile):** Cập nhật kỹ năng, upload ảnh CCCD (để eKYC).
*   **Tìm việc quanh đây:** Xem bản đồ, dùng bộ lọc (Lương, Loại hình).
*   **Ứng tuyển (Apply):** Gửi hồ sơ cho Employer.
*   **Chat:** Nhắn tin trao đổi với Employer.
*   **GPS Check-in / Check-out:** Xác nhận giờ làm tại địa điểm.
*   **Báo cáo (Report):** Tố cáo Employer vi phạm.
*   **Đánh giá (Review):** Chấm sao cho Employer sau khi xong việc.

### 2.2. Actor: Employer (Nhà tuyển dụng - Cá nhân & Doanh nghiệp)
*   **Đăng ký / Đăng nhập.**
*   **Xác thực eKYC:** Upload GPKD hoặc CCCD.
*   **Đăng tin tuyển dụng:** Nhập thông tin, chọn tọa độ GPS.
*   **Quản lý Ứng viên:** Xem danh sách người nộp đơn.
    *   *Hành động con:* Duyệt đơn (Accept) hoặc Từ chối (Reject).
*   **Xác nhận hoàn thành:** Xác nhận nhân viên đã làm xong để hệ thống ghi nhận/trả thưởng.
*   **Đánh giá (Review):** Chấm sao cho Candidate.

### 2.3. Actor: Admin (Quản trị viên)
*   **Duyệt tin (Pre-moderation):** Xem xét các tin bị hệ thống đánh dấu nghi ngờ.
*   **Xử lý Báo cáo:** Xem bằng chứng Report để xử phạt.
*   **Quản lý người dùng:** Khóa (Ban) tài khoản vi phạm.
*   **Xem Thống kê (Dashboard):** Xem số liệu tăng trưởng.(Có thể thêm)

### 2.4. System (Hệ thống tự động - Tác nhân phụ)
Trong biểu đồ Use Case đôi khi không vẽ System, nhưng ngầm hiểu nó thực hiện các việc:
*   **Kiểm tra từ khóa cấm (Auto-filter):** `<<include>>` trong chức năng "Đăng tin".
*   **Xác thực khuôn mặt AI:** `<<include>>` trong chức năng "Xác thực eKYC".
*   **Gửi thông báo (Push Notification):** Gửi khi có trạng thái mới.
