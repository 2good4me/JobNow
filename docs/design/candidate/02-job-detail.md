# 📱 Candidate — C02: Job Detail & Shift Booking

> **Actor:** Candidate (Người tìm việc)  
> **Flow:** Xem chi tiết việc → Chọn ca → Ứng tuyển  
> **Route:** `/candidate/jobs/$jobId.tsx`

---

## Ngữ cảnh nghiệp vụ

Candidate tap vào Job Card → xem toàn bộ thông tin công việc. Có thể chọn ca làm việc cụ thể và gửi đơn ứng tuyển với cover letter. Employer sẽ nhận notification và duyệt/từ chối.

**Dữ liệu Firestore:**
- `jobs/{jobId}`: title, description, salary, salary_type, location, shifts[], requirements, employer_id, status, viewCount
- `users/{employer_id}`: full_name, avatar_url, verification_status, reputation_score, bio
- `applications`: kiểm tra candidate đã ứng tuyển job này chưa

---

## PROMPT cho Stitch MCP

```
You are a Senior Mobile UI/UX Designer. Design the "Job Detail & Shift Booking" screen 
for JobNow mobile app — Candidate view.

**Design System:** Flat Design, Professional Minimalism.
- Colors: Primary #0F172A, CTA #0369A1, Accent #F59E0B, Success #10B981, BG #F8FAFC
- Fonts: Poppins headings, Inter body. Cards: rounded-2xl, shadow-sm.
- Touch targets 44×44px. Icons: Lucide React only.

**Screen Layout (375×812px):**

**Header (Scrollable, collapses on scroll):**
- Cover image area (full-width, height 200px, rounded-b-3xl)
  - If no image: gradient placeholder #0F172A → #0369A1
- Floating back arrow (top-left, 40×40px circle, bg-white/80, backdrop-blur)
- Floating action buttons (top-right): Share icon + Bookmark/Heart icon
- Employer avatar (56×56px, rounded-xl, border-2 border-white) 
  — overlapping bottom of cover image

**Quick Info Section:**
- Job title: Poppins 700, 22px, #0F172A
- Employer name (tap to view profile) + Verified badge (if verified)
- Three stat cards in a row (equal width):
  | 💰 150.000đ/h | 📍 1.2 km | 🕐 Hôm nay |
  - Each: rounded-xl, bg-sky-50, p-3, centered
  - Icon (sky-700) + value (Poppins 600) + label (Inter 400, text-xs, slate-500)

**Job Description Section:**
- Section header: "Mô tả công việc" (Poppins 600, 16px)
- Description text: Inter 400, 14px, #475569, line-height 1.6
- "Xem thêm" expand link if text > 4 lines

**Requirements Section:**
- Section header: "Yêu cầu"
- Checklist items with CheckCircle icons (emerald-500):
  - "Có kinh nghiệm F&B"
  - "Ngoại hình gọn gàng"
  - "Đúng giờ, chăm chỉ"

**Shift Picker Section (CRITICAL INTERACTION):**
- Section header: "Chọn ca làm việc" + "Tối đa 1 ca"
- Date header: "📅 Thứ 2, 24/03/2026"
- Grid of shift cards (2 columns):
  - Each card: rounded-xl, border-2, p-4
  - Content: Shift name ("Ca sáng"), Time ("07:00 - 11:00"), Slots ("Còn 3/5 chỗ")
  - States:
    - Available: border-slate-200, bg-white → tap to select
    - Selected: border-sky-700, bg-sky-50, checkmark icon top-right
    - Full: border-slate-100, bg-slate-50, opacity-50, "Hết chỗ" red badge
  - Slot indicator: progress bar (emerald → amber → red as slots fill)

**Employer Info Card:**
- Horizontal card: Avatar + Name + Rating stars (⭐ 4.5) + "Xem hồ sơ →"
- Reputation score: circular progress (e.g., 92/100)
- Stats row: "24 tin đã đăng" | "156 ứng viên đã thuê"

**Cover Letter Input (expandable):**
- Textarea: "Viết lời nhắn cho nhà tuyển dụng (không bắt buộc)"
- rounded-xl, border-slate-200, min-height 80px
- Character count: "0/500"

**Sticky Bottom Action Bar:**
- Full-width bar, bg-white, shadow-t-lg, p-4, safe-area-bottom
- Left: Salary highlight "150K/h" (Poppins 700, sky-700, 20px)
- Right: "Ứng tuyển ngay" CTA button (bg-sky-700, text-white, rounded-xl, h-48px)
- If already applied: button changes to "Đã ứng tuyển" (bg-emerald-100, text-emerald-700, disabled)
- Warning tooltip above button: "⚠️ Hủy sau khi được duyệt sẽ bị trừ điểm uy tín"

**Chat FAB (floating):**
- Bottom-right above action bar: MessageSquare icon, 48×48px circle, bg-sky-700, shadow-md

Design production-ready. Focus on the shift picker interaction — this is the 
core booking mechanism similar to selecting time slots in a booking app.
```
