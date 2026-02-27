# Báo Cáo Cố Vấn Chiến Lược: Tuyển Dụng Dài Hạn (Part-time Cố Định)

Chào Founder, câu hỏi "Tuyển Part-time dài hạn (mấy tháng/nửa năm) thì hệ thống chạy bằng cách nào?" là câu hỏi chạm đến cảnh giới thiết kế Kiến trúc Dữ liệu Động (Dynamic Data Architecture) cực kỳ cao cấp.

Nếu chúng ta ép Chủ quán tạo tay 100 ca làm việc cho 3 tháng, hoặc ép Sinh viên nộp đơn 100 lần, thì App sẽ chết yểu ngay vì UI/UX quá nặng nề. Về mặt Database, việc nhồi hàng ngàn dòng `CA_LAM_VIEC` vào trước cho tương lai cũng là một thảm họa tốn dung lượng vô ích (bởi vì sinh viên có thể nghỉ việc giữa chừng ở tháng thứ 2).

Với tư cách Cố vấn Chiến lược, tôi vạch ra **"Luồng Tự Sinh Ca (Auto-Roster Flow)"** giải quyết hoàn hảo bài toán này:

## 1. Góc nhìn của Employer (Tạo Job Dài Hạn)
*   **Thao tác (UX):** Chủ quán mở App, chọn **"Tuyển Cố Định (Dài hạn)"**. Thay vì chọn từng Ngày đơn lẻ, giao diện sẽ cho họ check vào "Lịch Làm Việc Chu Kỳ" (VD: T2, T4, T6 từ 08:00 - 12:00, Lương 30k/h).
*   **Xử lý (DB Backend):** Hệ thống chỉ tạo đúng **1 bản ghi** vào bảng `VIEC_LAM` kèm theo chuỗi `schedule_rule` (Quy tắc lặp: `Mon,Wed,Fri|08:00-12:00`). **TUYỆT ĐỐI KHÔNG SINH RA HÀNG TRĂM `CA_LAM_VIEC` TỪ BÂY GIỜ**. Công việc này cứ thế treo trên Map tìm người.

## 2. Góc nhìn của Candidate (Ứng Tuyển)
*   **Thao tác (UX):** Sinh viên thấy Job "Tuyển Barista (T2-4-6 hàng tuần)". Cảm thấy phù hợp, họ chỉ bấm duy nhất một nút: **[Ứng Tuyển Dài Hạn]**.
*   **Xử lý (DB Backend):** Một `DON_UNG_TUYEN` (Ticket) duy nhất được tạo ra để neo (Bind) sinh viên này vào nguyên cái Công Việc (JobPost) của Chủ quán.

## 3. Khoảnh Khắc "Chốt Sale" (Onboarding)
*   Chủ quán trò chuyện, ưng ý bé sinh viên này và bấm **[NHẬN VIỆC] (Approve)**.
*   Ngay tại giây phút này, hệ thống sẽ kích hoạt **Cỗ máy Nhân Bản (Cronjob Engine)**. Trạng thái Job trên Map đóng lại.

## 4. Cỗ Máy Rải Ca Tự Động (Auto-Roster) - Đỉnh Cao Thiết Kế
Làm sao để hệ thống vừa giữ được DNA chấm công "Rất chi tiết theo từng ngày (100m GPS)" mà Database không bị phình to? 

*   **Logic Nhỏ Giọt:** Cứ vào 00:00 sáng Chủ Nhật mỗi tuần, con Bot hệ thống sẽ quét cái Job "Barista T2-4-6" mang tên bé sinh viên kia. Nó tự động **Đẻ ra 3 bản ghi `CA_LAM_VIEC`** (chính xác cho Thứ 2, Thứ 4, Thứ 6 của tuần tới). 
*   Bot tự động xếp tên bé sinh viên vào sắn 3 Ca này luôn. Không cần Chủ lẫn Tớ đụng tay.

## 5. Vận Hành Check-in GPS Hằng Ngày 
*   Sáng Thứ 2 đến: Y chang như đi làm Thời Vụ! 07:45 sáng, điện thoại bé sinh viên rú lên báo Push Noti: *"Sắp đến giờ làm T2, nhớ check-in"*.
*   Bé đến bán kính 100m, mở App chấm cái Đùng. Bản ghi `CHAM_CONG` của ngày hôm nay được kích hoạt. Lương buổi hôm nay (120k) được tóm tắt vào Ví.
*   Mọi thứ lập lại êm ru vào sáng T4, T6... cho đến khi nào Chủ quán bấm **[Sa Thải]** hoặc Sinh viên bấm **[Xin Thôi Việc]**, thì con Bot Rải Ca Tự Động kia nó lập tức Dừng Lại, không đẻ thêm Ca cho tuần sau nữa.

---
**KẾT LUẬN CHIẾN LƯỢC QUẢN TRỊ VẬN HÀNH:**
1.  **Founder Sướng:** Data cực kì gọn nhẹ, không lưu trữ rác tương lai.
2.  **Chủ Quán Sướng:** Chỉ đăng 1 lần, tuyển 1 lần, tự động lên lịch chạy vi vu hàng tháng trời không cần tạo Job mới.
3.  **Sinh Viên Sướng:** App vẫn nhắc đi làm đúng giờ từng ngày và cộng dồn tiền lương lên Bảng lương tháng cực kỳ tường minh.

Đây chính là luồng **Subscription Job (Công việc thuê bao)**. Nó xóa nhòa ranh giới giữa Tuyển Thời vụ và Tuyển Dài Hạn trong đúng 1 giao diện App của bạn. Bạn thấy quy trình Vận hành tự động này đã sắc bén chưa?
