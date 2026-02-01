# Quy tắc và Nguyên lý Biểu đồ Lớp (Class Diagram)

Tài liệu này tổng hợp các quy tắc chuẩn khi xây dựng Biểu đồ Lớp (Class Diagram) theo tiêu chuẩn UML và áp dụng cho dự án.

## 1. Các thành phần cốt lõi

Một lớp (Class) được biểu diễn bằng hình chữ nhật chia làm 3 phần:

1.  **Phần đầu (Tên Lớp):**
    *   **Quy tắc:** In đậm, Căn giữa, Viết hoa chữ cái đầu mỗi từ (PascalCase).
    *   **Lớp trừu tượng (Abstract):** Tên in nghiêng hoặc có thêm `{abstract}`.
    *   **Giao diện (Interface):** Có từ khóa `<<interface>>`.
    *   *Ví dụ:* `NguoiDung`, `TinTuyenDung`.

2.  **Phần giữa (Thuộc tính - Attributes):**
    *   Liệt kê các dữ liệu/thông tin của đối tượng.
    *   **Cú pháp:** `[Tầm vực] [Tên thuộc tính] : [Kiểu dữ liệu]`
    *   **Ký hiệu Tầm vực (Visibility):**
        *   `+` Public (Công khai)
        *   `-` Private (Riêng tư)
        *   `#` Protected (Được bảo vệ - dùng cho kế thừa)
    *   *Ví dụ:* `- hoTen : String`

3.  **Phần cuối (Phương thức - Methods):**
    *   Liệt kê các hành động/chức năng của đối tượng.
    *   **Cú pháp:** `[Tầm vực] [Tên phương thức]([Tham số]) : [Kiểu trả về]`
    *   *Ví dụ:* `+ dangNhap() : boolean`

## 2. Các mối quan hệ (Relationships)

Các đường nối giữa các class thể hiện kiến trúc của hệ thống.

### 2.1. Association (Liên kết)
*   **Ký hiệu:** Đường thẳng liền (có thể có mũi tên hướng).
*   **Ý nghĩa:** Hai đối tượng có liên hệ với nhau (VD: Nhà tuyển dụng đăng Tin tuyển dụng).
*   **Số lượng (Multiplicity):**
    *   `1`: Chính xác 1.
    *   `0..1`: Không hoặc 1.
    *   `*` hoặc `0..*`: Nhiều (từ 0 trở lên).
    *   `1..*`: Ít nhất 1.

### 2.2. Inheritance / Generalization (Kế thừa)
*   **Ký hiệu:** Đường thẳng với mũi tên tam giác rỗng hướng về class Cha.
*   **Ý nghĩa:** Quan hệ "Là một" (Is-a). Class Con kế thừa toàn bộ thuộc tính và phương thức của Class Cha.
*   **Ví dụ:** `UngVien` là một `NguoiDung`.

### 2.3. Aggregation (Tụ hợp - Quan hệ yếu)
*   **Ký hiệu:** Đường thẳng với hình thoi rỗng ở phía "Cái toàn thể".
*   **Ý nghĩa:** Quan hệ "Có một" (Has-a) nhưng lỏng lẻo. Phần tử con có thể tồn tại độc lập nếu phần tử cha bị hủy.
*   **Ví dụ:** `PhongBan` có `NhanVien` (Xóa phòng ban thì nhân viên vẫn còn).

### 2.4. Composition (Cấu thành - Quan hệ mạnh)
*   **Ký hiệu:** Đường thẳng với hình thoi đặc (tô đen) ở phía "Cái toàn thể".
*   **Ý nghĩa:** Quan hệ "Có một" (Has-a) chặt chẽ. Phần tử con KHÔNG thể tồn tại nếu thiếu phần tử cha.
*   **Ví dụ:** `HoaDon` gồm các `ChiTietHoaDon` (Xóa hóa đơn thì chi tiết cũng mất).

### 2.5. Dependency (Phụ thuộc)
*   **Ký hiệu:** Đường nét đứt có mũi tên.
*   **Ý nghĩa:** Một class sử dụng class khác trong quá trình hoạt động (VD: làm tham số truyền vào hàm).

## 3. Best Practices (Thực hành tốt nhất)

1.  **Đơn giản hóa:** Không cố gắng vẽ tất cả mọi thứ. Chỉ tập trung vào các thực thể chính quan trọng.
2.  **Danh từ hóa:** Tìm các danh từ trong tài liệu yêu cầu (VD: "Ứng cử viên", "Việc làm") để xác định Class.
3.  **Đơn trách nhiệm (SRP):** Mỗi class chỉ nên đảm nhận một vai trò cụ thể.
4.  **Đặt tên nhất quán:** Sử dụng tiếng Anh cho code (để quốc tế hóa) nhưng có thể chú thích tiếng Việt để dễ hiểu nghiệp vụ.
