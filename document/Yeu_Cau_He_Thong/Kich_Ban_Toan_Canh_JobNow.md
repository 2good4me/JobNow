# KỊCH BẢN TỔNG THỂ & LUỒNG CHUYỂN TRẠNG THÁI (USER FLOWS & BRANCHES) - GPS JOBNOW

Tài liệu này đóng vai trò như bản thiết kế "Phim Trường" của toàn bộ hệ thống. Nó liệt kê chi tiết mọi ngóc ngách, quyền hạn của từng loại tài khoản và các luồng (Flows) rẽ nhánh của ứng dụng để chuẩn bị cho bước "Chẻ Task Lập Trình".

---

## PHẦN 1: HỆ THỐNG PHÂN QUYỀN (ACTORS & ROLES)

### 1. Phân hệ Candidate (Người tìm việc)
*   **Guest (Khách vãng lai - Chưa đăng nhập):** Chỉ được xem Bản đồ GPS rải rác các đốm sáng tin tuyển dụng. Bấm vào chi tiết bị chặn (Pop-up: "Đăng nhập bằng SĐT để xem lương cụ thể").
*   **Candidate Chuẩn (Đã OTP & Profile cơ bản):** Điểm uy tín mặc định: 100.
    *   Được bấm "Lưu Công Việc" hoặc "Ứng Tuyển".
    *   Giới hạn ngầm: Không được ứng tuyển cùng lúc 2 ca làm việc có thời gian trùng nhau (Ví dụ: Đã ứng ca 8h-12h quán A thì không được nhận ca phụ bếp 9h-11h quán B).

### 2. Phân hệ Employer (Nhà tuyển dụng / Cửa hàng)
*   **Tier 1 - Employer Tân Binh (Chỉ có SĐT, Chưa KYC):** Điểm uy tín: 50/100.
    *   **Luật rẽ nhánh:** Chỉ được đăng **TỐI ĐA 01 CA LÀM VIỆC (Trạng thái Active/Pending)** trong cùng một thời điểm. Hệ thống đếm: `IF count(Ca làm việc status in [Active, Pending]) >= 1 THEN disable(Nút Đăng Tin)`.
    *   Phải điền Profile và cập nhật Ảnh mặt tiền quán thật (Làm ảnh bìa cho Job) để có thể hoạt động.
*   **Tier 2 - Employer Xác Thực (Đã tải GPKD / CCCD lên Admin duyệt):** Điểm uy tín tối thiểu bắt đầu: >60/100.
    *   **Luật rẽ nhánh:** Mở khóa "Giới hạn Đăng". Được đăng 10, 20 ca tùy ý (Sáng, Trưa, Chiều). 
    *   Được quyền truy cập Ví chức năng để mua gói "Push Notifications" bám đuổi Candidate quanh khu vực.
*   **Tài khoản Bị Kỷ Luật (Shadow Ban):** Trust Score < 50.
    *   Nhìn bề ngoài vẫn dùng App bình thường, đăng tin báo thành công, nhưng Backend set cờ `hidden = true`. Không ứng viên nào nhìn thấy tin của cửa hàng này.

### 3. Phân hệ Vô hình (Hệ thống)
*   **Bot Nightly (ETL):** Thức dậy lúc 00:00 hằng ngày. Quét tổng doanh thu mua gói VIP. Quét trừng phạt bùng ca. Xóa rác.
*   **Location Service:** Nhận lệnh xin tọa độ từ Client thao tác Check-in.

---

## PHẦN 2: CÁC LUỒNG HOẠT ĐỘNG CHÍNH (MAIN WORKFLOWS)

### Luồng 1 (Flow 1): Hành trình Đăng việc của Employer
1. Employer mở App -> Chọn "Tạo ca làm việc".
2. Điền thông tin: Tiêu đề (VD: Phục vụ bàn), Ngày làm, Giờ bắt đầu, Giờ kết thúc, Lương/Giờ.
3. Tải lên (Hoặc chọn lại) **Ảnh mặt tiền quán** (Bắt buộc dùng làm Cover Job).
4. Bấm "Đăng".
5. **Rẽ nhánh Logic (Branching):**
    *   *Trường hợp A (Employer Tier 1):* Backend check `count_active_jobs`. Nếu có 2 ca -> Trả lỗi: *"Tài khoản chưa xác thực chỉ được đăng 1 ca. Vui lòng xác minh quán để đăng không giới hạn!"*. Nếu có 0 ca -> Ghi DB thành công. Trạng thái Job: `ACTIVE`.
    *   *Trường hợp B (Employer Tier 2):* Bỏ qua validation đếm ca -> Ghi DB thành công. Trạng thái Job: `ACTIVE`.

### Luồng 2 (Flow 2): Hành trình Ứng Tuyển & Phê Duyệt
1. Candidate mở App -> Lướt Map -> Chọn 1 đốm sáng quán gần đó -> Xem chi tiết (Thấy ảnh mặt tiền).
2. Candidate bấm nút "Ứng Tuyển Ca". Trạng thái DB của Mapping Card: `APPLIED_WAITING`.
3. Employer nhận Notification Pop-up.
4. Employer vào danh sách ca, xem Profile Candidate (Chủ yếu xem Điểm Uy Tín của Candidate).
5. **Rẽ nhánh Ngầm:** (Nếu App muốn hạn chế Spam) Một ca 1 người chỉ cho phép Employer chọn duy nhất 1 Candidate.
6. Employer bấm "Phê duyệt" (Approve) Candidate A.
7. **Rẽ nhánh Xóa (Auto-Reject):** Trạng thái của Candidate A thành `APPROVED`. Tất cả 10 người khác ứng tuyển ca đó tự động bị chuyển thành `REJECTED`, App tự động bắn tin nhắn chia buồn cho họ.

### Luồng 3 (Flow 3): Luồng Đi Làm (Check-in/Check-out Kép)
*(Giả sử Ca làm việc là 8:00 AM đến 12:00 PM)*
1. **7:45 AM:** App bắn Push Notification tự động cho Candidate: *"Đã sắp đến giờ làm ở Quán Mộc Cafe, nhớ Check-in lấy lương nhé!"*.
2. **8:00 AM (Khi đến quán):** Candidate mở App chọt bấm nút `[CHECK-IN ĐIỂM DANH]`.
3. **App rẽ nhánh xác thực:**
    *   *Nhánh 1 (GPS Tốt):* App bắt sóng lấy 1 tọa độ Vĩ độ/Kinh độ. Khoảng cách (App, Quán) < 100m. -> Báo: `CHECK-IN THÀNH CÔNG`.
    *   *Nhánh 2 (GPS Ngu/Trượt hầm xe):* App đo khoảng cách ra 150m. Báo lỗi thất bại rẽ nhánh Fallback: *"Vị trí không khớp! Hãy nhờ Chủ quán đưa MÃ QR của ca làm để quét xác nhận đỏ mặt"*. Candidate quét Mã QR động trên máy của Employer -> `CHECK-IN THÀNH CÔNG`.
4. Trạng thái Ca: `WORKING`.
5. **12:00 PM (Kết ca):** Candidate lại lấy điện thoại bấm `[CHECK-OUT]`.
    * Nếu bấm trước 12h00 -> Popup hỏi Employer duyệt cho về sớm không.
    * Nếu bấm đúng giờ -> Trạng thái Ca: `COMPLETED`. Lương 100k bay vào ví/hiển thị chờ thanh toán.

### Luồng 4 (Flow 4): Hình Phạt Trừng Trị Hệ Thống (Bùng Kèo & Xù Job)
1. **Nhánh 1: Candidate Hủy Ca Sát Giờ.**
   *   Candidate A đã được Approve ca 8h. Nhưng 7h sáng mở App bấm nút "Hủy đi làm".
   *   Backend trừ thẳng tay 30 Điểm Uy Tín.
   *   Employer nhận thông báo để lật đật tuyển người khác.
2. **Nhánh 2: Candidate Ngủ Quên (No-show Ghosting).**
   *   Ca bắt đầu 8:00. Đến 8:30 (Quá 30 phút Tolerance), Backend không thấy tín hiệu check-in.
   *   Trạng thái từ `APPROVED` chuyển thành `GHOSTED`. Trừ thẳng tay 50 Điểm Uy Tín.
   *   Nếu điểm rớt xuống < 50 -> Tài khoản Candidate bị văng ra, không thể xem Map GPS trong 7 ngày tới.
3. **Nhánh 3: Employer Hủy Ca Vô Cớ (Gài Ứng Viên).**
   *   Employer duyệt Candidate A. 7:30 Employer bấm "Hủy Ca/Hủy tuyển".
   *   Backend trừ thẳng 30 Điểm Uy Tín của Employer.
   *   Nếu Employer tái phạm 5 lần (Điểm < 50) -> Đính mác Shadow Ban. Đưa UUID điện thoại vào sổ đen `Burner_Accounts`. 

### Luồng 5 (Flow 5): Vận Hành Hệ System (ETL Tổng Hợp Đêm Khuya)
1. Đúng 00:00, Cron Job Backend kích hoạt tác vụ ETL.
2. App gom toàn bộ `CA_LAM_VIEC` có trạng thái là `COMPLETED` trong ngày hôm qua. Tính tổng tiền phát sinh lương. Lọc biểu đồ doanh thu đẩy qua cho bảng Dashboard.
3. App quét toàn bộ `CA_LAM_VIEC` bị "Kẹt" (Trạng thái vẫn là Working từ 2 ngày trước do quên Check-out). App tự động ép chuyển trạng thái về `COMPLETED` với số giờ max của ca đó để tránh treo hệ thống.

---
**TỔNG KẾT:** Kịch bản này đã quy hoạch toàn bộ các luồng ma sát khó nhất của quy trình Tuyển dụng thời vụ. App đã chặn mọi lỗ hổng tạo clone ảo và tự động kiểm soát chất lượng qua Điểm Uy Tín mà không cản trở User mới. Giai đoạn tiếp theo có thể giao cấu trúc DB này cho Backend Dev thiết kế các APIs tương ứng.
