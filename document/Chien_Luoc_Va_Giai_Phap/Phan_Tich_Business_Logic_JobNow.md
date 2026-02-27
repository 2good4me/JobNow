# Báo Cáo Cố Vấn Chiến Lược: Đánh Giá Độ Hoàn Thiện Của Business Logic (GPS JobNow)

## 1. STRATEGIC QUESTION (Vấn đề Chiến Lược)
Business Logic cốt lõi của ứng dụng GPS JobNow hiện tại đã đủ "chín" để tung ra thị trường (Launch MVP) chưa? Những lỗ hổng chết người nào (Fatal Flaws) đang tiềm ẩn trong luồng vận hành thực tế cần phải được vá ngay lập tức để tránh vỡ trận khi Scale (Mở rộng)?

---

## 2. SITUATION ANALYSIS (Phân Tích Hiện Trạng)

*   **Current State (Hiện trạng Logic):** App hoạt động mượt mà xoay quanh luồng: Đăng `CA_LAM_VIEC` -> Phân quyền (Candidate, Employer, Admin) -> Nhận ca -> Check-in/out tự động bằng tọa độ GPS vòng tròn 100m. Đồng thời có Background Job (ETL) để tính thống kê và phạt.
*   **Objective (Mục tiêu):** Trở thành một nền tảng "Real-time Matching" hoàn hảo, nơi Employer rảnh tay 100% trong khâu chấm công, và Candidate tìm được việc vặt quanh nhà chỉ bằng 1 cú chạm.
*   **Constraints (Điểm nghẽn thực tế):**
    1.  Sai số của công nghệ GPS phần cứng (Điện thoại cùi bắp, chui xuống hầm gửi xe, vào Aeon Mall mất sóng).
    2.  Hành vi của "Con người": Ứng viên nhận ca cho vui xong ngủ quên (No-show). Employer đăng ca xạo để phá đối thủ.

---

## 3. OPTIONS EVALUATION (Nhận Diện Lỗ Hổng & Đề Xuất Trám Lỗ ổng)

Dưới góc nhìn Business Analyst & Strategy Advisor, bộ khung DB của bạn (Phân ca, ETL Job) đã đạt **Mức Hoàn Thiện 80% (Rất Tốt)**. Tuy nhiên, 20% còn lại là các "Edge Cases" (Luồng ngoại lệ) quyết định sống còn của App:

### Lỗ Hổng 1: "Điềm Kẹt" (Dead-end) ở luồng Check-in & Check-out
*   ***Vấn đề:*** Nếu thiết bị của Candidate bị lệch sóng GPS báo khoảng cách 150m (dù họ đang đứng ở bếp), App sẽ chặn Check-in. Quản lý ở đó có mặt nhưng App không cho vào ca, gây ức chế tột độ. Hoặc lúc trưa họ xin về sớm, rớt mạng không bấm Check-out được.
*   ***Option (Cách giải quyết):*** **Cơ chế Dual-Verification (Xác thực kép - Dự phòng).** 
    *   Bình thường: Dùng bán kính 100m GPS (Mặc định).
    *   Fallback (Dự phòng): Employer có 1 mã QR tĩnh in dán trên tường. Nếu GPS hư, Candidate mở App quét mã QR đó. Khớp ID Quán = Check-in thành công.
*   ***Risk (Độ rủi ro nếu bỏ qua):*** CAO (Uy tín App bị chửi bới dữ dội trên Store vì "Làm rồi mà App lỗi không tính lương").

### Lỗ Hổng 2: Chưa có bộ "Luật Rừng" (Penalty & Reward Rules) cho Marketplace
*   ***Vấn đề:*** App tuyển dụng thời vụ sợ nhất là nạn "Bùng kèo" ngang xương. Candidate nhận ca sáng mai xong tối nay nhậu xỉn ném ĐT không đi làm. Employer hủy ca trước 1 tiếng khiến Candidate bơ vơ.
*   ***Option (Cách giải quyết):*** **Hệ thống Điểm Uy Tín (Credibility Score).** 
    *   Bắt đầu mỗi account có 100 điểm.
    *   Bùng ca sát giờ (Dưới 2 tiếng): Trừ thẳng 30 điểm. Xuống dưới 50 điểm -> Cấm hiển thị Bản đồ trong 7 ngày.
    *   Khuyến khích: Mở chức năng bắt buộc Employer phải quét/nhận ứng viên. Nếu Employer hủy ca sát giờ -> Tự động trích tiền từ "Ví Employer" bồi thường 50% tiền ca đó cho Candidate.
*   ***Risk (Độ rủi ro nếu bỏ qua):*** RẤT CAO. Chợ lao động nát bét vì không có tính cam kết.

### Lỗ Hổng 3: Áp lực Dòng tiền (Monetization Friction) ngay giai đoạn "Trứng Nước"
*   ***Vấn đề:*** Bắt thu phí `GIAO_DICH` (Transaction fee) hoặc gói VIP sớm quá làm chùn bước Employer (Ngành F&B chi li từng cắc).
*   ***Option (Cách giải quyết):*** **Mô hình Freemium Dài Hạn.**
    *   Đăng ca: MIỄN PHÍ 100%. Check-in: MIỄN PHÍ 100%. 
    *   *Chỉ thu tiền tính năng:* "Khẩn Cấp" (Đọc tin tức thời, App tự Push Noti hú còi cho 100 ứng viên gần nhất). Thu tiền Employer khi họ xài tính năng "Chiếm sóng" này (Ví dụ: 30k/lần).
*   ***Risk (Độ rủi ro nếu bỏ qua):*** TRUNG BÌNH. Dễ kiệt sức khi cạnh tranh với các Group Facebook rác nhưng miễn phí.

---

## 4. RECOMMENDATION (Kết Luận & Lộ Trình Lời Khuyên)

**Business Logic của JobNow CẦN BẢN VÁ LỖ HỔNG (Hot-fix) TRƯỚC KHI DEV UI.**

**Lộ trình Thực thi ngay lập tức:**
1.  **Cập nhật Use Case & Database (Tuần 1):** Bổ sung thuộc tính `QR_CODE_HASH` cho bảng `CUA_HANG` làm Fallback check-in. Bổ sung bảng con `DIEM_UY_TIN_LOG` kết nối với User để truy vết lịch sử tăng/trừ điểm.
2.  **Cập nhật Bot ETL Đêm Khuya (Tuần 2):** Con Bot chạy nền (System) lúc nửa đêm không chỉ tính tiền doanh thu, mà phải quét các biến `CA_LAM_VIEC`: Ca nào "Đã Quá Giờ" mà Status vẫn là "Đã Ứng Tuyển" (Không Check-in) -> Tự động vả trừ điểm uy tín của ứng viên đó. Đồng thời tự Force Check-out các ca bị treo.
3.  **UI/UX (Tuần 3):** Làm nổi bật "Điểm uy tín" to đùng trên Avatar của Candidate để Employer tự tin chọn mặt gửi vàng.

## 5. SUCCESS METRICS (Tiêu chí Thành công 1 tháng sau Launch)
1. Tỉ lệ Check-in trơn tru (Không cần gọi trợ giúp): > 95%.
2. Tỉ lệ Bùng Ca (No-show Rate) giảm từ mức xô bồ 30% xuống còn < 5% nhờ sợ bị trừ điểm Uy tín khóa móm.
3. Khối lượng tin đăng (Liquidity) đạt mốc 200 tin F&B/tuần nhờ miễn phí đăng tải cơ bản.

---
*Biên soạn bởi: AI Strategy Advisor - Dành riêng cho GPS JobNow.*
