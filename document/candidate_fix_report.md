# 📋 BÁO CÁO CÁC PHẦN CẦN SỬA – Candidate Interface

> **Ngày:** 13/03/2026 | **Phạm vi:** `/candidate/*` và `/jobs`

---

## 🔴 CRITICAL – Phải sửa ngay

### 1. Rating hardcoded = 4.8 (2 nơi)
- **File:** `routes/candidate/profile/index.tsx` dòng 61
- **File:** `routes/candidate/jobs/$jobId.tsx` dòng 182
- **Vấn đề:** Điểm đánh giá luôn hiển thị 4.8, không lấy từ database
- **Hướng sửa:** Lấy từ Firestore hoặc hiển thị "Chưa có đánh giá"

### 2. Employer score hardcoded = 98
- **File:** `routes/candidate/jobs/$jobId.tsx` dòng 313
- **Vấn đề:** Điểm uy tín nhà tuyển dụng luôn là 98
- **Hướng sửa:** Lấy `reputation_score` từ employer document

### 3. Badge "ĐÃ XÁC THỰC" luôn hiện
- **File:** `routes/candidate/jobs/$jobId.tsx` dòng 169
- **Vấn đề:** Tất cả tin tuyển dụng đều hiển thị badge xác thực
- **Hướng sửa:** Kiểm tra `employer.verification_status === 'VERIFIED'`

### 4. Wallet chưa có trang UI
- **Trạng thái:** Có hooks (`features/wallet/hooks/useWallet.ts`) nhưng chưa có route
- **Hướng sửa:** Tạo `/candidate/wallet` với UI số dư + lịch sử giao dịch

### 5. Hệ thống Review/Rating chưa tồn tại
- **Vấn đề:** Không có collection `reviews` trong Firestore, không có UI đánh giá
- **Hướng sửa:** Thiết kế flow: Candidate đánh giá employer sau hoàn thành ca

---

## 🟠 HIGH – Nên sửa sớm

### 6. Nút Share không hoạt động
- **File:** `routes/candidate/jobs/$jobId.tsx` dòng 154
- **Vấn đề:** Nút `Share2` chỉ là placeholder, không có `onClick`
- **Hướng sửa:** Dùng Web Share API hoặc copy link to clipboard

### 7. Nút Chat trong Job Detail không hoạt động
- **File:** `routes/candidate/jobs/$jobId.tsx` dòng 330
- **Vấn đề:** Nút `MessageSquare` trong bottom action bar không có logic
- **Hướng sửa:** Navigate đến `/candidate/chat` với context của employer

### 8. Profile Edit thiếu upload avatar
- **File:** `routes/candidate/profile/edit.tsx`
- **Vấn đề:** Không có cách tải ảnh đại diện
- **Hướng sửa:** Thêm Firebase Storage upload + crop

### 9. Profile Edit thiếu nhiều trường
- **File:** `routes/candidate/profile/edit.tsx`
- **Thiếu:** Ngày sinh, email, kỹ năng, kinh nghiệm làm việc
- **Hướng sửa:** Thêm các input field + select/multi-select

### 10. Shift cards hiển thị ID thay vì tên việc
- **File:** `routes/candidate/shifts.tsx` dòng 54, 100
- **Vấn đề:** Hiển thị "Đơn #abc12345" thay vì tên job + employer
- **Hướng sửa:** Query `jobTitle` từ application hoặc job document

### 11. Dashboard load tất cả jobs
- **File:** `routes/candidate/index.tsx` dòng 26
- **Vấn đề:** `useAllJobs()` load toàn bộ, không recommend theo vị trí/ngành
- **Hướng sửa:** Implement thuật toán đề xuất hoặc filter theo gần nhất

---

## 🟡 MEDIUM – Cần cải thiện

### 12. Applications chưa có filter theo trạng thái
- **File:** `routes/candidate/applications.tsx`
- **Hướng sửa:** Thêm tabs: Tất cả | Chờ duyệt | Đã nhận | Từ chối

### 13. Không thể hủy ứng tuyển
- **File:** `routes/candidate/applications.tsx`
- **Vấn đề:** Candidate không có cách rút đơn
- **Hướng sửa:** Thêm nút "Hủy ứng tuyển" cho đơn trạng thái PENDING/NEW

### 14. Settings – 2 button placeholder
- **File:** `routes/candidate/profile/settings.tsx` dòng 117, 126
- **Vấn đề:** "Quyền riêng tư" và "Điều khoản sử dụng" không hoạt động
- **Hướng sửa:** Tạo content page hoặc link đến URL bên ngoài

### 15. Chưa có đổi mật khẩu
- **File:** `routes/candidate/profile/settings.tsx`
- **Hướng sửa:** Thêm Firebase Auth password reset flow



### 17. Job Search UX
- **File:** `routes/jobs/index.tsx`
- **Vấn đề:** Bộ lọc nâng cao chiếm quá nhiều diện tích, thiếu "Xóa tất cả"
- **Hướng sửa:** Collapsible filters + nút Clear All + pagination rõ ràng

### 18. Push Notification chưa tích hợp thực
- **Vấn đề:** Toggle setting có nhưng chưa có FCM integration
- **Hướng sửa:** Tích hợp Firebase Cloud Messaging

---

## 🟢 LOW – Nice to have

### 19. Calendar view cho shifts
- Lịch biểu trực quan thay vì danh sách

### 20. Timer đếm giờ khi check-in
- Hiển thị realtime timer khi đang làm ca

### 21. Xóa tài khoản (GDPR compliance)
- Settings → Xóa toàn bộ data + anonymize

### 22. Dọn test data trong Firestore
- Xóa các job titles như "dsfsdf", "bưng bê" với salary bất thường

### 23. Chat page load chậm
- Cần audit performance của `ChatPage` component

---

## 📊 Thống kê tổng hợp

| Mức độ | Số lượng | Tình trạng |
|--------|----------|-----------|
| 🔴 Critical | 5 | Phải xử lý Sprint 1 |
| 🟠 High | 6 | Nên làm Sprint 1-2 |
| 🟡 Medium | 7 | Sprint 2-3 |
| 🟢 Low | 5 | Backlog |
| **Tổng** | **23 items** | |
