# 📱 Candidate — C05: Wallet

> **Actor:** Candidate  
> **Flow:** Xem số dư → Lịch sử giao dịch → Rút tiền  
> **Route:** `/candidate/wallet.tsx`

---

## Ngữ cảnh nghiệp vụ

Candidate nhận lương sau khi hoàn thành ca làm (employer thanh toán). Xem số dư, lịch sử giao dịch, rút tiền về tài khoản ngân hàng.

**Dữ liệu:** users.balance, transactions (type: CREDIT/DEBIT, status: SUCCESS/PENDING)

---

## PROMPT cho Stitch MCP

```
You are a Senior Mobile UI/UX Designer. Design the "Candidate Wallet" screen 
for JobNow mobile app.

**Design System:** Flat Design, Professional Minimalism.
- Colors: Primary #0F172A, CTA #0369A1, Success #10B981, BG #F8FAFC
- Fonts: Poppins headings, Inter body.

**Screen Layout (375×812px):**

**Balance Card (Hero):**
- Large card, rounded-3xl, bg-gradient-to-br from-#0F172A to-#0369A1, p-6
- "Số dư khả dụng" (Inter 400, 14px, white/70)
- Amount: "1.250.000đ" (Poppins 700, 32px, white)
- Two buttons row:
  - "Rút tiền" (bg-white, text-#0F172A, rounded-xl, ArrowUpFromLine icon)
  - "Lịch sử" (bg-white/20, text-white, rounded-xl, History icon)

**Quick Stats Row (3 cards):**
- "Tháng này": "+2.400.000đ" (emerald)
- "Đang chờ": "600.000đ" (amber)
- "Đã rút": "1.150.000đ" (slate)
- Each: rounded-xl, bg-white, shadow-sm, p-3, centered

**Transaction List:**
- Section header: "Lịch sử giao dịch" + "Xem tất cả" link
- Filter chips: "Tất cả" | "Nhận lương" | "Rút tiền"
- Transaction item:
  - Left: Circle icon (emerald ArrowDownLeft for receive, red ArrowUpRight for withdraw)
  - Middle: Description ("Lương từ Ca sáng - Quán ABC") + timestamp
  - Right: Amount "+150.000đ" (emerald) or "-500.000đ" (red)
  - Status dot: green (success), amber (pending)

**Withdraw Flow (BottomSheet):**
- Title: "Rút tiền về tài khoản"
- Bank selector dropdown (Vietcombank, BIDV, Techcombank, MoMo...)
- Account number input
- Account holder name input
- Amount input with "Tối đa" quick-fill link
- Fee note: "Phí rút: 0đ (miễn phí)" (emerald text)
- "Xác nhận rút tiền" CTA button
- Processing time note: "Tiền sẽ về tài khoản trong 1-3 ngày làm việc"

**Empty State:** 
- "Chưa có giao dịch nào"
- "Hoàn thành ca làm để nhận lương đầu tiên!"

Design the balance card as a premium, fintech-style element. 
Transaction list should be clean and scannable.
```
