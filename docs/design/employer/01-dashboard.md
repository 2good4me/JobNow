# 📱 Employer — E01: Dashboard

> **Actor:** Employer (Nhà tuyển dụng)  
> **Flow:** Tổng quan sau đăng nhập — Xem KPI, nhân viên, tin đăng gần đây  
> **Route:** `/employer/index.tsx`

---

## Ngữ cảnh nghiệp vụ

Đây là màn hình chính của Employer. Hiển thị tổng quan: số tin đang tuyển, ứng viên chờ duyệt, chi phí hôm nay, nhân viên đang làm (realtime). Quick actions dẫn đến các chức năng chính.

**Dữ liệu Firestore:**
- `jobs` (employer_id = current user, status = OPEN): count, titles
- `applications` (employer_id, status = PENDING): count
- `applications` (status = CHECKED_IN): live staff
- `users/{uid}`: balance

---

## PROMPT cho Stitch MCP

```
You are a Senior Mobile UI/UX Designer. Design the "Employer Dashboard" screen 
for JobNow mobile app — Employer view.

**Design System:** Flat Design, Professional Minimalism.
- Colors: Primary #0F172A, CTA #0369A1, Success #10B981, 
  Accent #F59E0B, Danger #EF4444, BG #F8FAFC
- Fonts: Poppins headings, Inter body. Cards: rounded-2xl, shadow-sm.
- Icons: Lucide React only. Touch targets 44×44px.

**Screen Layout (375×812px):**

**Top Header:**
- Left: "Xin chào, {businessName}!" (Poppins 600, 18px)
- Right: Bell icon (notification, badge dot if unread) + Avatar (36×36px, rounded-full)

**Stats Cards — Bento Grid (2×2):**
- Card style: rounded-2xl, bg-white, shadow-sm, p-4
1. "Tin đang tuyển": "5" (Poppins 700, 28px, sky-700) + Briefcase icon (sky-100 circle)
2. "Ứng viên chờ duyệt": "12" (amber-600) + Users icon (amber-100 circle)
   - Badge: red dot if > 0
3. "Chi phí hôm nay": "1.200.000đ" (slate-700) + DollarSign icon (emerald-100)
4. "Số dư ví": "5.000.000đ" (emerald-600) + Wallet icon
   - "Nạp tiền" link text below

**Live Monitor Card:**
- Card: rounded-2xl, bg-sky-50, border border-sky-200, p-4
- Title: "Nhân viên đang làm" + live pulse dot (green)
- Staff list (max 3 shown):
  - Avatar (32×32) + Name + "Check-in 07:02" timestamp + Job title
- "Xem tất cả ({n})" link if more than 3

**Quick Actions Grid (2×2):**
- Large icon buttons, 48×48px icon in colored circle
- Each: rounded-2xl, bg-white, shadow-sm, p-4, centered
1. ➕ "Đăng tin mới" (sky icon bg) → /employer/post-job
2. 📷 "Quét điểm danh" (emerald icon bg) → QR scanner
3. 📊 "Báo cáo" (amber icon bg) → /employer/reports
4. 🏪 "Quản lý cửa hàng" (slate icon bg) → /employer/profile

**Recent Jobs Section:**
- Header: "Tin đăng gần đây" + "Xem tất cả" link (→ /employer/job-list)
- Horizontal scroll of compact job cards:
  - Title + Status badge (OPEN/FULL/CLOSED) + Applicant count
  - Width: 260px each, rounded-xl

**FAB Button:**
- Bottom-right floating: "+" icon, 56×56px circle, bg-sky-700, shadow-lg
- Tap → /employer/post-job

Design as an executive dashboard — clean, data-driven, actionable.
Quick access to critical actions without scrolling.
```
