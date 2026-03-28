# 📱 Employer — E06: Wallet & Billing

> **Actor:** Employer  
> **Flow:** Xem số dư → Nạp tiền (VNPay) → Thanh toán lương → Lịch sử giao dịch  
> **Routes:** `/employer/wallet.tsx`, `/employer/vnpay-return.tsx`

---

## Ngữ cảnh nghiệp vụ

Employer nạp tiền vào ví (qua VNPay) → tiền dùng để thanh toán lương cho candidate sau mỗi ca. Có thể bật auto-pay. Xem lịch sử giao dịch (nạp/trả lương).

---

## PROMPT cho Stitch MCP

```
You are a Senior Mobile UI/UX Designer. Design the "Business Wallet & Billing" screen
for JobNow mobile app — Employer view.

**Design System:** Flat Design, Professional Minimalism.
- Colors: Primary #0F172A, CTA #0369A1, Success #10B981, BG #F8FAFC

**Screen Layout (375×812px):**

**Balance Card (Hero):**
- Card: rounded-3xl, bg-gradient-to-br from-#0F172A to-#1E3A5F, p-6
- "Số dư doanh nghiệp" (white/70, 14px)
- Amount: "5.250.000đ" (Poppins 700, 32px, white)
- Two buttons:
  - "Nạp tiền" (bg-sky-500, text-white, rounded-xl, PlusCircle icon)
  - "Lịch sử" (bg-white/20, text-white, rounded-xl, History icon)

**Quick Stats (3 cards):**
- "Chi tháng này": "3.600.000đ" (red text)
- "Chờ thanh toán": "800.000đ" (amber)
- "Đã nạp": "10.000.000đ" (emerald)

**Auto-Pay Setting:**
- Card: rounded-2xl, bg-white, shadow-sm, p-4
- "Tự động thanh toán lương" toggle switch
- Description: "Tự động trả lương cho ứng viên khi hoàn thành ca"
- Status: "🟢 Đang bật" or "⚪ Đã tắt"

**Transaction List:**
- Section header: "Giao dịch gần đây"
- Filter: "Tất cả" | "Nạp tiền" | "Trả lương"
- Transaction item:
  - Deposit: emerald ArrowDownLeft icon + "Nạp tiền VNPay" + "+500.000đ"
  - Payment: red ArrowUpRight icon + "Trả lương — Ca sáng [Job]" + "-150.000đ"
  - Auto-pay: blue Zap icon + "Auto-pay — [Candidate name]" + "-200.000đ"
  - Status: "Thành công" (emerald) | "Đang xử lý" (amber)

**Recharge Bottom Sheet (when tap "Nạp tiền"):**
- Title: "Nạp tiền vào ví"
- Preset amounts: 4 buttons grid
  - "100.000đ" | "500.000đ" | "1.000.000đ" | "5.000.000đ"
  - Selected: border-sky-700, bg-sky-50
- Custom amount input: "Số tiền khác" textarea
- Payment method: VNPay logo + radio button (default selected)
- "Nạp tiền" CTA button
- Security note: "Giao dịch được bảo mật bởi VNPay" (lock icon)

Design with fintech-level polish. Balance card should feel premium.
```
