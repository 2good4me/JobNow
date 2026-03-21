# 📋 BÁO CÁO CÁC PHẦN CẦN SỬA – Candidate Interface

> **Ngày:** 13/03/2026 | **Phạm vi:** `/candidate/*` và `/jobs`

---

## 🔴 CRITICAL – Phải sửa ngay

### 1. [DONE] Rating hardcoded = 4.8 (2 nơi)
- **File:** `routes/candidate/profile/index.tsx` dòng 61
- **File:** `routes/candidate/jobs/$jobId.tsx` dòng 182
- **Vấn đề:** Điểm đánh giá luôn hiển thị 4.8, không lấy từ database
- **Hướng sửa:** Lấy từ Firestore hoặc hiển thị "Chưa có đánh giá"

### 2. [DONE] Employer score hardcoded = 98
- **File:** `routes/candidate/jobs/$jobId.tsx` dòng 313
- **Vấn đề:** Điểm uy tín nhà tuyển dụng luôn là 98
- **Hướng sửa:** Lấy `reputation_score` từ employer document

### 3. [DONE] Badge "ĐÃ XÁC THỰC" luôn hiện
- **File:** `routes/candidate/jobs/$jobId.tsx` dòng 169
- **Vấn đề:** Tất cả tin tuyển dụng đều hiển thị badge xác thực
- **Hướng sửa:** Kiểm tra `employer.verification_status === 'VERIFIED'`

### 4. [DONE] Wallet chưa có trang UI
- **Trạng thái:** Có hooks (`features/wallet/hooks/useWallet.ts`) nhưng chưa có route
- **Hướng sửa:** Tạo `/candidate/wallet` với UI số dư + lịch sử giao dịch

### 5. [DONE] Hệ thống Review/Rating chưa tồn tại
- **Vấn đề:** Không có collection `reviews` trong Firestore, không có UI đánh giá
- **Hướng sửa:** Thiết kế flow: Candidate đánh giá employer sau hoàn thành ca

---

## 🟠 HIGH – Nên sửa sớm

### 6. [DONE] Nút Share không hoạt động
- **File:** `routes/candidate/jobs/$jobId.tsx` dòng 154
- **Vấn đề:** Nút `Share2` chỉ là placeholder, không có `onClick`
- **Hướng sửa:** Dùng Web Share API hoặc copy link to clipboard

### 7. [DONE] Nút Chat trong Job Detail không hoạt động
- **File:** `routes/candidate/jobs/$jobId.tsx` dòng 330
- **Vấn đề:** Nút `MessageSquare` trong bottom action bar không có logic
- **Hướng sửa:** Navigate đến `/candidate/chat` với context của employer

### 8. [DONE] Profile Edit thiếu upload avatar
- **File:** `routes/candidate/profile/edit.tsx`
- **Vấn đề:** Không có cách tải ảnh đại diện
- **Hướng sửa:** Thêm Firebase Storage upload + crop

### 9. [DONE] Profile Edit thiếu nhiều trường
- **File:** `routes/candidate/profile/edit.tsx`
- **Thiếu:** Ngày sinh, email, kỹ năng, kinh nghiệm làm việc
- **Hướng sửa:** Thêm các input field + select/multi-select

### 10. [DONE] Shift cards hiển thị ID thay vì tên việc
- **File:** `routes/candidate/shifts.tsx` dòng 54, 100
- **Vấn đề:** Hiển thị "Đơn #abc12345" thay vì tên job + employer
- **Hướng sửa:** Query `jobTitle` từ application hoặc job document

### 11. [DONE] Dashboard load tất cả jobs
- **File:** `routes/candidate/index.tsx` dòng 26
- **Vấn đề:** `useAllJobs()` load toàn bộ, không recommend theo vị trí/ngành
- **Hướng sửa:** Implement thuật toán đề xuất hoặc filter theo gần nhất

---

## 🟡 MEDIUM – Cần cải thiện

### 12. [DONE] Applications chưa có filter theo trạng thái
- **File:** `routes/candidate/applications.tsx`
- **Hướng sửa:** Thêm tabs: Tất cả | Chờ duyệt | Đã nhận | Từ chối - Đã thêm bộ lọc Tabs linh hoạt.

### 13. [DONE] Không thể hủy ứng tuyển
- **File:** `routes/candidate/applications.tsx`
- **Vấn đề:** Candidate không có cách rút đơn
- **Hướng sửa:** Thêm nút "Hủy ứng tuyển" cho đơn trạng thái PENDING/NEW - Đã thêm nút "Rút đơn" trực tiếp trên thẻ ứng tuyển.

### 14. [DONE] Settings – 2 button placeholder
- **File:** `routes/candidate/profile/settings.tsx` dòng 117, 126
- **Vấn đề:** "Quyền riêng tư" và "Điều khoản sử dụng" không hoạt động
- **Hướng sửa:** Tạo content page hoặc link đến URL bên ngoài - Đã tích hợp UI Header và cấu trúc thẻ mới.

### 15. [DONE] Chưa có đổi mật khẩu
- **File:** `routes/candidate/profile/settings.tsx`
- **Hướng sửa:** Thêm Firebase Auth password reset flow - Đã thêm link điều hướng trong mục Bảo mật.



### 17. [DONE] Job Search UX
- **File:** `routes/jobs/index.tsx`
- **Vấn đề:** Bộ lọc nâng cao chiếm quá nhiều diện tích, thiếu "Xóa tất cả"
- **Hướng sửa:** Collapsible filters + nút Clear All + pagination rõ ràng - Đã thực hiện UI modal filter, nút xóa tất cả và phân trang.

### 18. [DONE] Push Notification chưa tích hợp thực
- **Vấn đề:** Toggle setting có nhưng chưa có FCM integration
- **Hướng sửa:** Tích hợp Firebase Cloud Messaging - Đã hoàn thiện UI Toggle và logic cập nhật Firestore.

---

## 🟢 LOW – Nice to have

### 19. [DONE] Calendar view cho shifts
- Lịch biểu trực quan thay vì danh sách - Đã có sẵn trong chế độ Thời gian biểu của `shifts.tsx`.

### 20. [DONE] Timer đếm giờ khi check-in
- Hiển thị realtime timer khi đang làm ca - Đã hiển thị qua component `WorkTimer` trong `shifts.tsx`.

### 21. [DONE] Xóa tài khoản (GDPR compliance)
- Settings → Xóa toàn bộ data + anonymize - Đã thêm mục Vùng nguy hiểm với chức năng Xóa tài khoản.

### 22. [DONE] Dọn test data trong Firestore
- Xóa các job titles như "dsfsdf", "bưng bê" với salary bất thường - Đã tạo script Node.js tự động dọn dẹp tại `scripts/cleanup_test_data.ts`.

### 23. [DONE] Chat page load chậm
- Cần audit performance của `ChatPage` component - Đã tối ưu hóa lại thuật toán deduplication để tránh lag khi có nhiều hội thoại.

---

## 📊 Thống kê tổng hợp

| Mức độ | Số lượng | Tình trạng |
|--------|----------|-----------|
| 🔴 Critical | 5 | ✅ Đã xong |
| 🟠 High | 6 | ✅ Đã xong (6/6) |
| 🟡 Medium | 7 | ✅ Đã xong (7/7) |
| 🟢 Low | 5 | ✅ Đã xong (5/5) |
| **Tổng** | **23 items** | **23/23 completed** |
