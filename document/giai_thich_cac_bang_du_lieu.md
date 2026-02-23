# TÀI LIỆU CHUYÊN SÂU: CẤU TRÚC, PHÂN LOẠI VÀ CHỨC NĂNG CÁC BẢNG DỮ LIỆU (DATABASE DICTIONARY & SCENARIOS)

Tài liệu này đi sâu vào **từng ngóc ngách** của các bảng CSDL. Không chỉ liệt kê tên bảng, tài liệu này sẽ chỉ rõ: **Bảng này chứa những trường (columns) nào?**, **Có những trường hợp dữ liệu (Scenarios/Types) nào xảy ra trong thực tế?**, và **Sự khác biệt về dữ liệu giữa các đối tượng người dùng (Ví dụ: Employer vs Candidate)**.

---

## PHẦN 1: QUẢN LÝ NGƯỜI DÙNG & HỒ SƠ (USERS & PROFILES)

Khối này giải quyết bài toán cốt lõi: Ai đang dùng hệ thống? Họ có uy tín không?

### 1. Bảng NGUOI_DUNG (Tài khoản Đăng nhập)
*   **Chức năng:** Chỉ quản lý việc bảo mật, đăng nhập, phân quyền, số dư ví và trạng thái của tài khoản.
*   **Các trường dữ liệu chính:** `id`, `phone_number`, `password_hash`, `role` (ENUM), `balance` (Số dư), `reputation_score` (Điểm uy tín mặc định là 100), `status` (ENUM).
*   **Các loại dữ liệu (Scenarios) của trường `role`:**
    1.  `CANDIDATE` (Người tìm việc): Được cấp quyền xem quảng cáo việc làm, nộp đơn, check-in.
    2.  `EMPLOYER` (Nhà tuyển dụng): Được cấp quyền đăng tin, nạp tiền, mua gói dịch vụ, duyệt đơn.
    3.  `ADMIN` (Quản trị viên): Truy cập web Dashboard (CMS), duyệt eKYC, khóa mõm người dùng.
*   **Các loại dữ liệu của trường `status`:** `ACTIVE` (Bình thường), `LOCKED` (Tạm khóa 24h do spam), `BANNED` (Khóa vĩnh viễn do lừa đảo).

### 2. Bảng HO_SO (Chi tiết Hồ sơ Người dùng - 1:1 với NGUOI_DUNG)
*   **Chức năng:** Nơi chứa thông tin hiển thị ra bên ngoài (Tên, Ảnh, Giới thiệu).
*   **Các trường dữ liệu chính:** `user_id`, `full_name`, `avatar_url`, `bio`, `address_text`, `skills` (JSON), `identity_images` (JSON - mảng chứa link ảnh).
*   **SỰ KHÁC BIỆT DỮ LIỆU ĐẶC THÙ (The Core Difference):**
    *   **Trường hợp `role` = CANDIDATE (Người tìm việc):**
        *   `full_name`: "Nguyễn Văn A" (Tên cá nhân).
        *   `identity_images`: Lưu 2 link ảnh chụp Căn Cước Công Dân (CCCD mặt trước, mặt sau) để xác thực tuổi và danh tính gốc.
        *   `skills`: Chứa mảng các kỹ năng: `["Bưng bê", "Pha chế", "Giao tiếp tốt"]`.
        *   `bio`: Lời giới thiệu: "Em là sinh viên năm nhất cần tìm việc ca tối".
    *   **Trường hợp `role` = EMPLOYER (Nhà tuyển dụng):**
        *   `full_name`: "Highland Coffee CN Quận 1" hoặc "Công ty TNHH Bất Động Sản X" (Tên pháp nhân/Cửa hàng).
        *   `identity_images`: Lưu link ảnh chụp **Giấy Phép Kinh Doanh (GPKD)**, biên lai thuế, hoặc hợp đồng thuê nhà (Xác minh cơ sở kinh doanh có thật, dẹp nạn lừa đảo đa cấp).
        *   `skills`: Để trống. (**Lý do không xóa cột này vì:** Bảng `HO_SO` là bảng dùng chung cho cả Candidate và Employer. Cột `skills` là cực kỳ quan trọng đối với Candidate để họ điền kỹ năng cá nhân. Nhưng khi dòng dữ liệu này là của nhà tuyển dụng (Employer), thì cột này sẽ không được dùng đến và để `NULL`). Các "Yêu cầu kỹ năng" để tuyển người sẽ được Nhà tuyển dụng điền vào bảng `VIEC_LAM` mỗi khi họ tạo Tin tuyển dụng mới).
        *   `bio`: "Hệ thống cafe 10 năm tuổi với môi trường thân thiện".

---

## PHẦN 2: NGHIỆP VỤ VIỆC LÀM & CHẤM CÔNG (CORE OPERATIONS)

### 3. Bảng VIEC_LAM (Tin Tuyển Dụng)
*   **Chức năng:** Tin hiển thị trên bản đồ.
*   **Các trường dữ liệu chính:** `id`, `employer_id`, `category_id`, `title`, `description`, `salary`, `salary_type` (ENUM), `latitude`, `longitude`, `is_gps_required` (BOOLEAN), `status`.
    *   **Giải thích cột `is_gps_required`:** Mặc định là `TRUE` (Bắt ứng viên phải đến tận tọa độ quán để Check-in). Nếu `FALSE` (CTV Online, Nhập liệu), ứng viên có quyền bấm Check-in ở bất kỳ đâu, hệ thống bỏ qua bước dò GPS.
*   **Các loại dữ liệu của trường `salary_type` (Cách trả lương):**
    *   `HOURLY`: 25.000đ/giờ (Phục vụ tiệc).
    *   `DAILY`: 300.000đ/ngày (Phát tờ rơi sự kiện).
    *   `JOB`: 500.000đ/công việc (Khoán trọn gói - VD thu dọn kho bãi).
*   **Các loại dữ liệu của trường `status`:** `OPEN` (Đang tuyển), `FULL` (Đã đủ người), `CLOSED` (Tự đóng), `HIDDEN` (Bị Admin hạ xuống rà soát).

### 4. Bảng CA_LAM_VIEC (Khung giờ làm việc)
*   **Chức năng:** Tách 1 Bản tin tuyển dụng thành các "Rổ" chứa đơn ứng tuyển riêng biệt theo thời gian.
*   **Tại sao Cực Kỳ Quan Trọng (Vấn đề & Giải pháp):**
    *   **NỖI ĐAU NẾU KHÔNG CÓ BẢNG NÀY:** Quán Cafe muốn tuyển 2 người làm sáng, 1 người làm tối. Nếu không có bảng này, họ đăng 1 tin "Tuyển 3 phục vụ". Candidate nộp đơn vào. Employer phải gọi điện từng ứng viên: *"Em ơi em làm sáng hay tối?"* -> *"Dạ em làm tối"* -> *"Thôi chết tối quán anh đủ người rồi, anh đang thiếu sáng"*. Quá mất thời gian (Friction). Hoặc Employer phải bỏ tiền ra đăng 2 Bài Đăng riêng biệt -> Tốn kém, rác bản đồ.
    *   **GIẢI QUYẾT KHI CÓ BẢNG NÀY:** Quán Cafe chỉ tốn tiền đăng 1 Tin duy nhất. Bên trong tin đó tạo 2 Ca: Ca Sáng (Cần 2 người), Ca Tối (Cần 1 người).
        1.  Candidate bấm "Ứng tuyển" -> App sẽ tự hỏi *"Bạn muốn nộp vào ca nào?"* -> Ứng viên tự bấm chọn Ca Sáng.
        2.  Admin/Employer nhìn vào là biết hệ thống đã lấp đầy Ca Sáng. Ca Tối vẫn còn trống. Lúc này tự động đóng Ca Sáng, chỉ mở Ca Tối. Tất cả hoàn toàn tự động!
*   **Các trường dữ liệu chính:** `id`, `job_id`, `name`, `start_time` (TIME), `end_time` (TIME), `quantity` (INT). (Ví dụ: Ca Tối Sự Kiện 30/4, 20:00 - 23:30, cần 10 người).

### 5. Bảng DON_UNG_TUYEN (Hồ sơ ứng tuyển / The Ticket)
*   **Chức năng:** Là tờ đơn nộp xin việc, đồng thời là vé để đi check-in.
*   **Các trường chính:** `id`, `job_id`, `candidate_id`, `status` (ENUM), `payment_status` (ENUM), `cover_letter`.
*   **Các loại dữ liệu của `status` (Dòng đời của 1 đơn):**
    1.  `PENDING`: Mới nộp đơn, Employer chưa xem.
    2.  `APPROVED`: Employer đã bấm nút "Chấp nhận". Tờ đơn này giờ biến thành "Thẻ nhân viên tạm thời" để đi làm hôm đó.
    3.  `REJECTED`: Employer đánh trượt. Đơn bị đóng.
    4.  `COMPLETED`: Candidate đã làm xong việc, chủ quán đã duyệt xác nhận hoàn thành.
*   **Các loại dữ liệu của `payment_status`:** `UNPAID` (Chưa trả lương), `PAID` (Đã phát lương - Tránh tình trạng tranh cãi lương thưởng).

### 6. Bảng CHAM_CONG (Lịch sử Check-in GPS)
*   **Chức năng:** Candidate lấy điện thoại ra bấm "Đến nơi làm", App dò tọa độ GPS.
*   **Trường chính:** `application_id`, `check_in_time`, `check_in_lat`, `check_in_long`, `status`.
*   **Các loại `status`:** 
    *   `VALID`: Tọa độ điện thoại (lat, long) lệch không quá 100m so với tọa độ của Quán (trong bảng `VIEC_LAM`). Hợp lệ!
    *   `INVALID`: Ứng viên ở nhà cách quán 5km nhấn nút check in. Máy quăng cờ cờ đỏ INVALID báo lên Employer.

---

## PHẦN 3: KẾ TOÁN & KINH DOANH (MONETIZATION & TRANSACTIONS)

### 7. Bảng GOI_DICH_VU (Gói sản phẩm bán cho Employer)
*   **Chức năng:** Bảng Menu các "món hàng" hệ thống kinh doanh.
*   **Trường chính:** `id`, `name`, `price`, `duration_days`, `benefits` (JSON diễn giải các tính năng).
*   **Các loại Gói dịch vụ (Scenarios):**
    *   **Gói Đăng Tin Cơ Bản (Free_Tier):** `price = 0`, `duration_days = 30`. Benefits: `{"max_jobs": 2, "push_top": false}`. Cấp cho mọi tài khoản mới tạo.
    *   **Gói Nhà Tuyển Dụng Chuyên Nghiệp (Monthly_Pro):** `price = 500000`, `duration_days = 30`. Benefits: `{"max_jobs": unlimited, "badge": "VIP_Employer", "view_candidate_phone": true}`.
    *   **Gói Đẩy Top Bản Đồ (Daily_Boost - Mua lẻ):** `price = 50000`, `duration_days = 1`. Benefits: `{"push_top": true, "radius_notify": "5km"}`. Ai mua gói này, tin của họ luôn to nhất trên bản đồ trong 24h.

### 8. Bảng GIAO_DICH (Sổ phụ Ngân hàng ảo)
*   **Chức năng:** Ghi lại mọi biến động ở cột `balance` của `NGUOI_DUNG`.
*   **Trường chính:** `user_id`, `amount`, `type` (ENUM), `status`, `payment_method`.
*   **Các loại Giao dịch (`type`):**
    *   `DEPOSIT` (+ Tiền): Employer chuyển khoản/Momo vào ví hệ thống 500k. `payment_method` = "MOMO", trạng thái "SUCCESS". Ví cộng 500k.
    *   `PAYMENT` (- Tiền): Employer bấm mua "Gói Đẩy Top Bản Đồ" giá 50k. Record sinh ra `type = PAYMENT`, `amount = 50000`, trừ tiền dư ví. Lấy số dư này chuyển vào hệ thống.
    *   `REFUND` (+ Tiền): Tin đăng bị Admin xóa nhầm, Admin đền bù lại tiền vào ví cho Employer. `type = REFUND`.

---

## PHẦN 4: HỆ THỐNG PHÂN TÍCH (ANALYTICS & BI)

### 9. Bảng THONG_KE_DOANH_THU (Datamart cho Sếp)
*   **Chức năng:** Đây **KHÔNG PHẢI** bảng sinh ra từ thao tác của user. Đây là bảng do một hệ thống ngầm (Cronjob) tự động tổng hợp lúc nửa đêm chạy tự động.
*   **Trường chính:** `report_date`, `category_id`, `total_revenue`, `total_jobs`, `total_applications`.
*   **Ví dụ dữ liệu & Chức năng cụ thể:**
    *   *Dòng 1:* `date: 01/02/2026`, `category: F&B (Nhà hàng)`, `revenue: 5.000.000đ`, `jobs: 150`, `applications: 3000`.
    *   *Dòng 2:* `date: 01/02/2026`, `category: Logistics (Giao hàng)`, `revenue: 500.000đ`, `jobs: 20`, `applications: 150`.
*   **Mục đích:** Khi Admin (Sếp) mở trang web Dashboard lên:
    1.  Biểu đồ Cột sẽ vẽ lên tức thì: Cột F&B vút cao lên so với cột Logistics. Biết được ngành nào là "con gà đẻ trứng vàng".
    2.  Biểu đồ Đường hiển thị xu hướng: `total_applications` giảm 30% so với tuần trước -> App đang ít người xài lại, phải chạy MKT ngay.

### 10. Bảng LOG_HOAT_DONG (Activity / Audit Logs)
*   **Chức năng:** Camera quay lén mọi hành vi. Bảng này phình to rất nhanh (Millions records).
*   **Trường chính:** `user_id`, `action` (VARCHAR), `target_id`, `ip_address`, `created_at`.
*   **Các loại Log sinh ra trên hệ thống (Scenarios):**
    *   **Nhóm Bảo mật (Security Logs):** Khi user nhập sai mật khẩu 3 lần liên tiếp: `action="LOGIN_FAILED"`, hệ thống block nhanh IP đó.
    *   **Nhóm Truy vết (Audit Logs):** Khi Admin duyệt CCCD của ứng viên: `action="APPROVE_EKYC"`, `target_id = ID_của_Ứng_Viên`. Nếu lọt 1 tên tội phạm, truy cứu ra Admin nào đã bấm duyệt.
    *   **Nhóm Hành vi Người Dùng (Behavior Logs - Cho AI Recommender):** Candidate lướt bản đồ, bấm vào 1 quán Cafe để đọc mô tả việc, nhưng thoát ra không nộp đơn. App vẫn lưu: `action="VIEW_JOB"`, `target_id = Job_ID_Quan_Cafe`. AI sẽ tổng hợp dữ liệu này để biết Candidate này "Thích mấy việc nhẹ nhàng máy lạnh" để mai gợi ý việc tương tự. Đội Dev sẽ coi dữ liệu này để tính tỷ lệ Convertion (Xem 100 lần nhưng chỉ có 5 lượt Apply -> lương quá bèo).

---

## PHẦN 5: CÁC TIỆN ÍCH KHÁC (UTILITIES)

### 11. Bảng THONG_BAO (Notifications)
*   **Các loại thông báo (`type`):**
    *   `JOB_ALERT`: "Highland Coffee bạn đang theo dõi vừa đăng ca làm mới: Ca Sáng T7." (Giữ chân User vào App).
    *   `APPLICATION_UPDATE`: "Chúc mừng! Đơn xin làm Phục Vụ Sự Kiện của bạn đã được duyệt. Hãy xem lại giờ bắt đầu."
    *   `SYSTEM`: "Hồ sơ của bạn đã bị từ chối do ảnh CCCD mờ. Vui lòng chụp lại."

*   Các bảng **DANH_MUC** (Lưu loại công việc Cha/con như Ngành F&B -> Phục vụ), **THEO_DOI** (Mối nối giữ Candidate và Quán họ thích), **DANH_GIA** (Chấm Rate 1-5 sao sau khi làm xong) phục vụ quản trị danh mục và uy tín cho toàn bộ ecosystem kể trên.

*(Kết thúc phân tích dữ liệu chuyên sâu)*
