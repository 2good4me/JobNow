# Danh sách User Stories chi tiết

Tài liệu này tổng hợp toàn bộ các User Stories (Câu chuyện người dùng) cho dự án JobNow - Hệ thống tìm việc làm thời vụ theo GPS.

## 1. Actor: Guest (Khách vãng lai - Chưa đăng nhập)

Khách truy cập hệ thống nhưng chưa đăng nhập.

- **US-G01:** Là một Khách, tôi muốn xem danh sách các việc làm trên bản đồ để biết khu vực quanh mình có nhiều việc hay không.
- **US-G02:** Là một Khách, tôi muốn xem chi tiết mô tả công việc (Lương, Yêu cầu) để cân nhắc xem có phù hợp với mình không.
- **US-G03:** Là một Khách, tôi muốn đăng ký tài khoản mới (bằng SĐT) để bắt đầu sử dụng các tính năng ứng tuyển/đăng tin.
- **US-G04:** Là một Khách, tôi muốn đăng nhập vào tài khoản đã có để tiếp tục sử dụng dịch vụ.

## 2. Actor: Candidate (Người tìm việc)

Người dùng có nhu cầu tìm kiếm việc làm thời vụ.

### 2.1. Quản lý Hồ sơ
- **US-C01:** Là một Candidate, tôi muốn cập nhật thông tin cá nhân (Tên, Tuổi, Bio) để nhà tuyển dụng hiểu rõ về tôi.
- **US-C02:** Là một Candidate, tôi muốn thêm các kỹ năng (Skills) của mình để tăng khả năng được tìm thấy.
- **US-C03:** Là một Candidate, tôi muốn tải lên ảnh chân dung để hồ sơ trông chuyên nghiệp hơn.

### 2.2. Tìm kiếm và Ứng tuyển
- **US-C04:** Là một Candidate, tôi muốn lọc việc làm theo bán kính (VD: 5km, 10km) để tìm được việc gần nhà nhất.
- **US-C05:** Là một Candidate, tôi muốn lọc việc làm theo mức lương và loại hình để tìm việc đúng nhu cầu.
- **US-C06:** Là một Candidate, tôi muốn nộp đơn ứng tuyển (Apply) vào một công việc để bày tỏ mong muốn được làm việc.
- **US-C07:** Là một Candidate, tôi muốn viết lời nhắn (Cover Letter) khi ứng tuyển để thuyết phục nhà tuyển dụng tốt hơn.
- **US-C08:** Là một Candidate, tôi muốn nhận thông báo (Notification) khi đơn ứng tuyển của tôi được duyệt hoặc từ chối.

### 2.3. Làm việc và Chấm công
- **US-C09:** Là một Candidate, tôi muốn xem danh sách các công việc "Đang làm" để quản lý lịch trình của mình.
- **US-C10:** Là một Candidate, tôi muốn thực hiện check-in bằng GPS tại nơi làm việc để báo cáo chấm công.
- **US-C11:** Là một Candidate, tôi muốn thực hiện check-out khi hết giờ làm để hệ thống ghi nhận tổng thời gian làm việc.
- **US-C12:** Là một Candidate, tôi muốn chat trực tiếp với nhà tuyển dụng để hỏi thêm thông tin hoặc báo cáo sự cố.
- **US-C13:** Là một Candidate, tôi muốn đánh giá (Review) nhà tuyển dụng sau khi xong việc để cảnh báo/chia sẻ với cộng đồng.

## 3. Actor: Employer (Nhà tuyển dụng)

Người dùng có nhu cầu thuê nhân sự thời vụ.

### 3.1. Quản lý Tin đăng
- **US-E01:** Là một Employer, tôi muốn hoàn thành xác thực eKYC (CCCD/GPKD) để tài khoản được cấp "Tích xanh" uy tín.
- **US-E02:** Là một Employer, tôi muốn đăng tin tuyển dụng mới với đầy đủ thông tin (Vị trí bản đồ, Lương, Mô tả) để tìm người.
- **US-E03:** Là một Employer, tôi muốn chỉnh sửa hoặc đóng/ẩn tin tuyển dụng khi đã tìm đủ người.
- **US-E04:** Là một Employer, tôi muốn dùng tính năng "Gợi ý kỹ năng" để chọn nhanh các yêu cầu công việc phổ biến.

### 3.2. Quản lý Ứng viên
- **US-E05:** Là một Employer, tôi muốn nhận thông báo ngay lập tức khi có người mới nộp đơn.
- **US-E06:** Là một Employer, tôi muốn xem hồ sơ chi tiết của ứng viên để đánh giá năng lực.
- **US-E07:** Là một Employer, tôi muốn duyệt (Approve) hoặc từ chối (Reject) đơn ứng tuyển.
- **US-E08:** Là một Employer, tôi muốn chat với ứng viên ngay trên ứng dụng để hẹn lịch phỏng vấn hoặc trao đổi công việc.

### 3.3. Quản lý Công việc
- **US-E09:** Là một Employer, tôi muốn xem lịch sử chấm công (Check-in GPS) của nhân viên để đảm bảo họ đi làm đúng giờ.
- **US-E10:** Là một Employer, tôi muốn xác nhận hoàn thành công việc cho nhân viên để kết thúc hợp đồng.
- **US-E11:** Là một Employer, tôi muốn đánh giá nhân viên sau khi làm xong để lưu lại lịch sử làm việc của họ.
- **US-E12:** Là một Employer, tôi muốn giao dịch thanh toán gói dịch vụ tuyển dụng để bài đăng được nổi bật.

## 4. Actor: Admin (Quản trị viên)

Người quản trị hệ thống.

- **US-A01:** Là một Admin, tôi muốn đăng nhập vào trang quản trị (Dashboard) để vận hành hệ thống.
- **US-A02:** Là một Admin, tôi muốn xem danh sách các tin tuyển dụng bị báo cáo để xử lý vi phạm.
- **US-A03:** Là một Admin, tôi muốn khóa (Ban) tài khoản người dùng nếu họ có hành vi lừa đảo hoặc spam.
- **US-A04:** Là một Admin, tôi muốn quản lý danh mục kỹ năng (Sys Skills) để chuẩn hóa dữ liệu hệ thống.
- **US-A05:** Là một Admin, tôi muốn xem báo cáo thống kê doanh thu và lượt ứng tuyển để nắm tình hình phát triển của ứng dụng.
