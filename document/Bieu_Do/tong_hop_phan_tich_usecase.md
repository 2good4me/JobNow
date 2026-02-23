# BẢN TỔNG HỢP VÀ PHÂN TÍCH CHI TIẾT USE CASE (MASTER USE CASE DOCUMENT)

Tài liệu này là bản đặc tả Hệ thống chi tiết nhất, định nghĩa toàn bộ các Tác nhân (Actors) tham gia vào hệ thống GPS Job, các Use Case (Chức năng) tương ứng, và mô tả rẽ nhánh mọi tình huống (Scenarios) có thể xảy ra trong thực tế.

---

## PHẦN 1: MÔ TẢ SƠ ĐỒ USE CASE (USE CASE DIAGRAM DESCRIPTION)

Để hình dung tổng quan, hệ thống có 5 Tác nhân (Actors) chính. Sơ đồ Use Case được mô tả qua sự liên kết giữa Tác nhân và Hành động như sau:

1.  **Actor: Khách vãng lai (Guest)**
    *   *Liên kết với các Use Case:* Khám phá bản đồ, Xem chi tiết công việc, Đăng nhập/Đăng ký.
2.  **Actor: Người tìm việc (Candidate)**
    *   *Kế thừa toàn bộ quyền của Guest, cộng thêm:* Quản lý hồ sơ cá nhân, eKYC Căn cước, Ứng tuyển theo Ca, Theo dõi (Follow) cửa hàng, Check-in bằng GPS, Đánh giá (Review) Chủ quán.
3.  **Actor: Nhà tuyển dụng (Employer)**
    *   *Kế thừa quyền Đăng nhập/Đăng ký, cộng thêm:* eKYC Giấy Phép KD, Nạp Ví tiền, Mua Gói Dịch Vụ, Đăng Tin Tuyển Dụng (Kèm Ca làm), Duyệt/Từ chối Đơn ứng tuyển, Trả lương & Đánh giá Ứng viên.
4.  **Actor: Quản trị viên (Admin)**
    *   *Liên kết với các Use Case:* Xem Dashboard Thống kê (BI), Quản lý Người dùng (Khóa/Mở Khóa), Kiểm duyệt eKYC, Xử lý Tố cáo (Reports), Cấu hình Danh mục Ngành nghề (Categories).
5.  **Actor: Hệ thống (System - Tác nhân chạy Ngầm)**
    *   *Liên kết với các Use Case:* Quét trùng lặp Lịch làm việc, Tự động đóng Ca làm khi đủ người, Quét khoảng cách GPS (Validation), Chấm Điểm Uy Tín, Tổng hợp Doanh thu rạng sáng, Quét hành vi để AI Gợi ý việc làm.

---

## PHẦN 2: CHI TIẾT CÁC USE CASE CỦA TỪNG TÁC NHÂN

### TÁC NHÂN 1: KHÁCH VÃNG LAI (GUEST USER)

#### Use Case 1.1: Trải nghiệm Bản đồ & Xem tin (Explore)
*   **Mô tả:** Guest mở ứng dụng lần đầu để lướt xem có việc làm nào quanh khu vực không.
*   **Tình huống 1 (Thành công):** Guest cho phép quyền truy cập GPS. Hệ thống kéo danh sách công việc bán kính 5km, ghim lên Bản đồ. Guest bấm vào xem chi tiết Lương, Giờ làm của từng Ca. Hệ thống ẩn số điện thoại liên hệ của chủ quán.
*   **Tình huống 2 (Từ chối định vị):** Guest không cấp quyền GPS. Hệ thống tự động đẩy bản đồ về Trung tâm Thành phố (VD: Quận 1, TP.HCM) và hiện cảnh báo: "Bật định vị để tìm việc làm chính xác quanh bạn nhé".
*   **Kết quả mong đợi:** Guest có được "Trải nghiệm Aha" (thấy App xịn, nhiều việc lương cao) và nảy sinh nhu cầu Đăng nhập để ứng tuyển.

#### Use Case 1.2: Vấp phải Bức tường Đăng nhập (Login Wall)
*   **Mô tả:** Guest thực hiện một hành động cần định danh (Bấm "Ứng tuyển", Bấm "Lưu việc").
*   **Tình huống 1 (Hành động chặn đứng):** Khách bấm "Ứng tuyển". Hệ thống chặn lại, hiển thị Popup: "Bạn cần Đăng nhập hoặc Đăng ký tài khoản trong 30s để bắt đầu đi làm". 
*   **Kết quả mong đợi:** Chuyển hướng người dùng sang giao diện Authentication thành công mà không gây ức chế.

---

### TÁC NHÂN 2: NGƯỜI DÙNG QUYỀN CHUNG (CANDIDATE & EMPLOYER)

#### Use Case 2.1: Đăng nhập hệ thống
*   **Mô tả:** Người dùng xác thực để vào tài khoản của mình.
*   **Tình huống 1 (Đăng nhập thành công):** Nhập đúng SĐT và Mật khẩu. Hệ thống tạo Token, điều hướng người dùng thẳng vào Trang chủ tương ứng (Bản đồ cho Candidate / Quản lý việc cho Employer).
*   **Tình huống 2 (Sai mật khẩu):** Nhập sai Mật khẩu. Hệ thống báo: "Mật khẩu không chính xác". Số lần sai vượt quá 5 lần -> Tạm khóa đăng nhập thiết bị đó 15 phút (Chống Brute-force).
*   **Tình huống 3 (Tài khoản bị cấm):** Nhập đúng SĐT và Mật khẩu, nhưng `status` là `BANNED`. Hệ thống báo: "Tài khoản của bạn đã bị khóa vĩnh viễn do vi phạm Tiêu chuẩn cộng đồng".

#### Use Case 2.2: Quên mật khẩu
*   **Mô tả:** Lấy lại quyền truy cập qua mã OTP.
*   **Tình huống 1 (Thiết lập rết thành công):** Người dùng nhập SĐT. Hệ thống check SĐT tồn tại, Gửi mã OTP xác thực dạng SMS/Zalo. Người dùng nhập đúng OTP (trong 60s), sau đó nhập Mật khẩu mới x2 lần. Đổi pass thành công.
*   **Tình huống 2 (Số điện thoại không tồn tại):** Nhập SĐT lạ. Báo lỗi đỏ: "Số điện thoại chưa được đăng ký trong hệ thống".
*   **Tình huống 3 (Hết hạn OTP):** Nhập OTP sau 60s. Báo lỗi: "Mã OTP đã hết hạn, vui lòng yêu cầu gửi lại".

#### Use Case 2.3: Xác thực eKYC
*   **Mô tả:** Nộp giấy tờ CMND/CCCD/GPKD để tăng độ tin cậy.
*   **Tình huống 1 (Nộp thành công):** Upload ảnh mặt trước/sau rõ nét. Hệ thống AI quét thành công chữ và khuôn mặt. Lưu trạng thái `PENDING` chờ Admin duyệt.
*   **Tình huống 2 (Ảnh lỗi):** Upload ảnh lóa ánh sáng/mờ. AI không đọc được chữ. Hệ thống báo ngay: "Ảnh không hợp lệ, vui lòng căn góc chụp nơi đủ sáng".

---

### TÁC NHÂN 3: NGƯỜI TÌM VIỆC (CANDIDATE)

#### Use Case 3.1: Ứng tuyển theo Ca (Apply for Shift)
*   **Mô tả:** Quyết định nộp đơn vào 1 khung giờ nhất định của Quán.
*   **Tình huống 1 (Ứng tuyển thành công):** Chọn Ca Sáng. Ghi cover letter ngắn. Bấm Nộp. Đơn xếp trạng thái `PENDING`. Employer nhận được thông báo đẩy (Push Notification).
*   **Tình huống 2 (Bị chặn do trùng lịch - Trùng Validation):** Candidate đã nhận 1 việc ở Vị trí A trùng khung giờ với Ca Sáng này. Hệ thống báo lỗi chói lòa: "Bạn đã có lịch làm việc khác trong khung giờ này. Việc bùng kèo sẽ bị trừ 30 Điểm Uy Tín. Vui lòng chọn ca khác!". Hệ thống chặn không cho nộp đơn.
*   **Tình huống 3 (Bị chặn do FULL chỗ):** Trong lúc đang đắn đo đọc mô tả dài 5 phút, đã có người khác nộp vô Ca Sáng và được chủ quán chốt đơn nhanh. Candidate bấm Nộp -> Báo lỗi: "Rất tiếc, Ca làm việc này vừa mới đủ người. Hãy thử Ca Chiều nhé".

#### Use Case 3.2: Chấm công (Attendance / Check-in)
*   **Mô tả:** Tới chỗ làm và dùng App để điểm danh.
*   **Tình huống 1 (Chấm công Hợp lệ - Yêu cầu GPS):** Job được Employer cấu hình bắt buộc Check-in tại chỗ. Tới quán, bật App bấm "Check-in". Hệ thống dò tọa độ GPS của điện thoại cách Tọa độ Quán < 100m. Ghi nhận thời gian, cắm cờ `VALID`. Employer thấy tick Xanh.
*   **Tình huống 2 (Chấm công Gian lận / Spoofing - Yêu cầu GPS):** Ở nhà cách 5km bật App bấm Check-in. Hệ thống dò thất bại (> 100m). Cắm cờ `INVALID (Cờ Đỏ)`. Báo khẩn cấp cho Employer: "Ứng viên check-in nhưng không có mặt tại tọa độ thực tế".
*   **Tình huống 3 (Chấm công Khởi tạo Tự do - Không yêu cầu GPS):** Job được Employer cấu hình "Không yêu cầu định vị" (Dành cho việc làm Online, Marketing, Ctv). Candidate bấm "Check-in", hệ thống chỉ ghi nhận thời gian bắt đầu làm việc, bỏ qua bước quét GPS. Employer tự phê duyệt kết quả công việc sau.

---

### TÁC NHÂN 4: NHÀ TUYỂN DỤNG (EMPLOYER)

#### Use Case 4.1: Đăng Tin Tuyển Dụng & Chia Ca (Post Job & Shifts)
*   **Mô tả:** Khai báo nhu cầu nhân sự lên bản đồ.
*   **Tình huống 1 (Đăng thành công):** Nhập mô tả, Kéo đinh ghim định vị đúng cửa hàng. **Tích chọn: "Có yêu cầu check-in tại nơi làm việc không?"**. Khai báo 2 Ca làm: Sáng (7h-12h, cần 2ng), Chiều (13h-18h, cần 1ng). Trừ 1 lượt đăng trong Gói cước. Bài viết lên sóng.
*   **Tình huống 2 (Lập lịch lỗi):** Điền `start_time` Ca Sáng là 12h, nhưng `end_time` là 10h sáng. Hệ thống chặn lại: "Giờ kết thúc không thể nhỏ hơn giờ bắt đầu". Báo đỏ bằng Client-side validation.
*   **Tình huống 3 (Hết lượt đăng Tiêu chuẩn):** Bài đăng vượt quá giới hạn Gói Free. Hiện Popup chăn lại: "Tài khoản của bạn đã hết Lượt đăng miễn phí tháng này. Vui lòng mua thêm Gói Dịch Vụ Mở Rộng". (Upsell).

#### Use Case 4.2: Duyệt Đơn / Từ Chối Đơn (Manage Applications)
*   **Mô tả:** Sàng lọc ứng viên nộp vào.
*   **Tình huống 1 (Duyệt thành công):** Xem hồ sơ ứng viên (Điểm uy tín: 100đ). Cảm thấy an tâm, bấm vòng Duyệt (Approve). Trạng thái đơn đổi thành `APPROVED`. Push Noti về cho Candidate: "Chuẩn bị đi làm thôi!".
*   **Tình huống 2 (Từ chối):** Thấy điểm uy tín của Candidate là 40đ (Red flag). Bấm Từ chối. Trạng thái đơn `REJECTED`. Hệ thống giải phóng lại 1 "ghế rỗng" cho Ca làm đó để người khác nộp vào.

#### Use Case 4.3: Nạp tiền và Mua Gói VIP (Monetize)
*   **Mô tả:** Employer thanh toán dịch vụ.
*   **Tình huống 1 (Mua thành công):** Trong ví có 500k. Mua gói "VIP Tháng" giá 200k. Bấm xác nhận -> `SỐ DƯ` trừ còn 300k. Ghi Log vào bảng `GIAO_DICH`. Mở khóa tính năng Tách Ca không giới hạn.
*   **Tình huống 2 (Không đủ số dư):** Ví có 50k. Mua Gói VIP 200k. App chặn lại báo: "Vui lòng nạp thêm tối thiểu 150.000đ để tiếp tục". Chuyển hướng ra cổng nạp tiền (Ví Momo).

---

### TÁC NHÂN 5: QUẢN TRỊ VIÊN (ADMIN)

#### Use Case 5.1: Quản Trị Người Dùng (User Management)
*   **Mô tả:** Theo dõi sức khỏe hệ thống và xử phạt.
*   **Tình huống 1 (Khóa tài khoản lừa đảo):** Nhận được 5 lượt Báo cáo (Report) từ Candidate về Quán X bắt nộp phí môi giới đồng phục. Admin vào CMS check Log Chat. Nhìn thấy bằng chứng. Admin bấm nút Ban User. Trạng thái Quán X nhảy sang `BANNED`. Mọi bài đăng của Quán X tự động chuyển thành `HIDDEN` (Ẩn đi).
*   **Tình huống 2 (Mở khóa tài khoản):** Quán X lên trụ sở công ty giải trình, nộp tiền phạt vi phạm hợp đồng bảo đảm. Admin bấm nút Unban. Tài khoản hồi phục về `ACTIVE`.

#### Use Case 5.2: Xem Báo cáo Analytics (Dashboard BI)
*   **Mô tả:** Cập nhật tình hình kinh doanh tổng thể.
*   **Tình huống 1 (Xuất báo cáo thành công):** Admin mở màn hình. Hệ thống gọi bảng `THONG_KE_DOANH_THU` (được tổng hợp mỗi rạng sáng). Vẽ ngay biểu đồ tròn cho thấy: 70% doanh thu đến từ Gói Mua Lẻ (Đẩy Top), 30% đến từ Gói Tháng.
*   **Kết quả mong đợi:** Sếp ra quyết định chạy chương trình khuyến mãi giảm 20% cho Gói Tháng để boost data.

---

### TÁC NHÂN 6: HỆ THỐNG (SYSTEM BACKGROUND TASK)

#### Use Case 6.1: Vận hành Luật Điểm Uy Tín (Reputation Engine)
*   **Mô tả:** Con BOT chạy ngầm tính điểm đạo đức của toàn cõi App.
*   **Tình huống 1 (Trừng phạt Bùng kèo):** Lịch ghi nhận 08:00 Candidate phải có mặt Check-in. Nhưng tới 12:00 trạng thái đơn vẫn không có dấu Check-in (`status != VALID`), Employer báo Vắng mặt. Con Bot ngầm tự động gọi hàm: `reputation_score = reputation_score - 30`. Nếu `score` rớt dưới 20, Bot tự đổi trạng thái tài khoản thành `BANNED`.
*   **Tình huống 2 (Trừng phạt Chủ quán Quỵt lương):** Ca làm kết thúc được 3 ngày. Trạng thái lương vẫn là `UNPAID` (Chưa trả lương). Bot kích hoạt: Trừ 20 điểm uy tín của Quán đó, và đánh tụt bài đăng xuống bét bảng đồ.

#### Use Case 6.2: Tổng hợp Data Warehouse (ETL Job)
*   **Mô tả:** Giảm tải Server lúc ban ngày.
*   **Tình huống Sinh Data:** Cứ đúng 00:00 rạng sáng mỗi ngày. Con Bot quét qua bảng `GIAO_DICH` của 24h qua. Cộng tổng số tiền theo từng ngành (F&B, Logistics). Ghi 1 cục kết quả vào duy nhất 1 dòng trong bảng `THONG_KE_DOANH_THU`. Giúp sáng hsau Admin mở biểu đồ tốn 0.1s là hiện, không bị xoay thòng lọng đơ sấp Server.

---
**Tài liệu này là Bản đặc tả toàn diện nhất, dùng để làm căn cứ Nghiệm Thu/Manual Testing cho Tester và làm Requirement Specs cho giới Developer.**
