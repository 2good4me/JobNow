# Danh sách User Stories (Câu chuyện người dùng)

Tài liệu này liệt kê toàn bộ các User Stories của hệ thống "Tìm việc làm thời vụ theo GPS", được phân chia theo từng nhóm người dùng (Actor).

Cấu trúc chuẩn: **"Là một [Vai trò], tôi muốn [Hành động], để [Lợi ích/Mục đích]."**

---

## 1. Actor: Guest (Khách vãng lai - Chưa đăng nhập)

| ID | User Story | Mức độ ưu tiên |
| :--- | :--- | :--- |
| US-G01 | Là một **Khách**, tôi muốn **xem danh sách các việc làm trên bản đồ** để biết khu vực quanh mình có nhiều việc hay không. | High |
| US-G02 | Là một **Khách**, tôi muốn **xem chi tiết mô tả công việc (Lương, Yêu cầu)** để cân nhắc xem có phù hợp với mình không. | High |
| US-G03 | Là một **Khách**, tôi muốn **Đăng ký tài khoản mới** (bằng SĐT) để bắt đầu sử dụng các tính năng ứng tuyển/đăng tin. | High |
| US-G04 | Là một **Khách**, tôi muốn **Đăng nhập** vào tài khoản đã có để tiếp tục sử dụng dịch vụ. | High |

---

## 2. Actor: Candidate (Người tìm việc)`

### 2.1. Quản lý Hồ sơ
| ID | User Story | Mức độ ưu tiên |
| :--- | :--- | :--- |
| US-C01 | Là một **Candidate**, tôi muốn **cập nhật thông tin cá nhân (Tên, Tuổi, Bio)** để nhà tuyển dụng hiểu rõ về tôi. | High |
| US-C02 | Là một **Candidate**, tôi muốn **thêm các kỹ năng (Skills) của mình** (chọn từ danh sách hoặc nhập mới) để tăng khả năng được tìm thấy. | High |
| US-C03 | Là một **Candidate**, tôi muốn **tải lên ảnh chân dung** để hồ sơ trông chuyên nghiệp hơn. | Medium |

### 2.2. Tìm kiếm & Ứng tuyển
| ID | User Story | Mức độ ưu tiên |
| :--- | :--- | :--- |
| US-C04 | Là một **Candidate**, tôi muốn **lọc việc làm theo bán kính (VD: 5km, 10km)** để tìm được việc gần nhà nhất. | High |
| US-C05 | Là một **Candidate**, tôi muốn **lọc việc làm theo mức lương và loại hình** để tìm việc đúng nhu cầu. | High |
| US-C06 | Là một **Candidate**, tôi muốn **nộp đơn ứng tuyển (Apply) vào một công việc** để bày tỏ mong muốn được làm việc. | High |
| US-C07 | Là một **Candidate**, tôi muốn **viết lời nhắn (Cover Letter)** khi ứng tuyển để thuyết phục nhà tuyển dụng tốt hơn. | Medium |
| US-C08 | Là một **Candidate**, tôi muốn **nhận thông báo (Notification)** khi đơn ứng tuyển của tôi được duyệt hoặc từ chối. | High |

### 2.3. Làm việc & Chấm công
| ID | User Story | Mức độ ưu tiên |
| :--- | :--- | :--- |
| US-C09 | Là một **Candidate**, tôi muốn **xem danh sách các công việc "Đang làm"** để quản lý lịch trình của mình. | High |
| US-C10 | Là một **Candidate**, tôi muốn **thực hiện Check-in bằng GPS** tại nơi làm việc để báo cáo chấm công. | **Critical** |
| US-C11 | Là một **Candidate**, tôi muốn **thực hiện Check-out** khi hết giờ làm để hệ thống ghi nhận tổng thời gian làm việc. | **Critical** |
| US-C12 | Là một **Candidate**, tôi muốn **chat trực tiếp với Nhà tuyển dụng** để hỏi thêm thông tin hoặc báo cáo sự cố. | Medium |
| US-C13 | Là một **Candidate**, tôi muốn **đánh giá (Review) Nhà tuyển dụng** sau khi xong việc để cảnh báo/chia sẻ với cộng đồng. | High |

---

## 3. Actor: Employer (Nhà tuyển dụng)

### 3.1. Quản lý Tin đăng
| ID | User Story | Mức độ ưu tiên |
| :--- | :--- | :--- |
| US-E01 | Là một **Employer**, tôi muốn **hoàn thành xác thực eKYC (CCCD/GPKD)** để tài khoản được cấp "Tích xanh" uy tín. | High |
| US-E02 | Là một **Employer**, tôi muốn **đăng tin tuyển dụng mới** với đầy đủ thông tin (Vị trí bản đồ, Lương, Mô tả) để tìm người. | High |
| US-E03 | Là một **Employer**, tôi muốn **chỉnh sửa hoặc đóng/ẩn tin tuyển dụng** khi đã tìm đủ người. | High |
| US-E04 | Là một **Employer**, tôi muốn **dùng tính năng "Gợi ý kỹ năng" (Tag Cloud)** để chọn nhanh các yêu cầu công việc phổ biến. | Medium |

### 3.2. Quản lý Ứng viên
| ID | User Story | Mức độ ưu tiên |
| :--- | :--- | :--- |
| US-E05 | Là một **Employer**, tôi muốn **nhận thông báo ngay lập tức** khi có người mới nộp đơn. | High |
| US-E06 | Là một **Employer**, tôi muốn **xem hồ sơ chi tiết của ứng viên** để đánh giá năng lực. | High |
| US-E07 | Là một **Employer**, tôi muốn **Duyệt (Approve) hoặc Từ chối (Reject)** đơn ứng tuyển. | High |
| US-E08 | Là một **Employer**, tôi muốn **chat với ứng viên** ngay trên ứng dụng để hẹn lịch phỏng vấn hoặc trao đổi công việc. | High |

### 3.3. Quản lý Công việc
| ID | User Story | Mức độ ưu tiên |
| :--- | :--- | :--- |
| US-E09 | Là một **Employer**, tôi muốn **xem lịch sử chấm công (Check-in GPS)** của nhân viên để đảm bảo họ đi làm đúng giờ. | **Critical** |
| US-E10 | Là một **Employer**, tôi muốn **xác nhận hoàn thành công việc** cho nhân viên để kết thúc hợp đồng. | High |
| US-E11 | Là một **Employer**, tôi muốn **đánh giá nhân viên** sau khi làm xong để lưu lại lịch sử làm việc của họ. | High |

---

## 4. Actor: Admin (Quản trị viên)

| ID | User Story | Mức độ ưu tiên |
| :--- | :--- | :--- |
| US-A01 | Là một **Admin**, tôi muốn **đăng nhập vào trang quản trị (Dashboard)** để vận hành hệ thống. | High |
| US-A02 | Là một **Admin**, tôi muốn **xem danh sách các tin tuyển dụng bị báo cáo** để xử lý vi phạm. | High |
| US-A03 | Là một **Admin**, tôi muốn **Khóa (Ban) tài khoản người dùng** nếu họ có hành vi lừa đảo hoặc spam. | High |
| US-A04 | Là một **Admin**, tôi muốn **quản lý danh mục Kỹ năng (Sys Skills)** để chuẩn hóa dữ liệu hệ thống (nếu cần). | Low |
| US-A05 | Là một **Admin**, tôi muốn **xem báo cáo thống kê (Số lượng User, Tin đăng)** để nắm tình hình phát triển của ứng dụng. | Medium |
