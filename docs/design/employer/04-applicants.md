# 📱 Employer — E04: Applicant Management

> **Actor:** Employer  
> **Flow:** Duyệt ứng viên → Xem hồ sơ → Approve/Reject  
> **Routes:** `/employer/applicants.tsx`, `/employer/candidate.$candidateId.tsx`

---

## Ngữ cảnh nghiệp vụ

Employer xem danh sách ứng viên cho từng job, lọc theo trạng thái, xem hồ sơ chi tiết, duyệt hoặc từ chối. Khi duyệt → candidate nhận notification.

---

## PROMPT 1: Applicant List

```
You are a Senior Mobile UI/UX Designer. Design the "Applicant Management" screen
for JobNow mobile app — Employer view.

**Design System:** Flat Design, Professional Minimalism.
- Colors: Primary #0F172A, CTA #0369A1, Success #10B981, 
  Danger #EF4444, BG #F8FAFC

**Screen Layout (375×812px):**

**Header:** Back arrow + "Ứng viên" + Filter icon

**Job Context Bar:**
- Mini card: Job title + Status badge + "8 ứng viên"

**Filter Tabs:**
- "Chờ duyệt (3)" | "Đã nhận (5)" | "Từ chối (0)"
- Active: bottom border sky-700

**Search Bar:**
- Search input: "Tìm theo tên ứng viên..."

**Applicant Card:**
- Card: rounded-2xl, bg-white, shadow-sm, p-4
- Layout: horizontal
- Left: Avatar (48×48, rounded-full) + Verified badge overlay
- Middle:
  - Name (Poppins 600, 15px) + verified tick if eKYC done
  - Reputation: Circular mini (24×24px) "92" + "Xuất sắc" text
  - Applied time: "Ứng tuyển 2 giờ trước"
  - Shift applied for: "Ca sáng 07:00-11:00"
  - Cover letter preview (1 line, truncated)
- Right: Status-dependent buttons:
  - PENDING: Stack vertical:
    - "Duyệt" button (bg-sky-700, text-white, rounded-lg, h-36px)
    - "Từ chối" button (outline, text-red-500, border-red-200, h-36px)
  - APPROVED: "Đã duyệt" badge (emerald)
  - REJECTED: "Đã từ chối" badge (red, muted)

**Tap on card → opens Candidate Detail screen**

**Reject Confirmation Dialog:**
- BottomSheet: "Từ chối ứng viên?"
- Optional: Rejection reason textarea
- "Hủy" | "Xác nhận từ chối"

**Batch Actions (optional, for future):**
- "Chọn tất cả" checkbox + "Duyệt tất cả" button visible when > 1 pending

Design for quick decision-making — approval flow should be 1-2 taps max.
```

---

## PROMPT 2: Candidate Detail (viewed by Employer)

```
You are a Senior Mobile UI/UX Designer. Design the "Candidate Detail" screen 
viewed by Employer in JobNow mobile app.

**Design System:** Same as above.

**Screen Layout (375×812px):**

**Header:** Back arrow + "Hồ sơ ứng viên"

**Profile Hero:**
- Avatar: 72×72px, rounded-full, centered
- Name: Poppins 700, 20px
- Verified badge + Reputation score (circular ring, 48×48px)
- Tags: "F&B", "Giao hàng" (skill chips)

**Stats Cards (3 in row):**
- "Đã hoàn thành": "24 ca" (emerald)
- "Tỷ lệ đúng giờ": "95%" (sky)
- "Rating TB": "⭐ 4.7" (amber)

**Cover Letter Section:**
- "Lời nhắn gửi bạn"
- Full cover letter text in a quote-style card (left border sky-700)

**Work History:**
- "Lịch sử làm việc gần đây"
- Timeline list:
  - Job title + Employer + Date + Rating received
  - Maximum 5 items + "Xem thêm"

**Skills Section:**
- Skill chips (same as in their profile)

**Reviews from Other Employers:**
- Star ratings + short comments + employer names

**Action Bar (sticky bottom):**
- "Từ chối" outline (red) + "Duyệt ứng viên" CTA (sky-700)
- If already approved: "Nhắn tin" CTA + "Gọi điện" outline

Design as a hiring decision screen — all info needed to approve/reject at a glance.
```
