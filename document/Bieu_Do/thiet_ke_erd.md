# Thiết kế Cơ sở dữ liệu (ERD)

Tài liệu này được chia làm 2 phần:
1.  **Phần Tổng quan:** Dành cho việc nắm bắt luồng dữ liệu (Business Logic).
2.  **Phần Kỹ thuật (Cuối trang):** Dành cho Developer để tạo bảng (Physical Schema).

---

## 1. Quy tắc ERD
*   **Thực thể (Entity):** Tương ứng với Bảng dữ liệu.
*   **Quan hệ:** Đường nối thể hiện sự liên kết (1 người đăng được nhiều tin, 1 tin có nhiều người nộp...).

## 2. Giải thích mô hình User (Quan trọng)
Chúng ta sử dụng chiến lược **"Một bảng User duy nhất"** (Single Table Inheritance) cho cả Candidate và Employer.
*   **Lý do:** Để dùng chung API Đăng nhập, Chat, Báo cáo.
*   **Phân biệt:** Dựa vào cột `role` và mối quan hệ (Ai đăng tin là Employer, Ai nộp đơn là Candidate).

---

## 3. Sơ đồ Quan hệ Tổng quan (Mức Logic)

Biểu đồ này hiển thị các **Thuộc tính quan trọng nhất** để giúp bạn hiểu nghiệp vụ (Ví dụ: Job thì phải có Lương, User thì phải có Vai trò), nhưng lược bỏ các thông tin kỹ thuật rườm rà (URL ảnh, ID, ngày tạo).

### 3.1. Danh sách Thực thể & Thuộc tính chính
Dưới đây là các đối tượng chính trong hệ thống và những thông tin nghiệp vụ quan trọng nhất (đã lược bỏ các trường kỹ thuật).

*   **NGUOI_DUNG (User):**
    *   `Tài khoản` (SĐT)
    *   `Vai trò` (Candidate / Employer)
    *   `Điểm uy tín`
    *   `Trạng thái xác thực` (Đã eKYC chưa?)

*   **HO_SO (Profile):**
    *   `Họ tên đầy đủ`
    *   `Ngày sinh`
    *   `Giới thiệu bản thân`
    *   `Địa chỉ`

*   **VIEC_LAM (Job):**
    *   `Tên công việc`
    *   `Mức lương`
    *   `Số lượng cần tuyển`
    *   `Nơi làm việc` (Địa chỉ & GPS)
    *   `Trạng thái tin` (Đang tuyển / Đã đóng)

*   **DON_UNG_TUYEN (Application):**
    *   `Ngày nộp đơn`
    *   `Lời nhắn` (Cover letter)
    *   `Trạng thái` (Đậu / Trượt / Chờ)

*   **CHAM_CONG (Attendance):**
    *   `Giờ đến` (Check-in)
    *   `Giờ về` (Check-out)
    *   `Trạng thái` (Hợp lệ / Không hợp lệ)

*   **DANH_GIA (Review):**
    *   `Số sao` (1-5)
    *   `Nội dung nhận xét`

*   **BAO_CAO (Report):**
    *   `Lý do báo cáo`
    *   `Trạng thái xử lý`

*   **THEO_DOI (Follow):**
    *   `Người theo dõi` (Candidate)
    *   `Người được theo dõi` (Employer)

*   **CA_LAM_VIEC (Shift):** (Đột phá cốt lõi)
    *   `Ngày làm`
    *   `Giờ bắt đầu` / `Giờ kết thúc`
    *   `Sinh ra từ Tin Tuyển Dụng nào`

*   **THIET_BI_VI_PHAM (Banned Devices):**
    *   `Mã thiết bị / IP`
    *   `Lý do cấm`

### 3.2. Các Mối liên kết (Relationships)
Mô tả cách các thực thể tương tác với nhau:

1.  **NGUOI_DUNG --(chi tiết)--> HO_SO:**
    *   Mỗi tài khoản gắn liền với một bộ hồ sơ cá nhân chi tiết.
2.  **NGUOI_DUNG (Employer) --(đăng)--> VIEC_LAM:**
    *   Người dùng với vai trò Employer sẽ tạo ra các Tin tuyển dụng.
3.  **NGUOI_DUNG (Candidate) --(nộp)--> DON_UNG_TUYEN:**
    *   Người dùng với vai trò Candidate sẽ tạo ra Đơn ứng tuyển.
4.  **VIEC_LAM --(chia nhỏ)--> CA_LAM_VIEC:**
    *   Một Job có thể chia làm nhiều ca (Sáng/Chiều) hoặc lặp lại (T2-T6).
5.  **CA_LAM_VIEC --(nhận)--> DON_UNG_TUYEN:**
    *   Candidate nộp đơn vào một CA CỤ THỂ, chứ không nộp chung chung vào cả Job. Khi Ca đủ người, Ca đó sẽ Đóng.
6.  **DON_UNG_TUYEN --(sinh ra)--> CHAM_CONG:**
    *   **Tại sao lại dùng từ "sinh ra"?**
    *   Đơn ứng tuyển giống như **Hợp đồng lao động**.
    *   Chỉ khi có Hợp đồng (Đơn đã duyệt), thì hằng ngày nhân viên đi làm mới **phát sinh** ra các dòng dữ liệu chấm công.
    *   Không có Đơn ứng tuyển -> Không có cơ sở để Chấm công.
    *   Mối quan hệ là **1 Đơn (Cha) đẻ ra N lần Chấm công (Con)**.
    *   **Cơ chế liên kết:** Check-in vào "Tấm vé" (Đơn ứng tuyển) để hệ thống biết cụ thể nhân viên đang làm cho Job nào (như ví dụ đi xem phim ở trên).
6.  **NGUOI_DUNG --(viết)--> DANH_GIA:**
    *   Người dùng viết đánh giá cho nhau.
    *   **Quan trọng:** Đánh giá này **BẮT BUỘC** phải gắn với một `VIEC_LAM` cụ thể (thông qua `job_id`).
    *   Hệ thống sẽ kiểm tra: 2 người này có thực sự hoàn thành công việc đó không thì mới cho phép viết đánh giá.
7.  **NGUOI_DUNG (Candidate) --(theo dõi)--> NGUOI_DUNG (Employer):**
    *   Ứng viên bấm "Follow" một Nhà tuyển dụng (Cửa hàng) để nhận thông báo (Push Notification) mỗi khi cửa hàng này đăng Job mới. Điều này giải quyết bài toán "Quán quen".

---

## 4. Chi tiết Kỹ thuật (Physical Schema - Dành cho Dev)

Phần này đặc tả chi tiết kiểu dữ liệu, index, khóa ngoại để Lập trình viên xây dựng Database.

### 4.1. Bảng NGUOI_DUNG (Người dùng) - Quản lý tài khoản
| Tên cột | Kiểu dữ liệu | Ý nghĩa & Index |
| :--- | :--- | :--- |
| `id` | INT | **PK, Auto Increment**. |
| `phone_number` | VARCHAR(15) | **Unique Index**. Số điện thoại đăng nhập. |
| `email` | VARCHAR(100) | Email (để nhận tin tức/khôi phục pass). |
| `password_hash` | VARCHAR(255) | Mật khẩu đã mã hóa (Bcrypt). |
| `role` | ENUM | `CANDIDATE`, `EMPLOYER`, `ADMIN`. |
| `reputation_score`| INT | Điểm uy tín (Default: 100). |
| `account_tier` | TINYINT(1) | Cấp độ Account (0: Chưa xác thực, 1: Xác thực SĐT/Tier 1, 2: Đã eKYC/Tier 2). |
| `wallet_balance` | DECIMAL(15,2)| Số dư ví (Dùng để mua VIP, mua Boost hoặc bị trừ nợ 5K). |
| `status` | ENUM | `ACTIVE`, `BANNED`, `SHADOW_BANNED` (Sổ đen), `LOCKED`. |
| `device_id` | VARCHAR(255) | Nhận dạng thiết bị (Chống tài khoản ảo lách luật). |
| `fcm_token` | VARCHAR(255) | Token Firebase (Để bắn thông báo đẩy). |
| `last_login_at` | DATETIME | Thời gian đăng nhập gần nhất. |
| `created_at` | DATETIME | Ngày tạo tài khoản. |

### 4.2. Bảng HO_SO (Hồ sơ cá nhân / Doanh nghiệp)
| Tên cột | Kiểu dữ liệu | Ý nghĩa |
| :--- | :--- | :--- |
| `user_id` | INT | **PK, FK** (1-1 với NGUOI_DUNG). |
| `full_name` | VARCHAR(100) | Họ tên hiển thị. |
| `avatar_url` | VARCHAR(255) | Link ảnh đại diện. |
| `date_of_birth` | DATE | Ngày sinh (để tính tuổi lao động). |
| `gender` | ENUM | `MALE`, `FEMALE`, `OTHER`. |
| `address_text` | VARCHAR(255) | Địa chỉ thường trú (Text hiển thị). |
| `bio` | TEXT | Giới thiệu bản thân / Mô tả công ty. |
| `skills` | JSON | Danh sách kỹ năng (VD: `["Bưng bê", "Tiếng Anh"]`). |
| `identity_front_url`| VARCHAR | Ảnh CCCD mặt trước (Ẩn với người thường). |
| `identity_back_url` | VARCHAR | Ảnh CCCD mặt sau. |
| `business_license_url`| VARCHAR | Giấy phép KD (Nếu là Employer Doanh nghiệp). |

### 4.3. Bảng VIEC_LAM (Tin tuyển dụng)
| Tên cột | Kiểu dữ liệu | Ý nghĩa |
| :--- | :--- | :--- |
| `id` | INT | **PK**. |
| `employer_id` | INT | **FK** -> NGUOI_DUNG. |
| `category_id` | INT | **FK** -> Categories (Loại việc: Phục vụ, PG, Shipper...). |
| `title` | VARCHAR(200) | Tiêu đề tin tuyển dụng. |
| `description` | TEXT | Mô tả chi tiết công việc. |
| `salary` | DECIMAL(10,2) | Mức lương. |
| `salary_type` | ENUM | `HOURLY` (Giờ), `DAILY` (Ngày), `JOB` (Khoán). |
| `quantity` | INT | Số lượng cần tuyển (VD: 5 người). |
| `gender_require`| ENUM | Yêu cầu giới tính (`ANY`, `MALE`, `FEMALE`). |
| `is_boosted` | TINYINT(1) | Bài đăng có mua nhãn dán "Pro-Hunter" (Lên Top) không? |
| `latitude` | DOUBLE | **Index (Geospatial)**. Vĩ độ quán. |
| `longitude` | DOUBLE | **Index (Geospatial)**. Kinh độ quán. |
| `address_work` | VARCHAR(255) | Địa chỉ làm việc cụ thể. |
| `start_time` | DATETIME | Thời gian bắt đầu làm. |
| `end_time` | DATETIME | Thời gian kết thúc. |
| `status` | ENUM | `OPEN` (Đang tuyển), `FULL` (Đủ người), `CLOSED` (Hết hạn), `HIDDEN` (Vi phạm). |
| `created_at` | DATETIME | Ngày đăng tin. |
| `updated_at` | DATETIME | Ngày sửa lần cuối. |

### 4.3.B Bảng CA_LAM_VIEC (Shift - Ca làm chi tiết)
| Tên cột | Kiểu dữ liệu | Ý nghĩa |
| :--- | :--- | :--- |
| `id` | INT | **PK**. |
| `job_id` | INT | **FK** -> VIEC_LAM. |
| `work_date` | DATE | Ngày làm việc cụ thể. |
| `start_time` | TIME | Giờ bắt đầu (VD: 08:00). |
| `end_time` | TIME | Giờ kết thúc (VD: 12:00). |
| `needed_quantity`| INT | Số lượng cần cho ca này. |
| `status` | ENUM | `OPEN`, `FULL`, `COMPLETED`, `CANCELLED`. |

### 4.4. Bảng DON_UNG_TUYEN (Hồ sơ ứng tuyển)
| Tên cột | Kiểu dữ liệu | Ý nghĩa |
| :--- | :--- | :--- |
| `id` | INT | **PK**. |
| `shift_id` | INT | **FK** -> CA_LAM_VIEC (Nộp vào ca nào). |
| `candidate_id` | INT | **FK** -> NGUOI_DUNG. |
| `cover_letter` | TEXT | Lời nhắn gửi chủ quán lúc nộp đơn. |
| `status` | ENUM | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED` (Ứng viên hủy), `COMPLETED` (Xong việc). |
| `payment_status`| ENUM | `UNPAID`, `PAID` (Trạng thái trả lương). |
| `applied_at` | DATETIME | Thời gian nộp đơn. |
| `approved_at` | DATETIME | Thời gian được nhận. |

### 4.5. Bảng CHAM_CONG (Chấm công GPS)
| Tên cột | Kiểu dữ liệu | Ý nghĩa |
| :--- | :--- | :--- |
| `id` | INT | **PK**. |
| `application_id` | INT | **FK** -> DON_UNG_TUYEN. |
| `check_in_time` | DATETIME | Giờ check-in thực tế. |
| `check_in_lat` | DOUBLE | Vĩ độ lúc check-in (Latitude). |
| `check_in_long` | DOUBLE | Kinh độ lúc check-in (Longitude). |
| `check_out_time`| DATETIME | Giờ check-out. |
| `check_out_lat` | DOUBLE | Vĩ độ lúc check-out. |
| `check_out_long`| DOUBLE | Kinh độ lúc check-out. |
| `check_in_method`| ENUM | Phương thức Check-in (`GPS`, `QR_CODE`). |
| `image_evidence`| VARCHAR | Ảnh selfie tại nơi làm (nếu cần). |
| `status` | ENUM | `VALID`, `INVALID` (Sai vị trí), `PENDING` (Chờ duyệt thủ công). |

### 4.6. Bảng LICH_SU_GIAO_DICH (Transaction_History)
| Tên cột | Kiểu dữ liệu | Ý nghĩa |
| :--- | :--- | :--- |
| `id` | INT | **PK**. |
| `user_id` | INT | **FK**. |
| `amount` | DECIMAL(15,2)| Số tiền (+ là nạp/nhận, - là mua/trừ). |
| `type` | ENUM | `DEPOSIT`, `BOOST_JOB`, `VIP_SUB`, `PLATFORM_FEE` (Phí 5K/Job), `TRUST_DEPOSIT` (Mua điểm uy tín). |
| `reference_id` | INT | ID kham chiếu (Nếu trừ phí thì trỏ tới Application_ID). |
| `created_at` | DATETIME | Thời gian giao dịch. |

### 4.7. Bảng DANH_GIA (Đánh giá)
| Tên cột | Kiểu dữ liệu | Ý nghĩa |
| :--- | :--- | :--- |
| `id` | INT | **PK**. |
| `job_id` | INT | **FK**. |
| `reviewer_id` | INT | **FK**. |
| `reviewee_id` | INT | **FK**. |
| `rating` | TINYINT | 1 đến 5 sao. |
| `comment` | TEXT | Nội dung nhận xét. |
| `tags` | JSON | Các thẻ (VD: "Nhiệt tình", "Đúng giờ"). |
| `created_at` | DATETIME | Thời gian đánh giá. |

### 4.7. Bảng BAO_CAO (Báo cáo vi phạm)
| Tên cột | Kiểu dữ liệu | Ý nghĩa |
| :--- | :--- | :--- |
| `id` | INT | **PK**. |
| `reporter_id` | INT | **FK** (Người báo cáo). |
| `reported_user_id`| INT | **FK** (Người bị báo). |
| `reason` | VARCHAR | Lý do (Chọn từ danh sách 1, 2, 3...). |
| `proof_images` | JSON | Danh sách ảnh bằng chứng. |
| `status` | ENUM | `PENDING`, `RESOLVED`, `DISMISSED`. |

### 4.8. Bảng THEO_DOI (Followers)
| Tên cột | Kiểu dữ liệu | Ý nghĩa |
| :--- | :--- | :--- |
| `follower_id` | INT | **PK, FK** -> NGUOI_DUNG (Ứng viên đi follow). |
| `following_id` | INT | **PK, FK** -> NGUOI_DUNG (Chủ quán được follow). |
| `created_at` | DATETIME | Quen nhau từ bao giờ (Ngày bấm nút Follow). |

### 4.9. Các Bảng Bổ Trợ (Hệ Thống, Cấu Hình, Thống Kê)
| Tên Bảng | Ý nghĩa | Các cột quan trọng |
| :--- | :--- | :--- |
| **DANH_MUC** | Loại hình công việc (F&B, Sự kiện) | `id`, `name`, `icon_url` |
| **VIEC_DA_LUU** | Bookmark lưu trữ tin | `user_id`, `job_id`, `created_at` |
| **THONG_BAO** | Push Notification in-app | `user_id`, `title`, `content`, `is_read`, `type` |
| **TIN_NHAN** | Lịch sử Chat 1-1 | `sender_id`, `receiver_id`, `content`, `job_id` |
| **THIET_BI_VI_PHAM** | Lưu mã máy/IP bị Ban (Chống tài khoản ảo) | `device_id`, `ip_address`, `banned_at`, `reason` |
| **THONG_KE_DOANH_THU**| Data Warehouse (Gom Data lúc nửa đêm) | `date`, `total_revenue`, `new_jobs`, `active_users` |
| **MA_XAC_THUC** | Kho chứa mã OTP | `phone`, `otp_code`, `expired_at`, `is_used` |


