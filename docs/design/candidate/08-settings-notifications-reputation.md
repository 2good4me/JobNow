# 📱 Candidate — C08: Settings, Notifications & Reputation

> **Actor:** Candidate  
> **Flow:** Cài đặt tài khoản | Thông báo | Điểm uy tín chi tiết  
> **Routes:** `/candidate/profile/settings.tsx`, `/candidate/notifications.tsx`, `/candidate/profile/reputation.tsx`

---

## PROMPT 1: Settings

```
You are a Senior Mobile UI/UX Designer. Design the "Settings" screen 
for JobNow mobile app — Candidate view.

**Design System:** Flat Design, Professional Minimalism.
- Colors: Primary #0F172A, CTA #0369A1, Danger #EF4444, BG #F8FAFC

**Screen Layout (375×812px):**

**Header:** Back arrow + "Cài đặt"

**Settings Groups (each group has a section header):**

Group 1 — "Tài khoản & Bảo mật":
- 🔒 "Đổi mật khẩu" → ChevronRight
- 📱 "Số điện thoại" → "091x.xxx.x89" + ChevronRight
- 📧 "Email" → "n...@gmail.com" + ChevronRight

Group 2 — "Thông báo":
- 🔔 "Push Notification" → Toggle switch (emerald when on)
- 📧 "Thông báo Email" → Toggle switch
- 💬 "Tin nhắn mới" → Toggle switch

Group 3 — "Giao diện":
- 🌙 "Chế độ tối" → Toggle switch
- 🌐 "Ngôn ngữ" → "Tiếng Việt" + ChevronRight

Group 4 — "Hỗ trợ":
- 📋 "Quyền riêng tư" → ChevronRight
- 📜 "Điều khoản sử dụng" → ChevronRight
- 🆘 "Trung tâm hỗ trợ" → ChevronRight
- ℹ️ "Về JobNow" → "v1.0.0"

Group 5 — "Vùng nguy hiểm" (bg-red-50, border-red-200 section):
- 🗑️ "Xóa tài khoản" (text-red-500) → ChevronRight
- Each item: h-56px, flex row, icon + text + right element, border-bottom

**Footer:**
- "Đăng xuất" button (text-red-500, outline, full-width, rounded-xl)
- "JobNow v1.0.0" centered text (slate-400, text-xs)

**Toggle switches:** 
- Off: bg-slate-200, circle-white
- On: bg-emerald-500, circle-white

Design as a settings page following iOS/Android native patterns.
```

---

## PROMPT 2: Notifications

```
You are a Senior Mobile UI/UX Designer. Design the "Notifications" screen 
for JobNow mobile app.

**Design System:** Flat Design, Professional Minimalism.
- Colors: Primary #0F172A, CTA #0369A1, BG #F8FAFC

**Screen Layout (375×812px):**

**Header:** "Thông báo" + "Đọc tất cả" text button (sky-700)

**Notification Categories Tabs:**
- "Tất cả" | "Ứng tuyển" | "Hệ thống"
- Horizontal scrollable tabs

**Notification Item:**
- Left: Icon circle (40×40px) — color-coded by type:
  - Application approved: emerald bg, CheckCircle
  - Application rejected: red bg, XCircle
  - New message: sky bg, MessageSquare
  - Payment: amber bg, Wallet
  - System: slate bg, Bell
- Middle: 
  - Title (Inter 500, 14px, #0F172A): "Đơn ứng tuyển đã được duyệt"
  - Body (Inter 400, 13px, #64748B): "NTD ABC đã duyệt đơn của bạn cho vị trí..."
  - Time (Inter 400, 12px, #94A3B8): "5 phút trước"
- Right: Blue dot (8px) for unread
- Unread state: bg-sky-50 full row
- Tap: navigate to relevant screen

**Empty State:**
- Bell illustration
- "Không có thông báo mới"

Design a clean timeline-style notification list.
```

---

## PROMPT 3: Reputation Score Detail

```
You are a Senior Mobile UI/UX Designer. Design the "Reputation Score" detail screen 
for JobNow mobile app — Candidate view.

**Design System:** Flat Design, Professional Minimalism.
- Colors: Primary #0F172A, CTA #0369A1, Success #10B981, BG #F8FAFC

**Screen Layout (375×812px):**

**Header:** Back arrow + "Điểm uy tín"

**Score Hero Card:**
- Large circular progress ring (120×120px), centered
- Score: "92" inside (Poppins 700, 40px)
- Label: "Xuất sắc" (emerald, below ring)
- Description: "Top 15% ứng viên trên JobNow"

**Score Breakdown (4 cards, 2×2 grid):**
- "Hoàn thành ca": 24/24 (100%) — emerald
- "Đúng giờ check-in": 22/24 (92%) — emerald
- "Tỷ lệ hủy": 0/24 (0%) — emerald
- "Đánh giá TB": ⭐ 4.7/5 — sky

**Score History Chart:**
- Simple line chart showing score over last 6 months
- X-axis: months, Y-axis: 0-100

**Rules Card:**
- "Cách tính điểm uy tín"
- List items with icons:
  - "+5 điểm: Hoàn thành ca và được đánh giá tốt"
  - "+2 điểm: Check-in đúng giờ"
  - "-10 điểm: Hủy ca sau khi được duyệt"
  - "-20 điểm: Không đến mà không báo"

Design as a gamification/achievement screen — motivate good behavior.
```
