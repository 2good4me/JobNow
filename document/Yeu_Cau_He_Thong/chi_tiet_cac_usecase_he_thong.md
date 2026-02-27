# PHÂN TÍCH CHI TIẾT CÁC KỊCH BẢN SỬ DỤNG (USE CASE SCENARIOS)

Tài liệu này mô tả chi tiết dòng chảy (flow) của các tính năng cốt lõi trong hệ thống. Mỗi tính năng được phân rã thành các tình huống (scenarios) có thể xảy ra, bao gồm Luồng thành công (Happy Path), Luồng thất bại (Error Path) và Các hướng rẽ nhánh (Alternate Path).

---

## 1. NHÓM TÍNH NĂNG XÁC THỰC VÀ BẢO MẬT (AUTHENTICATION)

### 1.1. Đăng ký tài khoản mới
*   **Mô tả:** Người dùng (Candidate/Employer) tạo tài khoản lần đầu bằng Số điện thoại.
*   **Các tình huống:**
    1.  **Đăng ký thành công:**
        *   Người dùng nhập SĐT hợp lệ và chưa từng tồn tại trên hệ thống.
        *   Hệ thống gửi mã OTP (6 số) qua SMS/Zalo.
        *   Người dùng nhập đúng OTP và thiết lập Mật khẩu.
        *   Hệ thống khởi tạo tài khoản, chuyển hướng đến màn hình Chọn Vai Trò (Ứng viên hay Nhà tuyển dụng).
    2.  **SĐT đã tồn tại:**
        *   Người dùng nhập SĐT đã đăng ký từ trước.
        *   Hệ thống báo lỗi đỏ: "Số điện thoại này đã được sử dụng. Vui lòng đăng nhập." và gợi ý nút "Quên mật khẩu".
    3.  **Nhập sai mã OTP:**
        *   Người dùng nhập sai mã OTP quá 3 lần hoặc OTP hết hạn (sau 60s).
        *   Hệ thống báo lỗi "Mã xác thực không hợp lệ hoặc đã hết hạn". Yêu cầu bấm "Gửi lại mã".

### 1.2. Xác thực eKYC (Định danh điện tử)
*   **Mô tả:** Sau khi đăng ký, user nộp giấy tờ để hệ thống xác minh (Bắt buộc để chống lừa đảo).
*   **Các tình huống:**
    1.  **Gửi yêu cầu eKYC thành công (Chờ duyệt):**
        *   Candidate chụp Căn cước công dân (Mặt trước/sau) / Employer chụp Giấy phép kinh doanh.
        *   Hệ thống AI/OCR đọc và trích xuất thông tin khớp với ảnh. Lưu trạng thái `PENDING`.
        *   Báo: "Hồ sơ đang được Admin xét duyệt trong 24h".
    2.  **Ảnh bị mờ/Chói sáng:**
        *   Người dùng upload ảnh chất lượng kém, AI không đọc được text.
        *   Hệ thống báo lỗi ngay lập tức: "Ảnh quá mờ hoặc lóa sáng. Vui lòng chụp lại ở nơi đủ sáng."
    3.  **Hồ sơ bị Admin từ chối:**
        *   Admin phát hiện lấy ảnh trên mạng ghép vào. Admin bấm Reject.
        *   Hệ thống đẩy Notification: "Xác thực thất bại do phát hiện giấy tờ không hợp lệ." - Cấm tạo Job/Apply Job.

---

## 2. NHÓM TÍNH NĂNG KHÁCH VÃNG LAI (GUEST USER)

### 2.1. Lướt Bản đồ và Tìm việc (Khám phá)
*   **Mô tả:** Khách truy cập App nhưng chưa đăng nhập hoặc đăng ký tài khoản.
*   **Các tình huống:**
    1.  **Xem bản đồ thành công:**
        *   Khách mở App. Hệ thống không yêu cầu bắt buộc đăng nhập (Cho phép trải nghiệm trước).
        *   App xin quyền định vị (Location). Khách bấm Cho phép. Bản đồ hiện lên với các "Đinh ghim" việc làm.
    2.  **Từ chối quyền vị trí:**
        *   Khách bấm "Từ chối" cấp quyền vị trí.
        *   App lấy tọa độ mặc định (hoặc IP trung tâm) để hiển thị, kèm theo Header cảnh báo: "Bật định vị để tìm việc làm chính xác quanh bạn nhé".
    3.  **Xem chi tiết Công viêc (Job Detail):**
        *   Khách bấm vào 1 công việc. App hiển thị đủ nội dung: Tên quán, Lương, Các Ca làm việc (Sáng/Tối).
        *   **Điểm đánh đổi:** Các thông tin nhạy cảm (Số điện thoại chủ quán) bị ẩn đi (hiện dạng `091x.xxx.xxx`).

### 2.2. Bức tường Đăng nhập (Login/Register Wall)
*   **Mô tả:** Khách vãng lai cố gắng thực hiện một thao tác cần quyền định danh.
*   **Các tình huống:**
    1.  **Hành động Ứng tuyển (Apply):**
        *   Guest bấm nút "Ứng tuyển Ca Sáng".
        *   App bung Popup: "Đăng nhập ngay để nộp đơn và theo dõi lịch làm việc của bạn!". (Rút ngắn ma sát bằng nút "Đăng nhập nhanh qua Zalo/Google").
    2.  **Hành động Lưu việc / Theo dõi Employer:**
        *   Guest bấm nút Trái tim (Yêu thích).
        *   App bung Popup chặn: "Vui lòng đăng nhập để lưu lại công việc này".
    3.  **Hành động Đăng tin tuyển dụng:**
        *   Guest bấm vào tab "Nhà tuyển dụng".
        *   Bị chặn ngay ở ngay màn hình chờ, chỉ thấy nút "Đăng ký hoặc Đăng nhập để Tuyển nhân viên".

---

## 3. NHÓM NGHIỆP VỤ NHÀ TUYỂN DỤNG (EMPLOYER CORE)

### 3.1. Đăng tin tuyển dụng theo Ca (Job & Shifts Creation)
*   **Mô tả:** Employer tạo tin tìm người kèm theo các khung giờ cụ thể.
*   **Các tình huống:**
    1.  **Đăng tin thành công với Ca làm việc hợp lệ:**
        *   Employer điền đủ thông tin: Tiêu đề, Vị trí bản đồ, Lương. Thiết lập Cấu hình **"Yêu cầu Check-in tại nơi làm việc"** (Có/Không).
        *   Employer thêm 2 Ca: "Ca Sáng" (07:00-12:00, cần 2 người), "Ca Tối" (18:00-22:00, cần 1 người).
        *   Hệ thống duyệt nội dung không vi phạm, lưu dữ liệu và bung ghim tin lên Bản đồ.
    2.  **Lỗi thiết lập Ca làm việc vô lý:**
        *   Employer đặt `start_time` là 12:00 và `end_time` là 10:00 (Giờ kết thúc nhỏ hơn giờ bắt đầu).
        *   Hệ thống báo lỗi đỏ ngay tại ô nhập: "Giờ kết thúc phải diễn ra sau giờ bắt đầu". Không cho Lưu.
    3.  **Hết quỹ tin đăng miễn phí:**
        *   Employer đang dùng gói Free (quyền lợi dăng tối đa 2 tin/tháng) và định bấm lưu Tin thứ 3.
        *   Hệ thống popup: "Bạn đã vượt quá giới hạn tin đăng của tháng. Vui lòng nâng cấp Gói Dịch Vụ Mở Rộng." (Kèm nút Mua Gói VIP).

### 3.2. Xóa / Đóng sớm Tin tuyển dụng
*   **Mô tả:** Employer đóng tin trước hạn do đã kiếm đủ người qua nguồn khác.
*   **Các tình huống:**
    1.  **Đóng tin an toàn:**
        *   Tin đó CHƯA CÓ bất kỳ Ứng viên nào được Duyệt.
        *   Employer bấm "Đóng tin". Hệ thống đổi status thành `CLOSED` và gỡ đinh ghim khỏi bản đồ.
    2.  **Đóng tin có rủi ro tranh chấp:**
        *   Tin đó ĐÃ DUYỆT 2 ứng viên đi làm vào ngày mai, nhưng hnay quán bị cháy, phải đóng tin.
        *   Hệ thống hiện cảnh báo: "Bạn có 2 ứng viên đã được duyệt. Việc đóng tin lúc này có thể làm giảm uy tín của bạn. Bạn có muốn gửi thông báo hủy lịch kèm lời xin lỗi đến họ không?".

---

## 4. NHÓM NGHIỆP VỤ NGƯỜI TÌM VIỆC (CANDIDATE CORE)

### 4.1. Ứng tuyển theo Ca làm việc (Apply Job)
*   **Mô tả:** Candidate lướt bản đồ, thấy 1 quán Cafe gần nhà và bấm nộp đơn.
*   **Các tình huống:**
    1.  **Ứng tuyển thành công:**
        *   Candidate chưa nộp đơn nào trùng giờ.
        *   Candidate bấm "Ứng tuyển" -> Chọn "Ca Sáng" -> Ghi thêm lời nhắn "Em nhà gần 5p đi bộ".
        *   Hệ thống lưu log, bắn Notification đến máy của Employer: "Có 1 ứng viên vừa nộp đơn Ca Sáng".
    2.  **Ứng tuyển thất bại do Trùng lịch (Conflict Time):**
        *   Hệ thống quét thấy Candidate này đã được duyệt đi làm "Ca Sáng" ở một quán Tạp hóa khác trong cùng khung giờ.
        *   Hệ thống chặn nộp đơn: "Khung giờ này bạn đã có một lịch làm việc khác. Vui lòng chọn Ca khác hoặc sắp xếp lại thời gian". (Tính năng cực kỳ đẳng cấp giúp tỷ lệ rớt kèo của Employer giảm xuống 0%).
    3.  **Tình huống Ca làm đã FULL chỗ:**
        *   Lúc Candidate mở giao diện xem thông tin, Ca Sáng vẫn còn chỗ. Khựng lại 5 phút lướt màn hình, có người khác nộp vào trước và chủ đã duyệt xong Ca Sáng.
        *   Candidate bấm nộp Ca Sáng -> Hệ thống check Realtime database báo lỗi: "Rất tiếc, Ca Sáng vừa mới đuợc tuyển đủ người. Hãy thử nộp Ca Chiều bạn nhé!".

### 4.2. Chấm công (Attendance / Check-in)
*   **Mô tả:** Đến ngày đi làm, Candidate dùng App bấm Check-in để bắt đầu.
*   **Các tình huống:**
    1.  **Check-in Hợp lệ (Đối với Job bắt buộc đến nơi làm):**
        *   Candidate mở khóa màn hình, bấm "Bắt đầu làm". App bắt sóng GPS. Tọa độ của đt cách tọa độ quán < 100 mét.
        *   Hệ thống ghi nhận `status = VALID`, Record giờ check-in, nháy màu Xanh báo cho Employer "Ứng viên đã có mặt".
    2.  **Check-in Gian lận (Cờ Đỏ):**
        *   Tương tự trên, nhưng Candidate bật App lên bấm Check-in hòng qua mặt.
        *   Hệ thống dò GPS thấy khoảng cách tới nhà hàng là 5km (vượt định mức 100m).
        *   Hệ thống vẫn ghi nhận giờ nhưng đánh cờ `status = INVALID (RED FLAG)`. Báo cáo đỏ gửi lên máy Employer: "Cảnh báo: Ứng viên này check-in nhưng không có mặt tại tọa độ cửa hàng!".
    3.  **Check-in Từ Xa (Đối với Job KHÔNG bắt buộc đến nơi làm):**
        *   Employer cấu hình Job là Nhập liệu/Phát tờ rơi lưu động.
        *   Candidate ở nhà vẫn có thể bấm "Bắt đầu làm". 
        *   Hệ thống chỉ ghi nhận Giờ bắt đầu, bỏ qua việc xác thực tọa độ. Giao quyền duyệt kết quả công việc hoàn toàn thủ công cho Employer.

---

## 5. NHÓM CHỨC NĂNG KẾ TOÁN & TƯƠNG TÁC (MONETIZE & ENGAGE)

### 5.1. Mua Gói Đẩy Top (Boost Job)
*   **Mô tả:** Employer nạp tiền và mua gói dịch vụ để hiển thị việc làm to nhất trên bản đồ.
*   **Các tình huống:**
    1.  **Giao dịch thành công:**
        *   Trong ví hệ thống của Employer có 100.000đ.
        *   Họ bấm mua "Gói Đẩy Top 24h" giá 50.000đ.
        *   Hệ thống trừ tiền (Ví còn 50.000đ). Tạo record `GIAO_DICH`. Bật cờ (flag) `is_boosted = true` cho Job đó. Job tự động nhảy lên màu Đỏ chót trên bản đồ.
    2.  **Thất bại do Số dư không đủ (Insufficient Balance):**
        *   Ví Employer chỉ còn 20.000đ.
        *   Bấm mua gói 50.000đ -> Báo lỗi: "Số dư trong ví không đủ. Vui lòng nạp thêm tối thiểu 30.000đ để tiếp tục". Hiển thị nút gọi API qua Ví Momo.

### 5.2. Tính năng Theo dõi (Follower)
*   **Mô tả:** Ứng viên thích đi làm sự kiện ở một công ty Event uy tín, bấm theo dõi công ty đó.
*   **Tình huống Mồi Nhử (Hook):**
    *   Tháng sau rảnh rỗi, Employer Công ty Event đó tạo 1 Bài đăng Tuyển dụng mới.
    *   Event trigger: Hệ thống lập tức quét bảng `THEO_DOI`, tìm ra Candidate này.
    *   Hệ thống bắn 1 Push Notification nổ thẳng lên màn hình khóa máy của Candidate: "Nhà tuyển dụng bạn Yêu thích vừa đăng bài: Tuyển 50 PG sự kiện mùng 2. Bấm để giành slot ngay!".

---
*Tài liệu này đóng vai trò là kim chỉ nam cho Backend Developer thiết lập Logic validation và Frontend Developer thiết kế UI/UX báo lỗi (Error Handle).*
