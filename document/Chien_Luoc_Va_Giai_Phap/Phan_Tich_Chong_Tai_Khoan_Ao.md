# Báo Cáo Cố Vấn Chiến Lược: Giải Bài Toán "Tài Khoản Rác" (Burner Accounts)

## 1. STRATEGIC QUESTION (Vấn Đề Chiến Lược)
*(Câu hỏi của Founder)*: Nếu chúng ta dùng hệ thống "Điểm Uy Tín" để phạt (Khóa tài khoản) thay vì thu tiền cọc, thì làm sao ngăn chặn việc Employer vừa bị ban xong, lập tức lấy số điện thoại giả hoặc email xài 1 lần để tạo ngay một tài khoản mới tinh (100 điểm) và tiếp tục đăng bài phá rối rác rưởi?

---


## 2. SITUATION ANALYSIS (Phân Tích Hiện Trạng)

*   **Current State:** Mô hình Điểm Uy Tín (Trust Score) là hoàn hảo để giảm rào cản (Friction) lúc Onboarding. Bất kì ai cũng có thể đăng ký tài khoản nhanh chóng để đăng việc.
*   **Vulnerability (Lỗ hổng):** Nếu chi phí tạo 1 tài khoản mới (Ví dụ: Mua Sim rác 10K, email ảo miễn phí) RẺ HƠN chi phí nạp tiền để gỡ Ban cho tài khoản cũ (Ví dụ: Phí gỡ ban 100K), kẻ xấu chắc chắn sẽ chọn cách tạo tài khoản rác. Hệ thống sẽ trở thành một mớ hỗn độn 1 người có 100 cái nick. 
*   **Constraints:** Chúng ta KHÔNG THỂ bắt xác minh Căn cước công dân (eKYC) ngay từ đầu (Đã thống nhất ở bài phân tích số 1 là sẽ giết chết tăng trưởng).

---

## 3. OPTIONS EVALUATION (Đánh Giá Biện Pháp Chống Clone)

Đây là bài toán kinh điển của các sàn Thương mại điện tử (Shopee) hay Grab (Tài xế/Khách hàng bơm cuốc ảo). Để trị dứt điểm mà không làm phiền người dùng chân chính, chúng ta có 3 lớp rào chắn:

### Option 1: Chặn theo Thiết Bị & IP (Device Fingerprinting) - Rào chắn Vô Hình
Lúc một Employer bấm tạo tài khoản hoặc đăng nhập, App sẽ âm thầm thu thập `Device ID` (UUID của điện thoại) và `IP Address`.
Nếu tài khoản A bị khóa vĩnh viễn -> Hệ thống đưa `Device ID X` vào "**Sổ đen (Blacklist)**". Ngày hôm sau, kẻ đó lấy 1 số điện thoại mới tính đăng ký tải khoản B trên chính cái điện thoại đó. 
*   **Cách xử lý ngầm (Shadow Ban):** Không báo lỗi gì cả. Cứ cho tạo tài khoản thành công. NHƯNG, tài khoản B này ngay lập tức bị gán nhãn "Đỏ". Mọi tin đăng việc của tài khoản B sẽ hiển thị chữ `[Đang duyệt]` mãi mãi hoặc chỉ hiển thị cho... chính họ xem (Candidate khác không thấy).
*   **Pros:** Sạch sẽ, không gây phiền hà cho người dùng tử tế. Kẻ xấu không biết vì sao mình bị chặn.
*   **Cons:** Kẻ rành công nghệ có thể dùng máy tính/đổi điện thoại/dùng phần mềm giả lập để lách.
*   **Risk:** Thấp.

### Option 2: Giới hạn Đặc quyền theo Cấp độ (Tiered Verification) - Rào chắn Phân mảng 
**ĐÂY LÀ CHÌA KHÓA QUAN TRỌNG NHẤT.** Chúng ta cho phép tạo tài khoản dễ dàng, nhưng **chia Quyền lực theo độ tin cậy**.
*   **Tier 1 (Tài khoản chỉ xác thực OTP Điện thoại):** Mặc định khi tạo xong. **Luật:** Chỉ được đăng MỘT (01) ca làm việc đặng xem có ai làm không. Không được đăng ca thứ 2 nếu ca 1 chưa kết thúc hoặc chưa có ai nhận. Nếu 1 tài khoản rác tạo ra, chúng chỉ đăng được 1 tin rồi xù, sau đó bị khóa. Sát thương lên hệ thống cực thấp.
*   **Tier 2 (Tài khoản đã KYC - Tải GPKD/CCCD):** Khi quán làm ăn tốt, họ cần đăng 1 lúc 5 ca (Sáng/Trưa/Chiều...). Lúc này App bá cáo: *"Chúc mừng, để mở khóa đăng tin không giới hạn, vui lòng xác minh Cửa hàng"*. 
*   **Pros:** Ép kẻ xấu phải lộ diện (Cung cấp CCCD) mới có thể xả Rác diện rộng. Người dùng thật chỉ cần đăng 1 tin 1 lần thì không bị phiền.
*   **Cons:** Flow code phân quyền hơi nhọc cho Backend.
*   **Risk:** Cực Thấp. Giải bài toán bảo mật hoàn toàn.

### Option 3: Đặt cọc niêm phong "Điểm Uy Tín Khởi Trị" (Trust Deposit)
Người mới tạo tài khoản chỉ có 50/100 điểm. Để đăng tin, phải có tối thiểu 60 điểm. Điểm này kiếm được bằng cách: 
- Khai báo full Profile (+5đ).
- Chụp ảnh mặt tiền quán thực tế (+5đ).
- Có người quét Check-in ca đầu tiên không bị khiếu nại (+10đ).
Tài khoản rác không bao giờ rảnh rỗi đi setup từng li từng tí để kiếm đủ điểm đăng bài xả rác.

---

## 4. RECOMMENDATION (Lời Khuyên Chiến Lược)

**KHÔNG SỢ TÀI KHOẢN RÁC NẾU CHÚNG TA ÁP DỤNG TRỌN BỘ COMBO: OPTION 1 DÙNG NGẦM + OPTION 2 DÙNG NỔI.**

**Giải pháp chốt hạ (Implementation Roadmap):**
1.  **Backend DEV:** Thêm bảng `BANNED_DEVICES` (lưu Device ID/IP của những thằng xù kèo).
2.  **Logic Đăng Ca (Core Logic):** Căn cứ vào `is_verified` (Trạng thái đã KYC giấy tờ). 
    *   Nếu `false`: Chỉ cho phép tồn tại `Trạng thái: Active / Pending` tối đa **1 Ca làm việc/ngày.**
    *   Nếu `true`: Đăng thoải mái ngàn ca.
3.  **Thuật toán Shadow Ban (Hình phạt bí mật):** Kẻ nào tạo tài khoản từ số điện thoại mới trên 1 thiết bị đã dính "Sổ đen", hệ thống tự đánh dấu `Trust_Score = -999`. Cứ để chúng đăng ca bình thường cho thỏa mãn, nhưng thực chất Backend không bao giờ PUSH cái Ca làm việc đó lên Bản đồ tìm việc của mọi ứng viên. Cả đời chúng sẽ không thấy ai ứng tuyển.

Với chiến lược này, chi phí tạo và "nuôi" 1 tài khoản ảo phức tạp và đắt đỏ hơn gấp 10 lần việc đi nộp phạt để gỡ Ban. **Chợ nhân sự (Marketplace) của bạn sẽ cực kỳ trong sạch!**

---
*Phân tích Chiến lược cấp bách - GPS JobNow.*
