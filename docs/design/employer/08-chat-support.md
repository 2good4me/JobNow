# 📱 Shared — Chat & Support Center

> **Actor:** Candidate + Employer (chung)  
> **Flow:** Chat realtime | Trung tâm hỗ trợ  
> **Routes:** `/candidate/chat.tsx`, `/employer/chat.tsx`, `/support-center.tsx`

---

## PROMPT 1: Chat List

```
You are a Senior Mobile UI/UX Designer. Design the "Chat List" screen 
for JobNow mobile app — shared between Candidate and Employer.

**Design System:** Flat Design, Professional Minimalism.
- Colors: Primary #0F172A, CTA #0369A1, BG #F8FAFC

**Screen Layout (375×812px):**

**Header:** "Tin nhắn" + Search icon

**Chat List Items:**
- Each item: h-72px, flex row, border-bottom
- Left: Avatar (48×48px, rounded-full) + Online dot (green, 12px, bottom-right)
- Middle:
  - Name (Inter 500, 15px, #0F172A)
  - Last message preview (Inter 400, 13px, #64748B, truncate 1 line)
  - Job context tag: small chip "Nhân viên phục vụ" (bg-sky-50, text-xs)
- Right: 
  - Timestamp "14:32" or "Hôm qua" (text-xs, slate-400)
  - Unread count badge: circle 20×20px, bg-sky-700, white text

**Empty State:**
- MessageSquare illustration
- "Chưa có cuộc trò chuyện nào"
- "Bắt đầu chat với ứng viên/NTD từ trang chi tiết công việc"

Design as a familiar messaging app list (like Zalo/Messenger).
```

---

## PROMPT 2: Chat Detail

```
You are a Senior Mobile UI/UX Designer. Design the "Chat Detail" screen 
for JobNow mobile app.

**Design System:** Same as above.

**Screen Layout (375×812px):**

**Header:** 
- Back arrow + Avatar (32×32) + Name + Online status
- Right: Phone icon + More menu (...)

**Job Context Bar (pinned below header):**
- Mini card: "Về công việc: Nhân viên phục vụ — 150K/h"
- Tap to view job detail

**Message Bubbles:**
- Sent (right): bg-sky-700, text-white, rounded-2xl rounded-br-md
- Received (left): bg-white, text-#0F172A, rounded-2xl rounded-bl-md, shadow-sm
- Timestamp below each bubble (text-xs, slate-400)
- Read indicator: double check (blue) for read, single check for sent

**Quick Phrases (scrollable row above input):**
- "Tôi đang đến", "Bạn ở đâu?", "Đã nhận", "OK" 
- Each: rounded-full, bg-sky-50, border-sky-200, px-3 py-1

**Input Bar (sticky bottom):**
- Left buttons: Camera icon + MapPin icon (share location)
- Text input: rounded-full, bg-slate-100, flex-1
- Right: Send button (circle, bg-sky-700, SendHorizontal icon)

**Typing indicator:** Three animated dots in received bubble style

Design as a clean, functional messaging screen focused on work context.
```

---

## PROMPT 3: Support Center

```
You are a Senior Mobile UI/UX Designer. Design the "Support Center" screen 
for JobNow mobile app.

**Design System:** Same as above.

**Screen Layout (375×812px):**

**Header:** "Trung tâm hỗ trợ" + Search icon

**Search Bar:** "Tìm câu hỏi..."

**Quick Actions (2×2 grid):**
- "Hướng dẫn sử dụng" (BookOpen icon)
- "Báo lỗi" (Bug icon)
- "Góp ý" (MessageCircle icon)
- "Liên hệ" (Phone icon)

**FAQ Sections (accordion):**
- "Tài khoản & Đăng nhập" (3 items)
- "Ứng tuyển & Tuyển dụng" (5 items)
- "Thanh toán & Ví" (4 items)
- "Báo cáo vi phạm" (2 items)
- Each item: expandable with ChevronDown/Up animation

**Contact Section:**
- Email: support@jobnow.vn
- Hotline: 1900-xxxx
- "Chat với hỗ trợ viên" CTA button

Design as a help center — organized, searchable, self-service first.
```
