# XÂY DỰNG HỆ THỐNG ĐIỂM UY TÍN (TRUST & REPUTATION SYSTEM)

Điểm uy tín là "Xương sống đạo đức" của một nền tảng tuyển dụng Part-time. Trong thị trường lao động phổ thông, tình trạng "Bùng kèo" (Candidate nhận việc rồi không đến) hoặc "Quỵt lương/Bóc lột" (Employer) diễn ra như cơm bữa. 
**Tầm nhìn của hệ thống:** Biến Điểm Uy Tín thành một loại TÀI SẢN. Ai có điểm cao sẽ kiếm được nhiều tiền/dễ tuyển người. Ai điểm thấp sẽ bị đào thải khỏi nền tảng.

---

## 1. CƠ CHẾ KHỞI TẠO VÀ HOẠT ĐỘNG
*   **Điểm gốc (Starting Point):** Khi vừa tạo tài khoản, mọi User (cả Candidate và Employer) đều có mặc định **80 Điểm**. Đây là mức điểm "Chưa được kiểm chứng". Phải trải qua quá trình làm việc tốt mới có thể leo lên mức Xuất sắc (100đ).
*   **Thang điểm:** Từ `0` đến `100+`.
*   **Lưu trữ:** Trường `reputation_score` trong bảng `NGUOI_DUNG`.

---

## 2. KỊCH BẢN TĂNG/TRỪ ĐIỂM DÀNH CHO NGƯỜI TÌM VIỆC (CANDIDATE)

**Tầm nhìn:** Kỷ luật là sức mạnh. Đi đúng giờ, làm tốt sẽ được thưởng. Bùng kèo không lý do sẽ bị trừng phạt nặng nề.

### 🔴 Các hành vi BỊ TRỪ ĐIỂM (Penalties)
1. **Hủy ca vào phút chót (Late Cancellation):**
   * *Hành vi:* Đã được duyệt đơn, nhưng bấm hủy ca trước giờ làm < 12 tiếng. (Khiến quán không kịp trở tay tìm người thay).
   * *Hình phạt:* **-10 điểm**.
2. **Bùng kèo (No-show / Ghosting):**
   * *Hành vi:* Đã được duyệt đơn, nhưng đến giờ không đi làm, cũng không bấm hủy trên App. Đối với Job Yêu cầu Tới Nơi (dò GPS không thấy `VALID`), hoặc Job từ xa (Employer chủ động report ứng viên bóc hơi).
   * *Hình phạt:* **-30 điểm**. (Hành vi nghiêm trọng nhất).
3. **Bị đánh giá 1-2 Sao:**
   * *Hành vi:* Đi làm thái độ lồi lõm, chủ quán rate 1 sao hoặc 2 sao.
   * *Hình phạt:* **-5 điểm**.
4. **Vi phạm tiêu chuẩn cộng đồng:**
   * *Hành vi:* Bị Report và Admin xác nhận (Gửi ảnh khiêu dâm, chửi thề trên khung chat).
   * *Hình phạt:* **-50 điểm** hoặc Khóa tài khoản vĩnh viễn.

### 🟢 Các hành vi ĐƯỢC CỘNG ĐIỂM (Rewards)
1. **Gắn bó / Hoàn thành tốt ca làm:**
   * *Thành tích:* Được Employer đánh giá 5 sao sau ca làm.
   * *Phần thưởng:* **+2 điểm**.
2. **Đi làm đúng giờ chuẩn GPS:**
   * *Thành tích:* Có mặt và Check-in bằng GPS tại quán trước giờ làm 15 phút. Hệ thống ghi nhận `status = VALID`.
   * *Phần thưởng:* **+1 điểm**.
3. **Cứu cánh giờ chót (Hero Mode):**
   * *Thành tích:* Apply và nhận đi làm một Ca làm việc Đang Cần Gấp (Sẽ diễn ra trong vòng < 6 tiếng nữa). Hành động này giúp Employer giải quyết khủng hoảng nhân sự.
   * *Phần thưởng:* **+5 điểm**.

---

## 3. KỊCH BẢN TĂNG/TRỪ ĐIỂM DÀNH CHO NHÀ TUYỂN DỤNG (EMPLOYER)

**Tầm nhìn:** Bảo vệ quyền lợi ứng viên. Chống bóc lột, giam lương, và thông tin "treo đầu dê bán thịt chó".

### 🔴 Các hành vi BỊ TRỪ ĐIỂM (Penalties)
1. **Đóng ca sát giờ (Sudden Cancellation):**
   * *Hành vi:* Ứng viên chuẩn bị đi làm thì chủ quán bấm Đóng Job (Hủy lịch) trước < 6 tiếng. Khiến ứng viên mất cơ hội đi làm chỗ khác.
   * *Hình phạt:* **-15 điểm**.
2. **Quỵt lương / Trễ lương (Unpaid/Delayed Salary):**
   * *Hành vi:* Sau ca làm 3 ngày nhưng vẫn để trạng thái thanh toán là `UNPAID`. Bị ứng viên khiếu nại.
   * *Hình phạt:* **-20 điểm**.
3. **Bị đánh giá 1-2 Sao:**
   * *Hành vi:* Bắt làm thêm giờ không trả thêm tiền, môi trường độc hại. Ứng viên Rate 1 sao.
   * *Hình phạt:* **-5 điểm**.
4. **Lạm dụng "Từ chối" (High Rejection Rate):**
   * *Hành vi:* Đăng tin nhưng ứng viên nộp vào cứ bấm Reject liên tục (Tỷ lệ Reject > 90%). Dấu hiệu đăng tin rác, thu thập data ứng viên chứ không có nhu cầu tuyển thật.
   * *Hình phạt:* **-10 điểm**.

### 🟢 Các hành vi ĐƯỢC CỘNG ĐIỂM (Rewards)
1. **Môi trường tốt:** Được ứng viên đánh giá 5 sao. (**+5 điểm**).
2. **Thanh toán lương siêu tốc (Fast Payer):** Chuyển trạng thái đơn sang `PAID` (Đã trả lương) trong vòng < 2 giờ kể từ lúc ứng viên kết thúc ca làm. (**+3 điểm**).

---

## 4. HỆ QUẢ CỦA ĐIỂM UY TÍN DƯỚI GÓC NHÌN UI/UX (HỆ THỐNG HUY HIỆU)

### Giai đoạn Phạt (Penalty Phase)
*   **Dưới 60 điểm:** Hiện cảnh báo Vàng trên Profile. (Bị mất 20 điểm so với lúc mới tạo).
*   **Dưới 40 điểm (Vùng nguy hiểm):**
    *   *Candidate:* Bị cấm ứng tuyển các Job VIP. Khi nộp đơn, màn hình của Employer hiển thị **cảnh báo Đỏ** bên cạnh CV để họ cân nhắc.
    *   *Employer:* Tin đăng bị giáng cấp, không bao giờ được hiện lên đầu bản đồ dù có nạp tiền Mua Gói VIP (Tiền không mua được uy tín).
*   **Dưới 20 điểm (Banned):** Khóa tài khoản vắng mặt. Yêu cầu nộp tiền phạt hoặc chờ Admin xem xét lại.

### Giai đoạn Thưởng (Reward Phase)
*   **Đạt 100 điểm (Huy hiệu Excellent):**
    *   *Candidate:* Hồ sơ hiển thị huy hiệu "Ngôi sao Chăm Chỉ". Các Employer sẽ tranh nhau duyệt đơn của bạn. Viết App sẽ mở khóa cho bạn nộp cùng lúc nhiều Đơn hơn ngưởi bình thường.
    *   *Employer:* Tin đăng có huy hiệu "Nhà tuyển dụng Uy Tín". Thu hút lượng view và nộp đơn gấp 5 lần so với quán bình thường.

---
**Tổng kết:** Điểm Uy Tín không chỉ là một con số cho vui. Nó được gắn chặt trực tiếp vào Quyền lợi hiển thị và Hành vi Ứng tuyển. Đây là "Luật chơi" để giữ App sạch sẽ và chuyên nghiệp.
