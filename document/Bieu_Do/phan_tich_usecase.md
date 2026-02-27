# Phân tích Chi tiết Biểu đồ Use Case

Tài liệu này xác định rõ các quy tắc (rules) của biểu đồ Use Case theo chuẩn UML và áp dụng vào hệ thống Việc làm GPS để liệt kê danh sách Actor và Hành động. Việc liệt kê ở đây đảm bảo mỗi Use Case (Ca sử dụng) là một chức năng nguyên tử (atomic function) tách biệt, được liên kết rõ ràng bằng Include và Extend.

## 1. Quy tắc (Rules) của Biểu đồ Use Case

Để vẽ đúng và chuẩn, chúng ta cần tuân thủ các nguyên tắc sau:

### 1.1. Actor (Tác nhân)
*   **Định nghĩa:** Là người hoặc hệ thống bên ngoài tương tác trực tiếp với ứng dụng.
*   **Ký hiệu:** Hình người que (Stickman).
*   **Quy tắc:** Actor là **vai trò** (Role), nằm **ngoài** biên hệ thống (System Boundary).

### 1.2. Use Case (Ca sử dụng)
*   **Định nghĩa:** Một chức năng CỤ THỂ, TRỌN VẸN mà hệ thống thực hiện để mang lại giá trị cho Actor.
*   **Ký hiệu:** Hình bầu dục (Ellipse).
*   **Quy tắc:** Bắt buộc bắt đầu bằng **Động từ** (VD: *Nạp tiền*, *Đăng tin*, *Chat*, *Mua Gói VIP* phải được TÁCH BIỆT).

### 1.3. Quan hệ (Relationships)
1.  **Association (Liên kết):** Đường thẳng nối Actor với Use Case.
2.  **Include (Bao gồm - `<<include>>`):** Hành động A **bắt buộc** phải gọi hành động B. (B thiếu A thì A không chạy được).
3.  **Extend (Mở rộng - `<<extend>>`):** Hành động B **được gọi bổ sung** vào A nếu đúng điều kiện (Tùy chọn).
4.  **Generalization (Tổng quát hóa):** Quan hệ Kế thừa (Actor con được thừa hưởng quyền Actor cha).

---

## 2. Các Actor Chính trong Hệ thống
1.  **Guest (Khách vãng lai):** Người tải App chưa đăng nhập.
2.  **Candidate (Người tìm việc).**
3.  **Employer (Nhà tuyển dụng).**
4.  **Admin (Quản trị viên).**
5.  **System (Tác nhân ngầm):** Máy chủ chạy Background Jobs và AI.

*(Lưu ý: Candidate và Employer kế thừa quyền "Khám phá bản đồ" của Guest).*

---

## 3. Chi tiết Quan hệ và Luồng tương tác nguyên tử (Atomic Use Cases)

Phần này đặc tả việc bóc tách tỷ mỉ từng Use Case và quan hệ hướng đối tượng (`<<include>>`, `<<extend>>`).

### 3.1. Phân hệ Guest (Khách vãng lai)

| **Tác nhân** | **Quan hệ** | **Use Case** | **Mô tả / Quan hệ phụ (Include/Extend)** |
| :--- | :---: | :--- | :--- |
| **Guest** | Association | **Khám phá Bản đồ Việc làm** | Xem các cụm ghim việc làm xung quanh (View only). |
| **Guest** | Association | **Xem Chi tiết Việc làm** | Mở thẻ việc làm xem Ca làm/Lương (Che số điện thoại). |
| **Guest** | Association | **Đăng ký Tài khoản** | Đăng ký thông tin mới.<br>-> **`<<extend>>`**: Gửi OTP (Chỉ xảy ra nếu thao tác đăng ký đúng định dạng SĐT). |
| **Guest** | Association | **Đăng nhập Hệ thống** | Điền SĐT/Mật khẩu hoặc Đăng nhập Zalo để vào System.<br>-> **`<<extend>>`**: Khôi phục Mật khẩu (Nếu quên pass). |

### 3.2. Phân hệ Candidate (Người tìm việc)

| **Tác nhân** | **Quan hệ** | **Use Case** | **Mô tả / Quan hệ phụ (Include/Extend)** |
| :--- | :---: | :--- | :--- |
| **Candidate** | Association | **Cập nhật Hồ sơ (CV)** | Lưu kỹ năng, năm sinh, hình ảnh bản thân. Khởi tạo Trust Score = 100. |
| **Candidate** | Association | **Xác thực Căn cước (eKYC)** | Nộp giấy CMND/CCCD.<br>-> **`<<include>>`**: Quét Tự động AI (System ép chạy so khớp chữ). |
| **Candidate** | Association | **Tìm việc làm** | Nhập từ khóa để tra cứu quán cafe/sự kiện. |
| **Candidate** | Association | **Ứng tuyển theo Ca (Apply)** | Chọn đúng Ca Sáng/Tối để gửi đơn.<br>-> **`<<include>>`**: Quét lịch trùng (System cưỡng chế check DB). |
| **Candidate** | Association | **Lưu Việc làm (Bookmark)** | Lưu lại tin đăng vào danh sách Yêu thích. |
| **Candidate** | Association | **Theo dõi (Follow) Quán** | Bấm Theo dõi Employer để nhận thông báo. |
| **Candidate** | Association | **Chấm công (Check-in)** | Bấm Bắt đầu Đi làm bằng Nút Bấm Thủ Công.<br>-> **`<<include>>`**: Dò tọa độ định vị GPS 1 lần (<100m).<br>-> **`<<extend>>`**: Fallback Quét mã QR (Nếu GPS hỏng). |
| **Candidate** | Association | **Hủy Ca Định Làm** | Bấm nút hủy ca trước giờ G.<br>-> **`<<extend>>`**: Trừ Điểm Uy Tín (Nếu sát giờ hoặc vô lý). |
| **Candidate** | Association | **Chat với Employer** | Nhắn tin trao đổi nội dung công việc. |
| **Candidate** | Association | **Báo cáo (Report)** | Báo cáo các sự cố (Lừa môi giới, thu phí vô lý). |
| **Candidate** | Association | **Đánh giá Quán (Review)** | Rate sao cho Employer (Sau khi xong việc). |

### 3.3. Phân hệ Employer (Nhà tuyển dụng)

| **Tác nhân** | **Quan hệ** | **Use Case** | **Mô tả / Quan hệ phụ (Include/Extend)** |
| :--- | :---: | :--- | :--- |
| **Employer** | Association | **Cập nhật Hồ sơ Doanh nghiệp** | Chỉnh sửa tên Cửa hàng, Ảnh Avatar, Bio. (Thành User Tier 1). |
| **Employer** | Association | **Xác thực Kinh doanh (eKYC)** | Nộp GPKD hoặc Giấy tờ thuê nhà (Nâng cấp lên Tier 2 unlimit).<br>-> **`<<include>>`**: Quét Tự động AI. |
| **Employer** | Association | **Mua Gói Chống Cháy (Boost Push Noti)** | Mua gói hú còi 100 ứng viên xung quanh để tìm người gấp. |
| **Employer** | Association | **Mua Ghim Đẩy Top** | Mua nhãn dán cho 1 bài viết để ngoi lên đầu. |
| **Employer** | Association | **Đăng tin Tuyển dụng** | Điền thông tin tiêu đề, kỹ năng, lương...<br>-> **`<<extend>>`**: Check Quota Tier 1 (Tối đa 1 Ca Active/Ngày).<br>-> **`<<extend>>`**: Tạo Ca Lặp Lại (T2-T6). |
| **Employer** | Association | **Quản lý Ứng viên (Manage Applicants)** | Mở Dashboard danh sách người nộp đơn.<br>-> **`<<extend>>`**: Duyệt Đơn (Chấp nhận).<br>-> **`<<extend>>`**: Từ Chối Đơn (Reject). |
| **Employer** | Association | **Xác nhận kết thúc & Trả Lương** | Chốt giờ làm, đổi Status thành `PAID` (Trả lương Tiền mặt/Chuyển khoản). |
| **Employer** | Association | **Nạp Tiền Đóng Trễ Phí (Trust Deposit)** | Nạp tiền cứu lại điểm Uy Tín nếu lỡ hủy ca vô cớ quá nhiều. |
| **Employer** | Association | **Chat với Candidate** | Nhắn tin phỏng vấn ứng viên. |
| **Employer** | Association | **Báo cáo Ứng viên (Report)** | Cắm cờ "Bùng kèo" (No show) nếu Candidate biệt tăm. |
| **Employer** | Association | **Đánh giá Ứng viên (Review)** | Rate sao cho người đi làm. |

### 3.4. Phân hệ Admin (Quản trị viên)

| **Tác nhân** | **Quan hệ** | **Use Case** | **Mô tả / Quan hệ phụ (Include/Extend)** |
| :--- | :---: | :--- | :--- |
| **Admin** | Association | **Đăng nhập Trang Quản trị** | Vào giao diện Web (ReactJS) dành riêng cho Admin. |
| **Admin** | Association | **Sửa Danh Mục Việc Làm (Categories)** | Thêm/xóa ngành nghề: "Nhà hàng", "Giao hàng"... |
| **Admin** | Association | **Xem Báo cáo Tổng quan (Dashboard)** | Xem biểu đồ phân tích tăng trưởng và Data.<br>-> **`<<include>>`**: Data Warehouse Fetching. |
| **Admin** | Association | **Xét Duyệt Bài Đăng Thủ Công** | Quét các bài bị gắn Red Flag bởi AI hoặc bị User Report.<br>-> **`<<extend>>`**: Xóa Bài Đăng Vi Phạm. |
| **Admin** | Association | **Xử lý Tố cáo (Ticket Handle)** | Đọc ticket tố lừa đảo và xem bằng chứng chụp màn hình. |
| **Admin** | Association | **Quản lý Tài Khoản (User Control)** | Quản lý danh sách mọi số điện thoại.<br>-> **`<<extend>>`**: Khóa Tài khoản (Ban User).<br>-> **`<<extend>>`**: Mở khóa Tài khoản (Unban User). |

### 3.5. Phân hệ System (Background Agent)

| **Tác nhân** | **Quan hệ** | **Use Case** | **Mô tả / Quan hệ phụ (Include/Extend)** |
| :--- | :---: | :--- | :--- |
| **System** | Background | **Luồng Cập nhật Điểm Uy Tín (Reputation Job)** | Dò trạng thái làm việc mỗi ngày.<br>-> **`<<extend>>`**: Trừ Tuyệt Đối 30 Điểm (Nếu dính report vắng mặt).<br>-> **`<<extend>>`**: Tự động Block User (Nếu điểm < 20). |
| **System** | Background | **Gửi Push Notification (FCM Job)** | Đẩy thông báo mỗi khi có sự kiện (Like, Apply, Review). |
| **System** | Background | **Tổng hợp Dữ liệu Đêm khuya (ETL Job)** | Cộng dồn giao dịch để đưa lên Bảng Doanh Thu Tổng Hợp, hỗ trợ Load biểu đồ Dashboard. |
| **System** | Background | **Trích xuất Đặc trưng (AI Extract Job)** | Bóc tách ID Text, ảnh Lừa đảo lúc eKYC đăng ký. |

---

*Lưu ý cho việc Vẽ Hình UML: Tất cả những Action in đậm trong các bảng trên (VD: "Đăng nhập", "Ứng Tuyển", "Đăng tin", "Lưu việc", "Chat", "Mua Gói", "Mua Ghim") ĐỀU LÀ MỘT HÌNH BẦU DỤC RIÊNG BIỆT (Một Use Case riêng), không gộp chung với nhau. Mũi tên đứt nét (`<<extend>>` và `<<include>>`) được dùng để nối giữa các hình Bầu dục đó theo đúng bảng mô tả này.*
