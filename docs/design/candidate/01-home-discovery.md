# 📱 Candidate — C01: Home & Job Discovery

> **Actor:** Candidate (Người tìm việc)  
> **Flow:** Tìm kiếm việc làm — Màn hình chính sau đăng nhập  
> **Route:** `/candidate/index.tsx`, `/jobs/index.tsx`

---

## Ngữ cảnh nghiệp vụ

Đây là màn hình chính (Home) của Candidate sau khi đăng nhập. Candidate mở app → thấy ngay bản đồ GPS hiển thị các việc làm gần vị trí hiện tại (giống Grab). Có thể chuyển sang chế độ danh sách. Bộ lọc giúp thu hẹp kết quả theo khoảng cách, lương, loại công việc, ca làm.

**Dữ liệu hiển thị từ Firestore:**
- Collection `jobs` (status: OPEN): title, salary, salary_type, location (GeoPoint), category_id, shifts[], employer_id
- Collection `users` (employer): full_name, avatar_url, verification_status
- Collection `categories`: name, icon

**User Stories liên quan:**
- US-C04: Lọc việc theo bán kính (5km, 10km)
- US-C05: Lọc theo mức lương và loại hình
- US-G01: Xem việc trên bản đồ

---

## PROMPT cho Stitch MCP

```
You are a Senior Mobile UI/UX Designer. Design the "Home & Job Discovery" screen 
for a Candidate user in "JobNow" — a GPS-based gig work mobile app (like Grab for jobs).

**Design System:** Professional Minimalism, Flat Design.
- Colors: Primary #0F172A, CTA #0369A1, Accent #F59E0B, Success #10B981, BG #F8FAFC
- Fonts: Poppins (headings 600), Inter (body 400), base 16px
- Cards: rounded-2xl, shadow-sm, border-slate-100
- Touch targets: 44×44px min. Icons: Lucide React only.

**Screen Layout (375×812px, mobile):**

**Top Section — Search & Filters:**
- Safe area top padding
- Greeting: "Xin chào, {userName}!" (Poppins 600, 20px, #0F172A)
- Search bar: rounded-full, bg-white, border-slate-200, height 48px
  - Left: Search icon (slate-400)
  - Placeholder: "Tìm công việc, kỹ năng..."
  - Right: SlidersHorizontal filter icon button (48×48px, bg-sky-50, text-sky-700)
- Below search: Horizontal scroll chips for categories
  - Each chip: rounded-full, bg-white, border-slate-200, px-4 py-2
  - Active chip: bg-sky-700, text-white
  - Categories: "Tất cả", "F&B", "Bán hàng", "Giao hàng", "Sự kiện", "Kho bãi", "Khác"
  - Each chip has a small icon (16px) + text

**Middle Section — Interactive Map View:**
- Full-width map container (height: ~55% of screen)
- Custom map pins: 
  - Blue circle (32px) with "$" or Briefcase icon inside
  - Pin shows salary badge on hover/tap: "150K/h" (white bg, rounded-lg, shadow-md)
- "My Location" FAB button: bottom-right of map, 48×48px circle, 
  bg-white, shadow-md, Crosshair icon
- Toggle button top-right of map: List/Map view switch
  - Two icon buttons: Map icon | List icon, active has bg-sky-700

**Bottom Section — Pull-up Job List (Bottom Sheet):**
- Drag handle bar centered (40×4px, rounded-full, bg-slate-300)
- Title: "Việc làm gần bạn" (Poppins 600, 18px) + count badge "(24 việc)"
- Sort dropdown: "Gần nhất" | "Lương cao" | "Mới nhất"

**Job Card Design (in the list):**
- Horizontal layout, rounded-2xl, bg-white, shadow-sm, p-4, gap-3
- Left: Employer avatar (48×48px, rounded-xl)
- Right content:
  - Row 1: Job title (Poppins 600, 15px, #0F172A, line-clamp-1)
  - Row 2: Employer name (Inter 400, 13px, #64748B) + Verified badge (CheckCircle, sky-500, 14px) if verified
  - Row 3: Three inline badges:
    - 💰 Salary: "150.000đ/h" (sky-700, font-weight 700, 15px)
    - 📍 Distance: "1.2 km" (slate-500 badge, MapPin icon)
    - ⏰ Time: "Hôm nay" or "Ngày mai" (amber badge if today)
  - Row 4: Shift chips: "Ca sáng 7-11h" "Ca chiều 13-17h" (rounded-full, bg-slate-100, text-xs)
- Right edge: Bookmark icon (Heart outline, 20px) — tap to save

**Filter Bottom Sheet (when tapping filter icon):**
- Sheet header: "Bộ lọc nâng cao" + "Xóa tất cả" text button (red)
- Sections with clear labels:
  1. Khoảng cách: Slider 1-50km with value label
  2. Mức lương: Range slider (min-max)
  3. Loại ca: Chips "Sáng" "Chiều" "Tối" (multi-select)
  4. Thời gian: Chips "Hôm nay" "Ngày mai" "Tuần này"
  5. Trạng thái NTD: Toggle "Chỉ NTD đã xác thực"
- Sticky bottom: "Áp dụng" CTA button (full-width, bg-sky-700)

**Empty State (no jobs found):**
- Illustration of empty map
- "Không tìm thấy việc làm phù hợp"
- "Thử mở rộng bộ lọc hoặc thay đổi vị trí"
- "Xóa bộ lọc" outline button

**List View Mode (alternative to map):**
- Vertical scrolling list of Job Cards
- Pull-to-refresh indicator
- Infinite scroll with skeleton loading (3 skeleton cards)

Design this as a polished, production-ready mobile screen. 
The map view should feel like Grab/Uber — interactive and location-centric.
```
