# Báo Cáo Cố Vấn Chiến Lược: Xử lý Ứng viên xin nghỉ đột xuất

Chào Founder, đây là một bài toán kinh điển của ngành "Gig Economy" (Kinh tế chia sẻ sức lao động). Việc sinh viên "bùng kèo" hoặc ốm đột xuất trong chuỗi ngày làm việc là rủi ro hiện hữu mỗi ngày.

Tin vui là: **Nhờ quyết định "Chẻ nhỏ Công việc thành các Ca độc lập" (Bảng `CA_LAM_VIEC`) mà chúng ta vừa chốt ở ERD, việc giải quyết bài toán này trở nên vô cùng mượt mà.**

Dưới đây là phần phân tích qua lăng kính Strategy Advisor để bạn thấy ứng dụng GPS Job của chúng ta sẽ vận hành "thông minh" cỡ nào:

## 1. Phân Tích Tình Huống (Situation Analysis)
*   **Current State (Hiện trạng):** Ứng viên A đã trúng tuyển 5 Ca Làm Việc (Thứ 2 đến Thứ 6). Tới chiều Thứ 3, A bị sốt và không thể đi làm ngày Thứ 4. A mở App xin nghỉ Ca Thứ 4.
*   **Objective (Mục tiêu):**
    *   Chủ quán ngay lập tức tìm được người thế chỗ riêng cho ngày Thứ 4.
    *   Ứng viên A chỉ bị hủy Ca Thứ 4, không bị tước mất quyền đi làm tiếp vào Thứ 5, Thứ 6 (nếu Chủ quán vẫn cho phép).
    *   Phải có hình phạt răn đe để Ứng viên không lạm dụng việc hủy ca bừa bãi.

## 2. Hệ Thống Vận Hành (Luồng Xử lý của App)

Thay vì thiết kế hệ thống cứng nhắc "Gắn nguyên 1 Cục Job", chúng ta sẽ chạy luồng xử lý riêng biệt cho từng Ca (Shift) rành mạch như sau:

**Bước 1: Ứng Viên Bấm "Xin Nghỉ Ca Này"**
*   Trên màn hình điện thoại của Ứng viên, họ vào mục "Việc sắp tới", chọn đúng cái Ca của ngày Thứ 4 và bấm nút **[Hủy Nhận Ca]**.
*   Backend lập tức đổi trạng thái bảng `DON_UNG_TUYEN` (của riêng ca T4 đó) thành `CANCELLED_BY_CANDIDATE`.

**Bước 2: Hệ Thống Bật Trạng Thái "Cấp Cứu Hỏa Tốc" (Auto-Fill)**
*   Ngay khi Ứng viên A hủy, Ca làm việc Thứ 4 lập tức bị tuột từ trạng thái `FULL` (Đủ người) rớt về lại trạng thái `OPEN` (Đang tìm người).
*   Đồng thời, Ca Thứ 4 này được hệ thống tự động **Gắn cờ Đỏ (URGENT)** và đẩy một Push Notification giật gân (Miễn Phí) cho Toàn bộ sinh viên đang ở bán kính 3km quanh quán:
    *   *"Cấp cứu thay người: Quán Mộc Cafe đang trống 1 slot Ca Sáng mai. Lương 25k/h. Nhận ngay!!"*

**Bước 3: Thông Báo Cho Chủ Quán**
*   Điện thoại Chủ Quán sẽ Ping 1 thông báo: *"Sinh viên A vừa báo ốm ca Sáng mai (Thứ 4). Hệ thống đã ngay lập tức mở lại ca này trên Bản đồ để tìm người thay thế. Có 3 người vừa mới nộp đơn, vui lòng xem ngay!"*
*   Chủ quán chỉ việc bấm Duyệt 1 người tên B. Vậy là Thứ 4 người B làm, Thứ 5 người A lại hết ốm đi làm bình thường. Không ai bị tổn thương quá lố!

## 3. Khuyến Nghị Chiến Lược Răn Đe (Penalty Recommendation)

Hệ thống linh hoạt nhưng **KHÔNG ĐƯỢC DỄ DÃI**. Nếu Ứng viên ưng thì nhận, buồn thì hủy sát giờ sẽ làm Chủ quán đột quỵ. Chúng ta phải dùng **Thanh kiếm "Điểm Uy Tín" (Trust Score)** để xử trảm:

Đề xuất Bảng Luật (Quy tắc hóa vào Code Backend):
*   **Trường hợp 1 - Rất Văn Minh:** Ứng viên bấm Hủy ca trước 24 tiếng. (Ví dụ: Trưa T3 báo nghỉ sáng T4). Hệ thống trừ **2 điểm uy tín** (Mang tính nhắc nhở).
*   **Trường hợp 2 - Gây Khó Khăn:** Hủy ca trước 2h đến 12h. Chủ quán sẽ rất gấp ráp tìm người. Hệ thống trừ **10 điểm uy tín**.
*   **Trường hợp 3 - Phá Hoại (Bùng Kèo):** Hủy ca sát giờ (< 2 tiếng) hoặc Mất tích không đến Check-in (No-show). Hệ thống giáng búa tạ: Trừ thẳng **30 điểm uy tín** + **Khóa mõm (Ban Apply) trong 3 ngày**.

*(Lưu ý: Nếu một Ứng viên rớt xuống dưới 50 điểm Uy Tín, các Chủ Quán sẽ thấy Avatar của họ có Viền Đỏ Cảnh Báo ngập tràn, thề không ai dám nhận thằng này vào làm nữa).*

---
**KẾT LUẬN CHIẾN LƯỢC:** 
Nhờ thiết kế Database chẻ nhỏ Ca `CA_LAM_VIEC`, chuyện nhân viên xin nghỉ 1 ngày giữa chừng là "Muỗi". App chúng ta biến rủi ro của Chủ Quán thành **"Một Job Hot thả ra cho cộng đồng cắn xâu"** ngay lập tức và song song xử chém thanh Điểm Uy Tín của kẻ bùng kèo. 

Đó mới đích thực là Vận Hành Hiện Đại (Real-time Operations)!
Bạn thấy luồng xử lý này đủ sức gánh vác rủi ro ngoài đời thực chưa?
