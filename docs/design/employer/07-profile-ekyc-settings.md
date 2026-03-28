# 📱 Employer — E07: Profile, eKYC, Settings & Review Staff

> **Actor:** Employer  
> **Flow:** Hồ sơ doanh nghiệp | Xác thực eKYC | Cài đặt | Đánh giá nhân viên  
> **Routes:** `/employer/profile/index.tsx`, `/employer/profile/edit.tsx`, `/employer/verification/index.tsx`, `/employer/profile/settings/`

---

## PROMPT 1: Employer Profile View

```
You are a Senior Mobile UI/UX Designer. Design the "Employer Profile" view screen
for JobNow mobile app.

**Design System:** Flat Design, Professional Minimalism.
- Colors: Primary #0F172A, CTA #0369A1, Success #10B981, BG #F8FAFC

**Screen Layout (375×812px):**

**Profile Header:**
- Business logo: 72×72px, rounded-xl, border-4 border-white
- Business name: Poppins 700, 20px
- Business type: "Nhà hàng / F&B" (badge, slate)
- Verified: Shield + "Đã xác thực" or amber "Chưa xác thực"
- "Chỉnh sửa" outline button

**Reputation Score Card (same pattern as candidate):**
- Circular ring 72×72px, score "88/100"
- "Tốt — Top 25% nhà tuyển dụng"
- Stats: "12 tin đã đăng" | "98 ứng viên đã thuê" | "⭐ 4.3"

**eKYC Alert (if not verified):**
- Amber alert card: "Xác thực GPKD/CCCD để tăng uy tín tuyển dụng"
- "Xác thực ngay" button

**Info Sections:**
- Giới thiệu (bio text)
- Địa chỉ (MapPin icon + address)
- SĐT + Website + MST

**Menu List:**
- 📋 "Tin tuyển dụng" (count badge)
- 👥 "Ứng viên"
- 💰 "Ví doanh nghiệp"
- ⏰ "Quản lý ca"
- ⭐ "Điểm uy tín"
- ⚙️ "Cài đặt"

Design as a professional business card profile.
```

---

## PROMPT 2: Profile Edit (Employer)

```
You are a Senior Mobile UI/UX Designer. Design "Edit Business Profile" for JobNow.

**Design System:** Same as above.

**Form Sections:**
- Logo upload (72×72, rounded-xl, camera overlay)
- Tên doanh nghiệp (*)
- Loại hình kinh doanh (dropdown)
- Mô tả: textarea 120px
- Địa chỉ (*): text input + GPS button
- SĐT (*): phone input with +84 prefix, validation regex
- Email: email input
- Website: url input
- Mã số thuế: text input

**Validation:** Zod-style inline errors. Phone format, URL format.
**Sticky bottom:** "Lưu thay đổi" CTA

Design clean form with proper validation states.
```

---

## PROMPT 3: Employer eKYC Verification

```
You are a Senior Mobile UI/UX Designer. Design "Business Verification (eKYC)" 
for JobNow — Employer uploads CCCD + Business License (GPKD).

**Design System:** Same as above.

**Flow: 3 steps similar to Candidate but with business context:**

**Step 1 — Upload CCCD (Personal ID):**
- Same camera flow as candidate eKYC
- Title: "Chụp CCCD người đại diện"

**Step 2 — Upload GPKD (Business License):**
- Title: "Chụp giấy phép kinh doanh"
- Camera with document overlay (landscape A4 frame)
- Tips: "Chụp rõ tên doanh nghiệp và MST"

**Step 3 — Review & Submit:**
- Preview both documents (thumbnails)
- Extracted info: Tên DN, MST, Người đại diện
- "Gửi xác thực" CTA
- Pending result: "Hồ sơ đang được xem xét (1-3 ngày)"

Design as a trust-building business verification flow.
```

---

## PROMPT 4: Review Staff (After Shift)

```
You are a Senior Mobile UI/UX Designer. Design "Review Staff" screen for JobNow —
Employer reviews a candidate after shift completion.

**Design System:** Same as above.

**Screen Layout (375×812px):**

**Context:** "Đánh giá nhân viên — {Candidate Name}"
- Avatar + Name + Shift info: "Ca sáng 07:00-11:00"

**Star Rating:** 5 large interactive stars (40×40px each)
- Label: "Nhân viên làm việc thế nào?"

**Quick Tags (multi-select):**
- Positive (emerald): "Chăm chỉ", "Đúng giờ", "Khéo léo", "Thái độ tốt", "Giao tiếp tốt"  
- Negative (red): "Đi trễ", "Thiếu trách nhiệm", "Không phù hợp"

**Add to Favorites:**
- Checkbox: "Thêm vào danh sách nhân viên yêu thích ⭐"

**Comment:** Textarea (optional), "0/500"

**Submit:** "Gửi đánh giá" CTA + "Bỏ qua" link

Design warm and fair — encourage honest but constructive feedback.
```

---

## PROMPT 5: Employer Settings

```
You are a Senior Mobile UI/UX Designer. Design "Settings" for Employer in JobNow.

**Same pattern as Candidate Settings but with business-specific items:**

**Groups:**
1. "Tài khoản & Bảo mật": Password, Phone, Email
2. "Thông báo": Push (ứng viên mới), Email (báo cáo tuần)
3. "Thanh toán": Auto-pay toggle, Default payment method
4. "Giao diện": Dark mode, Language
5. "Hỗ trợ": FAQ, Điều khoản NTD, Liên hệ hỗ trợ
6. "Vùng nguy hiểm": Delete business account (red)

**Footer:** Logout + Version

Design following native settings patterns.
```
