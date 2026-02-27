# Báo Cáo Cố Vấn Chiến Lược: UX/UI Màn Hình Đăng Tin & Ứng Tuyển

Chào Founder, thiết kế UI (Giao diện) cho 2 màn hình này chính là "Trái tim" quyết định sự sống còn của JobNow. Nếu làm quá phức tạp (nhiều form), người dùng sẽ bỏ cuộc. Nếu làm quá đơn giản, hệ thống DB xịn sò của chúng ta ở phía sau sẽ không có dữ liệu để chạy logic.

Dưới góc độ Strategy Advisor, tôi xin trình bày "Bản thiết kế Công thái học" (Ergonomic Design) tối ưu nhất cho 2 màn hình này:

---

## MÀN HÌNH 1: EMPLOYER ĐĂNG TIN TUYỂN DỤNG (POST JOB)

Mục tiêu UX: Trải nghiệm vuốt/chạm mượt mà, hạn chế gõ chữ tối đa. Phân mảnh logic "Đăng 1 lần, đẻ N ca" một cách tự nhiên tinh tế.

### Các Block Giao Diện Chi Tiết:

**Block 1: Trọng tâm Công việc (Header Info)**
*   **Tiêu đề:** Input textbox (VD: Cần 2 bạn chạy bàn tiệc cưới).
*   **Danh mục:** Dropdown chọn ngành (F&B, Nhặt bóng, PG, Sự kiện...). Kèm Icon trực quan.
*   **Mô tả:** Text area (Để placeholder gợi ý mờ: Yêu cầu ăn mặc gọn gàng...).

**Block 2: Tiền bạc (Compensation)**
*   **Mức Lương:** Input dạng số (VD: 30.000).
*   **Đơn vị tính:** Toggle Button nằm ngang để chạm ( [Trọn Gói] | **[Theo Giờ]** | [Theo Ngày] ).

**Block 3: Định vị (Location Engine - Core Value)**
*   **Bản Đồ Nhỏ (Mini Map):** Giao diện Map hiện lên với một cây Kim (Pin) Rơi thẳng xuống vị trí GPS hiện tại của điện thoại chủ quán.
*   **Dòng chữ xác nhận:** "Vị trí quán của bạn là: Số 12 Nguyễn Văn Cừ..." (Tự auto-fill nhờ Google Maps API). Dưới đó có 1 nút nhỏ `[Sửa vị trí / Kéo điểm ghim]` nếu họ đang ngồi nhà đăng việc cho quán. KHÔNG CHO PHÉP ĐĂNG JOB REMOTE.

**Block 4: Ma Thuật Chia Ca (Scheduling Logic) - Dành riêng cho JobNow**
*   Màn hình hỏi: *"Bạn cần tuyển theo hình thức nào?"* -> Có 2 Tab lớn để chọn:
    *   **Tab A - Tuyển Thời Vụ (1 Lần/Ngắn Hạn):**
        *   Chọn `Ngày Làm` (Mở Calendar).
        *   Chọn `Giờ Bắt Đầu` -> `Giờ Kết Thúc` (Dạng vòng xoay đồng hồ dễ vuốt).
        *   Chọn `Số người cần` (Nút + / -).
        *   *(Option nâng cao)* Checkbox: `[x] Lặp lại ca này` -> Xổ ra `[T2] [T3] [T4] [T5] [T6] [T7] [CN]`. Nhấn chọn những ngày muốn lặp.
    *   **Tab B - Tuyển Cố Định (Dài Hạn Part-time):**
        *   Chọn Lịch Chu Kỳ: `[T2-T4-T6]` hoặc `[Làm Từ T2 đến T6]`.
        *   `Giờ Bắt Đầu` -> `Giờ Kết Thúc`.
        *   Không cần chọn ngày kết thúc vì hệ thống sẽ chạy vòng lặp vô hạn (Auto-Roster) như đã bàn.

**Block 5: Chốt hạ (Submit) & Gợi Ý Upsell**
*   Nút bự chà bá: **[ĐĂNG TIN MIỄN PHÍ]**.
*   *Upsell Freemium:* Ngay dưới nút Đăng Tin là một khung viền vàng lấp lánh: *"Việc quá gấp? Mua gói **Còi Hụ (20k)** để bắn thông báo ngay lập tức vào điện thoại 500 sinh viên quanh đây!"*.

---

## MÀN HÌNH 2: CANDIDATE ỨNG TUYỂN NHẬN JOB (APPLY)

Mục tiêu UX: Cảm giác "Lấy vé" (Ticketing). Ứng viên biết chính xác họ đang nộp vào thời gian nào để tránh đụng lịch, cảm nhận được độ uy tín của quán.

### Phân Tích Màn Hình Chi Tiết Job (Đọc Tin):
*   **Đập vào mắt:** Tiền lương thật to + Khoảng cách GPS ("Cách bạn 1.2 km").
*   **Bảo chứng niềm tin:** Banner thẻ Cửa hàng có ghi "Đã KYC Tích Xanh" và "Điểm Uy Tín: 95/100" (Nếu điểm dưới 50, viền sẽ đỏ rực cảnh báo).

### Các Block Giao Diện Khi Bấm [ỨNG TUYỂN]:

**Block 1: Lựa Chọn Ca (Shift Picker) - Phản ánh kiến trúc Database**
Màn hình này sẽ hiển thị khác nhau tùy vào cách Chủ Quán đã đăng ở bước trên:

*   **Tình huống 1 (Quán tuyển n ngày lắt nhắt):**
    Hệ thống list ra các ô vuông Ca Làm Việc (Shifts) như dạng vé xem phim.
    *   `[ ] Thứ 3 (10/05) | 18:00 - 22:00 | Còn rảnh 2 slot`
    *   `[ ] Thứ 4 (11/05) | 18:00 - 22:00 | [Mờ đục - Đã đủ người]`
    *   `[ ] Thứ 5 (12/05) | 18:00 - 22:00 | Còn rảnh 1 slot`
    -> Sinh viên tích vào các ô vuông mình rảnh (VD: Tích T3 và T5). 

*   **Tình huống 2 (Quán tuyển Dài hạn):**
    Hiển thị 1 bảng duy nhất:
    *   `Lịch Làm Cố Định: Thứ 2, Thứ 4, Thứ 6 hàng tuần`
    *   `Giờ: 08:00 - 12:00`
    -> Thấy được thì làm, không có mục chọn Ca lắt nhắt.

**Block 2: Lời Nhắn Vã Xác Nhận**
*   **Phần nhắn nhủ:** Text box nhỏ *"Để lại một lời hứa với chủ quán để dễ được duyệt (Không bắt buộc)"*.
*   **Cam kết:** Một dòng chữ ghim cứng: *"Bằng việc ấn Xác Nhận, bạn cam kết sẽ đến Check-in đủ các Ca đã dăng ký. Hủy ca sát giờ sẽ bị trừ nặng Điểm Uy Tín!"*
*   **Nút Chốt:** **[XÁC NHẬN NHẬN VIỆC]**.

---

## TỔNG KẾT CHIẾN LƯỢC UX
Như Founder thấy, màn hình giao diện đã giấu hoàn toàn sự phức tạp của hệ thống Database:
- Chủ quán cứ nghĩ mình tạo 1 Tin đăng có tính lặp lại. (Nhưng DB đã xé nát ra thành N ca độc lập).
- Ứng viên cứ nghĩ mình chọn "Slot" làm việc như book vé CGV. (Nhưng DB lại sinh ra N cái vé `DON_UNG_TUYEN` móc vào Ca).

Mọi thứ trên màn hình diễn ra không quá 4 cú click, cực kì gây nghiện!
