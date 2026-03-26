# 📱 Employer — E03: Job List & Job Detail

> **Actor:** Employer  
> **Flow:** Quản lý tin đăng → Xem chi tiết tin  
> **Routes:** `/employer/job-list.tsx`, `/employer/job-detail.tsx`

---

## Ngữ cảnh nghiệp vụ

Employer xem tất cả tin đã đăng, lọc theo trạng thái, tìm kiếm, sửa/đóng/xóa tin. Job Detail hiển thị chi tiết + số ứng viên + lượt xem.

---

## PROMPT 1: Job List

```
You are a Senior Mobile UI/UX Designer. Design the "My Job List" screen 
for JobNow mobile app — Employer view.

**Design System:** Flat Design, Professional Minimalism.
- Colors: Primary #0F172A, CTA #0369A1, Success #10B981, BG #F8FAFC
- Fonts: Poppins headings, Inter body. Icons: Lucide React only.

**Screen Layout (375×812px):**

**Header:**
- Title: "Tin tuyển dụng" (Poppins 700, 22px)
- Search icon button (top-right) → expandable search input

**Filter Tabs (horizontal scroll):**
- "Tất cả (8)" | "Đang tuyển (5)" | "Đã đầy (1)" | "Đã đóng (2)"
- Active tab: bg-sky-700, text-white, rounded-full

**Job Card (Employer version):**
- Card: rounded-2xl, bg-white, shadow-sm, p-4
- Row 1: Job title (Poppins 600, 15px) + Status badge
  - OPEN: emerald "Đang tuyển"
  - FULL: amber "Đã đầy"
  - CLOSED: slate "Đã đóng"
- Row 2: Category chip + Date posted
- Row 3 (stats): 3 inline metrics:
  - 👁 "124 lượt xem" | 👥 "8 ứng viên" | 💰 "150K/h"
- Row 4: Action buttons:
  - "Xem ứng viên" text button (sky-700)
  - "Sửa tin" icon button (Pencil)
  - "Đóng tin" icon button (Archive) — only for OPEN jobs
  - "..." more menu (duplicate, delete)

**Sort dropdown:** "Mới nhất" | "Nhiều UV nhất" | "Nhiều view nhất"

**FAB:** "+ Tạo tin mới" (bottom-right, 56×56, bg-sky-700)

**Empty State:**
- Illustration of clipboard
- "Chưa có tin tuyển dụng nào"
- "Đăng tin đầu tiên để bắt đầu tuyển dụng"
- "Đăng tin" CTA button

Design as a management dashboard — scannable stats on each card.
```

---

## PROMPT 2: Job Detail (Employer View)

```
You are a Senior Mobile UI/UX Designer. Design the "Job Detail" screen 
for JobNow mobile app — Employer's own job view (management mode).

**Design System:** Same as above.

**Screen Layout (375×812px):**

**Header:** Back arrow + "Chi tiết tin" + "Sửa" pencil icon + "..." more menu

**Status Banner (top):**
- Full-width status bar:
  - OPEN: bg-emerald-50, emerald icon, "Đang tuyển — Còn 3/5 vị trí"
  - PENDING_REVIEW: bg-amber-50, "Đang chờ kiểm duyệt"
  - CLOSED: bg-slate-100, "Đã đóng"

**Stats Dashboard (4 metrics in a row):**
- "124 Lượt xem" | "8 Ứng viên" | "5 Đã duyệt" | "2 Check-in"
- Each: bg-white, rounded-xl, p-3, centered, with colored number

**Job Info Sections (scrollable):**
- Title + Category badge
- Description (expandable)
- Salary: large text "150.000đ/giờ"
- Requirements checklist (CheckCircle icons)
- Location with map preview
- Shifts grid: each shift showing name, time, slots filled/total

**Applicants Preview:**
- "Ứng viên (8)" section header + "Xem tất cả →"
- Avatar stack (overlapping circles) + count
- Quick stats: "3 chờ duyệt | 5 đã nhận"

**Action Buttons (sticky bottom):**
- "Xem ứng viên" CTA (bg-sky-700, full-width)
- "Đóng tin" outline (if OPEN) / "Mở lại" outline (if CLOSED)

Design as a management view — data-rich, action-oriented.
```
