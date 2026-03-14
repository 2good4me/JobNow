# 📋 BÁO CÁO CÁC PHẦN CẦN SỬA – Employer Interface

> **Ngày:** 13/03/2026 | **Phạm vi:** `/employer/*`

---

## 🔴 CRITICAL – Phải sửa ngay


### 2. Wallet: Nạp tiền chỉ là alert()
- **File:** `routes/employer/wallet.tsx` dòng 72
- **Vấn đề:** `alert('Tính năng nạp tiền đang phát triển')` – không có logic thực
- **Hướng sửa:** Tạo bottom sheet chọn phương thức thanh toán hoặc trang nạp tiền riêng (DONE ✅)

### 3. Wallet: Rút tiền chỉ là alert()
- **File:** `routes/employer/wallet.tsx` dòng 79
- **Vấn đề:** `alert('Tính năng rút tiền đang phát triển')` – không có logic thực
- **Hướng sửa:** Tạo form rút tiền với xác nhận OTP/mật khẩu (DONE ✅)

### 5. "Sửa tin" trên Job List chỉ là toast placeholder
- **File:** `routes/employer/job-list.tsx` dòng 162
- **Vấn đề:** `toast.info('Tính năng Sửa tin đang được phát triển')` – trong khi Post Job đã hỗ trợ `editJobId`
- **Hướng sửa:** Đổi thành `navigate({ to: '/employer/post-job', search: { editJobId: job.id } })` (DONE ✅)

---

## 🟠 HIGH – Nên sửa sớm

### 6. Search button trên Job List không hoạt động
- **File:** `routes/employer/job-list.tsx` dòng 187-189
- **Vấn đề:** Button Search icon không có `onClick` handler
- **Hướng sửa:** Thêm search input slide-down hoặc filter by keyword (DONE ✅)

### 7. viewCount luôn = 0
- **File:** `routes/employer/job-list.tsx` dòng 235
- **Vấn đề:** `(job as any).viewCount || 0` – chưa có tracking lượt xem
- **Hướng sửa:** Tạo Firestore counter increment khi candidate xem job detail (DONE ✅)

### 8. "Lượt xem" trên Job Detail hardcoded "—"
- **File:** `routes/employer/job-detail.tsx` dòng 346
- **Vấn đề:** Luôn hiển thị "—" cho số lượt xem
- **Hướng sửa:** Lấy `viewCount` từ job document (cần implement task #7 trước) (DONE ✅)

### 9. Gender display hardcoded "Cả hai"
- **File:** `routes/employer/job-detail.tsx` dòng 257
- **Vấn đề:** Luôn hiển thị "Cả hai" thay vì lấy từ `job.genderPreference`
- **Hướng sửa:** Map `job.genderPreference` → "Nam" | "Nữ" | "Cả hai" (DONE ✅)

### 10. Dashboard `onViewAll` callback trống
- **File:** `routes/employer/index.tsx` dòng 158
- **Vấn đề:** `onViewAll={() => { }}` – bấm "Xem tất cả" không điều hướng
- **Hướng sửa:** `onViewAll={() => navigate({ to: '/employer/job-list' })}` (DONE ✅)

### 11. Shift Management thiếu attendance tracking
- **File:** `routes/employer/shift-management.tsx`
- **Vấn đề:** Không hiển thị danh sách NV đã check-in/check-out cho mỗi ca, không có trạng thái realtime
- **Hướng sửa:** Query attendance records, hiển thị danh sách NV với thời gian check-in/out, GPS (DONE ✅)

### 12. Applicant search filter sai field
- **File:** `routes/employer/applicants.tsx` dòng 150
- **Vấn đề:** Filter dùng `candidateId` thay vì `candidateName` – user gõ tên nhưng so sánh với ID
- **Hướng sửa:** Đổi filter sang `candidateName.toLowerCase().includes(search)` (DONE ✅)

---

## 🟡 MEDIUM – Cần cải thiện

### 13. Error handling dùng alert() thay vì toast (DONE ✅)
- **File:** `routes/employer/profile/edit.tsx` dòng 41, 58
- **Vấn đề:** Logo upload error và profile update error dùng `alert()` – UX kém
- **Hướng sửa:** Đổi thành `toast.error('Lỗi khi tải lên logo')`

### 14. Bell button trên Profile không có handler (DONE ✅)
- **File:** `routes/employer/profile/index.tsx` dòng 129
- **Vấn đề:** Nút chuông notification chỉ render, không có `onClick`
- **Hướng sửa:** `onClick={() => navigate({ to: '/employer/notifications' })}`

### 15. Achievement badges hardcoded (DONE ✅)
- **File:** `routes/employer/profile/index.tsx` dòng 251
- **Vấn đề:** Dùng `PREDEFINED_ACHIEVEMENTS` constant, không lấy từ user data
- **Hướng sửa:** Query achievements đã unlock từ Firestore user profile (DONE ✅)

### 16. Dark mode toggle không hoạt động thực (DONE ✅)
- **File:** `routes/employer/profile/settings/index.tsx` dòng 25
- **Vấn đề:** `isDarkMode` chỉ là local state, không apply CSS theme
- **Hướng sửa:** Implement CSS custom properties + localStorage persist + class trên `<html>`

### 17. Language selector không hoạt động thực (DONE ✅)
- **File:** `routes/employer/profile/settings/index.tsx` dòng 29
- **Vấn đề:** `selectedLanguage` chỉ là local state, chưa tích hợp i18n
- **Hướng sửa:** Tích hợp react-i18next, persist vào user settings

### 18. Notification toggles không persist (DONE ✅)
- **File:** `routes/employer/profile/settings/index.tsx` dòng 26-27
- **Vấn đề:** Push/Email toggles chỉ là local state, reload mất
- **Hướng sửa:** Lưu preferences vào Firestore user document (DONE ✅)

### 19. Shift status hardcoded "Đang mở" (DONE ✅)
- **File:** `routes/employer/shift-management.tsx` dòng 142
- **Vấn đề:** Tất cả shifts luôn hiện `✅ Đang mở`, không có trạng thái thực
- **Hướng sửa:** Tính trạng thái dựa trên thời gian hiện tại vs startTime/endTime

### 20. Categories post-job hardcode 4 mục (DONE ✅)
- **File:** `routes/employer/post-job.tsx` dòng 43
- **Vấn đề:** Chỉ có `['F&B Service', 'Retail', 'Delivery', 'Event Helper']`
- **Hướng sửa:** Lấy danh mục từ Firestore collection `categories` hoặc mở rộng list (DONE ✅)

### 21. Job List thiếu max-w container trên desktop (DONE ✅)
- **File:** `routes/employer/job-list.tsx`
- **Vấn đề:** Tương tự Dashboard, content giãn rộng trên desktop
- **Hướng sửa:** Thêm `max-w-lg mx-auto` wrapper

### 22. Thiếu FAB "Tạo tin mới" (DONE ✅)
- **File:** `routes/employer/job-list.tsx` + `routes/employer/index.tsx`
- **Vấn đề:** Không có floating action button khi đã có jobs – chỉ có CTA trong empty state
- **Hướng sửa:** Thêm FAB cố định góc dưới phải: `+ Tạo tin`

### 23. Profile Edit thiếu validation form (DONE ✅)
- **File:** `routes/employer/profile/edit.tsx`
- **Vấn đề:** Không validate format SĐT, URL website, MST
- **Hướng sửa:** Thêm Zod schema validation trước khi submit

### 24. Emoji checkmark thay vì SVG icon (DONE ✅)
- **File:** `routes/employer/job-detail.tsx` dòng 417
- **Vấn đề:** Requirements list dùng `✓` text emoji thay vì Lucide icon
- **Hướng sửa:** Dùng `<CheckCircle2 className="w-4 h-4 text-emerald-500" />`

---

## 🟢 LOW – Nice to have

### 25. Batch approve ứng viên
- Checkbox multi-select + nút "Duyệt tất cả" trên trang Applicants

### 26. Sort applicants
- Sắp xếp ứng viên theo ngày ứng tuyển, rating, tên

### 27. Multi-image upload cho Post Job
- Cho phép upload tối đa 5 ảnh thay vì chỉ 1 cover image

### 28. Draft/autosave khi đăng tin
- Lưu nháp form post-job vào localStorage để khôi phục khi reload

### 29. Job duplication
- Nhân bản tin đăng cũ với 1 click để tiết kiệm thời gian

### 30. Export CSV danh sách ứng viên
- Xuất file CSV/Excel danh sách ứng viên cho từng job

### 31. Calendar view cho shifts
- Hiển thị ca làm theo lịch biểu trực quan thay vì list đơn giản

### 32. Employer analytics dashboard
- Mini charts: lượt xem theo tuần, tỷ lệ chuyển đổi, ứng tuyển per job

### 33. Share link trên Job Detail
- Job Detail thiếu nút Share (có trên Job List nhưng thiếu ở Detail page)

### 34. Push Notification (FCM) tích hợp thực
- Toggle setting có nhưng chưa có Firebase Cloud Messaging integration

### 35. Tích hợp Payment Gateway
- VNPay / Momo / ZaloPay cho chức năng nạp/rút tiền Wallet

---

## 📊 Thống kê tổng hợp

| Mức độ | Số lượng | Tình trạng |
|--------|----------|-----------|
| 🔴 Critical | 5 | Phải xử lý Sprint 1 |
| 🟠 High | 7 | Nên làm Sprint 1-2 |
| 🟡 Medium | 12 | Sprint 2-3 |
| 🟢 Low | 11 | Backlog |
| **Tổng** | **35 items** | |

