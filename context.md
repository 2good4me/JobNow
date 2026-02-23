# PROJECT CONTEXT - GPS JOB RECRUITMENT APP

**Tài liệu này lưu trữ toàn bộ bối cảnh quan trọng, các quyết định kiến trúc và luồng nghiệp vụ cốt lõi của dự án "Ứng dụng Tìm việc làm thời vụ theo vị trí (GPS)".** 
*Mục đích: Giúp bất kỳ Developer hoặc AI Assistant nào tham gia vào dự án có thể đọc và hiểu ngay lập tức tầm nhìn và cách hệ thống hoạt động.*

---

## 1. TỔNG QUAN DỰ ÁN (PROJECT OVERVIEW)
*   **Tên dự án:** Nền tảng Kết nối Việc làm Thời vụ & Bán thời gian dựa trên Bản đồ (GPS Job Matching Platform).
*   **Mục tiêu kinh doanh:** Trở thành "Grab" của ngành tuyển dụng lao động phổ thông. Phá vỡ cách tuyển dụng truyền thống (đăng Facebook, gọi điện thoại) bằng cách: hiển thị việc làm xung quanh trên bản đồ, cho phép ứng tuyển chỉ với 1 chạm, và tách biệt các khung giờ (ca làm việc) rõ ràng để loại bỏ thời gian chết trong đàm phán mớ.
*   **Ngành nghề trọng tâm:** F&B (Nhà hàng/Cafe), Logistics (Giao hàng/Kho), Sự kiện (Event/PG) và Giúp việc nhà.
*   **Đối tượng Người dùng (Actors):**
    1.  **Candidate (Người Tìm Việc):** Cần việc làm ngay, gần nhà, rảnh ca nào nộp ca nấy.
    2.  **Employer (Nhà Tuyển Dụng):** Quán cafe, nhà hàng... cần người gấp đi làm ngay, hoặc cần tổ chức đội ngũ part-time đông đảo.
    3.  **Admin (Quản trị viên):** Vận hành hệ thống, duyệt hồ sơ, kiểm duyệt nội dung, xem báo cáo doanh thu.

---

## 2. QUYẾT ĐỊNH CÔNG NGHỆ CHÍNH (TECH STACK)
*   **Mobile App (Client chính):** React Native (Đa nền tảng iOS & Android). Tập trung hiển thị Google Maps Platform lấy định vị (Lat/Long).
*   **Web Admin / Web CMS:** ReactJS hoặc Next.js.
*   **Backend & API:** Node.js (khuyên dùng NestJS cho kiến trúc phân lớp chuẩn Enterprise).
*   **Cơ sở dữ liệu chính (SQL):** PostgreSQL kèm extension **PostGIS** để tối ưu hóa truy vấn không gian (Spatial Queries - Ví dụ: `Select jobs within 5km`).
*   **Caching & OTP:** Redis.
*   **Realtime Chat & Push Notification:** Firebase (Firestore/Realtime DB & Firebase Cloud Messaging - FCM). **Quyết định quan trọng:** Không dùng SQL để lưu trữ Tin nhắn Chat để đảm bảo tốc độ và giảm tải Server.

---

## 3. CÁC QUYẾT ĐỊNH THIẾT KẾ CƠ SỞ DỮ LIỆU ĐẶC BIỆT (CORE ERD CHOICES)

Dự án có khoảng 16 bảng dữ liệu, nhưng dưới đây là những bảng mang tính "Cách mạng" giải quyết các điểm nghẽn của thị trường (Pain-points):

### 3.1. Kỹ thuật Unified Table cho Hồ sơ (Bảng `HO_SO`)
*   Cả Candidate và Employer dùng chung 1 bảng `HO_SO` nối 1:1 với bảng `NGUOI_DUNG`.
*   **Bảo mật & eKYC (Chắn lừa đảo):** Cột `identity_images`.
    *   Với Candidate: Bắt buộc upload Căn Cước Công Dân (Hạn chế trẻ em dưới tuổi lao động, hoặc người có tiền án mạo danh).
    *   Với Employer: Bắt buộc upload Giấy Phép Kinh Doanh (GPKD) hoặc giấy tờ cửa hàng (Dẹp bỏ nạn tuyển dụng đa cấp, công ty ma).
*   **Kỹ năng (`skills`):** Thiết kế dạng Tag Cloud JSON. Dành riêng cho Candidate điền vào (VD: `"Pha chế", "Bưng bê"`). Employer thì cột này để `NULL`. Mọi "Yêu cầu kỹ năng" của công việc sẽ được Employer định nghĩa ở mỗi bài đăng (`VIEC_LAM`).

### 3.2. Đột phá vận hành với Bảng Khung Giờ (Bảng `CA_LAM_VIEC`)
*   **Vấn đề:** Ứng viên nộp đơn nhưng ko rảnh trùng giờ với quán. Gây ra hàng trăm cuộc gọi xác nhận lãng phí.
*   **Giải pháp:** 1 Tin Tuyển Dụng (Bảng `VIEC_LAM`) chứa N Ca Làm Việc (Bảng `CA_LAM_VIEC`).
    *   *Ví dụ:* Quán tạo tin Phục vụ. Thêm Ca Sáng (07:00-12:00, số lượng 2) và Ca Tối (18:00-22:00, số lượng 1).
    *   *UX/UI:* Người tìm việc bấm Ứng tuyển -> App hỏi "Chọn Ca" -> Sinh ra bảng `DON_UNG_TUYEN` ghim cứng với Ca đó. Ca nào đủ số lượng tự động đóng slot.

### 3.3. Tích hợp Quản lý nhân sự tại chỗ (Bảng `CHAM_CONG`)
*   Ứng viên có "Tấm vé" (`DON_UNG_TUYEN` trạng thái = APPROVED) sẽ đến cửa hàng và dùng App để bấm Check-in/Check-out.
*   **Công nghệ:** Hệ thống rà soát `latitude`, `longitude` của điện thoại lúc đó có nằm trong bán kính 100m của Tọa độ công việc không. Cấp cờ `VALID` hoặc `INVALID` (Cheating).

### 3.4. Mô hình Doanh thu & Dòng tiền (Monetization & `GIAO_DICH`, `GOI_DICH_VU`)
*   App sẽ kinh doanh (Thu tiền nhà tuyển dụng) thông qua việc bán các Lượt Đăng Tin, Gói VIP tháng, Ghim tin lên TOP Bản đồ theo bán kính (5km, 10km), hoặc Trả phí để xem Contact ứng viên xịn.
*   Luồng tiền lưu vết ở bảng `GIAO_DICH` (DEPOSIT, PAYMENT, REFUND).

### 3.5. Kiến trúc Data Warehouse thu nhỏ (Bảng `THONG_KE_DOANH_THU`)
*   Tránh việc Query SUM() hàng triệu dòng hóa đơn mỗi khi Boss/Admin Mở Dashboard.
*   Một hệ thống Cronjob chạy lúc rạng sáng (00:00) sẽ tổng hợp doanh thu, lượng ứng viên, lượng job mới của ngày hôm qua, nhóm theo Danh mục làm việc (Ngành IT, Ngành F&B), rồi ghi kết quả vào bảng này. Chart vẽ siêu tốc.

### 3.6. Dữ liệu mồi cho hệ thống AI (Ai Recommender & `LOG_HOAT_DONG`)
*   Bảng Log không chỉ để Audit (Ai sửa, xoá data) hay Security (Block ngập lụt IP).
*   Mục tiêu tối thượng: Ghi nhận hành vi `VIEW_JOB`, `SEARCH_KEYWORD` của Candidate. Cung cấp Data cho Model học Máy (Machine Learning) để đề xuất công việc chính xác vào ngày mai -> Níu chân người dùng (Retention). Mọi thao tác đều được hệ thống "Lắng nghe".

---

## 4. QUY TRÌNH & TRẠNG THÁI HIỆN TẠI (Tình trạng dự án tính đến 02/2026)
*   [x] **Project Conceptualization:** Đã viết xong Requirement, Actor, User Stories.
*   [x] **Use Case Analysis:** Đã phân tích Use Case tổng thể và viết kịch bản chi tiết Step-by-step cho Report, Check-in, Đăng nhập, Duyệt đơn (File: `chi_tiet_kich_ban_usecase.md`, `phan_tich_usecase.md`).
*   [x] **Database Design (ERD):** Đã chốt hạ cấu trúc ~16 bảng với đầy đủ chức năng vận hành, kiếm tiền, thống kê, tối ưu trải nghiệm người dùng (File: `thiet_ke_va_xay_dung.md`, `giai_thich_cac_bang_du_lieu.md`).
*   [x] **Mock Data (Seed):** Đã chuẩn bị trước bộ dữ liệu Test cơ bản (File: `du_lieu_mau.md`).
*   [ ] **In Progress (Sắp tới):** API Design, Class Diagram chi tiết hoặc Coding Phase.

---
*(Hãy cập nhật file này nếu có thêm bất kỳ Business Logic hoặc Tech Stack mới nào được chốt).*
