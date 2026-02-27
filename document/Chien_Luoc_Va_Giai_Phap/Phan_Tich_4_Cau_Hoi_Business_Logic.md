# Báo Cáo Cố Vấn Chiến Lược: 4 Câu Hỏi Sống Còn Về Vận Hành Thực Tế

Chào Founder, 4 câu hỏi bạn vừa đặt ra chứng tỏ bạn đích thị là người làm Product thực chiến, đi rất sát vào tâm lý và dòng tiền của User. Tôi sẽ áp dụng luôn bộ tư duy "Strategy Advisor" để giải quyết từng vấn đề thật triệt để.

---

## QUESTION 1: Phục hồi Điểm Uy Tín < 50 (Sợ Employer vote 1 sao rác app)
**Tình huống (Situation):** Một ông chủ quán bình thường làm ăn đàng hoàng, đùng cái hỏa hoạn/lũ lụt hoặc bất cẩn quên bấm, bị hệ thống tự động trừ sạch điểm xuống dưới 50. Cửa hàng không có ứng viên, chủ quán điên tiết thề xóa App và vote 1 sao. Làm sao cứu?

**Đề xuất Chiến Lược (Recommendation): Xóa bỏ "Shadow Ban" cho User Thật - Đưa ra lộ trình "Chuộc lỗi".**
*   Lúc phân tích tài khoản ảo, tôi có nhắc đến "Shadow ban" (ẩn ngầm). LUẬT NÀY CHỈ DÙNG CHO USER CLONE (1 thiết bị đăng ký 10 SĐT).
*   Còn với **Employer đã KYC (Xác thực GPKD đàng hoàng)**: Khi họ rớt < 50 điểm, hệ thống KHÔNG chặn ngầm. Hệ thống hiển thị thẳng một cái Banner đỏ chót bự chà bá trên App của họ: *"Tin đăng của bạn đang BỊ ẨN do Cửa hàng dính nhiều vi phạm Hủy Ca. Ứng viên sẽ không thấy tin của bạn"*.
*   **Lối thoát (The escape hatch):** Kế bên dòng chữ đó có 2 nút giải quyết để họ không tức giận:
    1.  *Nút "Kháng Cáo" (Appeal):* Cho họ viết lý do (Có hình hỏa hoạn/bệnh viện). Admin duyệt tay sẽ trả lại 100 điểm.
    2.  *Nút "Đóng Phạt Dân Sự":* (Dùng thẻ/Momo nạp vô khoảng 50.000 VNĐ). Đóng tiền phạt để MUA LẠI 50 điểm. Khoản tiền đóng phạt này App thu, hoặc ném vào "Quỹ bù đắp ứng viên". Vừa răn đe, vừa có doanh thu!

---

## QUESTION 2: Concept "Đăng 10 - 20 Ca làm việc"
**Tình huống:** Một cửa hàng nhỏ thường chỉ có Ca Sáng - Chiều - Tối (3 ca). Tại sao lại có vụ đăng 10, 20 ca?

**Giải thích:**
Khái niệm "Ca Làm Việc" (Shift) trong Database của bạn không phải nói về số lượng ca trong **1 NGÀY**, mà là Đang Tồn Tại (Active) **TRÊN TOÀN HỆ THỐNG**.
*Ví dụ:* Hôm nay là Thứ Hai. Ông chủ quán cần đặt lịch tìm ứng viên cho cả tuần.
*   Thứ 3: Cần 1 ca Sáng, 1 ca Tối (2 Ca Active).
*   Thứ 4: Cần 3 người đi bưng mâm đám cưới (Chia làm 3 Ca Active khác nhau).
*   Thứ 5: Cần 1 ca Trưa.
=> Tổng cộng ông chủ đó đang có **6 Ca Làm Việc rải rác**. Nếu tài khoản Tier 1 (Cùi bắp), họ ko thể lập kế hoạch xa như thế này (Chỉ đăng được 1 ca rồi phải chờ ca đó kết thúc mới đăng tiếp). Tài khoản Tier 2 (KYC) thì đăng thả ga cho 2 tuần tới cũng được.

---

## QUESTION 3: Monetization - Thỏa thuận trả Lương Tiền Mặt thì App thu tiền sao?
**Tình huống cực khoai:** Candidate đến làm ca 4 tiếng (100k). Kết thúc ca, bà chủ quán rút túi đưa thẳng tờ 100k tiền mặt cho sinh viên cho lẹ (Đỡ tốn tiền rút qua App). Vậy App GPS Job lấy gì ăn? Chẳng lẽ làm từ thiện?

**Đánh Giá Các Lựa Chọn Thu Phí (Monetization Evaluaton):**
*   *Cách 1 (Bắt nạp tiền ứng viên):* Không khả thi, chả ai đi kiếm việc mà bắt nạp tiền.
*   *Cách 2 (Bảo lưu lương):* Bắt cửa hàng nạp 100k vào Momo của App. Khi ứng viên Check-out, App bòn rút 5k, trả 95k cho ứng viên. Cách này an toàn tuyệt đối, nhưng cự kì MA SÁT CAO. Quán sẽ ngại dùng vì giam vốn của họ. 

**Khuyến Nghị Chiến Lược Số 3 (Mô hình Grab 2.0 - Trừ Phí Cửa Hàng Chậm):**
Chúng ta KHÔNG thu phí giao dịch trên ứng viên. Nhận tiền mặt là việc của họ.
1.  Quán cứ đăng tin Miễn phí. Nhận ứng viên Miễn Phí. Ứng viên Check-out nhận tiền mặt tại chỗ ok.
2.  Sau khi ca đạt Trạng thái `COMPLETED` (Thành công - Có người đi làm), App âm thầm ghi nợ (Debt) vào Tài khoản của Chủ quán phí dịch vụ kết nối: **Phí = 5.000 VNĐ/Ca**.
3.  Tuy nhiên, tài khoản Chủ Quán bị ghi âm tiền. Nếu Ví Cửa Hàng bị âm quá 50.000 VNĐ (Tức nợ 10 ca), App tự khóa nút "Đăng việc mới", ép họ nạp 100k vào để trả nợ.
*Lợi ích vĩ đại:* App của bạn phủ sóng mọi ngõ ngách vì dùng thử chả mất đồng góc nào. Đợi họ Ghiền app, quen mặt sinh viên rồi, mới đòi nợ phí 5k lẻ tẻ này họ sẽ đóng cái roẹt không tiếc.

---

## QUESTION 4: Check-in bằng GPS với những Job Remote (Đánh máy, Telesale ở nhà)
**Tình huống:** App cốt lõi là GPS, nhưng chủ quán có job "Gọi điện Telesale từ xa chốt đơn".

**Đánh giá Chiến Lược Mở Rộng (Scope Expansion Risk):**
Dưới góc nhìn Cố vấn chiến lược, tham lam trộn lẫn "Job Local (Lao động vị trí)" với "Job Remote (Làm ở nhà)" vào giai đoạn đầu (MVP) là **SỰ CHẾT CHÓC VỀ ĐỊNH VỊ THƯƠNG HIỆU**.
Thế mạnh tuyệt đối, "Vũ khí hạt nhân" của hệ thống này là CÔNG NGHỆ BẮT ĐIỂM DANH THEO BÁN KÍNH 100m. 
*   Nếu bạn mở ra cho Job Remote, bạn sẽ trực tiếp đối đầu với các diễn đàn Freelancer khổng lồ.
*   Ứng viên sẽ rối trí: "Ủa, rốt cuộc App này là đi làm quanh nhà hay là kiếm việc online?". Hệ thống Check-in sẽ bị vô hiệu hóa, mọi logic của bạn đổ sông đổ biển.

**Lời Khuyên (Recommendation):** 
1.  **Chữ "SAY NO" của Steve Jobs:** Giai đoạn Version 1 -> **CẤM KHÔNG HỖ TRỢ JOB REMOTE**. Mọi công việc đăng lên ép buộc phải tới Tọa độ Cửa hàng. 
2.  Nếu Chủ quán vẫn điền Job là Remote (bắt tới quán điểm danh xong cầm laptop về nhà làm) -> Đó là việc của họ thỏa thuận ngầm. App chỉ đóng vai trò rào lại chuẩn 1 tính năng móng gốc là Local Location (Định vị).
3.  Mở rộng (Sau 1 năm có chỗ đứng): Lúc đó mới tạo môt tab riêng gọi là "Việc Từ Xa" (Bỏ hoàn toàn logic bấm nút check-in GPS). 

---
*Biên soạn bởi AI Strategy Advisor - Phân rã ngoại lệ cho GPS JobNow.*
