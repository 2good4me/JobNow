# 📱 Candidate — C06: Profile & eKYC

> **Actor:** Candidate  
> **Flow:** Xem hồ sơ → Chỉnh sửa → Xác thực eKYC  
> **Routes:** `/candidate/profile/index.tsx`, `/candidate/profile/edit.tsx`, `/candidate/verification/index.tsx`

---

## Ngữ cảnh nghiệp vụ

Candidate xem hồ sơ cá nhân (avatar, bio, skills, reputation score), chỉnh sửa thông tin, và thực hiện xác thực danh tính (eKYC) bằng CCCD/CMND + chân dung để được badge "Đã xác thực" → mở khóa Premium Jobs.

**Dữ liệu:** users (full_name, avatar_url, skills[], bio, reputation_score, verification_status), users_private/verification_requests

---

## PROMPT 1: Profile View

```
You are a Senior Mobile UI/UX Designer. Design the "Candidate Profile" view screen
for JobNow mobile app.

**Design System:** Flat Design, Professional Minimalism.
- Colors: Primary #0F172A, CTA #0369A1, Success #10B981, BG #F8FAFC
- Fonts: Poppins headings, Inter body.

**Screen Layout (375×812px):**

**Profile Header (top section, bg-white, pb-6):**
- Cover area: subtle gradient bg #F1F5F9 → #E2E8F0, height 100px
- Avatar: 80×80px, rounded-full, border-4 border-white, overlapping cover
  - "Verified" badge: small emerald circle with Check icon, bottom-right of avatar
  - If not verified: amber circle with AlertTriangle icon
- Name: Poppins 700, 22px, #0F172A
- Role badge: "Ứng viên" (rounded-full, bg-sky-50, text-sky-700, text-xs)
- "Chỉnh sửa hồ sơ" outline button (rounded-xl, border-sky-700)

**Reputation Score Card:**
- Card: rounded-2xl, bg-white, shadow-sm, p-4
- Left: Circular progress ring (72×72px)
  - Score: "92" (Poppins 700, 24px, inside circle)
  - Ring color: emerald (>80), amber (50-80), red (<50)
- Right: 
  - "Điểm uy tín" title
  - Progress description: "Xuất sắc — Top 15%"
  - Mini stats: "24 ca hoàn thành" | "0 lần hủy"

**eKYC Alert Card (if not verified):**
- Card: rounded-2xl, bg-amber-50, border border-amber-200, p-4
- Left: ShieldAlert icon (amber-600)
- Text: "Xác thực danh tính để mở khóa Premium Jobs"
- Button: "Xác thực ngay" (bg-amber-500, text-white, rounded-xl)

**Info Sections (vertical list):**
- Bio section: "Giới thiệu" + text content
- Skills: Tag chips (rounded-full, bg-sky-50, text-sky-700)
  - "Phục vụ", "Pha chế", "Bán hàng", "Giao hàng"
- Contact: Phone (masked: 091x.xxx.x89), Email

**Menu List:**
- Items with ChevronRight arrow:
  - 📋 "Đơn ứng tuyển" (badge: 3 pending)
  - ⏰ "Ca làm của tôi"
  - 💰 "Ví tiền" 
  - ❤️ "Việc đã lưu"
  - ⭐ "Điểm uy tín"
  - ⚙️ "Cài đặt"
- Each item: h-56px, border-bottom, icon (20px) + text + chevron

Design clean and scannable. Reputation score should be the visual highlight.
```

---

## PROMPT 2: Profile Edit

```
You are a Senior Mobile UI/UX Designer. Design the "Edit Profile" screen 
for JobNow mobile app — Candidate.

**Design System:** Flat Design, Professional Minimalism.
- Colors: Primary #0F172A, CTA #0369A1, BG #F8FAFC
- Form inputs: rounded-xl, border-slate-200, h-48px, focus:border-sky-500

**Screen Layout (375×812px):**

**Header:** Back arrow + "Chỉnh sửa hồ sơ" + "Lưu" text button (sky-700)

**Avatar Section:**
- Avatar 80×80px centered + Camera icon overlay button
- "Thay đổi ảnh đại diện" text link below

**Form Sections:**

Section 1 — "Thông tin cá nhân":
- Họ và tên (*): text input, pre-filled
- Email: text input
- Ngày sinh: date picker input (CalendarDays icon)
- Giới tính: segmented control "Nam" | "Nữ" | "Khác"

Section 2 — "Giới thiệu":
- Bio textarea: rounded-xl, min-h 100px, character count "45/300"

Section 3 — "Kỹ năng":
- Current skills as removable chips (X button)
- "+ Thêm kỹ năng" button → opens skill picker BottomSheet
- Suggested skills grid in sheet

Section 4 — "Kinh nghiệm làm việc":
- List of experience entries (editable cards)
- "+ Thêm kinh nghiệm" button

**Validation:** Inline error messages (red text, 12px) below invalid fields.
**Sticky bottom:** "Lưu thay đổi" full-width CTA button

Design a clean, form-focused screen with proper validation states.
```

---

## PROMPT 3: eKYC Verification Flow

```
You are a Senior Mobile UI/UX Designer. Design the "eKYC Identity Verification" flow
for JobNow mobile app — Candidate.

**Design System:** Flat Design, Professional Minimalism.
- Colors: Primary #0F172A, CTA #0369A1, Success #10B981, BG #F8FAFC

**This is a 3-step wizard flow:**

**Progress Bar:** 3 steps at top, connected by line
- Step 1: "Chụp CCCD" | Step 2: "Chụp chân dung" | Step 3: "Kết quả"
- Active step: sky-700 circle + bold text
- Completed: emerald circle with Check
- Future: slate-300 circle

**Step 1 — ID Card Photo:**
- Title: "Chụp mặt trước CCCD/CMND"
- Large camera viewfinder (280×180px) with ID card overlay frame
- Guide dots at card corners
- Instructions: "Đặt CCCD/CMND trong khung và chụp rõ nét"
- Tips list: "Đủ ánh sáng" | "Không bị mờ" | "Thấy rõ 4 góc"
- "Chụp ảnh" large circle button (64×64px, bg-sky-700, Camera icon)
- After capture: Preview + "Chụp lại" | "Tiếp tục" buttons

**Step 2 — Portrait/Selfie:**
- Title: "Chụp ảnh chân dung"
- Circular camera viewfinder (240×240px) with face outline
- Face detection guide: "Đưa khuôn mặt vào vùng tròn"
- Liveness check: "Vui lòng nháy mắt" instruction
- Same capture + review pattern

**Step 3 — Processing & Result:**
- Loading state: Scanning animation + "Đang xác thực..." 
- OCR extracted info preview:
  - Họ tên: "Nguyễn Văn A"
  - Số CCCD: "0012345xxxxx"
  - Ngày sinh: "01/01/1995"
- Confirm: "Thông tin đúng" button
- Result states:
  - SUCCESS: Large emerald CheckCircle + "Xác thực thành công!" 
    + "Hồ sơ của bạn đã được xác thực" + "Về trang chủ" button
  - PENDING: Amber Clock + "Đang chờ duyệt" + "Hồ sơ sẽ được xác nhận trong 24h"
  - REJECTED: Red XCircle + rejection reason + "Thử lại" button

Design this as a trust-building flow. Clean, guided steps with clear visual cues.
```
