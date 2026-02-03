# NỘI DUNG THUYẾT TRÌNH DỰ ÁN: HỆ THỐNG TUYỂN DỤNG VIỆC LÀM QUA GPS

Tài liệu này tổng hợp toàn bộ nội dung cốt lõi của dự án để phục vụ cho việc thuyết trình và báo cáo.

---

## PHẦN 1: BÀI TOÁN VÀ YÊU CẦU HỆ THỐNG

### 1.1. Bối cảnh & Bài toán (Problem Statement)
*   **Thực trạng:** Nhu cầu tìm việc làm thêm (part-time) và tuyển dụng lao động phổ thông (phục vụ, giao hàng, bảo vệ...) tại các thành phố lớn rất cao nhưng việc kết nối hiện tại qua mạng xã hội rất rời rạc, thiếu tin cậy và tốn thời gian di chuyển.
*   **Giải pháp:** Xây dựng ứng dụng "Uber cho việc làm" giúp kết nối Nhà tuyển dụng và Người tìm việc dựa trên **Vị trí thực (GPS)**.
*   **Mục tiêu:**
    *   Giúp người tìm việc thấy ngay việc làm gần nhà (< 5km).
    *   Giúp chủ cửa hàng tìm được nhân viên đang ở gần để đi làm ngay.
    *   Xác thực danh tính (eKYC) để đảm bảo an toàn, tránh lừa đảo.

### 1.2. Yêu cầu Chức năng (Functional Requirements)
*   **Candidate (Người tìm việc):** Đăng ký/Đăng nhập, Quản lý hồ sơ cá nhân, Bật định vị để quét việc làm xung quanh, Xem chi tiết công việc, Ứng tuyển nhanh (1 click), Nhận thông báo, Chấm công bằng GPS, Đánh giá nhà tuyển dụng.
*   **Employer (Nhà tuyển dụng):** Đăng tin tuyển dụng (có gắn vị trí bản đồ), Quản lý danh sách ứng viên (Duyệt/Từ chối), Liên hệ ứng viên (Chat/Gọi), Xác nhận hoàn thành công việc.
*   **Admin:** Quản lý người dùng, Kiểm duyệt tin đăng, Xử lý báo cáo vi phạm.

### 1.3. Yêu cầu Phi chức năng (Non-Functional Requirements)
*   **Chính xác:** Vị trí GPS sai số thấp (< 20m).
*   **Hiệu năng:** Tải bản đồ và các ghim việc làm nhanh (< 1s), chịu tải tốt giờ cao điểm.
*   **Bảo mật:** Mã hóa thông tin cá nhân, đảm bảo xác thực eKYC.
*   **Khả dụng:** Giao diện trên Mobile dễ sử dụng cho lao động phổ thông.

---

## PHẦN 2: BIỂU ĐỒ USE CASE (CA SỬ DỤNG)

### 2.1. Tổng quát (General Use Case)
Hệ thống gồm 3 phân hệ chính tương ứng với 3 Actor:
1.  **Candidate:** Xoay quanh các ca sử dụng: *Tìm việc quanh đây* -> *Ứng tuyển* -> *Chấm công* -> *Nhận lương/Đánh giá*.
2.  **Employer:** Xoay quanh: *Đăng tin* -> *Duyệt hồ sơ* -> *Quản lý nhân viên*.
3.  **Admin:** Xoay quanh: *Kiểm duyệt* -> *Quản lý hệ thống*.

### 2.2. Chi tiết các Actor & Use Case
*   **Candidate:** Đăng nhập, Cập nhật Profile, Tìm kiếm (Filter, Map), Ứng tuyển (Apply), Chat, Check-in/Check-out, Báo cáo (Report).
*   **Employer:** Đăng nhập, eKYC (Upload giấy tờ), Đăng tin (Post Job), Quản lý ứng viên (Accept/Reject), Đánh giá nhân viên.

---

## PHẦN 3: THIẾT KẾ CHI TIẾT 3 CHỨC NĂNG QUAN TRỌNG

### 3.1. Biểu đồ Trình tự (Sequence Diagram)
Mô tả luồng tương tác dữ liệu cho 3 tính năng cốt lõi:

**a. Chức năng Tìm việc quanh đây (Scan Jobs):**
1.  Candidate mở App -> App lấy tọa độ GPS hiện tại.
2.  App gửi Request `GET /jobs/nearby` + Tọa độ lên Server.
3.  Server truy vấn Database (PostGIS) tìm việc làm trong bán kính 5km.
4.  Database trả kết quả -> Server phản hồi JSON -> App hiển thị các Pin lên bản đồ.

**b. Chức năng Đăng tin tuyển dụng (Post Job):**
1.  Employer nhập thông tin việc làm -> App lấy GPS vị trí quán.
2.  Gửi `POST /jobs` lên Server.
3.  Server kiểm tra (Validate) từ khóa cấm và số dư tài khoản.
4.  Server lưu vào Database -> Trả về thông báo thành công.

**c. Chức năng Chấm công (Check-in):**
1.  Nhân viên đến nơi làm -> Bấm Check-in.
2.  App gửi tọa độ thực tế lên Server.
3.  Server so sánh tọa độ thực tế với tọa độ quán.
4.  *Nếu khoảng cách < 200m:* Ghi nhận thành công -> Báo cho Employer.
5.  *Nếu > 200m:* Báo lỗi "Bạn đang ở quá xa".

### 3.2. Biểu đồ Hoạt động (Activity Diagram)
Mô tả luồng nghiệp vụ:
1.  **Quy trình Tuyển dụng:** Nộp đơn -> Hệ thống kiểm tra hồ sơ -> Chờ duyệt -> Employer xem hồ sơ -> Quyết định (Duyệt/Từ chối).
2.  **Quy trình Đi làm:** Đến nơi -> Check-in -> Hệ thống kiểm tra vị trí -> (Nếu đúng) Tính giờ làm -> Làm xong -> Check-out.
3.  **Quy trình Kết thúc:** Employer xác nhận hoàn thành -> Hệ thống mở khóa chức năng đánh giá -> Hai bên đánh giá chéo (Review) -> Cộng điểm uy tín.

---

## PHẦN 4: THIẾT KẾ CƠ SỞ DỮ LIỆU & LỚP

### 4.1. Biểu đồ Lớp (Class Diagram)
*   **User (Abstract):** Lớp cha chứa thông tin chung (ID, Phone, Password).
*   **Candidate (extends User):** Thêm thuộc tính Kỹ năng, Bán kính tìm việc.
*   **Employer (extends User):** Thêm thông tin Giấy phép KD, Điểm uy tín.
*   **JobPost:** Chứa thông tin việc làm (Lương, Vĩ độ, Kinh độ, Số lượng).
*   **Application:** Bảng trung gian lưu trạng thái ứng tuyển (Pending, Approved).
*   **Mối quan hệ:** 1 Employer đăng nhiều JobPost; 1 JobPost có nhiều Application; 1 Candidate nộp nhiều Application.

### 4.2. Cơ sở dữ liệu (ERD)
Sử dụng mô hình Quan hệ (Relational DB) với các bảng chính:
*   `NGUOI_DUNG`: Lưu chung cả Candidate và Employer (phân biệt bằng cột `role`).
*   `HO_SO`: Lưu chi tiết (Ngày sinh, Bio, eKYC).
*   `VIEC_LAM`: Lưu tin tuyển dụng (Có cột Latitude/Longitude được Index Spatial).
*   `DON_UNG_TUYEN`: Lưu lịch sử nộp đơn.
*   `CHAM_CONG`: Lưu lịch sử Check-in/Check-out.
*   `DANH_GIA` & `BAO_CAO`: Các bảng hỗ trợ tương tác.

---

## PHẦN 5: CÔNG NGHỆ LỰA CHỌN (TECH STACK)

### 5.1. Mobile App
*   **Công nghệ:** **React Native** (TypeScript).
*   **Lý do:** Đa nền tảng (iOS/Android), Cộng đồng lớn, Hỗ trợ bản đồ tốt.

### 5.2. Backend (Server)
*   **Framework:** **NestJS** (Node.js).
*   **Lý do:** Kiến trúc rõ ràng, Hiệu năng cao cho ứng dụng Real-time.

### 5.3. Database
*   **Hệ quản trị:** **PostgreSQL**.
*   **Extension:** **PostGIS**.
*   **Lý do:** Hỗ trợ truy vấn không gian (Spatial Query) tốt nhất hiện nay cho bài toán tìm kiếm theo vị trí.

### 5.4. Bản đồ (Map Service)
*   **Platform:** **Google Maps Platform**.
*   **API:** Maps SDK, Geocoding API, Places API.
