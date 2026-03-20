# BÁO CÁO AUDIT DỰ ÁN JOBNOW
**Thực hiện bởi:** Senior System Architect & Lead Business Analyst

Sau khi đối chiếu hệ thống tài liệu đồ sộ (`document/Chien_Luoc_Va_Giai_Phap`) và mã nguồn thực tế (`packages/types`, `apps/functions`, `apps/api`, `firestore.rules`), tôi xin gửi đến Founder báo cáo Audit toàn diện nhằm đưa JobNow đạt chuẩn Production-Ready.

---

## PHẦN 1: GAP ANALYSIS (TÀI LIỆU YÊU CẦU VS. CODE THỰC TẾ)

| Tính năng yêu cầu trong Docs | Thực trạng trong Code | Mức độ lệch (Gap) |
| :--- | :--- | :--- |
| **Cấu trúc dữ liệu Ca làm việc:** `CA_LAM_VIEC` là bảng độc lập (ERD). | **Sai lệch hoàn toàn:** Trong `job.ts`, `shifts` đang bị nhét thành mảng (array) `JobDoc.shifts` và `JobDoc.shift_capacity`. | 🔴 Nghiêm trọng |
| **Chống tài khoản ảo (Tiering):** Tài khoản chưa KYC chỉ được có 1 Ca Active, các ca lặp lại (T3-T6) bị khóa `LOCKED_TIER_1`. | **Chưa làm:** Schema `ShiftData` thậm chí CÒN KHÔNG CÓ trường `status`. `job.service.ts` cho phép tạo luôn N ca cùng lúc. | 🔴 Nghiêm trọng |
| **Xử lý hủy ca (Auto-fill & URGENT):** Hủy ca đột xuất hệ thống sẽ gắn cờ URGENT, đẩy Push Notification bán kính 3km. | **Chưa làm:** Trong `withdrawApplication` (Firebase Functions) chỉ đơn thuần đổi trạng thái Application thành `CANCELLED` và trả lại số lượng (`remaining_slots++`). Không hề có event push notification hay URGENT flag cấp cứu. | 🟡 Trung bình |
| **Chế tài xử phạt hủy ca:** Trừ `Trust Score` (2đ, 10đ, 30đ + Ban) tùy theo thời gian trước ca làm. | **Chưa làm:** Không có bất kỳ dòng code nào trừ điểm uy tín (`reputation_score`) của Candidate khi gọi hàm rút đơn. | 🔴 Nghiêm trọng |
| **Check-in thủ công kèm GPS:** Chỉ cho check-in nếu sai số `< 100m`. | **Đã làm:** Hàm `checkIn` (Functions) tính chính xác khoảng cách (`haversineDistanceMeters`) và chặn nếu vuợt `checkin_radius_m`. Khá mượt mà đúng Docs. | 🟢 Hoàn thiện |

---

## PHẦN 2: LOGIC INCONSISTENCIES (CÁC LỖ HỔNG & LỖI LOGIC)

### 1. Lỗ hổng Trục lợi Tài chính (Infinite Money Bug) trong `firestore.rules`:
*   **File:** `firestore.rules` (dòng 31-35)
```javascript
allow update: if isOwner(userId) || (
  isSignedIn() && (
    request.resource.data.diff(resource.data).affectedKeys().hasAny(['average_rating', 'total_ratings', 'updated_at', 'updatedAt', 'balance'])
  )
);
```
*   **Lỗi chí mạng:** 
    1. `isOwner(userId)` KHÔNG CHẶN user sửa các field nhạy cảm. Một ứng viên bất kỳ có thể gọi DB từ client, set `balance = 9999999`, `reputation_score = 100` và `role = ADMIN`.
    2. Dùng sai hàm logic: `hasAny` thay vì `hasOnly`. Đoạn rule trên cho phép *Bất kỳ user nào đang đăng nhập* cũng có thể đổi tiền (`balance`) của *Bất kỳ user nào khác*. Lỗ hổng tài chính thảm họa cực kỳ nghiêm trọng.

### 2. Tiền một nơi, Ví một nẻo (VNPAY IPN Mismatch):
*   **File:** `apps/api/src/controllers/vnpay.controller.ts` (dòng 79)
*   **Lỗi logic:** Webhook VNPAY đang cộng tiền vào collection `wallets` (`db.collection('wallets').doc(userId)`). TUY NHIÊN, toàn bộ schema backend (`packages/types/src/user.ts`) lại định nghĩa ví tiền nằm tại `User.balance` trong collection `users`! Điều này dẫn đến việc nạp tiền báo thành công vạn lần, nhưng số dư trong app user vĩnh viễn là 0.

### 3. Spam Job từ Frontend:
*   **File:** `firestore.rules` (dòng 75)
*   **Lỗi logic:** Lỗ hổng cho phép Client tự do tạo trực tiếp Jobs vào DB (`allow create: if ... isValidJobCreate()`). Kết hợp việc Backend API (`job.controller.ts`) cũng có router `createJob`, gây ra rủi ro rất cao. Khi cho phép client tự do tạo Job qua client SDK, bạn sẽ không móc nối được các logic như kiểm tra Anti-spam hay Push Notification, và hacker dễ dàng spam nghẽn hệ thống.

---

## PHẦN 3: TECHNICAL DEBT & IMPROVEMENT

### 1. Tái cấu trúc Schema `CA_LAM_VIEC`:
*   **Nợ kĩ thuật (Tech Debt):** Đang thiết kế kiểu NoSQL "nhét chung" (Embed) `shifts` vào mảng của document `jobs`. Cấu trúc này làm tê liệt hoàn toàn các tính năng truy vấn. VD: *"Tìm TẤT CẢ các ca làm việc trống vào sáng Thứ 3 tuần sau trên toàn bản đồ"*. Firestore KHÔNG THỂ query sâu vào phần tử mảng của Collection một cách tối ưu.
*   **Giải pháp (Improvement):** Tuân thủ tuyệt đối cấu trúc mà bạn đã thiết kế trong ERD (`JobNow_ERD_Mermaid.md`). Tách `shifts` xuất thành Root Collection `shifts` (hoặc subcollection `jobs/{id}/shifts`). Thêm trường `status: OPEN | LOCKED_TIER_1 | FULL` cho TỪNG CA LÀM (Shift) để giải quyết bài toán hiển thị Nhỏ Giọt của Account Tier 1.

### 2. Nguyên tắc "Chỉ đọc từ Client, Viết qua Backend API/Functions":
*   Tuyệt đối cấm Client cập nhật các trạng thái quan trọng thông qua Client-SDK. Viết lại `firestore.rules` ở hầu hết collection thành: `allow write: if false;` (Hoặc chỉ cho update thông tin cá nhân cơ bản như Avatar, tên, phone).
*   Mọi hành động: `Tạo Job`, `Ứng tuyển`, `Hủy Ca`, `Check-in`, `Nạp Tiền` bắt buộc phải thông qua API Server hoặc Firebase Functions Callables. Nếu để lỏng, nền tảng sẽ mất kiểm soát hoàn toàn.

---

## PHẦN 4: ACTION PLAN (KẾ HOẠCH HÀNH ĐỘNG KHẮC PHỤC)

### 🔥 Ưu tiên Cao (Cần vá ngay lập tức để bảo vệ DB & Doanh thu)
1. **Sửa ngay `firestore.rules`:** Chặn đứng việc User tự đổi `role`, `balance`, `reputation_score`. Update đoạn mã ở dòng 31 thành `hasOnly` cho các field review, và cấm update `role`, `balance` từ client. 
2. **Đồng bộ Ví Tiền:** Cập nhật file `vnpay.controller.ts`, sửa logic ghi nhận ví tiền từ collection `wallets` sang update trực tiếp field `balance` vào đúng `db.collection('users').doc(userId)`. 
3. **Sửa lỗi hàm `withdrawApplication`:** Bổ sung logic chấm điểm răn đe. Trừ `reputation_score` (2đ, 10đ, 30đ) của Candidate tuỳ thuộc vào thời gian hủy so với giờ bắt đầu ca làm việc. 

### ⚡ Ưu tiên Trung bình (Hoàn thiện chức năng Tier/Anti-spam)
4. **Tách rời mảng `shifts` ra khỏi DB `jobs`:** Database Migration: Tạo collection `shifts` độc lập, thêm trường `status`. Thay đổi lại logic `job.service.ts` và API tìm kiếm lân cận.
5. **Implement Tier Logic vào API Tạo Job (`createJob`):** Kiểm tra `verification_status` của Employer. Nếu là `UNVERIFIED`: đánh dấu `LOCKED_TIER_1` cho các ca thứ 2 trở đi.

### 🧹 Ưu tiên Thấp (Enhancements & Features)
6. Bổ sung tính năng Cấp cứu **Auto-fill & URGENT**: Tại Cloud Function `withdrawApplication`, khi một ứng viên hủy ca sát giờ làm, kích hoạt trigger update trạng thái Shift về `OPEN`, bật cờ `is_urgent = true` và gọi Cloud Task/PubSub bắn Push Notification khẩn cấp cho các ứng viên trong vòng bán kính 3km để tìm ứng viên thay thế ngay lập tức.

---
*Dành cho Founder review - Phân tích dựa trên tài liệu kiến trúc JobNow.*
