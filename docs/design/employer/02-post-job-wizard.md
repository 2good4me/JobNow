# 📱 Employer — E02: Post Job Wizard (4 Steps)

> **Actor:** Employer  
> **Flow:** Đăng tin tuyển dụng mới → 4 bước wizard  
> **Route:** `/employer/post-job.tsx`  
> **Components:** `Step1Info.tsx`, `Step2Details.tsx`, `Step3Shifts.tsx`, `Step4Review.tsx`

---

## Ngữ cảnh nghiệp vụ

Employer tạo tin đăng tuyển dụng qua 4 bước: Thông tin cơ bản → Chi tiết & Vị trí → Lịch ca làm → Xem lại & Đăng. Cũng dùng để chỉnh sửa tin (editJobId mode).

**Dữ liệu Firestore tạo ra:** jobs document (title, description, salary, salary_type, category_id, location, shifts[], requirements, status)

---

## PROMPT 1: Step 1 — Thông tin cơ bản

```
You are a Senior Mobile UI/UX Designer. Design "Post Job - Step 1: Basic Info" 
for JobNow mobile app — Employer.

**Design System:** Flat Design, Professional Minimalism.
- Colors: Primary #0F172A, CTA #0369A1, BG #F8FAFC
- Form inputs: rounded-xl, border-slate-200, h-48px, focus:border-sky-500
- Icons: Lucide React only.

**Screen Layout (375×812px):**

**Progress Bar (top):** 4 connected circles + labels
- "Thông tin" (active, sky-700) → "Chi tiết" → "Ca làm" → "Xem lại"
- Active: filled circle, bold text. Future: outline circle, muted text.

**Form Content:**

**Tiêu đề công việc (*):**
- Text input, placeholder: "VD: Nhân viên phục vụ nhà hàng"
- Character count: "0/100"

**Danh mục (*):**
- Tap to open CategoryBottomSheet
- Display: Selected category chip or "Chọn danh mục"
- Sheet content: Grid of category cards (3 columns)
  - Each: 100×80px, rounded-xl, bg-white, icon + name centered
  - Categories: F&B, Bán hàng, Giao hàng, Sự kiện, Kho bãi, Dọn dẹp, 
    Bảo vệ, Marketing, IT, Khác
  - Selected: border-sky-700, bg-sky-50

**Mô tả công việc (*):**
- Textarea, min-h 120px, placeholder: "Mô tả chi tiết công việc..."
- Character count: "0/1000"

**Yêu cầu (multi-select chips + custom):**
- Suggested: "Có kinh nghiệm", "Ngoại hình gọn gàng", "Chăm chỉ", 
  "Giao tiếp tốt", "Có xe máy"
- "+ Thêm yêu cầu" button → input field
- Selected chips: bg-sky-700, text-white

**Ảnh bìa (optional):**
- Upload area: dashed border, 160×100px, Camera + "Thêm ảnh bìa"
- Preview after upload with X remove button

**Sticky Bottom:** "Tiếp tục" CTA button (disabled if required fields empty)

Design a clean wizard form. Validation errors inline.
```

---

## PROMPT 2: Step 2 — Chi tiết & Vị trí

```
You are a Senior Mobile UI/UX Designer. Design "Post Job - Step 2: Details & Location" 
for JobNow mobile app.

**Design System:** Same as above.

**Screen Layout (375×812px):**

**Progress Bar:** Step 2 active

**Mức lương (*):**
- Salary input: number, formatted with "đ" suffix
- Toggle: "Theo giờ" | "Theo ngày" | "Theo việc" (segmented control)
- Preview: "= 150.000đ/giờ" or "= 1.200.000đ/ngày"

**Giới tính ưu tiên:**
- Segmented control: "Nam" | "Nữ" | "Cả hai"

**Số lượng tuyển:**
- Number stepper: [-] 5 [+] (min 1, max 50)

**Ngày bắt đầu (*):**
- Date picker, showing calendar below input

**Vị trí làm việc (*):**
- Address text input
- "Lấy vị trí GPS hiện tại" button (MapPin icon, sky-700)
- Mini map preview (200px height, rounded-xl)
  - Draggable pin on map
  - Address text below map updates as pin moves
- GPS accuracy indicator

**Yêu cầu GPS check-in:**
- Toggle: "Bắt buộc check-in bằng GPS" (default ON)
- Info text: "Ứng viên phải ở trong bán kính 200m để check-in"

**Sticky Bottom:** "Quay lại" outline + "Tiếp tục" CTA

Design with map as the visual focal point.
```

---

## PROMPT 3: Step 3 — Lịch ca làm

```
You are a Senior Mobile UI/UX Designer. Design "Post Job - Step 3: Shift Scheduler" 
for JobNow mobile app.

**Design System:** Same as above.

**Screen Layout (375×812px):**

**Progress Bar:** Step 3 active

**Title:** "Thiết lập ca làm việc"

**Shift Cards (vertical list):**
- Each shift card: rounded-2xl, bg-white, border-slate-200, p-4
  - Shift name input: "Ca sáng" (editable)
  - Time pickers: Start "07:00" — End "11:00" (wheel picker style)
  - Slots: Number stepper [-] 5 [+]
  - Remove button: X icon (top-right, red-400), shown if > 1 shift

**"+ Thêm ca làm" Button:**
- Dashed outline button, full-width, rounded-xl
- Plus icon + "Thêm ca làm mới"

**Summary:**
- "Tổng ca: 3 | Tổng slots: 15"

**Sticky Bottom:** "Quay lại" outline + "Tiếp tục" CTA

Design intuitive time slot management.
```

---

## PROMPT 4: Step 4 — Xem lại & Đăng

```
You are a Senior Mobile UI/UX Designer. Design "Post Job - Step 4: Review & Publish" 
for JobNow mobile app.

**Design System:** Same as above.

**Screen Layout (375×812px):**

**Progress Bar:** Step 4 active (all steps completed with checkmarks)

**Preview Card (looks like the final Job Detail card):**
- Cover image (or gradient placeholder)
- Title, Category badge, Salary (large, sky-700)
- Description (collapsed, expandable)
- Requirements checklist
- Location with mini map
- Shifts grid (read-only version)

**Section Edit Links:**
- Each section has "Sửa" pencil icon → navigates back to that step

**Cost Estimate Card:**
- "Chi phí ước tính": calculated from salary × shifts × slots
- "Số dư hiện tại": employer balance
- Warning if balance insufficient: amber card "Nạp thêm {amount}đ"

**Sticky Bottom:**
- "Đăng tin" CTA button (bg-sky-700, full-width, h-52px, Poppins 600)
- Below: "Tin sẽ được kiểm duyệt trước khi hiển thị" (slate-500, text-xs)

**Success Modal (after publish):**
- CheckCircle animation (large, emerald)
- "Đăng tin thành công!"
- "Tin của bạn đang chờ kiểm duyệt và sẽ hiển thị sau khi được duyệt"
- "Xem tin" button + "Về Dashboard" link

Design the review screen to feel like a final confirmation — professional and complete.
```
