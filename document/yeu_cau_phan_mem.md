1.1. Mục đích
Tài liệu đặc tả yêu cầu phần mềm này mô tả chi tiết các yêu cầu chức năng và phi chức năng của Hệ thống Quản lý và Tuyển dụng Việc làm Thời vụ theo định vị GPS. Mục đích của tài liệu là cung cấp một cơ sở thống nhất cho việc phát triển, kiểm thử và triển khai hệ thống, đồng thời giúp các bên liên quan như đội phát triển, kiểm thử, nhà đầu tư và quản lý dự án hiểu rõ các yêu cầu của hệ thống. Tài liệu này sẽ là cơ sở để xác định rõ các yêu cầu chức năng và phi chức năng, định hướng cho quá trình thiết kế, phát triển, kiểm thử và bảo trì, giảm thiểu rủi ro hiểu sai yêu cầu giữa các bên, đảm bảo hệ thống được xây dựng đúng với mục tiêu kết nối việc làm nhanh chóng và thuận tiện dựa trên vị trí địa lý.

1.2. Phạm vi
1.2.1. Phạm vi của hệ thống
Hệ thống là một nền tảng trực tuyến (tập trung vào ứng dụng di động) được thiết kế để kết nối Nhà tuyển dụng và Người tìm việc dựa trên vị trí địa lý thực (GPS) và nhu cầu "làm ngay", hướng đến đối tượng là sinh viên, lao động phổ thông và các chủ cửa hàng, doanh nghiệp cần nhân sự thời vụ. Hệ thống hỗ trợ các chức năng dành cho nhiều đối tượng người dùng khác nhau bao gồm:
●	Người tìm việc (Candidate) có chức năng đăng ký, đăng nhập, tạo hồ sơ (kỹ năng, thời gian rảnh), tìm kiếm việc làm trên bản đồ xung quanh vị trí hiện tại, ứng tuyển nhanh, lưu công việc và nhận thông báo việc làm mới.
●	Nhà tuyển dụng (Employer) có chức năng đăng tin tuyển dụng gắn với vị trí bản đồ, thực hiện xác thực danh tính (eKYC) để tăng uy tín, quản lý hồ sơ ứng viên, liên hệ trực tiếp và đánh giá nhân viên.
●	Quản trị viên (Admin) có chức năng quản lý tài khoản người dùng, kiểm duyệt tin đăng để loại bỏ nội dung xấu/lừa đảo, quản lý danh mục ngành nghề và xem báo cáo thống kê.

Hệ thống được thiết kế với khả năng xử lý trơn tru các tác vụ liên quan đến bản đồ và định vị theo thời gian thực. Các tính năng quan trọng bao gồm tìm kiếm việc làm theo bán kính, gợi ý việc làm gần nhất, cơ chế xác thực danh tính (eKYC) để đảm bảo an toàn, và khả năng chịu tải cao vào các khung giờ cao điểm tuyển dụng.

1.2.2. Phạm vi của tài liệu
Tài liệu này được xây dựng nhằm mô tả các yêu cầu hệ thống chi tiết phục vụ cho quá trình phát triển, kiểm thử và triển khai hệ thống tuyển dụng việc làm thời vụ. Tài liệu sẽ được sử dụng bởi:
●	Nhóm phát triển phần mềm: Sử dụng tài liệu làm cơ sở để thiết kế, lập trình và triển khai hệ thống (Mobile App & Backend) theo đúng yêu cầu.
●	Nhóm kiểm thử: Kiểm tra tính đúng đắn và đầy đủ của hệ thống, đặc biệt là tính chính xác của thuật toán tìm kiếm theo vị trí và quy trình ứng tuyển.
●	Nhóm quản lý dự án: Đánh giá phạm vi, tiến độ và kiểm soát chất lượng sản phẩm trước khi đưa vào vận hành.
●	Khách hàng/Nhà đầu tư: Hiểu rõ các tính năng, phạm vi và giới hạn của hệ thống trong giai đoạn đầu.

Tài liệu này xác định phạm vi phát triển của phiên bản đầu tiên của hệ thống. Bất kỳ yêu cầu bổ sung hoặc thay đổi nào sẽ được xem xét và cập nhật trong các phiên bản tài liệu sau.

2. Mô tả chung
2.1. Bối cảnh sản phẩm
Hệ thống Quản lý và Tuyển dụng Việc làm Thời vụ theo định vị GPS là một nền tảng công nghệ kết hợp giữa ứng dụng di động (Mobile App) và Website quản trị. Ứng dụng di động được phát triển đa nền tảng (Android, iOS) để phục vụ người dùng cuối (Người tìm việc và Nhà tuyển dụng) với tính năng cốt lõi là định vị GPS thời gian thực. Website quản trị dành cho Quản trị viên để vận hành hệ thống. Hệ thống tương tác với các dịch vụ bản đồ số (Google Maps/Mapbox) để cung cấp dữ liệu vị trí chính xác. Dữ liệu người dùng và việc làm được lưu trữ tập trung trên máy chủ đám mây (Cloud Server), đảm bảo tính sẵn sàng cao và bảo mật thông tin cá nhân.

2.2. Các lớp người dùng và đặc điểm
Người dùng | Đặc điểm
--- | ---
**Người tìm việc (Candidate)** | ● **Đặc điểm:** Là sinh viên, lao động phổ thông, người cần việc làm thêm linh hoạt. Số lượng dự kiến lớn, có thể lên hàng chục nghìn người.<br>● **Tương tác:** Đăng ký/đăng nhập, cập nhật hồ sơ, bật định vị để tìm việc làm xung quanh, ứng tuyển "một chạm", nhận thông báo việc làm mới.<br>● **Tần suất sử dụng:** Cao (hàng ngày hoặc khi có nhu cầu tìm việc gấp).<br>● **Yêu cầu đặc biệt:** Giao diện đơn giản, dễ sử dụng (dành cho cả người ít am hiểu công nghệ), định vị chính xác, hoạt động mượt mà trên các dòng điện thoại phổ thông.
**Nhà tuyển dụng (Employer)** | ● **Đặc điểm:** Cá nhân, chủ hộ kinh doanh, cửa hàng, hoặc doanh nghiệp vừa và nhỏ cần tuyển nhân sự thời vụ/bán thời gian gấp.<br>● **Tương tác:** Đăng tin tuyển dụng (có gắn vị trí bản đồ), duyệt hồ sơ ứng viên, liên hệ ứng viên, thanh toán phí dịch vụ (nếu có).<br>● **Tần suất sử dụng:** Trung bình (khi phát sinh nhu cầu nhân sự).<br>● **Yêu cầu đặc biệt:** Quy trình đăng tin nhanh gọn, công cụ quản lý ứng viên trực quan, cơ chế xác thực danh tính (eKYC) nhanh chóng để tạo niềm tin.
**Quản trị viên (Admin)** | ● **Đặc điểm:** Đội ngũ vận hành hệ thống.<br>● **Tương tác:** Quản lý người dùng, kiểm duyệt tin đăng, giải quyết khiếu nại, xem báo cáo thống kê.<br>● **Tần suất sử dụng:** Thường xuyên (hàng ngày).<br>● **Yêu cầu đặc biệt:** Công cụ quản trị mạnh mẽ, báo cáo chi tiết, khả năng can thiệp nhanh khi có báo cáo lừa đảo/vi phạm.

3. Thiết kế dữ liệu (Data Design)
3.1. Xác định thực thể, mối quan hệ và biểu đồ lớp

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

3.3. Từ điển dữ liệu (Data Dictionary)
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
| role | ENUM | Not Null | Vai trò: CANDIDATE, EMPLOYER, ADMIN. |
| reputation_score | INT | Default: 100 | Điểm uy tín của người dùng. |
| is_verified | TINYINT(1) | Default: 0 | Trạng thái eKYC (0: Chưa, 1: Đã duyệt, 2: Chờ duyệt). |
| status | ENUM | Default: ACTIVE | Trạng thái hoạt động: ACTIVE, BANNED, LOCKED. |
| fcm_token | VARCHAR(255) | Nullable | Token Firebase (Để bắn thông báo đẩy). |
| last_login_at | DATETIME | Nullable | Thời gian đăng nhập gần nhất. |
| created_at | DATETIME | Default: NOW() | Ngày tạo tài khoản. |

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

Bảng 9: BAO_CAO - Báo cáo vi phạm
| Tên cột | Kiểu dữ liệu | Ràng buộc | Mô tả |
| :--- | :--- | :--- | :--- |
| id | INT | PK, Auto Increment | Khóa chính. |
| reporter_id | INT | FK, Not Null | Người báo cáo. |
| reported_user_id | INT | FK, Not Null | Người bị báo cáo. |
| reason | VARCHAR(255)| Not Null | Lý do báo cáo. |
| proof_images | JSON | Nullable | Ảnh bằng chứng kèm theo. |
| status | ENUM | Default: PENDING | Trạng thái xử lý: PENDING, RESOLVED, DISMISSED. |
