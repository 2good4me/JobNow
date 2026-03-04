# JobNow — Layout Blueprint: Candidate vs Employer

> Tài liệu này phân tách rõ ràng từng màn hình, nút bấm, thanh điều hướng cho 2 vai trò **Candidate** (Người tìm việc) và **Employer** (Nhà tuyển dụng). Mỗi mục đều đủ chi tiết để đưa vào MCP Stitch tạo giao diện.

---

## Design System (Nhắc lại cho Stitch)

| Token | Giá trị |
|-------|---------|
| Primary | `#2563EB` |
| Secondary | `#10B981` |
| Accent/Warning | `#F59E0B` |
| Danger | `#EF4444` |
| Background Light | `#F8FAFC` |
| Background Dark | `#0F172A` |
| Card BG | `#FFFFFF` |
| Font Heading | Inter / SF Pro Display, **600-700** |
| Font Body | Inter, **400-500** |
| Border Radius | Card `16px`, Button `12px` |
| Touch Target | ≥ `44×44px` |
| Screen Size | 390×844 (iPhone 14) |

---

## Màn hình dùng chung (Shared Screens)

Các màn hình sau **giống nhau** cho cả 2 vai trò:

| # | Màn hình | Mô tả ngắn |
|---|----------|-------------|
| 1 | Splash + Onboarding (3 slides) | Logo, tagline, 3 slide giới thiệu |
| 2 | Đăng nhập / Đăng ký | Tab [Đăng nhập] / [Đăng ký] + Role selector |
| 3 | OTP Verification | 6 ô nhập OTP + đếm ngược |
| 4 | eKYC (CCCD/GPKD) | Camera chụp CCCD + duyệt |
| 5 | Chat List + Detail | Danh sách hội thoại + chi tiết |
| 6 | Notifications | Danh sách thông báo theo nhóm |
| 7 | Settings | Cài đặt chung, đổi mật khẩu, đăng xuất |
| 8 | Report | Báo cáo vi phạm (3 bước) |

---

## PHẦN A: CANDIDATE (Người tìm việc)

### A.1 Bottom Navigation — Candidate

```
┌─────────┬─────────┬──────────┬─────────┬──────────┐
│ 🗺️      │ 🔍      │          │ 💬      │ 👤       │
│ Bản đồ  │ Tìm kiếm│  (none)  │ Chat    │ Tài khoản│
│ (active)│         │          │         │          │
└─────────┴─────────┴──────────┴─────────┴──────────┘
```

> **Lưu ý:** Candidate **KHÔNG** có nút "Đăng tin" ở giữa. Vị trí giữa để trống hoặc bỏ, giữ 4 tab: Bản đồ, Tìm kiếm, Chat, Tài khoản.

**5 tab cho Candidate (tùy chọn giữ 5):**

| Tab | Icon | Label | Mô tả |
|-----|------|-------|--------|
| 1 | 🗺️ | Bản đồ | Trang chính — bản đồ GPS hiển thị việc làm |
| 2 | 🔍 | Tìm kiếm | Bộ lọc nâng cao + kết quả danh sách |
| 3 | 📅 | Ca của tôi | Lịch ca làm + check-in/check-out |
| 4 | 💬 | Chat | Nhắn tin với Employer |
| 5 | 👤 | Tài khoản | Hồ sơ cá nhân + cài đặt |

---

### A.2 Màn hình: Bản đồ Chính (Home)

```
┌───────────────────────────────────┐
│ [Avatar] [🔍 Tìm quán, việc...]  [🔔]  │  ← Glassmorphism top bar
├───────────────────────────────────┤
│         GOOGLE MAP FULL SCREEN         │
│    📍 Blue pin = Việc thường            │
│    📍 Green pin = Lương cao (>50k)      │
│    📍 Gold pin = VIP/Boosted            │
│    🔵 User location (pulsing)           │
├───────────────────────────────────┤
│ [Gần nhất] [Lương cao] [F&B] [Sự kiện] │  ← Filter chips
├───────────────────────────────────┤
│ ┌─ Swipeable Job Card ──────────┐ │
│ │ [Ảnh] Phục vụ bàn - Quán Mộc  │ │
│ │ [F&B] [Part-time]  35k/h 📍1.2km │ │
│ │ ✓ Đã xác thực                  │ │
│ └───────────────────────────────┘ │
├───────────────────────────────────┤
│ [🗺️] [🔍] [📅] [💬] [👤]        │  ← Bottom nav
└───────────────────────────────────┘
```

**Các nút trên màn hình này:**
- `[Avatar]` — Tap mở profile nhanh
- `[🔍 Search bar]` — Tap chuyển sang màn Tìm kiếm
- `[🔔 Bell]` — Mở Notifications (có badge đỏ)
- `[Filter Chips]` — Toggle bộ lọc nhanh
- `[Job Card]` — Tap mở Chi tiết Việc làm
- `[Map Pins]` — Tap mở preview card

---

### A.3 Màn hình: Tìm kiếm & Bộ lọc

**Các nút & thành phần:**
- `[← Back]` — Quay lại Bản đồ
- `[🔍 Input]` — Tìm kiếm text (auto-focus)
- `[🎤 Voice]` — Tìm bằng giọng nói
- `[Chips gần đây]` — Lịch sử tìm kiếm
- **Bộ lọc nâng cao:**
  - `[Slider]` Khoảng cách 1-10km
  - `[Slider]` Lương tối thiểu 20k-100k
  - `[Chips]` Danh mục: F&B, Giao hàng, Sự kiện, Bán hàng
  - `[Chips]` Ca làm: Sáng, Chiều, Tối
  - `[Switch]` Employer đã xác thực
  - `[Chips]` Sort: Gần nhất, Lương cao
- `[ÁP DỤNG BỘ LỌC]` — Nút primary xanh
- `[📋 Danh sách / 🗺️ Bản đồ]` — Toggle view

---

### A.4 Màn hình: Chi tiết Việc làm

**Các nút & thành phần:**
- `[← Back]` — Quay lại
- `[↗ Share]` — Chia sẻ việc làm
- `[🔖 Bookmark]` — Lưu việc làm
- `[Store Photo Header]` — Ảnh cửa hàng
- `[Badge "Đã xác thực ✓"]`
- **Salary Box:** `35,000đ / giờ` (green gradient)
- **Key Info Grid:** Ngày làm, Ca làm, Số lượng, Danh mục
- **Shift Select:** `[Ca Sáng]` `[Ca Tối]` — dạng ticket card
- **Employer Card:** Avatar + tên + Trust Score gauge
- **Bottom Bar (Sticky):**
  - `[❤️]` — Yêu thích
  - `[💬 Chat]` — Nhắn tin Employer (outline)
  - `[ỨNG TUYỂN NGAY]` — **Nút chính xanh lớn**

---

### A.5 Màn hình: Xác nhận Ứng tuyển (Bottom Sheet Modal)

**Các nút:**
- `[Drag handle]` — Kéo xuống đóng
- `[✕ Close]` — Đóng modal
- `[Textarea]` — Lời nhắn (không bắt buộc)
- `[⚠️ Cam kết]` — Warning card cam
- `[XÁC NHẬN NHẬN VIỆC]` — **Nút primary xanh lớn**

---

### A.6 Màn hình: Ca làm của tôi (My Shifts)

```
┌───────────────────────────────────┐
│ "Ca làm của tôi"   [Tháng ▼] [Tuần]│
├───────────────────────────────────┤
│ T2  T3  T4  T5  T6  T7  CN       │ ← Calendar week
│     •       ••          •         │
├───────────────────────────────────┤
│ ┌─ ĐANG LÀM (green border) ────┐ │
│ │ Quán Mộc Cafe 08:00-12:00     │ │
│ │ Còn 1h25p  [CHECK-OUT]        │ │
│ └───────────────────────────────┘ │
│ ┌─ SẮP TỚI (blue border) ──────┐ │
│ │ Nhà hàng ABC 18:00-22:00      │ │
│ │ [CHECK-IN] (disabled)          │ │
│ └───────────────────────────────┘ │
├───────────────────────────────────┤
│ Tuần này: 3 ca | 12h | 420k      │
│ Tháng này: 12 ca | 48h | 1.6M    │
└───────────────────────────────────┘
```

**Các nút:**
- `[Tháng / Tuần]` — Toggle lịch
- `[CHECK-IN]` — Mở màn Chấm công GPS
- `[CHECK-OUT]` — Kết thúc ca
- `[Job Card]` — Tap xem chi tiết ca

---

### A.7 Màn hình: Chấm công GPS (Check-in)

**Các nút:**
- `[← Back]` — Quay lại Ca làm
- **State A (< 100m):** `[✓ CHECK-IN ĐIỂM DANH]` — Nút xanh lá lớn
- **State B (> 100m):** `[📷 Quét mã QR từ chủ quán]` — Nút outline xanh
- **State C (Đã check-in):** `[CHECK-OUT]` — Nút kết thúc + timer đang chạy

---

### A.8 Màn hình: Hồ sơ Candidate (Tài khoản)

```
┌───────────────────────────────────┐
│ Cover Gradient                     │
│    ┌──────┐                        │
│    │Avatar│  Nguyễn Minh An        │
│    └──────┘  🛡️ 95/100 | ⭐ 4.8   │
├───────────────────────────────────┤
│ SĐT: 0912***456 | DOB | Location │
├───────────────────────────────────┤
│ Skills: [Bưng bê] [Pha chế]       │
├───────────────────────────────────┤
│ Lịch sử làm việc (Timeline)       │
│  • Quán Mộc — ⭐4.5 "Nhanh nhẹn"  │
│  • Nhà hàng ABC — ⭐5.0            │
├───────────────────────────────────┤
│ 23 ca  |  4.8 ⭐  |  0 lần bùng   │
├───────────────────────────────────┤
│ [Chỉnh sửa hồ sơ] (outline)       │
│ [Xác thực eKYC] (green)           │
└───────────────────────────────────┘
```

**Các nút:**
- `[Chỉnh sửa hồ sơ]` — Mở form edit (outline style)
- `[Xác thực eKYC]` — Chuyển sang luồng eKYC (green filled)
- `[⚙️ Settings]` — Icon cài đặt góc phải

---

### A.9 Màn hình: Ví & Giao dịch (Candidate)

**Các nút:**
- `[+ Nạp tiền]` — Nạp vào ví
- `[↗ Rút tiền]` — Rút ra tài khoản ngân hàng
- `[Filter Chips]` — Tất cả / Nạp / Thu nhập
- `[Transaction Item]` — Tap xem chi tiết

---

### A.10 Màn hình: Việc đã lưu & Lịch sử

**Các nút:**
- `[Tab ❤️ Việc đã lưu]` — Danh sách saved jobs
- `[Tab 📋 Lịch sử làm việc]` — Timeline hoàn thành/hủy
- `[Job Card]` — Tap xem chi tiết
- `[Bỏ lưu]` — Xóa khỏi danh sách yêu thích

---

### A.11 Màn hình: Đánh giá sau ca (Review)

**Các nút:**
- `[⭐⭐⭐⭐⭐]` — 5 sao tương tác
- `[Chips]` — Nhãn quick: "Trả lương đúng", "Thân thiện", "Môi trường tốt"
- `[Textarea]` — Nhận xét chi tiết
- `[GỬI ĐÁNH GIÁ]` — Nút primary xanh

---

## PHẦN B: EMPLOYER (Nhà tuyển dụng)

### B.1 Bottom Navigation — Employer

```
┌─────────┬─────────┬──────────┬─────────┬──────────┐
│ 🏠      │ 📊      │   ➕     │ 💬      │ 👤       │
│ Tổng    │ Quản lý │ Đăng tin │ Chat    │ Tài khoản│
│ quan    │ ứng viên│ (center) │         │          │
└─────────┴─────────┴──────────┴─────────┴──────────┘
```

> **Khác biệt chính:** Employer có nút **"➕ Đăng tin"** nổi bật ở giữa (gradient xanh lớn). Không có tab Bản đồ và Tìm kiếm.

| Tab | Icon | Label | Mô tả |
|-----|------|-------|--------|
| 1 | 🏠 | Tổng quan | Dashboard: thống kê nhanh, tin đang tuyển |
| 2 | 📊 | Quản lý | Quản lý ứng viên + chấm công |
| 3 | ➕ | Đăng tin | Nút giữa nổi bật — mở wizard đăng tin |
| 4 | 💬 | Chat | Nhắn tin với Candidate |
| 5 | 👤 | Tài khoản | Hồ sơ doanh nghiệp + cài đặt |

---

### B.2 Màn hình: Tổng quan (Dashboard Home)

```
┌───────────────────────────────────┐
│ "Xin chào, Quán Mộc ☕"    [🔔]  │
├───────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ │
│ │  3  │ │  5  │ │ 12  │ │ 4.6 │ │
│ │Đang │ │Ứng  │ │Ca   │ │⭐   │ │
│ │tuyển│ │viên │ │hoàn │ │Rating│ │
│ │     │ │mới  │ │thành│ │     │ │
│ └─────┘ └─────┘ └─────┘ └─────┘ │
├───────────────────────────────────┤
│ 🔥 Ứng viên mới (cần duyệt)      │
│ ┌───────────────────────────────┐ │
│ │ [Avatar] Nguyễn Văn A 🛡️95    │ │
│ │ → Phục vụ bàn | Ca Sáng       │ │
│ │ [TỪ CHỐI (red)] [DUYỆT (green)]│ │
│ └───────────────────────────────┘ │
├───────────────────────────────────┤
│ 📋 Tin đang tuyển                  │
│ ┌───────────────────────────────┐ │
│ │ Phục vụ bàn | 2/3 slot đã full │ │
│ │ [Xem ứng viên] [Chỉnh sửa]    │ │
│ └───────────────────────────────┘ │
├───────────────────────────────────┤
│ [🏠] [📊] [➕] [💬] [👤]         │
└───────────────────────────────────┘
```

**Các nút:**
- `[🔔 Bell]` — Notifications (có badge)
- `[Stat Cards]` — Tap mở chi tiết thống kê
- `[TỪ CHỐI]` — Nút đỏ outline — từ chối ứng viên
- `[DUYỆT]` — Nút xanh lá filled — duyệt ứng viên
- `[Xem ứng viên]` — Mở danh sách ứng viên cho tin đó
- `[Chỉnh sửa]` — Sửa tin đăng
- `[➕ Đăng tin]` — Nút giữa mở Wizard đăng tin

---

### B.3 Màn hình: Đăng tin Tuyển dụng (Post Job Wizard)

**4 bước — Progress bar ở trên cùng:**

**Step 1 — Thông tin:**
- `[Input]` Tiêu đề tin (vd: "Cần 2 bạn chạy bàn")
- `[Chips]` Danh mục: F&B, Sự kiện, Giao hàng, Bán hàng
- `[Textarea]` Mô tả công việc
- `[Toggle]` Giới tính: Nam / Nữ / Không yêu cầu
- `[Skills Chips]` Kỹ năng yêu cầu
- `[TIẾP TỤC →]` — Nút primary

**Step 2 — Lương & Vị trí:**
- `[Input]` Mức lương (VNĐ)
- `[Chips]` Loại: Theo giờ / Theo ca / Theo ngày
- `[Mini Map]` — Pin kéo thả xác định vị trí
- `[Auto-fill]` Địa chỉ tự điền từ pin
- `[← QUAY LẠI]` `[TIẾP TỤC →]`

**Step 3 — Ca làm:**
- `[Tab]` Thời vụ / Cố định
- `[Date Picker]` Ngày bắt đầu
- `[Time Picker]` Giờ bắt đầu - kết thúc
- `[Input]` Số lượng cần
- `[+ Thêm ca]` — Thêm ca mới
- `[🗑️ Xóa]` — Xóa ca
- `[← QUAY LẠI]` `[TIẾP TỤC →]`

**Step 4 — Xác nhận:**
- Summary card tổng hợp
- `[📷 Upload ảnh bìa]` — Upload ảnh
- `[Banner Boost]` — "🔥 Boost 20k – Hiển thị với 500 người"
- `[ĐĂNG TIN MIỄN PHÍ]` — Nút primary xanh
- `[ĐĂNG + BOOST 🔥]` — Nút gold gradient

---

### B.4 Màn hình: Quản lý Ứng viên

**Các nút & thành phần:**
- `[← Back]` — Quay lại
- `[Job Selector]` — Dropdown chọn tin đăng
- `[Tabs]` — Tất cả / Chờ duyệt / Đã duyệt ✓ / Từ chối
- **Applicant Card:**
  - `[Avatar]` + Tên + 🛡️ Trust Score + eKYC badge
  - `[Skills Chips]` — Kỹ năng ứng viên
  - `[TỪ CHỐI]` — Nút đỏ
  - `[DUYỆT]` — Nút xanh lá
- **Khi đã duyệt (Expandable):**
  - `[📞 SĐT]` — Hiển thị số điện thoại
  - `[💬 Chat]` — Nhắn tin trực tiếp
  - `[📱 Tạo mã QR check-in]` — Tạo QR cho ứng viên
- `[🎉 Đã đủ người]` — Banner khi slots = 0

---

### B.5 Màn hình: Xem Chấm công (Attendance)

**Các nút:**
- `[← Back]`
- `[Date Filter]` — Chọn ngày xem
- **Attendance Card:**
  - Tên ứng viên + Ca làm
  - Check-in time + Check-out time
  - GPS distance khi check-in
  - `[✅ Xác nhận hoàn thành]` — Nút xanh
  - `[⚠️ Báo cáo vấn đề]` — Nút cam

---

### B.6 Màn hình: Hồ sơ Doanh nghiệp

```
┌───────────────────────────────────┐
│ [📷 Ảnh cửa hàng]                 │
│    ┌──────┐                        │
│    │Avatar│  Quán Mộc Cafe         │
│    └──────┘  👑 Gold Tier | 45 followers │
├───────────────────────────────────┤
│ [Theo dõi] [Nhắn tin]             │ ← Cho người xem
├───────────────────────────────────┤
│ 🛡️ Trust: 92/100 | ⭐ 4.6         │
│ Badges: [✓ GPKD] [✓ eKYC]        │
├───────────────────────────────────┤
│ 📍 Quận 1, HCM | ☎️ 1900xxxx | F&B │
├───────────────────────────────────┤
│ Đang tuyển (3):                    │
│ [Job Card 1] [Job Card 2] [+1]    │
├───────────────────────────────────┤
│ Đánh giá từ ứng viên:             │
│ ⭐4.8 "Trả lương đúng hẹn"        │
├───────────────────────────────────┤
│ 156 ca đã hoàn thành              │
└───────────────────────────────────┘
```

**Các nút (khi Employer xem profile mình):**
- `[Chỉnh sửa hồ sơ]` — Sửa thông tin cửa hàng
- `[Xác thực eKYC / GPKD]` — Luồng xác thực
- `[⚙️ Settings]` — Cài đặt tài khoản

---

### B.7 Màn hình: Mua gói Dịch vụ (Premium/Upsell)

**Các nút:**
- `[← Back]`
- **Package Cards:**
  - `[🔥 GÓI CÒI HỤ — 20k]` — Push notification đến 500 người
  - `[📌 GHIM ĐẨY TOP — 15k/ngày]` — Top 3 trên bản đồ
  - `[👑 VIP THÁNG — 299k]` — Unlimited posts + badge "Pro-Hunter"
- **Payment Methods:**
  - `[VietQR]` `[Momo]` `[Ví JobNow]`
- `[MUA NGAY]` — Nút primary
- `[FAQ Expandable]` — Câu hỏi thường gặp

---

### B.8 Màn hình: Ví & Giao dịch (Employer)

**Các nút:**
- `[+ Nạp tiền]` — Nạp vào ví (để mua gói)
- **Quick Actions:**
  - `[🚀 Boost]` — Boost tin đăng
  - `[📌 Ghim]` — Ghim tin lên top
  - `[🔔 Còi]` — Gửi push notification
- `[Filter]` — Tất cả / Nạp / Chi tiêu
- `[Monthly Chart]` — Biểu đồ chi tiêu

---

### B.9 Màn hình: Đánh giá Ứng viên (Review)

**Các nút:**
- `[⭐⭐⭐⭐⭐]` — 5 sao tương tác
- `[Chips]` — "Nhanh nhẹn", "Đúng giờ", "Nhiệt tình", "Cần cải thiện"
- `[Textarea]` — Nhận xét
- `[GỬI ĐÁNH GIÁ]` — Nút primary xanh

---

## Tổng hợp So sánh Nhanh

| Tính năng | Candidate | Employer |
|-----------|-----------|----------|
| **Bottom Nav giữa** | 📅 Ca của tôi | ➕ Đăng tin (nổi bật) |
| **Tab 1** | 🗺️ Bản đồ GPS | 🏠 Dashboard tổng quan |
| **Tab 2** | 🔍 Tìm kiếm + Bộ lọc | 📊 Quản lý ứng viên |
| **Nút chính** | ỨNG TUYỂN NGAY | ĐĂNG TIN / DUYỆT |
| **Check-in** | ✓ CHECK-IN GPS | Xem chấm công + QR |
| **Ví** | Nạp + **Rút tiền** | Nạp + **Boost/Ghim/Còi** |
| **Hồ sơ** | Skills + Lịch sử làm | Ảnh cửa hàng + GPKD |
| **Review** | Đánh giá Employer | Đánh giá Candidate |
| **Premium** | ❌ Không có | ✅ Mua gói Boost/VIP |
| **eKYC** | Chụp CCCD | Chụp CCCD + GPKD |

---

## Hướng dẫn sử dụng với MCP Stitch

Khi tạo prompt cho Stitch AI, hãy:

1. **Luôn mở đầu** bằng Design System tokens ở trên
2. **Ghi rõ vai trò** trong prompt: "This screen is for **CANDIDATE role**" hoặc "**EMPLOYER role**"
3. **Copy wireframe ASCII** tương ứng vào prompt
4. **Liệt kê tất cả nút** từ phần "Các nút" của mỗi màn hình
5. **Ghi rõ Bottom Navigation** khác nhau cho mỗi vai trò
6. Kết thúc bằng: `Mobile 390x844 (iPhone 14). Clean minimalism + glassmorphism.`
