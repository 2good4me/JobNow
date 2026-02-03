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
## 2. Công nghệ phát triển (Đề xuất)
Dựa trên yêu cầu về bản đồ và hiệu năng, hệ thống sử dụng:
*   **Mobile App:** **React Native** (Đa nền tảng Android/iOS).
*   **Backend:** **Node.js (NestJS)**.
*   **Database:** **PostgreSQL** + **PostGIS** (Lưu trữ và truy vấn dữ liệu địa lý).
*   **Map Service:** **Google Maps Platform**.
