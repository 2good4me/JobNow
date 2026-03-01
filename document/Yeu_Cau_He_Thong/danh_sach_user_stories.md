# Danh sách User Stories (Câu chuyện người dùng) - PHIÊN BẢN ĐẦY ĐỦ

Tài liệu này liệt kê **toàn bộ** các User Stories của hệ thống "Tìm việc làm thời vụ theo GPS (JobNow)", được đối chiếu từ 6 nguồn tài liệu: Use Case, ERD, Kịch bản toàn cảnh, Yêu cầu chức năng, UX/UI Analysis, và Business Logic.

Cấu trúc chuẩn: **"Là một [Vai trò], tôi muốn [Hành động], để [Lợi ích/Mục đích]."**

Ưu tiên theo MoSCoW: **MUST** (Bắt buộc có) | **SHOULD** (Nên có) | **COULD** (Có thì tốt) | **WON'T** (Không làm lần này)

---

## 1. EPIC: Xác thực & Đăng nhập (Authentication)
**Business Value:** Cho phép người dùng truy cập hệ thống an toàn và phân quyền đúng vai trò.

| ID | User Story | Ưu tiên |
| :--- | :--- | :---: |
| US-A01 | Là một **Khách**, tôi muốn **đăng ký tài khoản bằng số điện thoại** để bắt đầu sử dụng các tính năng ứng tuyển/đăng tin. | MUST |
| US-A02 | Là một **Khách**, tôi muốn **xác thực số điện thoại bằng mã OTP** để chứng minh tôi là người thật và bảo mật tài khoản. | MUST |
| US-A03 | Là một **Khách**, tôi muốn **chọn vai trò (Tìm việc / Tuyển dụng)** ngay sau khi đăng ký để hệ thống hiển thị giao diện phù hợp. | MUST |
| US-A04 | Là một **Người dùng**, tôi muốn **đăng nhập bằng SĐT và mật khẩu** để truy cập tài khoản đã có. | MUST |
| US-A05 | Là một **Người dùng**, tôi muốn **đăng nhập bằng Google** để tiết kiệm thời gian nhập liệu. | SHOULD |
| US-A06 | Là một **Người dùng**, tôi muốn **đăng nhập bằng Facebook** để đăng nhập nhanh bằng mạng xã hội. | SHOULD |
| US-A07 | Là một **Người dùng**, tôi muốn **đăng nhập bằng Zalo** để sử dụng ứng dụng quen thuộc nhất của người Việt. | SHOULD |
| US-A08 | Là một **Người dùng**, tôi muốn **khôi phục mật khẩu** khi quên để lấy lại quyền truy cập tài khoản. | MUST |
| US-A09 | Là một **Người dùng**, tôi muốn **đăng xuất** để bảo vệ tài khoản khi cho người khác mượn điện thoại. | MUST |

---

## 2. EPIC: Khám phá & Trải nghiệm Khách vãng lai (Guest Experience)
**Business Value:** Thu hút người dùng mới bằng cách cho xem trước giá trị của App trước khi bắt buộc đăng ký.

| ID | User Story | Ưu tiên |
| :--- | :--- | :---: |
| US-GU01 | Là một **Khách**, tôi muốn **xem danh sách việc làm trên bản đồ GPS** để biết khu vực quanh mình có nhiều việc hay không. | MUST |
| US-GU02 | Là một **Khách**, tôi muốn **xem chi tiết mô tả công việc (Lương, Ca làm, Yêu cầu)** để cân nhắc có phù hợp không. | MUST |
| US-GU03 | Là một **Khách**, tôi muốn **thông tin nhạy cảm (SĐT chủ quán) bị ẩn** để hệ thống khuyến khích tôi đăng ký lấy đầy đủ. | MUST |
| US-GU04 | Là một **Khách**, khi tôi bấm **Ứng tuyển/Lưu/Theo dõi**, hệ thống phải **hiện popup yêu cầu đăng nhập** thay vì báo lỗi khó hiểu. | MUST |
| US-GU05 | Là một **Khách**, khi tôi **từ chối quyền GPS**, App cần **hiển thị bản đồ ở vị trí mặc định** kèm lời nhắc bật định vị. | SHOULD |

---

## 3. EPIC: Hồ sơ & Xác thực danh tính (Profile & eKYC)
**Business Value:** Xây dựng hệ sinh thái tin cậy, loại bỏ lừa đảo, tăng tỷ lệ match thành công.

| ID | User Story | Ưu tiên |
| :--- | :--- | :---: |
| US-P01 | Là một **Candidate**, tôi muốn **cập nhật thông tin cá nhân (Tên, Tuổi, Giới tính, Bio, Địa chỉ)** để nhà tuyển dụng hiểu rõ về tôi. | MUST |
| US-P02 | Là một **Candidate**, tôi muốn **thêm kỹ năng (Skills)** dạng tag cloud để tăng khả năng được tìm thấy và match. | MUST |
| US-P03 | Là một **Candidate**, tôi muốn **tải lên ảnh chân dung (Avatar)** để hồ sơ trông chuyên nghiệp hơn. | SHOULD |
| US-P04 | Là một **Candidate**, tôi muốn **xác thực căn cước công dân (eKYC)** bằng cách chụp CCCD mặt trước/sau để nhận badge "Đã xác thực" và tăng cơ hội được tuyển. | MUST |
| US-P05 | Là một **Employer**, tôi muốn **cập nhật hồ sơ doanh nghiệp (Tên cửa hàng, Ảnh mặt tiền, Bio, Địa chỉ)** để ứng viên tin tưởng. | MUST |
| US-P06 | Là một **Employer**, tôi muốn **xác thực kinh doanh (eKYC Tier 2)** bằng GPKD hoặc giấy thuê nhà để được badge "Tích xanh" và mở khóa đăng tin không giới hạn. | MUST |
| US-P07 | Là một **Người dùng**, tôi muốn hệ thống **AI/OCR tự động trích xuất thông tin từ ảnh CCCD/GPKD** để tôi không phải nhập thủ công. | SHOULD |
| US-P08 | Là một **Người dùng**, khi ảnh eKYC **quá mờ/bị chói**, hệ thống phải **báo lỗi ngay** yêu cầu chụp lại, thay vì đợi Admin từ chối sau 24h. | SHOULD |

---

## 4. EPIC: Tìm kiếm & Khám phá Việc làm (Job Discovery)
**Business Value:** Giúp ứng viên tìm được việc gần nhà, đúng nhu cầu trong thời gian ngắn nhất.

| ID | User Story | Ưu tiên |
| :--- | :--- | :---: |
| US-D01 | Là một **Candidate**, tôi muốn **xem việc làm trên bản đồ GPS** với các ghim (pin) màu khác nhau để phân biệt loại việc và mức ưu tiên. | MUST |
| US-D02 | Là một **Candidate**, tôi muốn **lọc việc làm theo khoảng cách (bán kính 1-10km)** để tìm việc gần nhà. | MUST |
| US-D03 | Là một **Candidate**, tôi muốn **lọc việc theo mức lương tối thiểu** để tìm việc đúng kỳ vọng thu nhập. | MUST |
| US-D04 | Là một **Candidate**, tôi muốn **lọc theo danh mục (F&B, Giao hàng, Sự kiện, Giúp việc)** để tìm đúng ngành phù hợp. | MUST |
| US-D05 | Là một **Candidate**, tôi muốn **lọc theo ca làm (Sáng/Chiều/Tối)** để chọn khung giờ tôi rảnh. | SHOULD |
| US-D06 | Là một **Candidate**, tôi muốn **lọc chỉ xem Employer đã xác thực** để tránh bị lừa đảo. | SHOULD |
| US-D07 | Là một **Candidate**, tôi muốn **sắp xếp kết quả theo: Gần nhất / Lương cao / Mới nhất / Đánh giá cao** để tìm việc theo tiêu chí riêng. | SHOULD |
| US-D08 | Là một **Candidate**, tôi muốn **tìm kiếm bằng từ khóa** (VD: "phục vụ bàn", "tiệc cưới") để tìm đúng công việc mong muốn. | MUST |
| US-D09 | Là một **Candidate**, tôi muốn **chuyển đổi giữa chế độ Bản đồ và Danh sách** để xem theo cách thuận tiện nhất. | SHOULD |
| US-D10 | Là một **Candidate**, tôi muốn thấy **ghim lương nổi trên bản đồ** (VD: "35k/h") để quyết định nhanh mà không cần mở chi tiết. | COULD |

---

## 5. EPIC: Chi tiết Việc làm & Ứng tuyển (Job Detail & Application)
**Business Value:** Quy trình ứng tuyển nhanh "1 chạm", giảm ma sát, tăng tỷ lệ chuyển đổi.

| ID | User Story | Ưu tiên |
| :--- | :--- | :---: |
| US-AP01 | Là một **Candidate**, tôi muốn **xem chi tiết việc làm** bao gồm: Ảnh quán, Tên, Lương, Mô tả, Kỹ năng yêu cầu, Vị trí, Khoảng cách GPS, và Điểm Uy Tín của Employer. | MUST |
| US-AP02 | Là một **Candidate**, tôi muốn **xem danh sách các Ca làm việc (Shifts)** dưới dạng thẻ vé để biết ca nào còn slot, ca nào đã đầy. | MUST |
| US-AP03 | Là một **Candidate**, tôi muốn **chọn cụ thể Ca muốn ứng tuyển** (VD: Ca Sáng 08:00-12:00) thay vì nộp chung chung vào cả Job. | MUST |
| US-AP04 | Là một **Candidate**, tôi muốn **viết lời nhắn (Cover Letter)** khi ứng tuyển để thuyết phục chủ quán. | SHOULD |
| US-AP05 | Là một **Candidate**, khi tôi ứng tuyển, hệ thống phải **tự động kiểm tra trùng lịch** và cảnh báo nếu tôi đã nhận ca làm trùng giờ ở nơi khác. | MUST |
| US-AP06 | Là một **Candidate**, khi ca đã **FULL slot trong lúc tôi đang xem**, hệ thống phải **báo lỗi realtime** "Ca vừa đủ người" thay vì để tôi nộp đơn rồi mới biết. | MUST |
| US-AP07 | Là một **Candidate**, tôi muốn **nhận thông báo** khi đơn ứng tuyển được Duyệt hoặc Từ chối. | MUST |
| US-AP08 | Là một **Candidate**, tôi muốn **lưu việc làm yêu thích (Bookmark)** để xem lại sau khi chưa quyết định ứng tuyển ngay. | SHOULD |
| US-AP09 | Là một **Candidate**, tôi muốn **theo dõi (Follow) một Employer** để nhận thông báo mỗi khi họ đăng việc mới. | SHOULD |

---

## 6. EPIC: Đăng tin & Quản lý Ca (Job Posting & Shift Management)
**Business Value:** Cho phép Employer đăng tin nhanh, chia ca tự động, giải quyết bài toán "ai làm khung giờ nào".

| ID | User Story | Ưu tiên |
| :--- | :--- | :---: |
| US-JP01 | Là một **Employer**, tôi muốn **đăng tin tuyển dụng** với thông tin: Tiêu đề, Mô tả, Yêu cầu, Lương, Danh mục. | MUST |
| US-JP02 | Là một **Employer**, tôi muốn **chọn vị trí làm việc trên bản đồ (GPS)** để ứng viên xung quanh tìm thấy tôi. | MUST |
| US-JP03 | Là một **Employer**, tôi muốn **tạo nhiều Ca làm việc (Shifts)** cho mỗi tin đăng (VD: Ca Sáng 07-12h cần 2 người, Ca Tối 18-22h cần 1 người). | MUST |
| US-JP04 | Là một **Employer**, tôi muốn **đặt chế độ lặp ca** (VD: Lặp lại T2-T6 hàng tuần) để không phải đăng lại mỗi ngày. | SHOULD |
| US-JP05 | Là một **Employer**, tôi muốn hệ thống **chặn nếu giờ bắt đầu > giờ kết thúc** khi thiết lập ca để tránh lỗi nghiệp vụ. | MUST |
| US-JP06 | Là một **Employer (Tier 1 - Chưa KYC)**, tôi hiểu rằng tôi chỉ được **đăng tối đa 1 ca Active** tại mỗi thời điểm. Hệ thống phải thông báo rõ ràng giới hạn này và gợi ý nâng cấp. | MUST |
| US-JP07 | Là một **Employer**, tôi muốn **tải lên ảnh mặt tiền cửa hàng** làm ảnh bìa cho tin đăng để tăng độ chuyên nghiệp. | MUST |
| US-JP08 | Là một **Employer**, tôi muốn **chỉnh sửa thông tin tin đăng** sau khi đã đăng. | SHOULD |
| US-JP09 | Là một **Employer**, tôi muốn **đóng/ẩn tin tuyển dụng** khi đã tìm đủ người. | MUST |
| US-JP10 | Là một **Employer**, khi đóng tin mà **đã có ứng viên được duyệt**, hệ thống phải **cảnh báo** tác động uy tín và gợi ý gửi thông báo xin lỗi đến họ. | SHOULD |

---

## 7. EPIC: Quản lý Ứng viên (Applicant Management)
**Business Value:** Dashboard cho Employer duyệt đơn nhanh, giảm thời gian tuyển dụng từ hàng giờ xuống còn phút.

| ID | User Story | Ưu tiên |
| :--- | :--- | :---: |
| US-AM01 | Là một **Employer**, tôi muốn **nhận thông báo ngay** khi có ứng viên mới nộp đơn vào ca làm của tôi. | MUST |
| US-AM02 | Là một **Employer**, tôi muốn **xem danh sách ứng viên** cho từng ca, bao gồm: Ảnh, Tên, Điểm Uy Tín, trạng thái eKYC, Kỹ năng. | MUST |
| US-AM03 | Là một **Employer**, tôi muốn **xem hồ sơ chi tiết (Profile)** của ứng viên để đánh giá trước khi duyệt. | MUST |
| US-AM04 | Là một **Employer**, tôi muốn **Duyệt (Approve)** đơn ứng tuyển để chính thức nhận người đi làm. | MUST |
| US-AM05 | Là một **Employer**, tôi muốn **Từ chối (Reject)** đơn ứng tuyển không phù hợp. | MUST |
| US-AM06 | Là một **Employer**, khi ca đã **đủ người**, hệ thống phải **tự động từ chối tất cả đơn còn lại** và gửi thông báo "chia buồn" cho họ. | MUST |
| US-AM07 | Là một **Employer**, tôi muốn **xem số điện thoại của ứng viên đã được duyệt** để liên hệ trực tiếp khi cần. | MUST |
| US-AM08 | Là một **Employer**, tôi muốn **tạo mã QR check-in** cho ca làm để ứng viên quét khi GPS không hoạt động. | SHOULD |

---

## 8. EPIC: Chấm công GPS & Đi làm (Attendance & Check-in)
**Business Value:** Xử lý bài toán "bùng kèo" bằng công nghệ GPS, tăng trách nhiệm và độ tin cậy.

| ID | User Story | Ưu tiên |
| :--- | :--- | :---: |
| US-CI01 | Là một **Candidate**, tôi muốn **xem danh sách ca làm sắp tới** để biết hôm nay làm ở đâu, mấy giờ. | MUST |
| US-CI02 | Là một **Candidate**, tôi muốn **nhận Push Notification nhắc nhở** 30 phút trước giờ làm để không quên. | MUST |
| US-CI03 | Là một **Candidate**, tôi muốn **Check-in bằng GPS** khi đến quán (khoảng cách < 100m) để xác nhận tôi có mặt. | MUST |
| US-CI04 | Là một **Candidate**, khi **GPS không khớp (> 100m)**, tôi muốn **quét mã QR từ máy chủ quán** để check-in thay thế (Fallback). | MUST |
| US-CI05 | Là một **Candidate**, tôi muốn **Check-out** khi hết ca để hệ thống ghi nhận thời gian làm việc thực tế. | MUST |
| US-CI06 | Là một **Candidate**, tôi muốn **xem thời gian đã làm (Timer)** và **thu nhập dự kiến** trong khi đang làm việc. | SHOULD |
| US-CI07 | Là một **Employer**, tôi muốn **nhận thông báo khi ứng viên check-in** để biết họ đã có mặt. | MUST |
| US-CI08 | Là một **Employer**, tôi muốn **nhận cảnh báo đỏ (RED FLAG)** khi ứng viên check-in từ vị trí cách quán > 100m (nghi gian lận). | MUST |
| US-CI09 | Là một **Employer**, tôi muốn **xem lịch sử chấm công** (giờ đến, giờ về, vị trí) của nhân viên. | MUST |
| US-CI10 | Là một **Employer**, tôi muốn **xác nhận hoàn thành & chốt lương** cho nhân viên khi kết thúc ca. | MUST |

---

## 9. EPIC: Hủy ca & Hệ thống Uy Tín (Cancellation & Trust Score)
**Business Value:** Cơ chế trừng phạt tự động bảo vệ cả 2 bên khỏi hành vi "bùng kèo".

| ID | User Story | Ưu tiên |
| :--- | :--- | :---: |
| US-TS01 | Là một **Candidate**, tôi muốn **hủy ca đã đăng ký** trước giờ làm nếu có việc đột xuất. | MUST |
| US-TS02 | Là một **Candidate**, tôi hiểu rằng **hủy ca sát giờ** (VD: dưới 2 tiếng) sẽ bị **trừ 30 điểm Uy Tín**. Hệ thống phải cảnh báo rõ trước khi tôi xác nhận hủy. | MUST |
| US-TS03 | Là một **Candidate**, nếu tôi **không check-in quá 30 phút** (No-show/Ghosting), hệ thống phải tự động đánh dấu GHOSTED và **trừ 50 điểm Uy Tín**. | MUST |
| US-TS04 | Là một **Candidate**, nếu **Điểm Uy Tín < 20**, tài khoản tôi sẽ bị **tự động khóa (Block)** và không thể sử dụng App. | MUST |
| US-TS05 | Là một **Employer**, nếu tôi **hủy ca vô cớ** sau khi đã duyệt ứng viên, tôi sẽ bị **trừ 30 điểm Uy Tín**. | MUST |
| US-TS06 | Là một **Employer**, nếu tôi **tái phạm hủy ca 5 lần** (Điểm < 50), tài khoản sẽ bị **Shadow Ban** — nhìn bình thường nhưng ứng viên không thấy tin tôi. | MUST |
| US-TS07 | Là một **Employer**, tôi muốn **nạp tiền đóng phạt (Trust Deposit)** để cứu lại điểm Uy Tín nếu bị trừ oan. | COULD |
| US-TS08 | Là một **Người dùng**, tôi muốn **xem Điểm Uy Tín** của bản thân và của đối phương trên profile để đánh giá độ tin cậy. | MUST |

---

## 10. EPIC: Đánh giá & Báo cáo (Review & Report)
**Business Value:** Tạo cơ chế feedback 2 chiều, xây dựng cộng đồng tự điều chỉnh.

| ID | User Story | Ưu tiên |
| :--- | :--- | :---: |
| US-RV01 | Là một **Candidate**, tôi muốn **đánh giá (Rate 1-5 sao) Employer** sau khi xong việc để chia sẻ trải nghiệm. | MUST |
| US-RV02 | Là một **Candidate**, tôi muốn **gắn tag đánh giá** (VD: "Trả lương đúng hẹn", "Thân thiện", "Quán đẹp") để review nhanh và trực quan. | SHOULD |
| US-RV03 | Là một **Employer**, tôi muốn **đánh giá (Rate 1-5 sao) Candidate** sau khi xong việc để ghi nhận chất lượng. | MUST |
| US-RV04 | Là một **Employer**, tôi muốn **gắn tag đánh giá** (VD: "Đúng giờ", "Chăm chỉ", "Nhanh nhẹn") cho ứng viên. | SHOULD |
| US-RV05 | Là một **Người dùng**, hệ thống phải **chỉ cho phép đánh giá khi cả 2 đã hoàn thành Job** đó để tránh đánh giá ảo. | MUST |
| US-RV06 | Là một **Candidate**, tôi muốn **Báo cáo (Report) Employer** nếu bị thu phí vô lý, lừa đảo, hoặc quấy rối. | MUST |
| US-RV07 | Là một **Employer**, tôi muốn **Báo cáo (Report) Candidate** nếu bị bùng kèo (No-show) hoặc hành vi xấu. | MUST |
| US-RV08 | Là một **Người dùng**, khi báo cáo tôi muốn **chọn lý do từ danh sách** và **tải lên ảnh bằng chứng** để Admin xét duyệt. | MUST |

---

## 11. EPIC: Chat & Thông báo (Messaging & Notifications)
**Business Value:** Kênh giao tiếp realtime giữa 2 bên, giảm phụ thuộc vào SĐT/Zalo bên ngoài.

| ID | User Story | Ưu tiên |
| :--- | :--- | :---: |
| US-CH01 | Là một **Candidate**, tôi muốn **chat trực tiếp với Employer** trên App để hỏi thêm thông tin công việc. | MUST |
| US-CH02 | Là một **Employer**, tôi muốn **chat với Candidate** để phỏng vấn hoặc hướng dẫn trước khi đi làm. | MUST |
| US-CH03 | Là một **Người dùng**, tôi muốn mỗi cuộc chat **gắn với một Job cụ thể** để dễ quản lý và tra cứu. | SHOULD |
| US-CH04 | Là một **Người dùng**, tôi muốn **nhận Push Notification** mỗi khi có tin nhắn mới, đơn được duyệt/từ chối, ca sắp đến giờ, hoặc quán Follow đăng việc mới. | MUST |
| US-CH05 | Là một **Người dùng**, tôi muốn **xem danh sách thông báo** được phân loại theo: Việc làm, Ứng tuyển, Hệ thống. | SHOULD |
| US-CH06 | Là một **Người dùng**, tôi muốn **đánh dấu đã đọc** tất cả thông báo cùng lúc. | COULD |

---

## 12. EPIC: Ví & Giao dịch (Wallet & Monetization)
**Business Value:** Luồng doanh thu chính của nền tảng, tạo giá trị gia tăng cho Employer trả phí.

| ID | User Story | Ưu tiên |
| :--- | :--- | :---: |
| US-WL01 | Là một **Employer**, tôi muốn **nạp tiền vào ví JobNow** qua VietQR/Momo/ZaloPay để sử dụng các dịch vụ nâng cao. | MUST |
| US-WL02 | Là một **Employer**, tôi muốn **mua Gói Còi Hụ (20k)** để Push thông báo đến 500 ứng viên xung quanh khi cần tuyển gấp. | SHOULD |
| US-WL03 | Là một **Employer**, tôi muốn **mua Ghim Đẩy Top (15k/ngày)** để tin tuyển dụng được ưu tiên hiển thị trên bản đồ. | SHOULD |
| US-WL04 | Là một **Employer**, tôi muốn **đăng ký Gói VIP tháng (299k)** để đăng tin không giới hạn, kèm badge "Pro-Hunter". | COULD |
| US-WL05 | Là một **Người dùng**, tôi muốn **xem lịch sử giao dịch** (Nạp tiền, Mua gói, Thu nhập, Phí nền tảng) để kiểm soát tài chính. | MUST |
| US-WL06 | Là một **Employer**, khi **số dư không đủ** để mua gói, hệ thống phải **báo rõ số tiền thiếu** và gợi ý nạp thêm. | MUST |

---

## 13. EPIC: Quản trị hệ thống (Admin Panel)
**Business Value:** Công cụ vận hành, kiểm duyệt nội dung, bảo vệ chất lượng hệ sinh thái.

| ID | User Story | Ưu tiên |
| :--- | :--- | :---: |
| US-AD01 | Là một **Admin**, tôi muốn **đăng nhập vào trang quản trị (Dashboard Web)** để vận hành hệ thống. | MUST |
| US-AD02 | Là một **Admin**, tôi muốn **xem Dashboard tổng quan** (Biểu đồ người dùng mới, tin đăng, lượt ứng tuyển, doanh thu) để nắm tình hình. | MUST |
| US-AD03 | Là một **Admin**, tôi muốn **xét duyệt hồ sơ eKYC** (CCCD/GPKD) và Duyệt/Từ chối với lý do cụ thể. | MUST |
| US-AD04 | Là một **Admin**, tôi muốn **xét duyệt bài đăng bị Red Flag** (do AI hoặc User report) để xóa nếu vi phạm. | MUST |
| US-AD05 | Là một **Admin**, tôi muốn **xử lý ticket tố cáo** bằng cách xem bằng chứng ảnh chụp và ra quyết định. | MUST |
| US-AD06 | Là một **Admin**, tôi muốn **Khóa (Ban)** tài khoản người dùng vi phạm. | MUST |
| US-AD07 | Là một **Admin**, tôi muốn **Mở khóa (Unban)** tài khoản sau khi người dùng khiếu nại thành công. | SHOULD |
| US-AD08 | Là một **Admin**, tôi muốn **quản lý Danh mục Việc làm** (Thêm/Sửa/Xóa ngành nghề) để chuẩn hóa dữ liệu. | SHOULD |
| US-AD09 | Là một **Admin**, tôi muốn **quản lý danh sách thiết bị bị cấm** (Banned Devices) để chống tài khoản ảo lách luật. | SHOULD |

---

## 14. EPIC: Hệ thống nền (System Background Jobs)
**Business Value:** Các tác vụ tự động chạy ngầm đảm bảo hệ thống sạch sẽ, dữ liệu chính xác.

| ID | User Story | Ưu tiên |
| :--- | :--- | :---: |
| US-SY01 | Là **Hệ thống**, tôi cần **tự động cập nhật Điểm Uy Tín** mỗi ngày dựa trên hành vi check-in/hủy ca/report. | MUST |
| US-SY02 | Là **Hệ thống**, tôi cần **tự động Block user** khi Điểm Uy Tín xuống dưới 20. | MUST |
| US-SY03 | Là **Hệ thống**, tôi cần **gửi Push Notification (FCM)** tự động khi có sự kiện: Apply, Approve, Review, Follow new job. | MUST |
| US-SY04 | Là **Hệ thống**, tôi cần chạy **ETL Job lúc 00:00** mỗi ngày để tổng hợp doanh thu, số ca hoàn thành vào bảng Thống kê. | SHOULD |
| US-SY05 | Là **Hệ thống**, tôi cần **tự động đóng ca "treo"** (vẫn status WORKING sau 48h do quên check-out) về COMPLETED. | SHOULD |
| US-SY06 | Là **Hệ thống**, tôi cần **đánh dấu GHOSTED** cho Candidate không check-in sau 30 phút kể từ giờ bắt đầu ca. | MUST |
| US-SY07 | Là **Hệ thống**, tôi cần **AI trích xuất đặc trưng ảnh eKYC** (OCR text, phát hiện ảnh giả) để hỗ trợ Admin duyệt nhanh. | SHOULD |

---

## 15. EPIC: Cài đặt & Tiện ích người dùng (Settings & Utilities)
**Business Value:** Trải nghiệm người dùng hoàn chỉnh, tuân thủ pháp luật bảo mật dữ liệu.

| ID | User Story | Ưu tiên |
| :--- | :--- | :---: |
| US-ST01 | Là một **Người dùng**, tôi muốn **bật/tắt thông báo** để kiểm soát mức độ bị làm phiền. | SHOULD |
| US-ST02 | Là một **Người dùng**, tôi muốn **chuyển đổi chế độ Sáng/Tối (Dark Mode)** theo sở thích. | COULD |
| US-ST03 | Là một **Người dùng**, tôi muốn **đổi mật khẩu** để bảo mật tài khoản. | MUST |
| US-ST04 | Là một **Người dùng**, tôi muốn **xóa tài khoản vĩnh viễn** khi không muốn dùng nữa (Tuân thủ quyền lãng quên - PDPA). | MUST |
| US-ST05 | Là một **Người dùng**, tôi muốn **xem Chính sách Bảo mật và Điều khoản** trước khi sử dụng dịch vụ. | MUST |
| US-ST06 | Là một **Candidate**, tôi muốn **xem lịch sử làm việc** (Timeline các ca đã hoàn thành, thu nhập, đánh giá nhận được). | SHOULD |

---

## TỔNG KẾT THỐNG KÊ

| Phân hệ | Epic | Số User Stories | MUST | SHOULD | COULD |
| :--- | :--- | :---: | :---: | :---: | :---: |
| Xác thực | Authentication | 9 | 5 | 4 | 0 |
| Khách vãng lai | Guest Experience | 5 | 4 | 1 | 0 |
| Hồ sơ & eKYC | Profile & eKYC | 8 | 4 | 4 | 0 |
| Tìm kiếm | Job Discovery | 10 | 4 | 5 | 1 |
| Ứng tuyển | Application | 9 | 6 | 3 | 0 |
| Đăng tin | Job Posting | 10 | 6 | 3 | 1 |
| Quản lý ứng viên | Applicant Mgmt | 8 | 7 | 1 | 0 |
| Chấm công | Attendance | 10 | 8 | 2 | 0 |
| Uy Tín & Hủy ca | Trust Score | 8 | 6 | 0 | 2 |
| Đánh giá & Báo cáo | Review & Report | 8 | 6 | 2 | 0 |
| Chat & Thông báo | Messaging | 6 | 3 | 2 | 1 |
| Ví & Giao dịch | Wallet | 6 | 3 | 2 | 1 |
| Admin | Admin Panel | 9 | 5 | 4 | 0 |
| Hệ thống nền | System Jobs | 7 | 4 | 3 | 0 |
| Cài đặt | Settings | 6 | 3 | 2 | 1 |
| **TỔNG CỘNG** | **15 Epics** | **119 Stories** | **78** | **38** | **7** |

---

### Phương pháp phân tích
Danh sách này được xây dựng bằng cách đối chiếu **6 nguồn tài liệu** của dự án:
1. `phan_tich_usecase.md` — Biểu đồ Use Case (5 Actor, Include/Extend)
2. `thiet_ke_erd.md` — Thiết kế ERD (16 bảng dữ liệu)
3. `chi_tiet_cac_usecase_he_thong.md` — Kịch bản chi tiết (Happy/Error/Alternate paths)
4. `Kich_Ban_Toan_Canh_JobNow.md` — Luồng hoạt động chính (5 workflows)
5. `yeu_cau_du_an.md` — Yêu cầu chức năng & phi chức năng
6. `Phan_Tich_UX_UI_Dang_Tin_Va_Ung_Tuyen.md` — Phân tích UX/UI chi tiết

Áp dụng framework phân tích từ skill **Business Analyst** (Jobs-to-be-Done, 5 Whys) và **Product Manager** (MoSCoW prioritization, Epic-to-Story breakdown).
