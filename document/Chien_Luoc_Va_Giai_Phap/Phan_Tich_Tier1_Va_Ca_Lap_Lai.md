# Báo Cáo Cố Vấn Chiến Lược: Nút thắt Tier 1 và Ca Làm Lặp Lại

Chào Founder, câu hỏi của bạn đâm "thủng" đúng vào điểm mâu thuẫn lớn nhất giữa 2 Quy tắc mà chúng ta vừa tạo ra:
1.  **Quy tắc Anti-Spam:** Tài khoản Tier 1 (Chỉ xác thực SĐT) chỉ được có TỐI ĐA 1 Ca làm việc (Shift) ở trạng thái Active (Đang chờ ứng viên) cùng một thời điểm.
2.  **Quy tắc UX Freemium:** Bổ sung Checkbox "Lặp lại ca này (T2-T6)" để Chủ quán rảnh tay tạo 1 lèo 5 Ca.

Nếu áp dụng nguyên si cơ học, thì đúng như bạn nói: Thằng Tier 1 bấm Checkbox "Từ T2 đến T6" xong bấm Lưu -> Hệ thống sẽ văng lỗi đập vào mặt nó: *"Bạn chỉ được tạo 1 ca, vui lòng KYC để tạo 5 ca"*. 
**Trải nghiệm này là CỰC KỲ TỒI TỆ (Bad UX).** Nó phản tác dụng của mô hình Freemium (Cho đi để dụ dỗ).

Dưới góc độ Strategy Advisor, tôi sẽ dùng Framework phân tích để tháo gỡ nút thắt này:

## 1. Phân tích Tình huống (Situation Analysis)
*   **Mục tiêu của Tier 1 Limit:** Ngừa bọn lừa đảo tạo tài khoản SĐT rác rồi rải thảm 100 job ảo khắp bản đồ để thu thập thông tin sinh viên.
*   **Mục tiêu của UX Lặp Lại:** Giúp Chủ quán thật (nhưng lười KYC) có trải nghiệm tốt nhất để họ "Ghiền" app.
*   **Mâu thuẫn:** Nếu ép họ KYC ngay từ thao tác đầu tiên (Chỉ vì họ muốn tìm người làm cả tuần), họ sẽ rời bỏ App ngay lập tức vì "App này phiền phức quá, tao ra group Facebook đăng cho nhanh".

## 2. Đánh Giá Các Lựa Chọn (Options Evaluation)

### Lựa Chọn A: Giữ nguyên luật "Cứng" (Chặn ngay từ Frontend)
*   **Cách thức:** Khi User Tier 1 chọn Checkbox "Lặp lại T2-T6", App mờ nút Submit đi và hiện Pop-up: *"Để đăng ca lặp lại nhiều ngày, vui lòng Chụp CMND xác thực tài khoản"*.
*   **Pros:** Code cực nhàn. Bảo mật DB tuyệt đối không có rác.
*   **Cons:** Tỉ lệ Drop-off (Rời bỏ App) của User mới sẽ lên tới 80%. Họ chưa thấy lợi ích gì đã bị đòi CMND.
*   **Điểm đánh giá rủi ro (Risk):** CAO (Phá hủy phễu User mới).

### Lựa Chọn B: Nới lỏng luật Tier 1 (1 Job = N Shifts)
*   **Cách thức:** Đổi định nghĩa. Tier 1 không phải giới hạn "1 Ca (Shift)" nữa, mà là giới hạn "1 Tin Tuyển Dụng (JobPost) Active". Trong 1 JobPost đó, họ được phép xài Checkbox lặp lại T2-T6 (Tức là đẻ ra 5 Shifts bên dưới).
*   **Pros:** Founder/Chủ quán cực kỳ sướng vì UX mượt mà. Đạt chuẩn bài toán Cà phê cần người bưng mâm cả tuần.
*   **Cons:** Bọn lừa đảo có thể tạo 1 Job "Việc nhẹ lương cao" nhưng lặp lại full 30 ngày để gom đơn.
*   **Điểm đánh giá rủi ro (Risk):** TRUNG BÌNH. Vì dù nó lặp lại 30 ca, thì trên Bản đồ (Map) nó vẫn chỉ hiện đúng **1 cái Pin ảo** tại 1 tọa độ đó. Mức độ ô nhiễm bản đồ không cao.

### Lựa Chọn C (ĐỀ XUẤT): Mở khóa Nguồn cung "Nhỏ giọt" (Drip-feed Logic)
*   **Cách thức:** Tier 1 ĐƯỢC PHÉP dùng Checkbox T2-T6 bình thường. Backend sinh ra đủ 5 Ca (Shifts) gán vào DB. NHƯNG hệ thống phân quyền của chúng ta sẽ can thiệp:
    *   Ca ngày Thứ 2: Trạng thái `OPEN` (Đẩy lên Bản đồ tìm người).
    *   Ca ngày Thứ 3,4,5,6: Phải chịu trạng thái `LOCKED_TIER_1` (Bị giam cấm, Ứng viên không nhìn thấy).
    *   Sau khi Ca Thứ 2 kết thúc (hoặc chốt đủ người), Backend tự động nhả Ca Thứ 3 thành `OPEN`. 
    *   Giao diện Chủ quán sẽ hiện thông báo: *"Bạn là tài khoản Thường, các ca T3-T6 đang ở chế độ chờ. Hãy KYC để mở khóa hiển thị tìm người cho TOÀN BỘ CÁC CA cùng lúc!"*
*   **Pros:** UX hoàn hảo (Owner vẫn bấm 1 phát ra 5 ca). Anti-Spam hoàn hảo (Trên map lúc nào cũng chỉ có 1 Pin Active của thằng đó). Lại lồng ghép được thông điệp "Mồi (Bait)" dụ Owner đi eKYC một cách cực kỳ duyên dáng.
*   **Cons:** Backend xử lý logic chuyển trạng thái cronjob phức tạp hơn một chút.
*   **Điểm đánh giá rủi ro (Risk):** THẤP NHẤT.

## 3. Khuyến Nghị Áp Dụng (Recommendation)
Tôi mạnh mẽ đề xuất bạn chọn **Lựa Chọn C**. Đây là đỉnh cao của nghệ thuật Product Design, kết hợp giữa "Tâm lý học hành vi" và "Giới hạn kỹ thuật":
1.  Cho họ cái họ muốn (Tạo 5 ca bằng 1 nút bấm).
2.  Bảo vệ nền tảng (Chỉ cho 1 ca hiển thị để hút hồ sơ).
3.  Tạo động lực eKYC tự nhiên (Họ thấy có người nộp đơn ca T2 ngon quá, muốn chốt luôn người cho ca T3, T4 thì họ sẽ **tự nguyện dâng hiến** CMND/GPKD để mở khóa).

**Cập nhật vào Database (ERD):**
Nếu bạn chốt Lựa chọn C hoặc B, chúng ta chỉ cần hiểu ngầm với nhau về Quy tắc xử lý status ở Backend Layer. Không cần đổi bảng Database nào cả.

*Bạn thấy Lựa chọn C (Giới hạn hiển thị tịnh tiến) này đủ độ "trí mạng" để giải quyết bài toán của bạn chưa?*
