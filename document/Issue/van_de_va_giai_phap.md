# Các vấn đề cần giải quyết và Giải pháp đề xuất

Tài liệu này phân tích các rủi ro, vấn đề tiềm ẩn trong quá trình vận hành hệ thống tuyển dụng thời vụ và đề xuất các phương án giải quyết (về mặt kỹ thuật hoặc quy trình).

## 1. Vấn đề quá tải duyệt bài (Admin Overload)
**Vấn đề:** Khi số lượng bài đăng tăng đột biến, Admin không thể duyệt thủ công từng bài kịp thời, dẫn đến trải nghiệm người dùng kém (đăng bài mãi không thấy hiển thị).

**Giải pháp đề xuất:**
*   **Hệ thống lọc từ khóa tự động (Automated Keyword Filter):** Xây dựng danh sách "từ khóa đen" (lừa đảo, cờ bạc, 18+, v.v.). Bài viết chứa từ khóa này sẽ bị từ chối tự động hoặc dán nhãn "Cần xem xét kỹ".
*   **Cơ chế "Nhà tuyển dụng tin cậy" (Trusted Employer):**
    *   Các tài khoản đã xác thực thông tin doanh nghiệp/CCCD và có lịch sử hoạt động tốt (không bị báo xấu) sẽ được **đăng bài ngay lập tức** mà không cần duyệt trước (Post-moderation).
    *   Tài khoản mới hoặc điểm tín nhiệm thấp sẽ phải qua bước duyệt (Pre-moderation).
*   **Cộng đồng báo cáo (Community Reporting):** Cho phép người dùng báo cáo vi phạm. Nếu một bài viết bị nhiều người báo cáo, hệ thống tự động ẩn bài và gửi cảnh báo cho Admin xử lý sau.

## 2. Tranh chấp giữa Người tuyển dụng và Ứng viên (Dispute Resolution)
**Vấn đề:** Mâu thuẫn về tiền lương, khối lượng công việc hoàn thành, hoặc thái độ làm việc (VD: Chủ nói chưa làm xong, Nhân viên nói xong rồi đòi tiền).

**Giải pháp đề xuất:**
*   **Hệ thống cung cấp bằng chứng (Evidence-based):**
    *   Ứng dụng cần có tính năng **GPS Check-in / Check-out** bắt buộc tại địa điểm làm việc để chứng minh nhân viên đã đến làm và làm đủ giờ.
    *   Khuyên khích trao đổi qua chat trên ứng dụng để lưu lại bằng chứng thỏa thuận.
*   **Vai trò của hệ thống:**
    *   **Không can thiệp pháp lý trực tiếp:** Hệ thống đóng vai trò trung gian cung cấp dữ liệu minh bạch (log giờ làm, vị trí, lịch sử chat) để hai bên tự thương lượng.
    *   **Cơ chế Đánh giá & Report:** Nếu không giải quyết được, bên bị hại có thể Report và để lại đánh giá 1 sao. Tài khoản bị Report nhiều lần về vấn đề tiền nong/thái độ sẽ bị khóa vĩnh viễn (Ban policy).
*   **Giữ tiền (Escrow - Nâng cao):** Với các công việc giá trị cao, có thể yêu cầu Nhà tuyển dụng nạp tiền vào hệ thống trước. Khi công việc hoàn thành (Candidate xác nhận + Employer xác nhận), tiền mới được chuyển đi. (Tính năng này phức tạp, có thể phát triển ở giai đoạn sau).

## 3. Vấn đề "Bùng kèo" (No-show / Ghosting)
**Vấn đề:** Ứng viên nhận việc nhưng đến giờ không đến, hoặc Nhà tuyển dụng hủy việc phút chót khiến người kia lỡ dở kế hoạch. Đây là vấn đề nhức nhối nhất của việc làm thời vụ.

**Giải pháp đề xuất:**
*   **Điểm uy tín (Reputation Score):** Mỗi lần "bùng kèo" (hủy sau khi đã chốt mà không có lý do chính đáng hoặc không đến check-in), hệ thống trừ điểm uy tín rất nặng.
*   **Giới hạn quyền lợi:** Nếu điểm uy tín quá thấp -> Không được phép ứng tuyển việc mới trong X ngày hoặc bị khóa tài khoản.
*   **Thông báo nhắc nhở:** Gửi Notification nhắc lịch làm việc trước 24h và 2h.

## 4. Lừa đảo và Đa cấp (Scam / MLM)
**Vấn đề:** Các đối tượng lợi dụng hệ thống để đăng tin tuyển dụng việc nhẹ lương cao, dụ dỗ đóng tiền cọc, tham gia đa cấp.

**Giải pháp đề xuất:**
*   **Cảnh báo người dùng:** Hiển thị cảnh báo đỏ ngay trong khung chat hoặc trang chi tiết việc làm: "Tuyệt đối KHÔNG đóng bất kỳ khoản phí nào trước khi nhận việc".
*   **Xác thực danh tính (eKYC):** Yêu cầu Nhà tuyển dụng chụp ảnh CCCD/GPKD để tăng độ tin cậy. Hiển thị tích xanh cho các tài khoản đã xác thực.

## 5. An toàn và Riêng tư (Safety & Privacy)
**Vấn đề:** Công khai vị trí chính xác của Người tìm việc có thể gây nguy hiểm (bị theo dõi), đặc biệt là nữ giới.

**Giải pháp đề xuất:**
*   **Vị trí tương đối:** Trên bản đồ của Nhà tuyển dụng, chỉ hiển thị vị trí "xấp xỉ" (bán kính ngẫu nhiên 500m) của ứng viên, không hiển thị địa chỉ nhà cụ thể.
*   **Chế độ ẩn danh:** Cho phép Người tìm việc tắt định vị khi không muốn tìm việc, hoặc chỉ chia sẻ vị trí khi đã chấp nhận ứng tuyển.
*   **Nút khẩn cấp (SOS):** (Tính năng nâng cao) Tích hợp nút gọi nhanh cho cảnh sát hoặc người thân trong app nếu có sự cố khi đi làm (như Grab/Uber).

## 6. Xử lý việc làm Online / Từ xa (Không yêu cầu đến nơi làm)
**Vấn đề:** Có những công việc như cộng tác viên viết bài, nhập liệu, thiết kế... làm tại nhà, không yêu cầu đến địa điểm của nhà tuyển dụng. Quy trình Check-in GPS sẽ không áp dụng được.

**Giải pháp đề xuất:**
*   **Phân loại tin đăng:** Thêm tùy chọn **"Việc làm từ xa / Online"** khi Employer đăng tin.
*   **Hiển thị:**
    *   Công việc này sẽ không bị giới hạn bởi bán kính tìm kiếm của ứng viên.
    *   Có thể hiển thị trong một tab riêng hoặc có biểu tượng đặc biệt trên danh sách.
*   **Quy trình xác nhận:**
    *   **Tắt yêu cầu GPS Check-in:** Hệ thống sẽ không yêu cầu nhân viên phải có mặt tại vị trí của Employer.
    *   **Xác nhận theo đầu việc (Task-based):** Thay vì check-in giờ, Employer sẽ có nút "Xác nhận đã nhận sản phẩm/kết quả" để hoàn tất công việc.

## 7. Xác thực Nhà tuyển dụng Cá nhân (Hộ gia đình)
**Vấn đề:** Các hộ gia đình/cá nhân cần tuyển người giúp việc, dọn nhà... không có Giấy phép kinh doanh để xác minh độ uy tín. Làm sao để ứng viên yên tâm không bị quỵt tiền hoặc gặp nguy hiểm?

**Giải pháp đề xuất:**
*   **Định danh điện tử (eKYC) cá nhân:** Bắt buộc Nhà tuyển dụng cá nhân phải xác thực CMND/CCCD gắn chip (Chụp 2 mặt + Quét khuôn mặt). Tài khoản sẽ có huy hiệu "Đã xác thực danh tính".
*   **Liên kết mạng xã hội/SĐT chính chủ:** Bắt buộc xác thực SĐT qua OTP và khuyến khích liên kết Facebook/Zalo (tăng điểm tin cậy ảo).
*   **Cơ chế Ký quỹ (Escrow) - Quan trọng:**
    *   Đối với Nhà tuyển dụng cá nhân mới (chưa có nhiều đánh giá), hệ thống nên yêu cầu hoặc khuyến khích **Nạp tiền công vào hệ thống trước**.
    *   Khi công việc hoàn thành, hệ thống mới giải ngân cho người làm -> Đảm bảo 100% người làm nhận được tiền.
*   **Xác thực địa chỉ:** Nếu địa chỉ nhà bị nhiều ứng viên báo cáo (Report) là địa chỉ ảo hoặc không an toàn, hệ thống sẽ đưa vào danh sách đen (Blacklist Address) và chặn không cho đăng tin tại tọa độ đó nữa.

## 8. Giải pháp Tự động hóa quy trình eKYC (Tránh quá tải cho Admin)
**Vấn đề:** Nếu có hàng nghìn người đăng ký mỗi ngày, Admin không thể ngồi soi từng cái CCCD và mặt người dùng để duyệt được. Rất mất thời gian và dễ sai sót.

**Giải pháp đề xuất:**
*   **Sử dụng dịch vụ 3rd Party (Khuyên dùng):** Tích hợp các API eKYC có sẵn của các nhà cung cấp uy tín (FPT AI, Viettel AI, VNPT eKYC, Amazon Rekognition...).
    *   **Cơ chế:** Người dùng chụp ảnh -> Gửi lên API -> AI tự động phân tích và trả về kết quả (Khớp/Không khớp, Giấy tờ thật/giả).
    *   **Tự động duyệt:** Nếu AI chấm điểm tin cậy > 90% -> Hệ thống tự động duyệt ngay lập tức (Real-time).
*   **Admin chỉ can thiệp khi:** AI trả về kết quả "Nghi ngờ" hoặc điểm tin cậy thấp. Lúc này Admin mới cần xem thủ công (Manual Review).
*   **Lợi ích:** Giảm được 90-95% khối lượng công việc cho Admin, người dùng được duyệt ngay lập tức không phải chờ đợi.

## 9. Ngăn chặn Kẻ xấu lập nhiều nick ảo để Báo cáo (Spam Reporting)
**Vấn đề:** Đối thủ cạnh tranh hoặc kẻ xấu có thể lập hàng chục tài khoản ảo (clone) để báo cáo oan cho một Nhà tuyển dụng uy tín nhằm dìm hàng họ.

**Giải pháp đề xuất:**
*   **Yêu cầu Giao dịch (Proof of Interaction):**
    *   **Nguyên tắc:** Người dùng chỉ ĐƯỢC PHÉP báo cáo Nhà tuyển dụng khi 2 bên đã **có tương tác thực tế** trên hệ thống (VD: Đã chat với nhau, đã nộp đơn ứng tuyển, hoặc đã được nhận việc).
    *   -> Người lạ đi ngang qua không thể bấm báo cáo bừa bãi.
*   **Trọng số Báo cáo (Weighted Reporting):**
    *   Báo cáo từ tài khoản **đã xác thực eKYC** và có điểm uy tín cao -> Hệ thống xử lý ưu tiên.
    *   Báo cáo từ tài khoản mới tạo (chưa xác thực) -> Hệ thống xếp vào hàng chờ thấp (Low priority) hoặc bỏ qua nếu thấy có dấu hiệu Spam.
*   **Dấu vân tay thiết bị (Device Fingerprint):**
    *   Hệ thống phát hiện nếu nhiều tài khoản cùng đăng nhập trên **1 thiết bị** hoặc **1 địa chỉ IP** để báo cáo cùng 1 người -> Tự động chặn và khóa tất cả các nick ảo đó.

## 10. Xử lý các trường hợp "Quên thao tác" (Human Error)
**Vấn đề:** Người dùng quên Check-in/Check-out hoặc Chủ quên bấm xác nhận hoàn thành, khiến quy trình bị treo.

**Giải pháp đề xuất:**
*   **Quên Check-in/Check-out:**
    *   **Nhắc nhở thông minh:** App tự động gửi Notification: "Chúng tôi thấy bạn đang ở gần địa điểm làm việc, đừng quên Check-in nhé!" (Dựa trên Geofencing).
    *   **Bổ sung bằng chứng:** Nếu lỡ quên, Candidate có thể gửi yêu cầu "Bổ sung công". Yêu cầu này phải được Employer **Duyệt thủ công**.
*   **Quên Xác nhận Hoàn thành (Auto-complete):**
    *   Sau khi công việc kết thúc **24 giờ**, nếu Employer không có hành động gì (không khiếu nại, không xác nhận), hệ thống sẽ:
        1.  Gửi thông báo nhắc nhở 2 lần.
        2.  **Tự động xác nhận hoàn thành (Auto-complete):** Coi như công việc đã xong, chuyển tiền/cần điểm cho Candidate.
    *   Điều này giúp bảo vệ quyền lợi người làm thuê, tránh bị "treo" tiền mãi.

## 11. Vấn đề Tìm kiếm theo Kỹ năng (Free-text Skill Filter)
**Vấn đề:** Do hệ thống cho phép người dùng nhập tự do (Free-text) kỹ năng (VD: "Múa lửa", "Bắt chuột"...), nên dữ liệu sẽ không đồng nhất. Nhà tuyển dụng sẽ khó khăn khi muốn lọc những người có kỹ năng này nếu không biết chính xác từ khóa.

**Giải pháp đề xuất:**
*   **Tìm kiếm gợi ý (Suggestive Search):**
    *   Khi Nhà tuyển dụng gõ vào ô Filter, hệ thống sẽ **quét (scan) toàn bộ các kỹ năng đang có** trong Database để gợi ý.
    *   *Ví dụ:* Employer gõ chữ "múa", hệ thống hiện ra Dropdown: "Múa lửa (10 người)", "Múa bụng (5 người)"... -> Employer chọn từ danh sách đó.
*   **Công nghệ Full-text Search (Elasticsearch):**
    *   Sử dụng các công cụ tìm kiếm mạnh mẽ để xử lý việc "tìm gần đúng".
    *   *Ví dụ:* Employer gõ "tieng anh", hệ thống vẫn tìm ra người ghi "Tiếng Anh", "English", "Anh văn" (nhờ cơ chế đồng nghĩa - Synonym).
*   **Đám mây từ khóa (Tag Cloud / Top Skills):**
    *   **Hiển thị mặc định:** Khi chưa nhập gì, hệ thống sẽ hiện danh sách "Các kỹ năng phổ biến nhất" (VD: Top 10 skill nhiều người có nhất) hoặc gom theo nhóm ngành (F&B, Sự kiện...).
    *   **Gợi ý thông minh:** *"Bạn đang tìm nhân viên Phục vụ? Thường họ sẽ có các kỹ năng: Bưng bê, Order món, Tiếng Anh giao tiếp..."*.
*   **Chuẩn hóa định kỳ (Normalization Job):**
    *   Định kỳ (hàng tuần/tháng), hệ thống chạy một tiến trình (Batch Job) để gom nhóm các kỹ năng giống nhau.
    *   *Ví dụ:* Gom "English", "Tiếng Anh", "AV" -> chung 1 nhóm "Ngoại ngữ: Tiếng Anh".
