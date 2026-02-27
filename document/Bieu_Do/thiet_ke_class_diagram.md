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
    *   `accountTier`: Integer (0: Chưa xác thực, 1: Tier 1, 2: eKYC Tier 2)
    *   `walletBalance`: Double (Số dư ví)
    *   `status`: UserStatus (Trạng thái: ACTIVE, BANNED, SHADOW_BANNED...)
    *   `deviceId`: String (Nhận dạng thiết bị)
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
*   **Phương thức:**
    *   `searchJobs(filters)`: Tìm kiếm việc làm theo bộ lọc.
    *   `applyForJob(jobId)`: Nộp đơn ứng tuyển.
    *   `checkIn(jobId, lat, long, method)`: Điểm danh (GPS/QR).
    *   `checkOut(jobId)`: Xác nhận ra về.
    *   `cancelJob(jobId)`: Bấm Hủy ca trước giờ làm.
    *   `followEmployer(employerId)`: Theo dõi cửa hàng.
    *   `unfollowEmployer(employerId)`: Bỏ theo dõi cửa hàng.

**Class: Employer (Nhà tuyển dụng) - Kế thừa User**
*   *Mô tả:* Người hoặc tổ chức đăng tin tuyển dụng.
*   **Thuộc tính:**
    *   `companyName`: String (Tên công ty/Cửa hàng)
    *   `businessLicenseUrl`: String (Ảnh giấy phép kinh doanh/CCCD)
    *   `address`: String (Địa chỉ trụ sở)
    *   `reputationScore`: Double (Điểm uy tín)
    *   `followerCount`: Integer (Số lượng người theo dõi)
*   **Phương thức:**
    *   `postJob(jobDetails)`: Đăng tin tuyển dụng mới.
    *   `updateJob(jobId)`: Sửa tin đăng.
    *   `reviewApplication(appId, status)`: Duyệt hồ sơ ứng viên.
    *   `confirmCompletion(jobId, candidateId, paymentStatus)`: Xác nhận nhân viên đã làm xong và Trả lương.
    *   `depositMoney(amount)`: Nạp tiền vào ví.
    *   `buyBoost(jobId)`: Mua gói đẩy Top / Khẩn cấp.

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
    *   `salary`: Double (Mức lương)
    *   `salaryType`: String (Loại lương: Theo Giờ/Ngày/Khoán)
    *   `jobType`: String (Loại công việc: Phục vụ, Bán hàng...)
    *   `locationLat`: Double (Vĩ độ nơi làm việc)
    *   `locationLong`: Double (Kinh độ nơi làm việc)
    *   `locationAddress`: String (Địa chỉ hiển thị)
    *   `quantity`: Integer (Số lượng cần tuyển)
    *   `isBoosted`: Boolean (Có đang mua gói VIP hiển thị không)
    *   `status`: JobStatus (Trạng thái: OPEN, CLOSED...)
    *   `expirationDate`: DateTime (Ngày hết hạn)
*   **Phương thức:**
    *   `createShifts()`: Tạo danh sách các ca làm việc.

**Class: Shift (Ca làm việc)**
*   *Mô tả:* Từng ca làm việc nhỏ được chia ra từ một JobPost (Ví dụ Job làm thứ 2 đến thứ 6 sẽ sinh ra 5 Ca).
*   **Thuộc tính:**
    *   `id`: String
    *   `jobId`: String (Thuộc về Job nào)
    *   `workDate`: Date (Ngày làm việc)
    *   `startTime`: Time (Giờ bắt đầu)
    *   `endTime`: Time (Giờ kết thúc)
    *   `neededQuantity`: Integer (Số lượng cần cho ca)
    *   `status`: ShiftStatus (OPEN, FULL, COMPLETED, CANCELLED)
*   **Phương thức:**
    *   `getApplicants()`: Lấy danh sách hồ sơ ứng tuyển vào ca này.

**Class: Application (Đơn ứng tuyển)**
*   *Mô tả:* Bản ghi thể hiện việc một ứng viên xin vào một ca cụ thể.
*   **Thuộc tính:**
    *   `id`: String
    *   `shiftId`: String (Ứng tuyển vào ca nào)
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

**Class: TransactionHistory (Lịch sử Nạp/Trừ tiền)**
*   *Mô tả:* Lưu lại mọi biến động ví (mua gói, trả nợ).
*   **Thuộc tính:**
    *   `id`: String
    *   `userId`: String
    *   `amount`: Double (Số tiền, biến động +/-)
    *   `type`: String (Loại GD: DEPOSIT, PLATFORM_FEE, BOOST_JOB...)
    *   `createdAt`: DateTime

**Class: Follow (Theo dõi)**
*   *Mô tả:* Danh sách Ứng viên theo dõi Cửa hàng.
*   **Thuộc tính:**
    *   `followerId`: String (ID Ứng viên)
    *   `followingId`: String (ID Chủ quán/Cửa hàng)
    *   `createdAt`: DateTime

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

**Class: Category (Danh mục công việc)**
*   *Mô tả:* Lĩnh vực/Ngành nghề của Job (F&B, PG, Kho...).
*   **Thuộc tính:**
    *   `id`: String
    *   `name`: String
    *   `iconUrl`: String

**Class: Bookmark (Việc đã lưu)**
*   *Mô tả:* Các tin tuyển dụng ứng viên quan tâm.
*   **Thuộc tính:**
    *   `userId`: String
    *   `jobId`: String
    *   `savedAt`: DateTime

**Class: Notification (Thông báo Push)**
*   *Mô tả:* Lịch sử thông báo đẩy của hệ thống.
*   **Thuộc tính:**
    *   `userId`: String
    *   `title`: String
    *   `content`: String
    *   `type`: String (APPLY, PAYMENT, ALERT...)
    *   `isRead`: Boolean

**Class: BannedDevice (Thiết bị vi phạm)**
*   *Mô tả:* Blackbox chứa thông tin định danh máy lách luật.
*   **Thuộc tính:**
    *   `deviceId`: String
    *   `ipAddress`: String
    *   `reason`: String
    *   `bannedAt`: DateTime

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
    *   `JobPost` (1) ---- (*) `Shift` 
    *   *Ý nghĩa:* Một JobPost có thể phân mảnh ra thành nhiều Ca làm việc (Shifts) khác nhau.

3.  **Quan hệ Liên kết (Association) - Ứng tuyển:**
    *   `Candidate` (1) ---- (*) `Application`
    *   *Ý nghĩa:* Một Ứng viên có thể nộp **nhiều** Đơn ứng tuyển.
    *   `Shift` (1) ---- (*) `Application`
    *   *Ý nghĩa:* Một Ca làm việc có thể nhận **nhiều** Đơn ứng tuyển.
    *   *(Application là bảng trung gian quy định ai làm Ca nào, không nộp chung chung vào JobPost).*

4.  **Quan hệ Tương tác:**
    *   `User` (1) ---- (*) `Message`: Người dùng gửi/nhận nhiều tin nhắn.
    *   `User` (1) ---- (*) `Notification`: Người dùng nhận nhiều thông báo.
    *   `User` (1) ---- (*) `Review`: Người dùng viết đánh giá hoặc nhận đánh giá.
    *   `User` (1) ---- (*) `Bookmark`: Ứng viên lưu các mẩu tin Job.
    *   `User` (1) ---- (*) `TransactionHistory`: Lưu vết dòng tiền của user.
    *   `User` (1) ---- (*) `Report`: Người dùng tạo báo cáo vi phạm.

5.  **Quan hệ Phụ thuộc (Dependency):**
    *   `Candidate` ..> `JobPost`
    *   *Ý nghĩa:* Candidate "tìm kiếm" JobPost. Hành động tìm kiếm phụ thuộc vào dữ liệu của JobPost.

6.  **Quan hệ Theo dõi (Follow-up):**
    *   `Candidate` (*) ---- (*) `Employer` (Thông qua bảng trung gian `Follow`)
    *   *Ý nghĩa:* Một Ứng viên (Candidate) có thể theo dõi nhiều Chủ quán (Employer). Và Ngược lại một Chủ quán có thể có nhiều Ứng viên theo dõi.
