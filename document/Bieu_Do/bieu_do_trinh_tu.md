# Quy trình Xử lý (Sequence Flow)

Tài liệu này mô tả chi tiết từng bước tương tác giữa Người dùng, Ứng dụng và Hệ thống cho 3 chức năng cốt lõi.

## 1. Chức năng: Tìm việc quanh đây (Scan Jobs by GPS)
**Mô tả:** Quy trình hiển thị danh sách việc làm dựa trên vị trí hiện tại của ứng viên.

**Các bước thực hiện:**
1.  **Candidate** mở màn hình "Tìm việc" trên App.
2.  **App Mobile** tự động lấy tọa độ GPS hiện tại (Latitude, Longitude).
    *   *Kiểm tra:* Nếu GPS chưa bật -> App hiển thị yêu cầu bật định vị.
3.  **App Mobile** gửi yêu cầu lên **Server**: `GET /jobs/nearby` kèm theo tọa độ.
4.  **Server** truy vấn **Database**: Tìm tất cả công việc có khoảng cách < 5km (bán kính mặc định).
5.  **Database** trả về danh sách việc làm phù hợp cho Server.
6.  **Server** trả dữ liệu (JSON) về cho **App Mobile**.
7.  **App Mobile** vẽ các Pin (Ghim) công việc lên bản đồ Google Map/Mapbox để người dùng xem.

---

## 2. Chức năng: Đăng tin tuyển dụng (Post Job)
**Mô tả:** Quy trình Nhà tuyển dụng đăng một tin mới lên hệ thống.

**Các bước thực hiện:**
1.  **Employer** bấm nút "Đăng tin" và nhập thông tin (Tiêu đề, Lương, Mô tả).
2.  **App Mobile** hỗ trợ tự động điền địa chỉ dựa trên GPS hiện tại của Employer.
3.  **Employer** bấm nút "Xác nhận Đăng".
4.  **App Mobile** gửi dữ liệu lên **Server**: `POST /jobs`.
5.  **Server** thực hiện kiểm tra (Validate):
    *   Kiểm tra số dư tài khoản (nếu có thu phí).
    *   Kiểm tra từ khóa cấm (lọc nội dung xấu).
6.  **Xử lý kết quả kiểm tra:**
    *   *Trường hợp Hợp lệ:* **Server** lưu tin vào **Database** -> Trả về "Thành công" -> **App** báo cho Employer.
    *   *Trường hợp Lỗi:* **Server** trả về mã lỗi -> **App** hiển thị thông báo (VD: "Tin chứa từ khóa không phù hợp").

---

## 3. Chức năng: Chấm công (GPS Check-in)
**Mô tả:** Quy trình xác thực nhân viên đã đến nơi làm việc bằng GPS.

**Các bước thực hiện:**
1.  **Candidate** đến nơi làm, mở App và bấm nút "Check-in".
2.  **App Mobile** lấy tọa độ GPS thực tế của điện thoại (gọi là `User_GPS`).
3.  **App Mobile** gửi yêu cầu Check-in lên **Server** kèm `User_GPS`.
4.  **Server** lấy tọa độ của địa điểm làm việc từ **Database** (gọi là `Job_GPS`).
5.  **Server** tính toán khoảng cách giữa `User_GPS` và `Job_GPS`.
6.  **Quyết định kết quả:**
    *   *Nếu khoảng cách < 200m:*
        *   Server ghi nhận "Check-in Hợp lệ" vào Database.
        *   Server gửi thông báo (Push Notification) cho Employer: "Nhân viên A đã đến".
        *   App báo "Thành công" cho Candidate.
    *   *Nếu khoảng cách > 200m:*
        *   Server từ chối Check-in.
        *   App báo lỗi: "Bạn đang ở quá xa (Cách 500m), vui lòng di chuyển đến đúng vị trí".
