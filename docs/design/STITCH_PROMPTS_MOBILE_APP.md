# 🚀 JobNow Mobile App - Full Screen Prompt Suite (UI-UX Pro Max)

Tài liệu này chứa bộ Prompt đầy đủ 100% các màn hình cho **Stitch MCP**, chia theo từng Actor và Luồng nghiệp vụ.

---

## 🛠 0. Global Design System (Bắt buộc chạy trước)
> "You are a Senior UI/UX Designer. Create a Design System for **JobNow**. 
> - **Style:** Professional Minimalism, Flat Design.
> - **Palette:** Primary #0F172A, CTA #0369A1, Success #10B981, Danger #EF4444, Warning #F59E0B, Background #F8FAFC.
> - **Typography:** Poppins (Headings), Inter (Body).
> - **Components:** Use Shadcn/UI patterns (Card, Badge, Avatar, Skeleton, Sheet).
> - **Rules:** All buttons 44x44px. Lucide icons only. `cursor-pointer` on all clickable cards."

---

## 🧑‍💻 NHÓM 1: CANDIDATE (ỨNG VIÊN)

### C1. Home & Discovery (Tìm việc)
> "Design Candidate Home screen. 
> - **Top:** Search bar + Filter icon. Below: Horizontal scroll of categories (F&B, Delivery, Event) with subtle icons.
> - **Middle:** Interactive Map with custom Blue Pins ($). 
> - **Bottom Sheet:** Pull-up list of 'Jobs Near You'.
> - **Job Card:** Show Salary (Bold Blue), Distance (Badge), and 'Verified Shop' tick. Use `shadow-sm` and `rounded-xl`."

### C2. Job Detail & Shift Booking (Chi tiết & Đặt ca)
> "Design Job Detail screen. 
> - **Header:** Shop Image + Title + Rating (Star icon).
> - **Quick Stats Row:** [Salary/hr] | [Distance] | [Time].
> - **The Shift Picker:** A grid of cards for each shift (Date, Time, Slot remaining). 
> - **Selection State:** Blue border for selected, Gray for full. 
> - **Sticky Footer:** [Confirm Application] button with a 'Penalty Warning' tooltip."

### C3. My Jobs & Attendance (Việc của tôi & Điểm danh)
> "Design 'My Jobs' screen. 
> - **Tabs:** [Upcoming], [In Progress], [Completed].
> - **Active Shift Card:** Show a 'Check-in' button (Green) and a 'View QR' button.
> - **Attendance UI:** A large QR Scanner interface for checking-in at the shop. Add a 'GPS Distance Check' status indicator."

### C4. Post-Shift Review (Đánh giá sau ca làm)
> "Design 'Review Employer' screen after a shift ends.
> - **Top:** 'How was your shift at [Shop Name]?'.
> - **Rating:** Large 5-star interaction.
> - **Tags:** Multi-select chips: [Punctual Pay], [Friendly Boss], [Clean Environment], [Heavy Workload].
> - **Comment:** Shadcn Textarea for feedback.
> - **Action:** [Submit Review] button."

### C5. Candidate Profile & eKYC (Hồ sơ & Định danh)
> "Design 'Candidate Profile' screen.
> - **Profile Header:** Avatar with 'Verified' badge, Name, Reputation Score (ProgressBar).
> - **eKYC Card:** A yellow alert card 'Verify Identity to unlock Premium Jobs' -> Action: [Start eKYC].
> - **eKYC Flow UI:** Progress bar (3 steps: ID Photo, Portrait, Result). Large camera frame with ID card overlay.
> - **Menu:** [Personal Info], [Work Preferences], [Saved Jobs], [Support]."

### C6. Candidate Wallet (Ví tiền)
> "Design 'Candidate Wallet' screen.
> - **Balance Card:** Large Blue Gradient card showing 'Available to Withdraw'. Button: [Withdraw Money].
> - **Transaction List:** List items with Lucide icons (ArrowDown for Pay, ArrowUp for Withdraw). Show Status: [Success] (Green) or [Pending] (Amber)."

---

## 🏢 NHÓM 2: EMPLOYER (NHÀ TUYỂN DỤNG)

### E1. Employer Dashboard (Tổng quan)
> "Design 'Employer Dashboard' with Bento Grid layout.
> - **Stats:** [Current Staff], [Pending Applicants], [Today's Cost].
> - **Live Monitor:** A card showing 'Staff Currently Working' with Check-in timestamps.
> - **Quick Actions:** [Post Job], [Scan Attendance], [View Reports], [Manage Shop]."

### E2. Post Job Wizard (Đăng tin - 4 bước)
> "Design 'Post Job' flow (Wizard style).
> - **Step 1:** Title, Category, Description.
> - **Step 2:** Salary [Toggle: Hourly/Daily] + Map Pin for location.
> - **Step 3:** Shift Scheduler. UI to add multiple shifts (Start-End time).
> - **Step 4:** Preview & Post. Large blue button: [Publish Job]."

### E3. Applicant Management (Duyệt người)
> "Design 'Applicant Management' screen.
> - **Filter Tabs:** [Pending (5)], [Approved], [Rejected].
> - **Applicant Card:** Avatar, Name, Reputation Score (e.g. 98/100). Buttons: [Reject] (Outline) | [Approve] (Solid Blue).
> - **Detail Sheet:** When clicking an applicant, show a 'Work History' summary."

### E4. Staff Management & Review (Quản lý & Đánh giá)
> "Design 'Staff Management' for an active job.
> - **List:** People currently checked-in.
> - **Review Action:** For people who finished, show a [Review Staff] button.
> - **Staff Review UI:** Stars + Tags: [Hardworking], [Punctual], [Skillful]. Checkbox: [x] Add to 'Favorite Staff' list."

### E5. Employer Wallet & Billing (Ví & Nạp tiền)
> "Design 'Business Wallet' for Employer.
> - **Current Budget:** Show remaining balance.
> - **Recharge Section:** VNPAY integration UI with preset amounts ($50, $100, $500).
> - **Auto-Pay Setting:** Toggle for 'Auto-pay staff after shift completion'."

---

## 💬 NHÓM 3: COMMUNICATION & SETTINGS (CHUNG)

### S1. Chat System (Trò chuyện)
> "Design 'Chat List' & 'Chat Detail' screens.
> - **List:** List of Candidates/Employers with 'Last Message' and 'Job Tag'.
> - **Detail:** Clean messaging UI with bubble styles. Features: [Send Location], [Send Photo], [Quick Phrases: 'I'm arriving', 'Where are you?']."

### S2. Auth & Onboarding (Đăng nhập & Giới thiệu)
> "Design 'Onboarding' flow.
> - **Step 1:** Role Selection: [I want to Work] (Illustration) vs [I want to Hire] (Illustration).
> - **Step 2:** Phone Login with OTP input (6-digit boxes).
> - **Step 3:** Basic Info (Name, City selection)."

### S3. General Settings (Cài đặt)
> "Design 'Settings' screen.
> - **Groups:** [Account Security], [Notifications], [Privacy], [Language], [Dark Mode Toggle].
> - **Footer:** 'JobNow v1.0.0' + [Logout] (Red text)."
