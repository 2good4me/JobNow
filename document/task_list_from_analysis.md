# 📋 DANH SÁCH TASK CẦN LÀM – Dựa trên Báo cáo Phân tích 23/03/2026

> **Tổng:** 19 tasks | **Sprint 1:** 4 tasks (1-2 ngày) | **Sprint 2:** 6 tasks (1-2 tuần) | **Sprint 3:** 9 tasks (2-4 tuần)

---

## 🔥 SPRINT 1 – VÁ BẢO MẬT NGAY LẬP TỨC (1-2 ngày)

### TASK 1: Siết Firestore Rules cho `applications`
- [x] Done
- **Mức độ:** 🔴 Critical
- **File:** `firestore.rules` dòng 83-89
- **Vấn đề hiện tại:**
  ```
  match /applications/{applicationId} {
    allow read, write: if isSignedIn();
  }
  ```
  Bất kỳ user đăng nhập nào cũng đọc/sửa/xóa application của người khác. Candidate A có thể tự set `status = APPROVED` cho đơn của mình, hoặc xóa đơn đối thủ.
- **Cần sửa thành:**
  ```
  match /applications/{applicationId} {
    allow read: if isSignedIn() && (
      resource.data.candidate_id == request.auth.uid ||
      resource.data.employer_id == request.auth.uid ||
      isAdmin()
    );
    allow create: if false; // Chỉ qua Firebase Functions
    allow update: if false; // Chỉ qua Firebase Functions
    allow delete: if false;

    match /{allSubcollections=**} {
      allow read: if isSignedIn() && (
        get(/databases/$(database)/documents/applications/$(applicationId)).data.candidate_id == request.auth.uid ||
        get(/databases/$(database)/documents/applications/$(applicationId)).data.employer_id == request.auth.uid
      );
      allow write: if false; // Chỉ qua Firebase Functions
    }
  }
  ```
- **Kiểm tra:** Dùng Firebase Emulator chạy test: user A không thể đọc/sửa application của user B.

---

### TASK 2: Siết Firestore Rules cho `jobs` update
- [x] Done
- **Mức độ:** 🔴 Critical
- **File:** `firestore.rules` dòng 76
- **Vấn đề hiện tại:**
  ```
  allow update: if isSignedIn();
  ```
  Bất kỳ user nào cũng sửa được tin của employer khác (đổi salary, status, employer_id).
- **Cần sửa thành:**
  ```
  allow update: if isSignedIn() && (
    resource.data.employer_id == request.auth.uid ||
    isAdmin()
  );
  ```
- **Lưu ý:** Kiểm tra xem Firebase Functions `applyJob` có ghi trực tiếp vào `jobs` (update `shift_capacity`) không. Nếu có → Functions dùng Admin SDK nên không bị ảnh hưởng bởi rules. Xác nhận điều này trước khi deploy.

---

### TASK 3: Xóa simulation rule cho `transactions`
- [x] Done
- **Mức độ:** 🟠 High
- **File:** `firestore.rules` dòng 138
- **Vấn đề hiện tại:**
  ```
  allow create: if isSignedIn(); // Allow creating for simulation
  ```
  User có thể tạo fake transaction records.
- **Cần sửa thành:**
  ```
  allow create: if false; // Chỉ tạo qua Backend API / Firebase Functions
  ```
- **Lưu ý:** Kiểm tra xem frontend có đang tạo transaction trực tiếp từ client không (ví dụ trong wallet deposit flow). Nếu có → chuyển logic đó sang Firebase Function trước khi siết rule.

---

### TASK 4: Thay `alert()` bằng `toast` (10 chỗ)
- [x] Done
- **Mức độ:** 🟡 Medium
- **Vấn đề:** 10 chỗ dùng `alert()` mang trải nghiệm UX rất kém, chặn luồng UI.
- **Danh sách file cần sửa:**

| # | File | Dòng | Nội dung alert | Sửa thành |
|:--|:---|:---:|:---|:---|
| 1 | `features/chat/components/ChatRoom.tsx` | 78 | `alert(err.message \|\| 'Gửi tin nhắn thất bại')` | `toast.error(err.message \|\| 'Gửi tin nhắn thất bại')` |
| 2 | `features/jobs/components/MapPicker.tsx` | 144 | `alert("Không thể lấy vị trí...")` | `toast.error("Không thể lấy vị trí...")` |
| 3 | `features/jobs/components/MapPicker.tsx` | 150 | `alert("Trình duyệt không hỗ trợ...")` | `toast.error("Trình duyệt không hỗ trợ...")` |
| 4 | `components/ui/ApplicantCard.tsx` | 155 | `alert("Không thể duyệt: ...")` | `toast.error("Không thể duyệt: ...")` |
| 5 | `components/ui/ApplicantCard.tsx` | 167 | `alert("Không thể từ chối: ...")` | `toast.error("Không thể từ chối: ...")` |
| 6 | `components/ui/ApplicantCard.tsx` | 199 | `alert('Không tìm thấy thông tin...')` | `toast.error('Không tìm thấy thông tin...')` |
| 7 | `components/ui/ApplicantCard.tsx` | 211 | `alert("Thanh toán thất bại: ...")` | `toast.error("Thanh toán thất bại: ...")` |
| 8 | `routes/candidate/applications.$applicationId.tsx` | 162 | `alert('Xác nhận thành công!')` | `toast.success('Xác nhận thành công!')` |
| 9 | `routes/employer/-components/post-job/Step2Details.tsx` | 24 | `alert('Không thể lấy vị trí GPS...')` | `toast.error('Không thể lấy vị trí GPS...')` |
| 10 | `routes/employer/-components/post-job/Step2Details.tsx` | 29 | `alert('Trình duyệt không hỗ trợ...')` | `toast.error('Trình duyệt không hỗ trợ...')` |

- **Lưu ý:** Đảm bảo mỗi file đã import `toast` từ `sonner`. Hầu hết các file khác trong project đã dùng sonner.

---

## ⚡ SPRINT 2 – HOÀN THIỆN LUỒNG CỐT LÕI (1-2 tuần)

### TASK 5: Xây dựng Admin eKYC Review
- [x] Done
- **Mức độ:** 🔴 Critical
- **Vấn đề:** Candidate gửi hồ sơ xác thực → trạng thái PENDING → **không ai duyệt**. Admin panel hoàn toàn không có UI xem/duyệt hồ sơ eKYC.
- **Cần tạo mới:**

| File | Mô tả |
|:---|:---|
| `routes/admin/verifications.tsx` | Trang danh sách hồ sơ eKYC chờ duyệt |
| `features/admin/services/verificationService.ts` | Service query `users_private/{userId}/verification_requests` |
| `features/admin/hooks/useVerifications.ts` | React hooks cho data fetching |

- **Logic chi tiết:**
  1. Query tất cả documents trong `users_private` collection có `verification_requests` subcollection với `status = PENDING`
  2. Hiển thị danh sách: tên, ảnh CCCD đã upload, thông tin OCR trích xuất, ngày gửi
  3. Nút **Approve**: set `verification_requests/{id}.status = APPROVED` + set `users/{userId}.verification_status = VERIFIED`
  4. Nút **Reject** + input lý do: set `verification_requests/{id}.status = REJECTED` + ghi `rejection_reason`
  5. Tạo notification cho user về kết quả
- **Firestore Rules:** `users_private` đã cho phép Admin read/write (dòng 47), nên không cần sửa rules.

---

### TASK 6: Thêm kiểm tra Conflict Time trong `applyJob`
- [x] Done
- **Mức độ:** 🔴 Critical
- **File:** `apps/functions/src/index.ts` – hàm `applyJob` (dòng 162-261)
- **Vấn đề:** Candidate có thể ứng tuyển nhiều ca trùng giờ nhau → employer bị kèo rớt.
- **Cần thêm logic (sau dòng 207, trước khi tạo application):**
  ```typescript
  // ─── Check Conflict Time ───
  const shifts = Array.isArray(jobData.shifts) ? jobData.shifts : [];
  const targetShift = shifts.find((s: any) => String(s.id) === input.shiftId);
  
  if (targetShift && jobData.start_date) {
    const shiftStart = new Date(`${jobData.start_date}T${targetShift.start_time}:00`);
    const shiftEnd = new Date(`${jobData.start_date}T${targetShift.end_time}:00`);
    
    // Query all APPROVED applications of this candidate
    const approvedApps = await db.collection('applications')
      .where('candidate_id', '==', input.candidateId)
      .where('status', 'in', ['APPROVED', 'CHECKED_IN'])
      .get();
    
    for (const appDoc of approvedApps.docs) {
      const appData = appDoc.data();
      const otherJobSnap = await db.collection('jobs').doc(appData.job_id).get();
      if (!otherJobSnap.exists) continue;
      const otherJob = otherJobSnap.data();
      const otherShifts = Array.isArray(otherJob?.shifts) ? otherJob.shifts : [];
      const otherShift = otherShifts.find((s: any) => String(s.id) === appData.shift_id);
      
      if (otherShift && otherJob?.start_date) {
        const otherStart = new Date(`${otherJob.start_date}T${otherShift.start_time}:00`);
        const otherEnd = new Date(`${otherJob.start_date}T${otherShift.end_time}:00`);
        
        if (shiftStart < otherEnd && shiftEnd > otherStart) {
          throw new HttpsError('failed-precondition', 
            `Khung giờ này trùng với lịch làm việc "${otherJob.title}" (${otherShift.start_time}-${otherShift.end_time}). Vui lòng chọn ca khác.`);
        }
      }
    }
  }
  ```
- **Lưu ý:** Query này nằm ngoài transaction (Firestore transaction không cho query `where`). Cần cân nhắc race condition nhưng rủi ro thấp (ứng tuyển không phải high-frequency).

---

### TASK 7: Xây dựng Payment Flow (Employer → Candidate)
- [x] Done
- **Mức độ:** 🔴 Critical
- **Vấn đề:** Trường `payment_status: 'UNPAID'` trong application được set khi tạo nhưng **không bao giờ chuyển thành PAID**. Không có cơ chế thanh toán lương.
- **Cần tạo:**

| File | Mô tả |
|:---|:---|
| `apps/functions/src/index.ts` | Thêm callable `processPayment` |

- **Logic Firebase Function `processPayment`:**
  ```
  Input: { applicationId, employerId }
  1. Verify caller = employer_id của application
  2. Verify application.status = COMPLETED
  3. Verify application.payment_status = UNPAID
  4. Lấy salary từ job document (tính theo ca)
  5. Transaction:
     a. Trừ balance employer (nếu đủ tiền)
     b. Cộng balance candidate
     c. Set application.payment_status = PAID
     d. Tạo 2 transaction records (DEBIT cho employer, CREDIT cho candidate)
     e. Tạo notification cho candidate: "Bạn đã nhận X VNĐ từ công việc Y"
  6. Nếu employer không đủ tiền → throw error kèm số tiền cần nạp thêm
  ```
- **Frontend:**
  - Thêm nút "Thanh toán lương" trên `ApplicantCard.tsx` khi `status = COMPLETED && payment_status = UNPAID`
  - Confirmation dialog trước khi thanh toán

---

### TASK 8: Fix filter Ca làm & Thời gian trên `/jobs`
- [x] Done
- **Mức độ:** 🟠 High
- **File:** `apps/web/src/routes/jobs/index.tsx`
- **Vấn đề:** Bộ lọc "Thời gian" (Hôm nay/Ngày mai) và "Ca làm" (Sáng/Chiều/Tối) có UI chọn được nhưng **không ảnh hưởng kết quả** – biến `selectedTime` và `selectedShifts` không được sử dụng trong `filteredJobs` useMemo.
- **Cần thêm vào hàm `filteredJobs` (sau dòng 114, trước `return true`):**
  ```typescript
  // 6. Time filter
  if (selectedTime) {
    const jobDate = job.start_date || job.startDate;
    if (jobDate) {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
      if (selectedTime === 'Hôm nay' && jobDate !== today) return false;
      if (selectedTime === 'Ngày mai' && jobDate !== tomorrow) return false;
    }
  }
  
  // 7. Shift time filter
  if (selectedShifts.length > 0) {
    const jobShifts = job.shifts || [];
    const hasMatchingShift = jobShifts.some((s: any) => {
      const hour = parseInt(s.start_time?.split(':')[0] || '0');
      if (selectedShifts.includes('Sáng') && hour >= 5 && hour < 12) return true;
      if (selectedShifts.includes('Chiều') && hour >= 12 && hour < 17) return true;
      if (selectedShifts.includes('Tối') && hour >= 17) return true;
      return false;
    });
    if (!hasMatchingShift) return false;
  }
  ```
- **Đừng quên** thêm `selectedTime` và `selectedShifts` vào dependency array của `useMemo` (dòng 117).

---

### TASK 9: Tích hợp Google Maps cho Map View trên trang tìm việc
- [x] Done
- **Mức độ:** 🟠 High
- **File:** `apps/web/src/routes/jobs/index.tsx`
- **Vấn đề:** Nút toggle Map/List có nhưng chế độ Map **không render bản đồ**. Đây là core feature – "Uber/Grab cho việc làm".
- **Cần làm:**
  1. Cài `@react-google-maps/api` hoặc `react-leaflet` (miễn phí) 
  2. Tạo component `JobMapView.tsx` hiển thị bản đồ với pins cho từng job
  3. Khi `viewMode === 'map'`, render `JobMapView` thay vì danh sách
  4. Click pin → popup hiển thị tóm tắt job → link đến job detail
  5. Tự động center bản đồ theo vị trí user (nếu có GPS)
- **Lưu ý:** Nên dùng `react-leaflet` + OpenStreetMap tiles (miễn phí) thay vì Google Maps API (tốn phí) cho giai đoạn dev.

---

### TASK 10: Admin Job Moderation – Kiểm duyệt tin trước khi công khai
- [x] Done
- **Mức độ:** 🟠 High
- **Vấn đề:** Yêu cầu Admin 2.3: "Duyệt tin tuyển dụng trước khi hiển thị". Hiện tại tin vào Firestore = hiển thị ngay.
- **Cần sửa:**

| Bước | Chi tiết |
|:---|:---|
| **1. Schema** | Thêm `moderation_status: 'PENDING_REVIEW' \| 'APPROVED' \| 'REJECTED'` vào job document |
| **2. Tạo job** | Sửa `apps/api/src/services/job.service.ts` → set `moderation_status = 'PENDING_REVIEW'` khi tạo |
| **3. Frontend query** | Sửa `useAllJobs` hook → chỉ trả jobs có `moderation_status = 'APPROVED'` (hoặc không có field – backward compat) |
| **4. Admin UI** | Sửa `routes/admin/jobs.tsx` → thêm tab "Chờ duyệt" với nút Approve/Reject |
| **5. Notification** | Khi Admin approve → push notification cho employer: "Tin của bạn đã được phê duyệt" |

---

## 🧹 SPRINT 3 – NÂNG CẤP & TỐI ƯU (2-4 tuần)

### TASK 11: Tách `shifts` thành subcollection
- [x] Done
- **Mức độ:** 🟡 Medium
- **Vấn đề:** Shifts hiện là mảng con `jobs.shifts[]`. Firestore **không thể query tối ưu** vào phần tử mảng → chặn tính năng tìm ca trống theo thời gian.
- **Migration plan:**
  1. Tạo migration script: đọc tất cả jobs, tạo subcollection `jobs/{jobId}/shifts/{shiftId}`
  2. Cập nhật `job.service.ts` createJob → tạo shifts trong subcollection
  3. Cập nhật Firebase Functions (`applyJob`, `withdrawApplication`, `checkIn`) → đọc shift từ subcollection
  4. Cập nhật frontend hooks → query subcollection
  5. Giữ backward compat: đọc từ subcollection trước, fallback sang mảng cũ
- **Rủi ro:** Cao – ảnh hưởng nhiều file. Cần test kỹ.

---

### TASK 12: Implement Tier/Anti-spam
- [x] Done
- **Mức độ:** 🟡 Medium
- **Vấn đề:** Không có giới hạn tin đăng. Tài khoản chưa verify đăng được vô hạn. Hacker có thể spam.
- **Cần làm:**
  1. Trong `createJob` API: kiểm tra `employer.verification_status`
  2. Nếu `UNVERIFIED` → giới hạn 2 tin/tháng, chỉ 1 ca active
  3. Nếu `VERIFIED` → giới hạn 10 tin/tháng (Free tier)
  4. Count tin đã đăng trong tháng trước khi cho tạo mới
  5. Frontend: hiển thị quota còn lại trên trang Post Job

---

### TASK 13: Guest Mode – Xem việc không cần đăng nhập
- [x] Done
- **Mức độ:** 🟡 Medium
- **Vấn đề:** App bắt buộc login trước khi truy cập bất kỳ trang nào. Yêu cầu cho guest xem bản đồ/danh sách.
- **Cần làm:**
  1. Sửa `__root.tsx` → cho phép truy cập `/jobs`, `/jobs/:id` mà không cần auth
  2. Sửa Firestore rules cho `jobs` → `allow read: if true;` (thay vì `isSignedIn()`)
  3. Trên Job Detail (guest): ẩn SĐT employer (hiện `091x.xxx.xxx`), ẩn nút Chat
  4. Nút "Ứng tuyển" / "Yêu thích" / "Theo dõi" → hiện popup login wall
  5. Tab Employer: redirect đến trang login với message CTA

---

### TASK 14: FCM Push Notification thực
- [x] Done
- **Mức độ:** 🟡 Medium
- **Vấn đề:** Toggle setting trong UI chỉ lưu state, không đăng ký FCM token.
- **Cần làm:**
  1. Cài `firebase/messaging` trong frontend
  2. Tạo `firebase-messaging-sw.js` service worker
  3. Khi user bật push notification → request permission → lưu FCM token vào `users/{uid}.fcm_tokens[]`
  4. Trong Firebase Functions: sau khi tạo notification document → gọi `admin.messaging().send()` đến FCM token
  5. Hiển thị push notification trên browser/mobile

---

### TASK 15: Nhắc việc – Scheduled Cloud Function
- [x] Done
- **Mức độ:** 🟡 Medium
- **Vấn đề:** Candidate không được nhắc khi sắp đến giờ làm.
- **Cần tạo:**
  1. Cloud Function scheduled (chạy mỗi 30 phút)
  2. Query applications `status = APPROVED` có shift sắp bắt đầu trong 2 giờ tới
  3. Tạo notification + push FCM: "Ca làm tại {employer} bắt đầu lúc {time}. Đừng quên!"
  4. Đánh dấu đã nhắc để không gửi trùng

---

### TASK 16: Admin khóa/mở khóa user
- [x] Done
- **Mức độ:** 🟡 Medium
- **File:** `routes/admin/users.tsx`, `routes/admin/users.$userId.tsx`
- **Vấn đề:** Liệt kê users được nhưng **không có nút khóa/mở khóa** tài khoản vi phạm.
- **Cần thêm:**
  1. Nút "Khóa tài khoản" trên user detail page
  2. Call Firebase Admin SDK `admin.auth().updateUser(uid, { disabled: true })`
  3. Set `users/{uid}.status = 'SUSPENDED'` trong Firestore
  4. Nút "Mở khóa" → `disabled: false` + `status = 'ACTIVE'`

---

### TASK 17: Follow → Push Notification khi employer đăng tin mới
- [x] Done
- **Mức độ:** 🟢 Low
- **Vấn đề:** Use case 5.2 yêu cầu: Candidate follow employer → nhận push khi employer đăng tin mới. Hiện chỉ có follow/unfollow UI, không có trigger.
- **Cần tạo:**
  1. Firestore trigger `onDocumentCreated('jobs/{jobId}')` 
  2. Query `follows` collection: `where('followed_id', '==', job.employer_id)`
  3. Tạo notification + push cho mỗi follower: "NTD bạn yêu thích vừa đăng: {title}"

---

### TASK 18: Boost/VIP Package
- [x] Done
- **Mức độ:** 🟢 Low
- **Vấn đề:** Use case 5.1 yêu cầu hệ thống mua gói đẩy top. Hoàn toàn chưa có code.
- **Cần tạo:**
  1. Firestore collection `packages` (gói dịch vụ) + `purchases` (lịch sử mua)
  2. UI trong Employer: nút "Đẩy tin" → chọn gói → trừ ví → set `is_boosted = true` + `boost_expires_at`
  3. Frontend: Jobs có `is_boosted` hiển thị ưu tiên đầu danh sách
  4. Scheduled Function: hết hạn → `is_boosted = false`

---

### TASK 19: Đóng tin an toàn – Cảnh báo ứng viên đã duyệt
- [x] Done
- **Mức độ:** 🟢 Low
- **File:** `routes/employer/job-detail.tsx` hoặc `job-list.tsx`
- **Vấn đề:** Use case 3.2 yêu cầu: khi đóng tin có ứng viên đã duyệt → cảnh báo + gửi notification hủy.
- **Cần làm:**
  1. Trước khi set `status = CLOSED`: query applications `where('job_id', '==', jobId).where('status', '==', 'APPROVED')`
  2. Nếu có kết quả → hiện dialog: "Bạn có {n} ứng viên đã duyệt. Đóng tin sẽ ảnh hưởng uy tín. Gửi thông báo hủy?"
  3. Nếu confirm → tạo notification cho từng candidate đã duyệt
  4. Trừ điểm uy tín employer nếu hủy ca sát giờ

---

## 📊 Tổng kết

| Sprint | Số tasks | Thời gian | Focus |
|:---|:---:|:---|:---|
| **Sprint 1** | 4 | 1-2 ngày | 🔒 Bảo mật Firestore rules + UX |
| **Sprint 2** | 6 | 1-2 tuần | ⚙️ Business logic cốt lõi |
| **Sprint 3** | 9 | 2-4 tuần | 🚀 Nâng cấp tính năng |
| **Tổng** | **19** | **~5-6 tuần** | |
