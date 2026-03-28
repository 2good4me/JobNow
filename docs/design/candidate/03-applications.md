# 📱 Candidate — C03: My Applications

> **Actor:** Candidate  
> **Flow:** Quản lý đơn ứng tuyển  
> **Route:** `/candidate/applications.tsx`

---

## Ngữ cảnh nghiệp vụ

Candidate xem danh sách tất cả đơn ứng tuyển, lọc theo trạng thái (Chờ duyệt, Đã duyệt, Từ chối). Có thể rút đơn khi đang ở trạng thái PENDING. Khi được duyệt → chuyển sang "Shifts" để check-in.

**Dữ liệu Firestore:**
- `applications`: job_id, shift_id, status (PENDING/APPROVED/REJECTED/COMPLETED), payment_status, cover_letter, created_at
- Join `jobs/{job_id}`: title, employer_id, salary, shifts[]
- Join `users/{employer_id}`: full_name, avatar_url

---

## PROMPT cho Stitch MCP

```
You are a Senior Mobile UI/UX Designer. Design the "My Applications" screen 
for JobNow mobile app — Candidate view.

**Design System:** Flat Design, Professional Minimalism.
- Colors: Primary #0F172A, CTA #0369A1, Success #10B981, Danger #EF4444, 
  Warning #F59E0B, BG #F8FAFC
- Fonts: Poppins headings, Inter body. Cards: rounded-2xl, shadow-sm.

**Screen Layout (375×812px):**

**Header:**
- Title: "Đơn ứng tuyển" (Poppins 700, 22px)
- Right: Filter icon button

**Filter Tabs (horizontal scroll):**
- Tabs: "Tất cả (12)" | "Chờ duyệt (5)" | "Đã nhận (4)" | "Từ chối (2)" | "Hoàn thành (1)"
- Active tab: bg-sky-700, text-white, rounded-full
- Inactive: bg-white, border-slate-200, text-slate-600

**Application Card Design:**
- Vertical card, rounded-2xl, bg-white, shadow-sm, p-4
- Top row: Employer avatar (40×40) + Job title (Poppins 600, 15px) + Status badge
- Status badges:
  - PENDING: bg-amber-50, text-amber-700, border-amber-200, Clock icon, "Chờ duyệt"
  - APPROVED: bg-emerald-50, text-emerald-700, border-emerald-200, CheckCircle, "Đã nhận"
  - REJECTED: bg-red-50, text-red-700, border-red-200, XCircle, "Từ chối"
  - COMPLETED: bg-blue-50, text-blue-700, border-blue-200, CheckCheck, "Hoàn thành"
- Info rows (Inter 400, 13px, #64748B):
  - 🏢 Employer name
  - 💰 "150.000đ/h" (salary)
  - 📅 "Ca sáng 07:00-11:00, 24/03/2026" (shift info)
  - ⏱️ "Ứng tuyển 2 giờ trước" (relative time)
- Payment badge (if COMPLETED):
  - PAID: "✅ Đã thanh toán" (emerald badge)
  - UNPAID: "⏳ Chờ thanh toán" (amber badge)
- Action buttons (bottom of card):
  - PENDING: "Rút đơn" outline button (text-red-500, border-red-200)
  - APPROVED: "Xem ca làm" solid button (bg-sky-700) + "Chat" outline button
  - REJECTED: "Xem lý do" text button
  - COMPLETED + UNPAID: no action (employer pays)

**Pull-to-refresh** on the entire list.

**Empty State (no applications):**
- Illustration of clipboard with papers
- "Bạn chưa ứng tuyển công việc nào"
- "Khám phá việc làm gần bạn" CTA button → navigate to Home

**Withdraw Confirmation Dialog:**
- BottomSheet modal
- Title: "Rút đơn ứng tuyển?"
- Body: "Bạn có chắc muốn rút đơn ứng tuyển cho công việc [Job Title]?"
- Buttons: "Hủy" (outline) | "Xác nhận rút đơn" (bg-red-500)

Design with clear visual hierarchy. The status badges should be 
immediately scannable — users need to quickly identify which applications 
need attention.
```
