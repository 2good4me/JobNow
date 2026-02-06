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


## Chương 3: Thiết kế dữ liệu (Data Design)

### 3.1. Xác định thực thể, mối quan hệ và biểu đồ lớp

Bảng 1: Danh sách bảng trong dữ liệu

| STT | Tên thực thể | Mô tả | Ghi chú |
| :--- | :--- | :--- | :--- |
| 1 | **NGUOI_DUNG** | Thực thể quản lý tài khoản người dùng (bao gồm cả Candidate, Employer, Admin). Gồm các thuộc tính: id, phone_number, password_hash, role (vai trò), reputation_score... | Quan hệ 1-1 với HO_SO. Quan hệ 1-N với VIEC_LAM, DON_UNG_TUYEN, BAO_CAO, DANH_GIA. |
| 2 | **HO_SO** | Thực thể lưu trữ thông tin cá nhân chi tiết. Gồm các thuộc tính: full_name, bio, address, date_of_birth, avatar_url, identity_images (eKYC)... | Quan hệ 1-1 với NGUOI_DUNG. |
| 3 | **VIEC_LAM** | Thực thể tin tuyển dụng. Gồm các thuộc tính: title, salary, address_work, latitude (GPS), longitude (GPS), status... | Quan hệ N-1 với NGUOI_DUNG (Employer). Quan hệ 1-N với DON_UNG_TUYEN. |
| 4 | **DON_UNG_TUYEN** | Thực thể đơn ứng tuyển (đóng vai trò như Tấm vé vào làm). Gồm các thuộc tính: status (Pending/Approved), cover_letter, applied_at... | Quan hệ N-1 với VIEC_LAM. Quan hệ N-1 với NGUOI_DUNG (Candidate). Quan hệ 1-N với CHAM_CONG. |
| 5 | **CHAM_CONG** | Thực thể lưu lịch sử điểm danh GPS hàng ngày. Gồm các thuộc tính: check_in_time, check_in_lat, check_in_long, status... | Quan hệ N-1 với DON_UNG_TUYEN. |
| 6 | **DANH_GIA** | Thực thể lưu đánh giá chất lượng sau khi hoàn thành công việc. Gồm các thuộc tính: rating (1-5 sao), comment, tags... | Quan hệ N-1 với NGUOI_DUNG (Người viết). Quan hệ N-1 với VIEC_LAM (Ngữ cảnh đánh giá). |
| 7 | **BAO_CAO** | Thực thể lưu báo cáo vi phạm nội dung hoặc hành vi. Gồm các thuộc tính: reason, proof_images, status... | Quan hệ N-1 với NGUOI_DUNG (Người báo cáo và Người bị báo). |
| 8 | **DANH_MUC** | Danh mục loại hình công việc (VD: F&B, Sự kiện). | Quan hệ 1-N với VIEC_LAM. |
| 9 | **THONG_BAO** | Lưu trữ thông báo hệ thống gửi đến người dùng. | Quan hệ N-1 với NGUOI_DUNG. |
| 10 | **TIN_NHAN** | Lưu lịch sử chat giữa 2 người dùng. | Quan hệ N-1 với NGUOI_DUNG (Sender/Receiver). |
| 11 | **VIEC_DA_LUU** | Lưu tin tuyển dụng (Bookmark). | Quan hệ N-N giữa User và Job. |
| 12 | **GIAO_DICH** | Lưu lịch sử nạp tiền/thanh toán. | Quan hệ N-1 với NGUOI_DUNG. |
| 13 | **LOG_HOAT_DONG** | Ghi log hành vi người dùng. | Quan hệ N-1 với NGUOI_DUNG. |
| 14 | **MA_XAC_THUC** | Mã OTP xác thực. | Quan hệ 1-1 (hoặc N-1) theo SĐT/Email. |
| 15 | **THEO_DOI** | Lưu danh sách Employer mà Candidate quan tâm (Follow). | Quan hệ N-N giữa User và User. |

### 3.3. Từ điển dữ liệu (Data Dictionary)
Danh sách bảng dữ liệu được mô tả chi tiết dưới đây:

Bảng 2: Danh sách bảng trong dữ liệu (Đã liệt kê ở mục 3.1)

Dưới đây là mô tả chi tiết từng thuộc tính của các bảng:

Bảng 3: NGUOI_DUNG - Quản lý tài khoản
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Increment | Khóa chính, định danh duy nhất người dùng. |
| phone_number | VARCHAR(15) | Unique Index | Số điện thoại đăng nhập (Duy nhất). |
| email | VARCHAR(100) | Nullable | Email (để nhận tin tức/khôi phục pass). |
| password_hash | VARCHAR(255) | Not Null | Mật khẩu đã mã hóa (Bcrypt). |
| balance | DECIMAL(15,2) | Default: 0 | Số dư tài khoản (Ví tiền) để thanh toán dịch vụ. |
| role | ENUM | Not Null | Vai trò: CANDIDATE, EMPLOYER, ADMIN. |
| reputation_score | INT | Default: 100 | Điểm uy tín của người dùng. |
| is_verified | TINYINT(1) | Default: 0 | Trạng thái eKYC (0: Chưa, 1: Đã duyệt, 2: Chờ duyệt). |
| status | ENUM | Default: ACTIVE | Trạng thái hoạt động: ACTIVE, BANNED, LOCKED. |
| fcm_token | VARCHAR(255) | Nullable | Token Firebase (Để bắn thông báo đẩy). |
| last_login_at | DATETIME | Nullable | Thời gian đăng nhập gần nhất. |
| created_at | DATETIME | Default: NOW() | Ngày tạo tài khoản. |
| updated_at | DATETIME | Nullable | Ngày cập nhật gần nhất. |

Bảng 4: HO_SO - Thông tin chi tiết (1-1 với NGUOI_DUNG)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| user_id | INT | PK, FK | Khóa ngoại trỏ đến bảng NGUOI_DUNG. |
| full_name | VARCHAR(100) | Not Null | Họ tên hiển thị đầy đủ. |
| avatar_url | VARCHAR(255) | Nullable | Link ảnh đại diện. |
| date_of_birth | DATE | Nullable | Ngày sinh (để tính tuổi lao động). |
| gender | ENUM | Nullable | Giới tính: MALE, FEMALE, OTHER. |
| address_text | VARCHAR(255) | Nullable | Địa chỉ thường trú (dạng text hiển thị). |
| bio | TEXT | Nullable | Giới thiệu bản thân / Mô tả công ty. |
| skills | JSON | Nullable | Danh sách kỹ năng (VD: ["Bưng bê", "Tiếng Anh"]). |
| identity_images | JSON | Nullable | Link ảnh CCCD/GPKD (Dữ liệu nhạy cảm). |
| created_at | DATETIME | Default: NOW() | Ngày tạo hồ sơ. |
| updated_at | DATETIME | Nullable | Ngày cập nhật hồ sơ. |

Bảng 5: VIEC_LAM - Tin tuyển dụng
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Increment | Khóa chính. |
| employer_id | INT | FK, Not Null | Người đăng tin (Trỏ đến NGUOI_DUNG). |
| category_id | INT | FK | Loại công việc (Phục vụ, PG, Shipper...). |
| title | VARCHAR(200) | Not Null | Tiêu đề tin tuyển dụng. |
| description | TEXT | Not Null | Mô tả chi tiết công việc. |
| salary | DECIMAL(10,2) | Not Null | Mức lương đề nghị. |
| salary_type | ENUM | Default: HOURLY | Kiểu trả lương: HOURLY (Giờ), DAILY (Ngày), JOB (Khoán). |
| quantity | INT | Default: 1 | Số lượng cần tuyển. |
| latitude | DOUBLE | Index (Spatial) | Vĩ độ quán (Để tính khoảng cách). |
| longitude | DOUBLE | Index (Spatial) | Kinh độ quán (Để tính khoảng cách). |
| address_work | VARCHAR(255) | Not Null | Địa chỉ làm việc cụ thể. |
| status | ENUM | Default: OPEN | Trạng thái: OPEN, FULL, CLOSED, HIDDEN. |
| created_at | DATETIME | Default: NOW() | Ngày đăng tin. |
| updated_at | DATETIME | Nullable | Ngày cập nhật tin. |

Bảng 6: DON_UNG_TUYEN - Hồ sơ ứng tuyển (Tấm vé)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Increment | Khóa chính. |
| job_id | INT | FK, Not Null | Ứng tuyển vào công việc nào. |
| candidate_id | INT | FK, Not Null | Ai là người ứng tuyển. |
| cover_letter | TEXT | Nullable | Lời nhắn gửi chủ quán. |
| status | ENUM | Default: PENDING | Trạng thái: PENDING, APPROVED, REJECTED, COMPLETED. |
| payment_status | ENUM | Default: UNPAID | Trạng thái nhận lương: UNPAID, PAID. |
| applied_at | DATETIME | Default: NOW() | Thời gian nộp đơn. |
| approved_at | DATETIME | Nullable | Thời gian được nhận việc. |
| updated_at | DATETIME | Nullable | Thời gian cập nhật trạng thái. |

Bảng 7: CHAM_CONG - Lịch sử điểm danh (Daily Check-in)
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Increment | Khóa chính. |
| application_id | INT | FK, Not Null | Check-in cho đơn ứng tuyển nào. |
| check_in_time | DATETIME | Not Null | Giờ check-in thực tế. |
| check_in_lat | DOUBLE | Not Null | Vĩ độ lúc check-in. |
| check_in_long | DOUBLE | Not Null | Kinh độ lúc check-in. |
| check_out_time | DATETIME | Nullable | Giờ check-out. |
| status | ENUM | Default: VALID | Trạng thái: VALID, INVALID (Sai vị trí), PENDING (Chờ duyệt). |
| updated_at | DATETIME | Nullable | Thời gian cập nhật. |

Bảng 8: DANH_GIA - Review chất lượng
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Increment | Khóa chính. |
| job_id | INT | FK, Not Null | Đánh giá trong ngữ cảnh công việc nào. |
| reviewer_id | INT | FK, Not Null | Người viết đánh giá. |
| reviewee_id | INT | FK, Not Null | Người nhận đánh giá. |
| rating | TINYINT | Check(1-5) | Số sao (1 đến 5). |
| comment | TEXT | Nullable | Nội dung nhận xét. |
| created_at | DATETIME | Default: NOW() | Thời gian đánh giá. |
| updated_at | DATETIME | Nullable | Thời gian chỉnh sửa đánh giá. |

Bảng 9: BAO_CAO - Báo cáo vi phạm
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Increment | Khóa chính. |
| reporter_id | INT | FK, Not Null | Người báo cáo. |
| reported_user_id | INT | FK, Not Null | Người bị báo cáo. |
| reason | VARCHAR(255)| Not Null | Lý do báo cáo. |
| proof_images | JSON | Nullable | Ảnh bằng chứng kèm theo. |
| status | ENUM | Default: PENDING | Trạng thái xử lý: PENDING, RESOLVED, DISMISSED. |
| created_at | DATETIME | Default: NOW() | Thời gian tạo báo cáo. |
| updated_at | DATETIME | Nullable | Thời gian xử lý/cập nhật. |

Bảng 10: DANH_MUC - Phân loại công việc
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Khóa chính. |
| name | VARCHAR(100) | Not Null | Tên danh mục (VD: "Phục vụ", "Bảo vệ"). |
| icon_url | VARCHAR(255) | Nullable | Icon hiển thị trên App. |
| parent_id | INT | FK | ID cha (để phân cấp danh mục con). |
| created_at | DATETIME | Default: NOW() | Ngày tạo. |
| updated_at | DATETIME | Nullable | Ngày cập nhật. |

Bảng 11: THONG_BAO - Hệ thống Notification
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Khóa chính. |
| user_id | INT | FK, Not Null | Người nhận thông báo. |
| title | VARCHAR(200) | Not Null | Tiêu đề. |
| content | TEXT | Not Null | Nội dung thông báo. |
| type | ENUM | Not Null | Loại: `APPLY_UPDATE`, `NEW_JOB`, `SYSTEM_ALERT`. |
| is_read | TINYINT(1) | Default: 0 | Trạng thái xem (0: Chưa xem, 1: Đã xem). |
| related_id | INT | Nullable | ID liên quan (VD: JobID) để Deep-link. |
| created_at | DATETIME | Default: NOW() | Thời gian gửi. |
| updated_at | DATETIME | Nullable | Thời gian cập nhật (VD: Đã đọc). |

Bảng 12: TIN_NHAN - Chat In-app
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Khóa chính. |
| sender_id | INT | FK, Not Null | Người gửi. |
| receiver_id | INT | FK, Not Null | Người nhận. |
| job_id | INT | FK, Nullable | Ngữ cảnh chat (Về job nào?). |
| content | TEXT | Not Null | Nội dung tin nhắn. |
| image_url | VARCHAR(255) | Nullable | Ảnh đính kèm. |
| created_at | DATETIME | Default: NOW() | Thời gian gửi (Index để sort). |

Bảng 13: VIEC_DA_LUU - Bookmark
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK | Khóa chính. |
| user_id | INT | FK, Not Null | Người lưu. |
| job_id | INT | FK, Not Null | Công việc được lưu. |
| created_at | DATETIME | Default: NOW() | Ngày lưu. |

Bảng 14: GIAO_DICH - Nạp tiền & Chi tiêu
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Inc | Mã giao dịch hệ thống. |
| user_id | INT | FK, Not Null | Người thực hiện. |
| amount | DECIMAL(15,2)| Not Null | Số tiền (+ Nạp, - Chi). |
| type | ENUM | Not Null | `DEPOSIT` (Nạp), `PAYMENT` (Chi), `REFUND` (Hoàn). |
| status | ENUM | Not Null | `PENDING`, `SUCCESS`, `FAILED`. |
| payment_method| VARCHAR(50) | Not Null | `MOMO`, `ZALOPAY`, `BANK_TRANSFER`. |
| transaction_ref| VARCHAR(100)| Unique | Mã tham chiếu từ cổng thanh toán. |
| created_at | DATETIME | Default: NOW() | Thời gian tạo. |
| updated_at | DATETIME | Nullable | Thời gian hoàn tất/thất bại. |

Bảng 15: LOG_HOAT_DONG - Audit Log
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK | Khóa chính. |
| user_id | INT | FK | Người thực hiện (Nếu có). |
| action | VARCHAR(50) | Not Null | Tên hành động (VD: `VIEW_JOB`, `LOGIN`). |
| target_id | INT | Nullable | ID đối tượng bị tác động. |
| ip_address | VARCHAR(45) | Nullable | IP người dùng. |
| created_at | DATETIME | Default: NOW() | Thời gian ghi log. |

Bảng 16: MA_XAC_THUC - OTP Storage
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK | Khóa chính. |
| contact | VARCHAR(100) | Index | SĐT hoặc Email nhận mã. |
| code | VARCHAR(10) | Not Null | Mã OTP (VD: "123456"). |
| expired_at | DATETIME | Not Null | Thời gian hết hạn. |
| is_used | TINYINT(1) | Default: 0 | Đã dùng chưa (Chống Replay attack). |

Bảng 17: THEO_DOI - Follow Employer
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK | Khóa chính. |
| follower_id | INT | FK, Not Null | Người theo dõi (Candidate). |
| following_id | INT | FK, Not Null | Người được theo dõi (Employer). |
| created_at | DATETIME | Default: NOW() | Thời gian bắt đầu theo dõi. |