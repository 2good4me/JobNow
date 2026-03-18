# Tài liệu Test Case - Hệ thống JobNow

Tài liệu này tổng hợp các kịch bản kiểm thử cho các chức năng chính của hệ thống JobNow dựa trên phân tích mã nguồn.

---

## 1. Chức năng Đăng tin tuyển dụng (Post Job)

| ID | Tên Test Case | Mô tả | Các bước thực hiện | Kết quả mong đợi |
|:---|:---|:---|:---|:---|
| PJ_01 | Kiểm tra bỏ trống trường bắt buộc (Bước 1) | Xác nhận hệ thống báo lỗi khi không nhập tiêu đề/mô tả. | 1. Vào trang Đăng tin.<br>2. Để trống Tiêu đề/Mô tả.<br>3. Nhấn "Tiếp tục". | Hệ thống hiển thị thông báo lỗi tương ứng bên dưới các trường. |
| PJ_02 | Kiểm tra độ dài tiêu đề | Xác nhận tiêu đề phải >= 5 ký tự. | 1. Nhập tiêu đề "Job".<br>2. Nhấn "Tiếp tục". | Thông báo lỗi "Tiêu đề phải >= 5 ký tự". |
| PJ_03 | Kiểm tra mức lương âm | Xác nhận mức lương không được nhỏ hơn 0. | 1. Nhập mức lương "-1000".<br>2. Nhấn "Tiếp tục". | Thông báo lỗi "Mức lương phải >= 0". |
| PJ_04 | Kiểm tra GPS chưa chọn (Bước 2) | Xác nhận không cho qua bước 3 nếu chưa chọn vị trí. | 1. Nhập địa chỉ.<br>2. Không chọn vị trí trên bản đồ (latitude/longitude là null).<br>3. Nhấn "Tiếp tục". | Hiển thị cảnh báo: "Vui lòng chọn vị trí GPS trước khi tiếp tục". |
| PJ_05 | Kiểm tra giới hạn ảnh | Xác nhận không cho tải ảnh > 5MB. | 1. Ở Bước 4, chọn file ảnh dung lượng 6MB.<br>2. Tải lên. | Hiển thị toast error: "Kích thước hình ảnh phải <= 5MB". |
| PJ_06 | Đăng tin thành công | Xác nhận quy trình đăng tin hoàn tất. | 1. Nhập đầy đủ thông tin hợp lệ qua 4 bước.<br>2. Nhấn "Đăng tin ngay". | Hiển thị toast success: "Đăng tin thành công!" và chuyển về trang Employer. |

---

## 2. Chức năng Quản lý Ví (Wallet Service)

| ID | Tên Test Case | Mô tả | Các bước thực hiện | Kết quả mong đợi |
|:---|:---|:---|:---|:---|
| WA_01 | Nạp tiền thành công | Kiểm tra luồng nạp tiền vào ví. | 1. Nhập số tiền > 0.<br>2. Chọn phương thức nạp.<br>3. Xác nhận. | Số dư (balance) tăng đúng bằng số tiền nạp, tạo 1 bản ghi giao dịch DEPOSIT. |
| WA_02 | Nạp tiền với số tiền <= 0 | Kiểm tra kiểm tra điều kiện đầu vào. | 1. Nhập số tiền 0 hoặc -100.<br>2. Nhấn nạp. | Hệ thống báo lỗi "Số tiền phải lớn hơn 0". |
| WA_03 | Rút tiền khi đủ số dư | Kiểm tra luồng rút tiền. | 1. Nhập số tiền thấp hơn số dư hiện tại.<br>2. Nhập thông tin ngân hàng.<br>3. Xác nhận. | Số dư giảm, tạo bản ghi giao dịch WITHDRAW với trạng thái COMPLETED/PENDING. |
| WA_04 | Rút tiền khi không đủ số dư | Kiểm tra kiểm tra điều kiện rút. | 1. Nhập số tiền lớn hơn số dư hiện tại.<br>2. Nhấn rút. | Hệ thống báo lỗi "Số dư không đủ để thực hiện giao dịch". |

---

## 3. Chức năng Quản lý công việc (Employer Jobs)

| ID | Tên Test Case | Mô tả | Các bước thực hiện | Kết quả mong đợi |
|:---|:---|:---|:---|:---|
| EJ_01 | Hiển thị danh sách tin | Kiểm tra dữ liệu tin tuyển dụng. | 1. Truy cập danh sách tin của NTD. | Hiển thị đúng các tin mà NTD đó đã đăng. |
| EJ_02 | Chỉnh sửa tin | Kiểm tra cập nhật thông tin. | 1. Chọn 1 tin cũ.<br>2. Thay đổi tiêu đề/mô tả.<br>3. Lưu lại. | Thông tin tin tuyển dụng được cập nhật chính xác trong database. |

---

## 4. Bảng điều khiển Admin (Admin Panel)

| ID | Tên Test Case | Mô tả | Các bước thực hiện | Kết quả mong đợi |
|:---|:---|:---|:---|:---|
| AD_01 | Chặn truy cập trái phép | Kiểm tra quyền ADMIN. | 1. Đăng nhập bằng tài khoản role CANDIDATE hoặc EMPLOYER.<br>2. Truy cập URL `/admin`. | Hệ thống chuyển hướng về trang chủ hoặc hiển thị "Truy cập bị từ chối". |
| AD_02 | Truy cập Admin thành công | Kiểm tra quyền truy cập đúng. | 1. Đăng nhập bằng tài khoản role ADMIN.<br>2. Truy cập URL `/admin`. | Hiển thị giao diện Admin Sidebar và Header bình thường. |
