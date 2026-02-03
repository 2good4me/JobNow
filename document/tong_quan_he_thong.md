# TỔNG QUAN HỆ THỐNG TUYỂN DỤNG VIỆC LÀM THEO VỊ TRÍ (GPS)

## 1.1. Mục tiêu dự án
Hệ thống được xây dựng nhằm giải quyết bài toán kết nối việc làm thời vụ một cách nhanh chóng và tối ưu hóa theo vị trí địa lý, cụ thể:
*   **Kết nối siêu tốc:** Giúp Nhà tuyển dụng tìm được nhân sự đang ở gần nhất để đáp ứng nhu cầu "cần người gấp", và giúp Người tìm việc tìm được việc làm ngay khu vực mình sinh sống để tiết kiệm thời gian, chi phí đi lại.
*   **Minh bạch hóa thông tin:** Cung cấp thông tin địa điểm làm việc chính xác trên bản đồ và thông tin xác thực của hai bên (eKYC) để giảm thiểu rủi ro lừa đảo trong tuyển dụng lao động phổ thông.
*   **Quản lý hiệu quả:** Cung cấp công cụ quản lý tin đăng, hồ sơ ứng tuyển và lịch sử làm việc tập trung, thay thế các phương thức thủ công hoặc mạng xã hội rời rạc.

## 1.2. Phạm vi hệ thống
Hệ thống bao gồm các nhóm chức năng chính phục vụ 3 đối tượng người dùng:

1.  **Phân hệ Người tìm việc (Candidate):**
    *   **Tìm kiếm việc làm trên bản đồ:** Hiển thị các tin tuyển dụng xung quanh vị trí hiện tại của người dùng.
    *   **Ứng tuyển nhanh:** Nộp hồ sơ "một chạm" cho các công việc phù hợp.
    *   **Quản lý hồ sơ:** Cập nhật kỹ năng, thời gian rảnh và xem lịch sử ứng tuyển.

2.  **Phân hệ Nhà tuyển dụng (Employer):**
    *   **Đăng tin tuyển dụng:** Tạo tin đăng mới với vị trí được ghim chính xác trên bản đồ.
    *   **Quản lý ứng viên:** Xem danh sách người ứng tuyển, xem hồ sơ chi tiết và liên hệ.
    *   **Xác thực danh tính (eKYC):** Cập nhật giấy tờ tùy thân/giấy phép kinh doanh để tăng độ uy tín.

3.  **Phân hệ Quản trị (Admin):**
    *   **Kiểm duyệt:** Duyệt tin đăng và tài khoản người dùng để đảm bảo chất lượng nội dung.
    *   **Quản lý danh mục:** Cập nhật các loại hình công việc và kỹ năng.
    *   **Báo cáo thống kê:** Theo dõi lượng truy cập, số lượng tin đăng và tỷ lệ kết nối thành công.

---
## CHƯƠNG 2: KIẾN TRÚC TỔNG THỂ (HLD)

### 2.1. Mô hình kiến trúc
Hệ thống được thiết kế theo mô hình **Kiến trúc Client-Server** kết hợp với **Kiến trúc Phân lớp (Layered Architecture)** ở phía Backend để đảm bảo tính tách biệt, dễ bảo trì và mở rộng.

#### Các thành phần chính:
1.  **Client (Presentation Layer):**
    *   **Mobile App (React Native):** Giao diện tương tác chính cho Người tìm việc và Nhà tuyển dụng. Chịu trách nhiệm hiển thị bản đồ, list công việc, form nhập liệu và gửi yêu cầu đến Server.
    *   **Web Admin (ReactJS/NextJS):** Giao diện quản trị dành cho Admin vận hành hệ thống.
2.  **Server (Business Logic Layer):**
    *   **API Gateway/Load Balancer:** Tiếp nhận mọi request từ Client, đảm bảo cân bằng tải và bảo mật cơ bản.
    *   **Backend Services (NestJS):** Xử lý nghiệp vụ chính (Đăng nhập, Tìm kiếm việc, Ứng tuyển...). Luồng dữ liệu hoạt động như sau:
        *   *Controller:* Nhận HTTP Request.
        *   *Service:* Xử lý logic nghiệp vụ.
        *   *Repository:* Tương tác với Database.
3.  **Data Layer:**
    *   Nơi lưu trữ dữ liệu bền vững (PostgreSQL) và cache (Redis).

#### Luồng dữ liệu đi từ Giao diện xuống Database:
1.  **Request:** Người dùng thao tác trên Mobile App (ví dụ: bấm "Tìm việc quanh đây"). App gửi HTTP GET request kèm theo tọa độ GPS (lat, long) đến API Server.
2.  **Processing:**
    *   Server (NestJS Controller) nhận request, validate dữ liệu đầu vào.
    *   Service gọi đến Repository để thực hiện câu truy vấn không gian (Spatial Query).
3.  **Database Interaction:** Repository gửi câu lệnh SQL (PostGIS query) xuống PostgreSQL: *"Select * from jobs where distance(job_location, user_location) < 5km"*.
4.  **Response:** Database trả về danh sách kết quả. Server format lại dữ liệu (JSON) và gửi phản hồi về Mobile App để hiển thị các Pin công việc lên bản đồ.


### 2.2. Sơ đồ triển khai (Deployment Diagram)
Hệ thống hoạt động trên nền tảng Cloud để đảm bảo tính sẵn sàng cao (High Availability).

*   **Client Side:**
    *   **Mobile App:** Đóng gói dạng `.apk` (Android) và `.ipa` (iOS), được tải về và chạy trực tiếp trên thiết bị di động của người dùng cuối. Kết nối Internet qua 4G/Wifi.
    *   **Web Admin:** Chạy trên trình duyệt web của quản trị viên.
*   **Server Side (Backend):**
    *   Chạy trên môi trường **Node.js Runtime**.
    *   Được đóng gói trong **Docker Containers** và quản lý bởi Docker Swarm hoặc Kubernetes (tùy quy mô).
    *   Triển khai trên các Cloud Server (AWS EC2 hoặc Google Compute Engine).
*   **Database Server:**
    *   **PostgreSQL:** Chạy trên một instance riêng biệt hoặc sử dụng dịch vụ Managed Database (như Amazon RDS) để tự động sao lưu và scaling. Cài đặt extension **PostGIS** để hỗ trợ dữ liệu địa lý.
    *   **Redis:** Một instance Redis dùng để caching phiên đăng nhập và vị trí thời gian thực.
*   **Third-party Services:**
    *   **Google Maps Platform:** Hệ thống kết nối qua API để lấy dữ liệu bản đồ.
    *   **Firebase/OneSignal:** Dịch vụ gửi Push Notification đến thiết bị di động.
    *   **Cloud Storage (AWS S3/Firebase Storage):** Lưu trữ hình ảnh avatar, ảnh eKYC của người dùng.
