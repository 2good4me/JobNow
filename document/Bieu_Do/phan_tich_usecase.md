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
*   **Chat:** Nhắn tin trao đổi với Candidate.
*   **Xác nhận hoàn thành:** Xác nhận nhân viên đã làm xong để hệ thống ghi nhận/trả thưởng.
*   **Đánh giá (Review):** Chấm sao cho Candidate.

### 2.3. Actor: Admin (Quản trị viên)
*   **Đăng nhập vào hệ thống.**
*   **Duyệt tin (Pre-moderation):** Xem xét các tin bị hệ thống đánh dấu nghi ngờ.
*   **Xử lý Báo cáo:** Xem bằng chứng Report để xử phạt.
*   **Quản lý người dùng:** Khóa (Ban) tài khoản vi phạm.
*   **Xem Thống kê (Dashboard):** Xem số liệu tăng trưởng.(Có thể thêm)

### 2.4. System (Hệ thống tự động - Tác nhân phụ)
Trong biểu đồ Use Case đôi khi không vẽ System, nhưng ngầm hiểu nó thực hiện các việc:
*   **Kiểm tra từ khóa cấm (Auto-filter):** `<<include>>` trong chức năng "Đăng tin".
*   **Xác thực khuôn mặt AI:** `<<include>>` trong chức năng "Xác thực eKYC".
*   **Gửi thông báo (Push Notification):** Gửi khi có trạng thái mới.

### 2.5. Actor: Guest (Khách vãng lai)
*   **Xem danh sách việc làm:** Có thể lướt xem danh sách việc làm trên bản đồ hoặc danh sách (nhưng không xem được chi tiết liên hệ).
*   **Đăng ký / Đăng nhập:** Để chuyển đổi vai trò thành Candidate hoặc Employer.

---

## 3. Chi tiết Quan hệ và Luồng tương tác

Phần này mô tả chi tiết mối quan hệ giữa Tác nhân và Use Case, bao gồm cả các quan hệ hướng đối tượng như `<<include>>` và `<<extend>>` để làm rõ luồng đi của dữ liệu.

### 3.1. Phân hệ Candidate (Người tìm việc)

| **Tác nhân** | **Quan hệ** | **Use Case** | **Mô tả Mối quan hệ** |
| :--- | :---: | :--- | :--- |
| **Candidate** | Association | **Đăng ký / Đăng nhập** | Người dùng bắt đầu phiên làm việc. Use Case này là tiền điều kiện cho hầu hết các hành động khác. |
| **Candidate** | Association | **Tìm việc làm** | Người dùng chủ động tìm kiếm việc xung quanh. <br>Hệ thống tự động gợi ý các việc làm phù hợp (Recommendation). |
| **Candidate** | Association | **Ứng tuyển (Apply)** | Người dùng nộp đơn vào một việc làm cụ thể.<br>-> **`<<include>>`**: Cập nhật hồ sơ (Hệ thống yêu cầu phải có hồ sơ trước khi nộp). |
| **Candidate** | Association | **Chấm công (Check-in)** | Người dùng báo cáo sự có mặt tại nơi làm việc.<br>-> **`<<include>>`**: Lấy vị trí GPS (Hệ thống bắt buộc lấy tọa độ để kiểm tra). |
| **Candidate** | Association | **Chat** | Giao tiếp trực tiếp với Employer về công việc. |
| **Candidate** | Association | **Đánh giá (Review)** | Viết nhận xét về Employer sau khi hoàn thành công việc. |

### 3.2. Phân hệ Employer (Nhà tuyển dụng)

| **Tác nhân** | **Quan hệ** | **Use Case** | **Mô tả Mối quan hệ** |
| :--- | :---: | :--- | :--- |
| **Employer** | Association | **Đăng tin tuyển dụng** | Employer tạo mới một tin tuyển dụng.<br>-> **`<<include>>`**: Kiểm tra từ khóa (Hệ thống tự động lọc nội dung xấu).<br>-> **`<<extend>>`**: Thanh toán phí (Nếu chọn gói tin VIP/Nổi bật). |
| **Employer** | Association | **Quản lý ứng viên** | Xem danh sách người nộp đơn, duyệt hoặc từ chối.<br>-> **`<<extend>>`**: Chat (Có thể nhắn tin ngay từ màn hình quản lý). |
| **Employer** | Association | **Xác thực eKYC** | Gửi ảnh giấy tờ tùy thân/GPKD.<br>-> **`<<include>>`**: AI Verification (Hệ thống tự động so khớp khuôn mặt). |
| **Employer** | Association | **Phê duyệt chấm công** | (Tùy chọn) Xác nhận lại việc nhân viên đã đến làm nếu GPS bị lỗi. |

### 3.3. Phân hệ Admin (Quản trị viên)

| **Tác nhân** | **Quan hệ** | **Use Case** | **Mô tả Mối quan hệ** |
| :--- | :---: | :--- | :--- |
| **Admin** | Association | **Đăng nhập quản trị** | Truy cập vào trang Dashboard dành riêng cho Admin. |
| **Admin** | Association | **Kiểm duyệt tin** | Xem xét các tin bị người dùng báo cáo hoặc AI đánh dấu nghi ngờ.<br>-> **`<<extend>>`**: Khóa tin (Nếu vi phạm thật). |
| **Admin** | Association | **Quản lý người dùng** | Xem danh sách User toàn hệ thống.<br>-> **`<<extend>>`**: Ban User (Khóa tài khoản vĩnh viễn nếu lừa đảo). |
| **Admin** | Association | **Xem báo cáo** | Theo dõi các chỉ số về lượng người dùng, lượng tin đăng (Analytics). |

### 3.4. Phân hệ Guest (Khách vãng lai)

| **Tác nhân** | **Quan hệ** | **Use Case** | **Mô tả Mối quan hệ** |
| :--- | :---: | :--- | :--- |
| **Guest** | Association | **Xem danh sách việc làm** | Cho phép xem trước danh sách các công việc đang tuyển (View only) để thu hút người dùng. |
| **Guest** | Association | **Đăng ký / Đăng nhập** | Hành động để chuyển đổi trạng thái từ Guest -> User (Candidate/Employer) để sử dụng full tính năng. |
