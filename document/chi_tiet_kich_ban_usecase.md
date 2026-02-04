# Kịch bản Chi tiết Use Case (Use Case Specification)

Tài liệu này mô tả chi tiết từng bước tương tác (Step-by-step) giữa Người dùng và Hệ thống cho các chức năng quan trọng.

## 1. Use Case: Chấm công (Check-in)
**Mục tiêu:** Xác thực nhân viên đã có mặt tại điểm làm việc hợp lệ.
**Tác nhân:** Ứng viên (Candidate).
**Điều kiện tiên quyết:** Ứng viên đã có ít nhất một Đơn ứng tuyển (Application) ở trạng thái `APPROVED` (Được nhận).

### Luồng sự kiện chính (Main Flow)
| Bước | Người dùng (User Action) | Hệ thống (System Response) | Ghi chú Kỹ thuật |
| :--- | :--- | :--- | :--- |
| 1 | Mở tab "Việc làm của tôi" | Hiển thị danh sách các việc đã được nhận. | Query bảng `DON_UNG_TUYEN` lấy các đơn `APPROVED`. |
| 2 | Chọn việc làm muốn điểm danh (VD: Cafe HighLand) | Chuyển sang màn hình chi tiết chấm công. | Client lưu `application_id` của việc được chọn. |
| 3 | Bấm nút **"CHECK-IN"** | 1. Yêu cầu quyền truy cập GPS (nếu chưa có).<br>2. Lấy tọa độ GPS hiện tại.<br>3. Gửi Request lên Server. | `POST /api/check-in`<br>Body: `{ app_id: 123, lat: 10.1, long: 106.2 }` |
| 4 | (Chờ xử lý) | 1. Server tra cứu tọa độ chuẩn của Job (trong DB).<br>2. Tính khoảng cách (Distance) giữa GPS người dùng và GPS quán.<br>3. So sánh với bán kính cho phép (200m). | Logic tính toán nằm ở Server để tránh Hack GPS trên App. |
| 5 | (Không làm gì) | **Nếu Hợp lệ (< 200m):**<br>- Lưu Check-in vào DB.<br>- Hiển thị thông báo "Check-in thành công!".<br>- Đổi trạng thái màn hình sang "Đang làm việc". | Insert vào bảng `CHAM_CONG`. |

### Luồng thay thế / Ngoại lệ (Alternative Flows)
*   **Trường hợp A: Ở quá xa (> 200m)**
    *   Hệ thống báo lỗi: *"Bạn đang cách nơi làm việc 500m. Vui lòng di chuyển đến gần hơn để check-in."*
    *   Nút Check-in không bị khóa, cho phép thử lại.

*   **Trường hợp B: GPS quá yếu / Không lấy được vị trí**
    *   Hệ thống báo lỗi: *"Không xác định được vị trí. Vui lòng đứng ra nơi thoáng đãng và thử lại."*

---

## 2. Use Case: Ứng tuyển nhanh (Apply)
**Mục tiêu:** Nộp đơn xin việc siêu tốc.

| Bước | Người dùng | Hệ thống |
| :--- | :--- | :--- |
| 1 | Xem chi tiết tin tuyển dụng | Hiển thị nút "Ứng tuyển ngay". |
| 2 | Bấm "Ứng tuyển ngay" | Kiểm tra hồ sơ User có đủ thông tin cơ bản (SĐT, Tên) chưa? |
| 3 | (Optional) Nhập lời nhắn | Hiển thị Popup nhập lời nhắn gửi chủ quán. |
| 4 | Xác nhận Nộp | 1. Tạo bản ghi `DON_UNG_TUYEN` mới (Status = PENDING).<br>2. Gửi thông báo cho Chủ quán. |

---

## 3. Use Case: Đăng tin (Post Job)
**Mục tiêu:** Nhà tuyển dụng đăng tin mới.

| Bước | Người dùng | Hệ thống |
| :--- | :--- | :--- |
| 1 | Bấm nút "Đăng tin" | Hiển thị Form nhập liệu. |
| 2 | Điền Tiêu đề, Lương, Mô tả | Validate dữ liệu (Không để trống). |
| 3 | Chọn địa điểm làm việc | **Tự động ghim vị trí hiện tại** làm địa chỉ quán. (Cho phép kéo ghim để chỉnh sửa chính xác). |
| 4 | Bấm "Đăng ngay" | 1. Kiểm tra từ khóa cấm.<br>2. Lưu `VIEC_LAM` vào DB.<br>3. Hiển thị tin lên bản đồ chung. |

---

## 4. Use Case: Cập nhật Hồ sơ (Update Profile)
**Mục tiêu:** Người tìm việc bổ sung kỹ năng để tăng cơ hội được tuyển.

| Bước | Người dùng | Hệ thống | Ghi chú Kỹ thuật (JSON Skill) |
| :--- | :--- | :--- | :--- |
| 1 | Vào màn hình "Hồ sơ cá nhân" | Hiển thị thông tin hiện tại. | `GET /api/me` |
| 2 | Bấm "Chỉnh sửa" -> Tìm mục **Kỹ năng** | Hiển thị danh sách các thẻ (Tags) hoặc Checkbox để chọn. | UI không bắt nhập text JSON thủ công. |
| 3 | Chọn các kỹ năng: "Pha chế", "Tiếng Anh" | Giao diện hiển thị các thẻ đã chọn (Chips). | Frontend gom lại thành mảng: `["Pha chế", "Tiếng Anh"]` |
| 4 | Bấm "Lưu thay đổi" | 1. Nhận mảng String từ Client.<br>2. Convert sang chuẩn JSON.<br>3. Update vào cột `skills` trong DB. | `UPDATE profiles SET skills = '["Pha chế", "Tiếng Anh"]'` |
