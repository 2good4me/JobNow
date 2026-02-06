# Dữ liệu mẫu khởi tạo (Seed Data)

Tài liệu này định nghĩa bộ dữ liệu ban đầu cần nạp vào Database (Seed) để hệ thống có thể hoạt động ngay khi vừa Deploy, tránh tình trạng "App trống trơn".

## 1. Vai trò & Tài khoản Admin (ROLES & USERS)
Hệ thống cần ít nhất 1 tài khoản Admin để đăng nhập trang quản trị.

| Bảng | Dữ liệu |
| :--- | :--- |
| **NGUOI_DUNG** | - Admin: `admin@jobnow.com` / Pass: `Admin@123` / Role: `ADMIN` <br> - Test Employer: `employer@test.com` <br> - Test Candidate: `candidate@test.com` |

## 2. Danh mục công việc (DANH_MUC)
Cấu trúc phân cấp Cha - Con:

### Nhóm 1: F&B (Dịch vụ ăn uống)
*   **Cha:** F&B (ID: 1)
*   **Con:**
    *   Phục vụ / Bồi bàn
    *   Pha chế (Bartender/Barista)
    *   Phụ bếp / Rửa bát
    *   Thu ngân
    *   Quản lý cửa hàng

### Nhóm 2: Logistics & Vận chuyển
*   **Cha:** Logistics (ID: 2)
*   **Con:**
    *   Shipper (Giao hàng)
    *   Bốc xếp / Kho vận
    *   Tài xế xe tải/Ba gác

### Nhóm 3: Sự kiện & Quảng cáo (Event)
*   **Cha:** Event (ID: 3)
*   **Con:**
    *   PG / PB (Promotion Boy/Girl)
    *   Nhân viên trực rạp chiếu phim
    *   Phát tờ rơi
    *   MC / Hoạt náo viên

### Nhóm 4: Giúp việc & Gia đình
*   **Cha:** Household (ID: 4)
*   **Con:**
    *   Dọn dẹp theo giờ
    *   Trông trẻ / Trông người già
    *   Nấu ăn tại gia

## 3. Gợi ý Kỹ năng (Tag Cloud)
Dữ liệu dùng để hiển thị trong mục "Gợi ý kỹ năng" khi Employer đăng tin (Lưu dưới dạng JSON hoặc Config).

*   **F&B:** `["Order món", "Bưng bê", "Pha chế cocktails", "Tiếng Anh giao tiếp", "Sử dụng POS"]`
*   **Logistics:** `["Có xe máy", "Rành đường", "Sức khỏe tốt", "Bằng lái B2"]`
*   **Event:** `["Ngoại hình ưa nhìn", "Cao trên 1m6", "Giao tiếp tốt", "Hoạt náo"]`
*   **Household:** `["Trung thực", "Sạch sẽ", "Nấu ăn ngon", "Biết ủi đồ"]`

## 4. Gợi ý Lý do Báo cáo (Report Reasons)
Dữ liệu cho Dropdown khi User bấm nút Report.

*   **Cho việc làm:**
    *   "Lừa đảo / Đa cấp"
    *   "Sai sự thật (Lương/Mô tả)"
    *   "Nội dung phản cảm / đồi trụy"
*   **Cho người dùng:**
    *   "Bùng kèo (Không đến/Không trả lương)"
    *   "Thái độ khiếm nhã / Quấy rối"
    *   "Spam tin nhắn"
