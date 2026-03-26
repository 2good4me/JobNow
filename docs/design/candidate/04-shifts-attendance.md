# 📱 Candidate — C04: My Shifts & Attendance

> **Actor:** Candidate  
> **Flow:** Quản lý ca làm → Check-in GPS/QR → Check-out  
> **Route:** `/candidate/shifts.tsx`

---

## Ngữ cảnh nghiệp vụ

Sau khi được duyệt, Candidate xem lịch ca làm, check-in bằng GPS khi đến nơi, xem QR để employer scan. Có timer đếm giờ khi đang làm. Chế độ Danh sách + Lịch biểu.

**Dữ liệu:** applications (APPROVED/CHECKED_IN/COMPLETED) + jobs + checkins subcollection

---

## PROMPT cho Stitch MCP

```
You are a Senior Mobile UI/UX Designer. Design the "My Shifts & Attendance" 
screen for JobNow mobile app — Candidate view.

**Design System:** Flat Design, Professional Minimalism.
- Colors: Primary #0F172A, CTA #0369A1, Success #10B981, BG #F8FAFC
- Fonts: Poppins headings, Inter body.

**Screen Layout (375×812px):**

**Header:**
- Title: "Ca làm của tôi" (Poppins 700, 22px)
- Toggle: "Danh sách" | "Thời gian biểu" (segmented control)

**Tabs:**
- "Sắp tới (3)" | "Đang làm (1)" | "Đã xong (8)"
- Active: border-bottom-2 sky-700

**"Đang làm" — Active Shift Card (HIGHLIGHTED):**
- Large card, rounded-2xl, bg-gradient-to-r from-sky-700 to-sky-600, text-white, p-5
- Top: Job title + Employer name
- Center: LIVE TIMER "02:34:15" (Poppins 700, 36px, monospace feel)
  - Animated pulse dot (green) + "Đang làm việc"
- Bottom row buttons:
  - "Check-out" button (bg-white, text-sky-700, rounded-xl)
  - "Xem QR" button (bg-white/20, text-white, rounded-xl, QrCode icon)
- GPS indicator: "📍 Trong phạm vi 50m" (green) or "⚠️ Ngoài phạm vi" (amber)

**"Sắp tới" — Upcoming Shift Card:**
- Card: rounded-2xl, bg-white, shadow-sm, p-4
- Left accent border (4px, sky-700)
- Job title (Poppins 600) + Employer
- Date: "📅 Thứ 2, 24/03" + Time: "07:00 - 11:00"
- Countdown: "Còn 3 giờ nữa" (amber badge if < 2h)
- Button: "Check-in" (bg-emerald-500, disabled if not within GPS range or time)
- GPS check: "📍 Cách nơi làm 2.3km" → must be within 200m to enable check-in

**"Đã xong" — Completed Shift Card:**
- Card: rounded-2xl, bg-white, shadow-sm, p-4
- Job title + Date
- Duration: "Đã làm 4h 02p"
- Payment: "✅ 600.000đ - Đã thanh toán" or "⏳ Chờ thanh toán"
- Button: "Đánh giá NTD" (if not reviewed yet, outline button)

**Calendar View (Thời gian biểu):**
- Monthly calendar grid
- Days with shifts: colored dots (sky-700 for upcoming, emerald for completed)
- Tap on date → shows shifts for that day below calendar

**QR Code Display Modal:**
- Full-screen BottomSheet
- Large QR code (200×200px) centered
- "Nhờ NTD quét mã để check-in"
- Auto-refresh timer: "QR hết hạn sau 5:00"
- Close button bottom

**Check-in Confirmation:**
- Success animation (checkmark lottie)
- "Check-in thành công!"
- "Thời gian: 07:02 | Khoảng cách: 15m"
- Timer starts automatically

Design with focus on the active shift card — it must be visually prominent 
and feel like a "live" working session dashboard.
```
