# 📱 Candidate — C07: Review Employer + Wishlist + Employer Profile

> **Actor:** Candidate  
> **Flow:** Đánh giá NTD sau ca | Việc đã lưu | Xem hồ sơ NTD  
> **Routes:** Review (post-shift), `/candidate/wishlist.tsx`, `/candidate/employer/$employerId.tsx`

---

## PROMPT 1: Review Employer (Post-Shift)

```
You are a Senior Mobile UI/UX Designer. Design the "Review Employer" screen 
for JobNow mobile app — shown to Candidate after completing a shift.

**Design System:** Flat Design, Professional Minimalism.
- Colors: Primary #0F172A, CTA #0369A1, Accent #F59E0B, BG #F8FAFC

**Screen Layout (375×812px):**

**Header:** "Đánh giá nhà tuyển dụng"

**Context Card (top):**
- "Ca sáng 07:00-11:00 tại Quán ABC" 
- Employer avatar + name + date

**Star Rating (center, prominent):**
- Title: "Công việc hôm nay thế nào?"
- 5 large stars (40×40px each), interactive
- Tap to rate, filled stars = amber-400
- Rating label below: "1=Rất tệ ... 5=Tuyệt vời"

**Quick Review Tags (multi-select chips):**
- Positive (emerald outline): 
  "Trả lương đúng hẹn", "Sếp thân thiện", "Môi trường sạch sẽ", "Giờ giấc linh hoạt"
- Negative (red outline): 
  "Trả lương trễ", "Công việc nặng", "Giờ giấc gắt", "Thái độ không tốt"
- Selected state: filled bg + white text

**Comment Textarea:**
- Label: "Nhận xét thêm (không bắt buộc)"
- Textarea: rounded-xl, border-slate-200, min-h 100px
- Placeholder: "Chia sẻ trải nghiệm làm việc của bạn..."
- Character count: "0/500"

**Anonymous Toggle:**
- "Đánh giá ẩn danh" switch toggle

**Submit Button:**
- "Gửi đánh giá" full-width CTA (bg-sky-700, rounded-xl, h-48px)
- "Bỏ qua" text link below

Design warm and encouraging — make review feel rewarding, not burdensome.
```

---

## PROMPT 2: Wishlist (Saved Jobs)

```
You are a Senior Mobile UI/UX Designer. Design the "Saved Jobs / Wishlist" screen 
for JobNow mobile app — Candidate view.

**Design System:** Flat Design, Professional Minimalism.
- Colors: Primary #0F172A, CTA #0369A1, Danger #EF4444, BG #F8FAFC

**Screen Layout (375×812px):**

**Header:** "Việc đã lưu" + Heart icon (filled, red-500)

**Job Cards List:**
- Same Job Card design as Home screen but with:
  - Filled red heart icon (top-right) — tap to unsave
  - Job status indicator: "Đang tuyển" (emerald) or "Đã đóng" (slate, opacity-50)
  - Swipe-left to remove from wishlist (red bg with Trash icon)

**Empty State:**
- Heart illustration (outline)
- "Chưa có việc làm nào được lưu"
- "Bấm ❤️ trên các tin tuyển dụng để lưu lại"
- "Khám phá việc làm" CTA button

Design clean list with easy remove interaction.
```

---

## PROMPT 3: View Employer Profile

```
You are a Senior Mobile UI/UX Designer. Design the "Employer Profile" view screen 
for JobNow — seen by Candidate when tapping on employer name.

**Design System:** Flat Design, Professional Minimalism.
- Colors: Primary #0F172A, CTA #0369A1, Success #10B981, BG #F8FAFC

**Screen Layout (375×812px):**

**Header:** Back arrow + "Hồ sơ nhà tuyển dụng"

**Profile Section:**
- Logo/Avatar: 72×72px, rounded-xl
- Business name: Poppins 700, 20px
- Verified badge (if verified): Shield + "Đã xác thực" (emerald)
- Category: "F&B / Nhà hàng" (slate badge)
- Rating: ⭐ 4.5 (24 đánh giá) — tap to see reviews

**Stats Row (3 cards):**
- "12 tin đang tuyển" | "156 người đã thuê" | "⭐ 4.5"

**About Section:**
- "Giới thiệu": description text
- Address: MapPin icon + address text
- Phone: masked "091x.xxx.x89"

**Active Jobs Section:**
- "Đang tuyển" header + "Xem tất cả" link
- Horizontal scroll of Job Cards (compact version)

**Reviews Section:**
- "Đánh giá từ ứng viên" header
- Review cards: avatar + name + stars + comment + date

**Action Buttons (sticky bottom):**
- "Theo dõi" outline button (UserPlus icon) / "Đã theo dõi" (active state)
- "Nhắn tin" CTA button (MessageSquare icon)

Design as a business profile page — trustworthy and informative.
```
