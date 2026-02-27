## Project: Lập Trình Ứng Dụng GPS JobNow (MVP Version)

**Goal (Mục tiêu)**: Xây dựng hoàn thiện ứng dụng GPS JobNow phiên bản MVP (Minimum Viable Product) dựa trên toàn bộ Business Logic và Kịch bản rẽ nhánh đã chốt, đảm bảo ứng viên đi làm check-in bằng GPS thủ công và quán nhận nhân sự mượt mà không cần nạp tiền cọc.
**Timeline (Thời lượng dự kiến)**: 8 Tuần.
**Team (Nhân sự)**: 1 Product Manager (Bạn), 1 Backend Dev, 1 Frontend App Dev (hoặc 1 Fullstack nếu dùng Flutter/React Native & Firebase/Supabase).
**Constraints (Ràng buộc)**: Tập trung tuyệt đối vào tính năng Local Job (GPS 100m). Không code Remote Job. Không code cổng thanh toán Payment Gateway ở Phase 1 (Chỉ ghi nhận Nợ trên Backend).

---

## 📍 MILESTONES (Cột Mốc Quan Trọng)

| # | Milestone | Target Date | Owner | Success Criteria (Tiêu chí Hoàn thành) |
|---|-----------|-------------|-------|------------------|
| 1 | Database & Auth Ready | Hết Tuần 2 | Backend Dev | Khởi tạo xong DB Schema, APIs đăng nhập OTP và phân quyền (Guest/Candidate/Tier 1/Tier 2). |
| 2 | Core Matching Engine | Hết Tuần 5 | Full Team | Ứng viên lướt Map thấy Job, bấm Apply. Employer nhận Push Noti và bấm Duyệt. |
| 3 | Core Location & Penalty | Hết Tuần 7 | Full Team | Mở App bấm Check-in (Khớp GPS <100m). Các kịch bản trừ điểm Uy tín (Cron Job) chạy mượt mà. |
| 4 | Launch Beta MVP | Hết Tuần 8 | PM / Devs | Đưa App lên TestFlight (iOS) / App Tester (Android) cho 20 users thật xài thử bùng ca các kiểu. |

---

## 🛠️ WORK BREAKDOWN STRUCTURE (WBS) - PHÂN RÃ CÔNG VIỆC

### Phase 1: Nền Móng Database & Tài Khoản (Tuần 1-2)

| Task | Effort | Owner | Depends On | Khái quát công việc |
|------|--------|-------|------------|---------------|
| Thiết kế Database (ERD) | 8h | Backend | Master Blueprint | Sắp xếp lại bảng Users, Stores, Jobs, Trust_Score_Logs, Banned_Devices. |
| API Xác thực OTP & JWT | 16h | Backend | DB Schema | Code luồng Login bằng số điện thoại. Gen Token. |
| Setup Frontend Architecture | 8h | Frontend | - | Dựng base code (React Native/Flutter), setup Redux/Zustand, Routing. |
| UI/API Cập nhật Profile Candidate | 12h | Fullstack | Login API | Màn hình điền Tên, Tuổi, Hình thật. Khởi tạo Trust Score = 100. |
| UI/API Đăng ký Cửa Hàng (Tier 1) | 16h | Fullstack | Login API | Màn hình chụp "Ảnh Mặt Tiền". Setup UUID Device thu thập ngầm. |
| API Phân Quyền (Tier) | 8h | Backend | Store Profile | Viết logic check Tier 1 vs Tier 2 để giới hạn quyền lực. |

**Total Effort Phase 1**: 68 hours (~ 1.5 tuần / dev)

---

### Phase 2: Lõi Đăng Việc & Tìm Việc (Tuần 3-5)
*Đây là trái tim của ứng dụng, tiêu tốn nhiều chất xám UI nhất.*

| Task | Effort | Owner | Depends On | Khái quát công việc |
|------|--------|-------|------------|---------------|
| UI/API Đăng Ca Làm Việc | 24h | Fullstack | Phase 1 | Form đăng ca. Nặng nhất: Logic bắt chọn Checkbox (T2-T6) sinh ra Multiple Records. Chặn 1 Ca đối với Tier 1. |
| Tích hợp Google Maps (Frontend) | 16h | Frontend | Phase 1 | Render bản đồ, cắm Pin (đốm sáng) theo tọa độ Cửa hàng có Job Active. |
| UI/API Chi Tiết Job & Apply | 16h | Fullstack | Maps UI | Mở Pin lên thấy Ảnh mặt tiền bự. Bấm "Ứng Tuyển". Chuyển Card sang `APPLIED_WAITING`. |
| API Thông báo Push Notification | 16h | Backend | - | Tích hợp Firebase Cloud Messaging (FCM). Hú Employer khi có thằng nộp đơn. |
| UI/API Quản lý Ứng Viên (Employer) | 20h | Fullstack | Apply API | Danh sách ứng viên. Bấm nút "Phê Duyệt". |
| Logic Rẽ Nhánh Auto-Reject | 8h | Backend | Approve API | Khi Employer duyệt 1 người, tự động Reject n người còn lại và bắn Push Noti chia buồn. |

**Total Effort Phase 2**: 100 hours (~ 2.5 tuần / dev)

---

### Phase 3: Điểm Danh Bằng Vị Trí & Hệ Thống Trừng Phạt (Tuần 6-7)
*Tính năng quan trọng nhất quyết định yếu tố "GPS" của App.*

| Task | Effort | Owner | Depends On | Khái quát công việc |
|------|--------|-------|------------|---------------|
| Get Foreground Location (Native) | 16h | Frontend | Phase 2 | Code xin quyền `While in Use`. Lấy Vĩ độ/Kinh độ lúc người dùng bấm nút [CHECK-IN]. |
| API So sánh Bán Kính (Haversine) | 8h | Backend | Get Location | Viết thuật toán đo khoảng cách Client vs Store. Trả về True (<100m) hoặc False. |
| UI Fallback Code QR | 16h | Fullstack | - | Mã QR động trên máy Cửa Hàng. Nút Quét QR quét trúng thì Bypass GPS thành Check-in. |
| UI/API Nút [HỦY CA] & [TRỪ ĐIỂM] | 16h | Fullstack | Phase 2 | Ứng viên tự hủy hoặc Quán Hủy vô cớ -> Kích hoạt lệnh chém 30 Điểm Uy Tín. |
| Luồng Kỷ Luật Shadow Ban | 12h | Backend | Khởi tạo Log | Nếu Điểm < 50: Nhét UUID vào sổ đen. Đánh cờ `hidden = true` cho mọi Job đăng sau này. |
| Worker Chạy Đêm (Node-Cron / Hangfire) | 16h | Backend | - | Code Bot 00:00 quét DB: Phạt 50 điểm đứa No-show. Tính Ghi Nợ 5.000đ/Job cho Quán. Xóa ca treo. |

**Total Effort Phase 3**: 84 hours (~ 2 tuần / dev)

---

### Phase 4: Kiểm Thử & Vá Lỗi (Tuần 8)

| Task | Effort | Owner | Depends On | Khái quát công việc |
|------|--------|-------|------------|---------------|
| Bug bash nội bộ | 16h | PM/Devs | Toàn bộ | Test chặn 1 ca. Test quét Map lỗi. Test trừ điểm. |
| Tối ưu UX/UI Khung Avatar (Pro-Hunter) | 8h | Frontend | Phase 2 | Vẽ lấp lánh cho bọn mua VIP. (Mock data trước, tính năng thanh toán làm sau). |
| Triển khai TestFlight / Apk | 8h | Fullstack | Bug bash | Đóng gói App gửi lên Store (dưới dạng Beta nội bộ). |

---

## ⚠️ RISKS & MITIGATION (Quản Trị Rủi Ro Lập Trình)

| Risk (Rủi ro) | Impact (Hậu quả) | Xác suất | Mitigation (Biện pháp phòng ngừa) |
|------|--------|-------------|------------|
| Google/Apple từ chối quyền Vị Trí | Chí mạng | Medium | Ghi RÕ RÀNG lý do trong màn hình xin quyền: "Dùng để so khớp điểm danh tại chỗ". Luôn có chức năng QR tĩnh dự phòng. |
| Thuật toán sinh Multi-Ca làm việc bị đúp data | Nặng | Medium | Back-end phải Validate kĩ biến Timestamp mảng T2-T6, dùng Transaction lúc lưu Data. |
| Push Notification dội bom rớt Firebase | Nặng | Low | Rate limit: Chỉ bắn Push lúc Ứng tuyển và lúc Hủy ca/Duyệt ca. Không bắn lặt vặt. |

---
*Created by: AI Project Planner - JobNow Project*
