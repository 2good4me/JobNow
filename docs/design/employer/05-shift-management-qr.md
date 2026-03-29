# 📱 Employer — E05: Shift Management & QR Attendance

> **Actor:** Employer  
> **Flow:** Quản lý ca làm → Xem nhân viên check-in → Quét QR điểm danh  
> **Routes:** `/employer/shift-management.tsx`, `/employer/qr-display.tsx`

---

## Ngữ cảnh nghiệp vụ

Employer theo dõi ca làm đang diễn ra, xem ai đã check-in, hiển thị QR code cho nhân viên quét. Sau ca hoàn thành → đánh giá và thanh toán.

---

## PROMPT 1: Shift Management

```
You are a Senior Mobile UI/UX Designer. Design the "Shift Management" screen 
for JobNow mobile app — Employer view.

**Design System:** Flat Design, Professional Minimalism.
- Colors: Primary #0F172A, CTA #0369A1, Success #10B981, BG #F8FAFC

**Screen Layout (375×812px):**

**Header:** Back arrow + "Quản lý ca làm" + Job title subtitle

**Today's Active Shift Card (highlighted):**
- Card: rounded-2xl, bg-sky-50, border-sky-200, p-5
- "Ca sáng — 07:00 đến 11:00" (Poppins 600)
- Status: "Đang diễn ra" with pulse dot (emerald)
- Staff count: "3/5 đã check-in"
- Progress bar: 60% filled (emerald)

**Staff Check-in List (inside active shift):**
- Each staff item:
  - Avatar (36×36) + Name + Check-in time "07:02"
  - GPS status: "📍 15m" (emerald if within range, amber if far)
  - Status badge: "Đang làm" (emerald) | "Đã hoàn thành" (blue)
  - Action: "Đánh giá" button (after shift ends)

**Not Checked-in Section:**
- List of approved candidates who haven't checked in yet
- "Chưa check-in" (amber badge) + "Gọi điện" icon button
- If past shift start + 30min: "⚠️ Quá giờ" (red warning)

**Upcoming Shifts:**
- Cards for upcoming shifts (same day or next day)
- Shift name + time + slots "5/5 đã duyệt"
- Status: "Sắp bắt đầu" | "Đang chờ"

**Action FAB:** "Hiện QR" button (bottom-right, 56px, bg-sky-700, QrCode icon)

Design as a real-time operations dashboard — clear who's working and who's not.
```

---

## PROMPT 2: QR Code Display

```
You are a Senior Mobile UI/UX Designer. Design the "QR Code Display" screen 
for Employer in JobNow mobile app.

**Design System:** Same as above.

**Screen Layout (375×812px, dark bg for contrast):**

**Header:** Close button (X) + "Mã QR điểm danh"

**Content (centered, bg-#0F172A full screen):**
- White card (rounded-3xl, p-8, centered):
  - QR Code: 240×240px with JobNow logo center
  - Job title below: "Nhân viên phục vụ — Ca sáng"
  - Shift time: "07:00 - 11:00, 24/03/2026"
- Instruction: "Nhân viên quét mã này để check-in" (white text on dark bg)
- Auto-refresh timer: "QR tự cập nhật sau 5:00" (countdown)
- Manual refresh button: "Tạo mã mới" (outline white)
- Brightness auto-max indicator

Design as a clear, scannable QR display on dark background for maximum contrast.
```
