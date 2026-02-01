# Đề tài: Hệ thống Quản lý và Tuyển dụng Việc làm Thời vụ theo định vị GPS

Đây là tài liệu chi tiết về ý tưởng, bài toán và các yêu cầu cho đề tài của bạn.

## 1. Ý tưởng & Giới thiệu bài toán

### 1.1. Ý tưởng (Idea)
Xây dựng một nền tảng ("Uber/Grab cho việc làm") kết nối **Nhà tuyển dụng** (cần người làm gấp, ngắn hạn) và **Người tìm việc** (sinh viên, lao động phổ thông muốn kiếm thêm thu nhập) dựa trên **vị trí địa lý thực (GPS)**.
Điểm cốt lõi là sự "nhanh chóng" và "gần đây". Người tìm việc có thể mở ứng dụng và thấy ngay các công việc đang tuyển chỉ cách mình vài trăm mét (phục vụ bàn, phát tờ rơi, bốc vác, PG/PB...).

### 1.2. Giới thiệu bài toán (Problem Statement)
*   **Bối cảnh:** Nhu cầu việc làm thời vụ (part-time, seasonal) rất lớn, đặc biệt ở các thành phố lớn. Sinh viên cần việc làm thêm linh hoạt, chủ cửa hàng cần người thay thế gấp hoặc cần thêm nhân sự vào giờ cao điểm.
*   **Vấn đề hiện tại:**
    *   Việc tìm kiếm chủ yếu qua các Group Facebook, Zalo (thông tin trôi nhanh, thiếu xác thực, khó lọc theo khu vực).
    *   Người tìm việc tốn thời gian di chuyển xa do không biết có việc làm ở ngay gần nhà.
    *   Nhà tuyển dụng khó tìm người ngay lập tức khi cần gấp.
*   **Giải pháp:** Hệ thống sử dụng GPS để hiển thị việc làm trên bản đồ số, gợi ý việc làm gần nhất, giúp rút ngắn thời gian tìm kiếm và chi phí đi lại.

## 2. Yêu cầu Chức năng (Functional Requirements)

Hệ thống cần phục vụ 3 đối tượng chính: **Candidate** (Người tìm việc), **Employer** (Nhà tuyển dụng), và **Admin** (Quản trị viên).

### 2.1. Phân hệ Người tìm việc (Candidate)
*   **Đăng ký/Đăng nhập:** Hỗ trợ qua SĐT, Email, Google/Facebook.
*   **Hồ sơ cá nhân (Profile):** Cập nhật thông tin, kỹ năng, thời gian rảnh, bán kính tìm việc mong muốn.
*   **Xác thực danh tính (eKYC - Khuyến khích):** Chụp ảnh CCCD/CMND để nhận huy hiệu "Verified". Ứng viên đã xác thực sẽ được ưu tiên hiển thị và tăng cơ hội được tuyển dụng.
*   **Tìm kiếm việc làm (Core Feature):**
    *   **Xem trên bản đồ:** Hiển thị vị trí người dùng và các pin công việc xung quanh.
    *   **Xem dạng danh sách:** Sắp xếp công việc theo khoảng cách (gần nhất đến xa nhất).
    *   **Bộ lọc:** Lọc theo mức lương, loại công việc, thời gian làm.
*   **Ứng tuyển:** Nộp đơn ứng tuyển nhanh ("One-click apply"), theo dõi trạng thái đơn (Đã nộp, Được xem, Chấp nhận/Từ chối).
*   **Nhắc việc:** Nhận thông báo khi có việc mới ở gần hoặc sắp đến giờ làm.
*   **Đánh giá:** Đánh giá nhà tuyển dụng sau khi hoàn thành công việc.

### 2.2. Phân hệ Nhà tuyển dụng (Employer)
*   **Xác thực danh tính (eKYC - Quan trọng):**
    *   **Cá nhân:** Chụp ảnh CCCD/CMND 2 mặt + Selfie.
    *   **Doanh nghiệp:** Tải lên giấy phép kinh doanh.
    *   Tài khoản đã xác thực sẽ có dấu tích xanh (Verified) để tăng độ uy tín.
*   **Đăng tin tuyển dụng:** Nhập tiêu đề, mô tả, mức lương, **vị trí làm việc (chọn trên bản đồ/tự động lấy GPS)**, số lượng cần tuyển.
*   **Quản lý ứng viên:** Xem danh sách người ứng tuyển, xem hồ sơ, duyệt hoặc từ chối, gọi điện/nhắn tin trực tiếp.
*   **Quản lý tin đăng:** Sửa, xóa, tạm ẩn, đẩy tin.
*   **Thanh toán (Nâng cao):** Mua gói tin đăng nổi bật (VIP) hoặc trả phí dịch vụ.
*   **Đánh giá:** Đánh giá thái độ và chất lượng làm việc của nhân viên.

### 2.3. Phân hệ Quản trị (Admin)
*   **Dashboard:** Thống kê số lượng người dùng mới, tin đăng, lượt ứng tuyển theo ngày/tháng.
*   **Quản lý người dùng:** Khóa/Mở khóa tài khoản vi phạm.
*   **Kiểm duyệt tin:** Duyệt các tin tuyển dụng (để tránh lừa đảo) trước khi hiển thị công khai.
*   **Quản lý danh mục:** Thêm/sửa/xóa các loại công việc (ngành nghề).

## 3. Yêu cầu Phi chức năng (Non-Functional Requirements)

Đây là các tiêu chuẩn về "chất lượng" của hệ thống:

*   **Tính chính xác của vị trí (Location Accuracy):** Hệ thống phải cập nhật vị trí GPS chính xác, sai số thấp để tính khoảng cách đúng.
*   **Hiệu năng (Performance):**
    *   Tải danh sách công việc trên bản đồ nhanh (< 1 giây cho 100 điểm).
    *   Chịu tải tốt khi nhiều người dùng truy cập cùng lúc (giờ cao điểm).
*   **Tính khả dụng (Usability):** Giao diện Mobile-first, thân thiện, dễ dùng cho cả lao động phổ thông ít am hiểu công nghệ.
*   **Bảo mật (Security):**
    *   Mã hóa mật khẩu người dùng.
    *   Bảo vệ API, tránh bị spam tin rác.
    *   Bảo mật thông tin cá nhân (SĐT, địa chỉ nhà) chỉ hiển thị khi hai bên chấp nhận kết nối.
*   **Tính tin cậy (Reliability):** Dữ liệu tin đăng phải được kiểm duyệt hoặc có cơ chế báo cáo (report) lừa đảo hiệu quả.

## 4. Công nghệ đề xuất (Tech Stack Suggestion)

*   **Mobile App (Ưu tiên hàng đầu):** Nên xây dựng App trước cho Candidate và Employer vì cần GPS và thông báo tức thời (Push Notification).
    *   Công nghệ: **Flutter** (Google) hoặc **React Native** (Facebook) để tiết kiệm thời gian (code 1 lần chạy cả iOS và Android).
*   **Bản đồ:** Google Maps API hoặc Mapbox API (Rẻ hơn).
*   **Backend:** NodeJS (NestJS/Express) hoặc Java Spring Boot.
*   **Database:** PostgreSQL (có PostGIS hỗ trợ truy vấn không gian/địa lý rất tốt) hoặc MongoDB (GeoJSON).
