# Thiết kế Biểu đồ Lớp (Class Diagram) - Dự án GPS Jobs

Tài liệu này mô tả chi tiết cấu trúc các Class (Lớp) và mối quan hệ giữa chúng trong hệ thống Tuyển dụng theo vị trí.

## 1. Chi tiết các Class (Thuộc tính & Phương thức)

### 1.1. Khối Người dùng (User Hierarchy)

**Class: User (Abstract - Lớp trừu tượng)**
*   *Mô tả:* Lớp cha định nghĩa các thông tin chung cho mọi loại người dùng.
*   **Thuộc tính:**
    *   `id`: String (Mã định danh duy nhất)
    *   `phoneNumber`: String (Số điện thoại đăng nhập)
    *   `email`: String
    *   `passwordHash`: String (Mật khẩu đã mã hóa)
    *   `fullName`: String (Họ và tên hiển thị)
    *   `avatarUrl`: String (Link ảnh đại diện)
    *   `status`: UserStatus (Trạng thái: ACTIVE, BANNED...)
    *   `createdAt`: DateTime
*   **Phương thức:**
    *   `login()`: Đăng nhập.
    *   `logout()`: Đăng xuất.
    *   `updateProfile()`: Cập nhật thông tin cá nhân.
    *   `changePassword()`: Đổi mật khẩu.

**Class: Candidate (Ứng viên) - Kế thừa User**
*   *Mô tả:* Người đi tìm việc làm.
*   **Thuộc tính:**
    *   `birthDate`: Date (Ngày sinh)
    *   `gender`: String (Giới tính)
    *   `bio`: String (Giới thiệu bản thân)
    *   `skills`: List<String> (Danh sách kỹ năng)
    *   `findingRadius`: Double (Bán kính tìm việc mong muốn - km)
    *   `currentLat`: Double (Vĩ độ hiện tại)
    *   `currentLong`: Double (Kinh độ hiện tại)
    *   `isVerified`: Boolean (Đã xác thực eKYC chưa)
*   **Phương thức:**
    *   `searchJobs(filters)`: Tìm kiếm việc làm theo bộ lọc.
    *   `applyForJob(jobId)`: Nộp đơn ứng tuyển.
    *   `checkIn(jobId, lat, long)`: Điểm danh tại nơi làm.
    *   `checkOut(jobId)`: Xác nhận ra về.

**Class: Employer (Nhà tuyển dụng) - Kế thừa User**
*   *Mô tả:* Người hoặc tổ chức đăng tin tuyển dụng.
*   **Thuộc tính:**
    *   `companyName`: String (Tên công ty/Cửa hàng)
    *   `businessLicenseUrl`: String (Ảnh giấy phép kinh doanh/CCCD)
    *   `address`: String (Địa chỉ trụ sở)
    *   `isVerified`: Boolean (Đã xác thực doanh nghiệp chưa)
    *   `reputationScore`: Double (Điểm uy tín)
*   **Phương thức:**
    *   `postJob(jobDetails)`: Đăng tin tuyển dụng mới.
    *   `updateJob(jobId)`: Sửa tin đăng.
    *   `reviewApplication(appId, status)`: Duyệt hồ sơ ứng viên.
    *   `confirmCompletion(jobId, candidateId)`: Xác nhận nhân viên đã hoàn thành công việc.

**Class: Admin (Quản trị viên) - Kế thừa User**
*   *Mô tả:* Người vận hành hệ thống.
*   **Thuộc tính:**
    *   `roleLevel`: String (Cấp độ quyền hạn)
*   **Phương thức:**
    *   `approveJob(jobId)`: Duyệt tin đăng.
    *   `banUser(userId)`: Khóa tài khoản vi phạm.
    *   `resolveReport(reportId)`: Xử lý báo cáo.
    *   `viewStatistics()`: Xem thống kê hệ thống.

---

### 1.2. Khối Nghiệp vụ Chính (Core Business)

**Class: JobPost (Tin tuyển dụng)**
*   *Mô tả:* Thông tin chi tiết về công việc cần tuyển.
*   **Thuộc tính:**
    *   `id`: String
    *   `employerId`: String (ID người đăng)
    *   `title`: String (Tiêu đề việc làm)
    *   `description`: String (Mô tả công việc)
    *   `salaryMin`: Double (Lương tối thiểu)
    *   `salaryMax`: Double (Lương tối đa)
    *   `jobType`: String (Loại công việc: Phục vụ, Bán hàng...)
    *   `locationLat`: Double (Vĩ độ nơi làm việc)
    *   `locationLong`: Double (Kinh độ nơi làm việc)
    *   `locationAddress`: String (Địa chỉ hiển thị)
    *   `quantity`: Integer (Số lượng cần tuyển)
    *   `status`: JobStatus (Trạng thái: OPEN, CLOSED...)
    *   `expirationDate`: DateTime (Ngày hết hạn)
*   **Phương thức:**
    *   `getApplicants()`: Lấy danh sách người đã ứng tuyển.

**Class: Application (Đơn ứng tuyển)**
*   *Mô tả:* Bản ghi thể hiện việc một ứng viên xin vào một công việc.
*   **Thuộc tính:**
    *   `id`: String
    *   `jobId`: String
    *   `candidateId`: String
    *   `status`: ApplicationStatus (Trạng thái: PENDING, ACCEPTED, REJECTED...)
    *   `appliedAt`: DateTime (Thời gian nộp)
*   **Phương thức:**
    *   `cancel()`: Hủy đơn ứng tuyển.

### 1.3. Khối Tương tác & Hỗ trợ

**Class: Review (Đánh giá)**
*   *Mô tả:* Đánh giá qua lại giữa 2 bên sau khi xong việc.
*   **Thuộc tính:**
    *   `reviewerId`: String (Người đánh giá)
    *   `revieweeId`: String (Người được đánh giá)
    *   `jobId`: String (Công việc liên quan)
    *   `rating`: Integer (Số sao 1-5)
    *   `comment`: String (Nội dung nhận xét)

**Class: Report (Báo cáo vi phạm)**
*   *Mô tả:* Báo cáo xấu, lừa đảo, spam.
*   **Thuộc tính:**
    *   `reporterId`: String (Người báo cáo)
    *   `reportedId`: String (Đối tượng bị báo cáo)
    *   `reason`: String (Lý do)
    *   `status`: String (Trạng thái xử lý)

**Class: Message (Tin nhắn chat)**
*   *Mô tả:* Tin nhắn trao đổi trực tiếp.
*   **Thuộc tính:**
    *   `senderId`: String
    *   `receiverId`: String
    *   `content`: String (Nội dung)
    *   `isRead`: Boolean (Đã xem chưa)

## 2. Các Mối quan hệ (Relationships)

Dưới đây là mô tả chi tiết các liên kết trong biểu đồ:

1.  **Quan hệ Kế thừa (Inheritance):**
    *   `Candidate` **IS-A** `User` (Candidate là một User).
    *   `Employer` **IS-A** `User` (Employer là một User).
    *   `Admin` **IS-A** `User` (Admin là một User).
    *   *Ý nghĩa:* 3 Class này thừa hưởng toàn bộ thuộc tính cơ bản (ID, SĐT, Login...) từ User.

2.  **Quan hệ Liên kết (Association) - Đăng tuyển:**
    *   `Employer` (1) ---- (*) `JobPost`
    *   *Ý nghĩa:* Một Nhà tuyển dụng có thể đăng **nhiều** Tin tuyển dụng. Một Tin tuyển dụng chỉ thuộc về **một** Nhà tuyển dụng.

3.  **Quan hệ Liên kết (Association) - Ứng tuyển:**
    *   `Candidate` (1) ---- (*) `Application`
    *   *Ý nghĩa:* Một Ứng viên có thể nộp **nhiều** Đơn ứng tuyển.
    *   `JobPost` (1) ---- (*) `Application`
    *   *Ý nghĩa:* Một Tin tuyển dụng có thể nhận **nhiều** Đơn ứng tuyển.
    *   *(Application là bảng trung gian giải quyết quan hệ Nhiều-Nhiều giữa Candidate và JobPost).*

4.  **Quan hệ Tương tác:**
    *   `User` (1) ---- (*) `Message`: Người dùng gửi/nhận nhiều tin nhắn.
    *   `User` (1) ---- (*) `Notification`: Người dùng nhận nhiều thông báo.
    *   `User` (1) ---- (*) `Review`: Người dùng viết đánh giá hoặc nhận đánh giá.
    *   `User` (1) ---- (*) `Report`: Người dùng tạo báo cáo vi phạm.

5.  **Quan hệ Phụ thuộc (Dependency):**
    *   `Candidate` ..> `JobPost`
    *   *Ý nghĩa:* Candidate "tìm kiếm" JobPost. Hành động tìm kiếm phụ thuộc vào dữ liệu của JobPost.
