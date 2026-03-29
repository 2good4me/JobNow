# 🎨 JobNow Mobile App – Global Design System Prompt

> **Mục đích:** Chạy prompt này ĐẦU TIÊN trên Stitch MCP để thiết lập Design System chung cho toàn bộ app.

---

## PROMPT: Global Design System

```
You are a Senior Mobile UI/UX Designer specializing in Employment & Hiring platforms.
Create a comprehensive Design System for "JobNow" — a GPS-based gig work platform 
connecting Candidates (job seekers) with Employers (businesses hiring temporary staff).

**App Context:**
- Vietnamese market, mobile-first (375px base)
- Two main user roles: Candidate (tìm việc) & Employer (tuyển dụng)
- Core features: GPS job map, shift booking, attendance (QR/GPS), wallet, chat, eKYC, reviews
- Think "Grab/Uber for temporary jobs"

**Design Style:** Professional Minimalism + Flat Design
- Mood: Modern, Professional, Clean, Trustworthy
- No gradients/heavy shadows. Use flat colors with subtle elevation (shadow-sm)
- Generous whitespace for content-heavy screens
- Rounded corners (16px cards, 12px buttons, 8px inputs)

**Color Palette:**
- Primary Brand: #0F172A (Slate 900) — headers, key text
- CTA Blue: #0369A1 (Sky 700) — primary buttons, links, active states
- Secondary Blue: #3B82F6 (Blue 500) — hover, selected states
- Accent Amber: #F59E0B — urgent badges ("Hot Job", "Gấp"), warnings
- Success: #10B981 (Emerald 500) — check-in, approved, paid
- Danger: #EF4444 (Red 500) — reject, delete, overdue
- Background Light: #F8FAFC (Slate 50) — page background
- Card White: #FFFFFF — card surfaces
- Text Primary: #0F172A — headings
- Text Body: #475569 (Slate 600) — body text
- Text Muted: #64748B (Slate 500) — captions, timestamps

**Typography:**
- Headings: Poppins (500, 600, 700) — job titles, section headers
- Body: Inter or Open Sans (400, 500) — descriptions, form labels
- Base size: 16px (1rem), line-height: 1.5

**Component Standards:**
- All touch targets minimum 44×44px
- All clickable elements have cursor-pointer
- Buttons: rounded-xl, height 48px, font-weight 600
- Cards: rounded-2xl, shadow-sm, border border-slate-100, padding 16px
- Badges: rounded-full, px-3 py-1, font-size 12px
- Icons: Lucide React icon set ONLY (no emojis as icons)
- Transitions: 150-300ms ease for all interactive states
- Skeleton loading for all async content

**Mobile Navigation Pattern:**
- Bottom Tab Bar (5 tabs max) with active indicator
- Candidate tabs: [Home/Map] [Shifts] [Chat] [Notifications] [Profile]
- Employer tabs: [Dashboard] [Jobs] [Chat] [Notifications] [Profile]
- Use Sheet/BottomSheet for filters and quick actions
- Pull-to-refresh on all list screens

**Status Color System:**
- PENDING: Amber/Yellow (#F59E0B bg, #92400E text)
- APPROVED/ACTIVE: Emerald (#10B981 bg, #065F46 text)
- REJECTED: Red (#EF4444 bg, #991B1B text)
- COMPLETED: Blue (#3B82F6 bg, #1E3A5F text)
- PAID: Emerald with checkmark icon
- UNPAID: Amber with clock icon

Generate the complete design system with all tokens, spacing scale (4px base), 
and component library overview.
```

---

## PROMPT: Auth & Onboarding Screens

```
You are a Senior Mobile UI/UX Designer. Design the Authentication & Onboarding flow 
for "JobNow" mobile app.

**App Context:** JobNow is a GPS-based gig work platform in Vietnam. Users choose between 
two roles: Candidate (job seeker) or Employer (hiring business).

**Design System:** Professional Minimalism, Flat Design.
- Colors: Primary #0F172A, CTA #0369A1, Accent #F59E0B, BG #F8FAFC
- Fonts: Poppins (headings), Inter (body), base 16px
- All buttons 48px height, rounded-xl. Touch targets 44×44px min.
- Icons: Lucide React only. No emojis.

**Screen 1 — Splash / Welcome:**
- Full-screen with JobNow logo centered
- Tagline: "Tìm việc gần bạn, ngay lập tức" (Find jobs near you, instantly)
- Subtle animation: logo fade-in + tagline slide-up
- Background: gradient from #0F172A to #0369A1 (only place gradient is used)

**Screen 2 — Onboarding Carousel (3 slides):**
- Slide 1: Illustration of map with job pins + "Khám phá việc làm quanh bạn" 
- Slide 2: Illustration of calendar with shifts + "Chọn ca làm phù hợp"
- Slide 3: Illustration of wallet + "Nhận lương nhanh chóng"
- Dot indicator at bottom, "Bỏ qua" (Skip) top-right, "Tiếp tục" CTA button bottom

**Screen 3 — Role Selection:**
- Title: "Bạn muốn sử dụng JobNow với vai trò nào?"
- Two large cards side-by-side:
  - Left card: Briefcase icon + "Tìm việc" (I want to Work) — blue border when selected
  - Right card: Building2 icon + "Tuyển dụng" (I want to Hire) — blue border when selected
- Each card: 160×180px, rounded-2xl, shadow-sm, illustration placeholder
- Bottom: "Tiếp tục" CTA button (disabled until role selected)

**Screen 4 — Phone Login:**
- Title: "Đăng nhập bằng số điện thoại"
- Phone input with Vietnam +84 prefix (flag icon)
- Large "Gửi mã OTP" CTA button
- Divider: "hoặc đăng nhập bằng"
- Social buttons row: Google | Facebook | Apple (outline style, icon-only, 48×48px)
- Bottom text link: "Chưa có tài khoản? Đăng ký"

**Screen 5 — OTP Verification:**
- Title: "Nhập mã xác thực"
- Subtitle: "Mã đã gửi đến 0912****89"
- 6-digit OTP input boxes (48×48px each, rounded-xl, auto-focus next)
- Countdown timer: "Gửi lại sau 60s" (disabled state) → "Gửi lại mã" (active)
- Auto-submit when 6 digits entered

**Screen 6 — Registration (Basic Info):**
- Title: "Hoàn tất hồ sơ"
- Avatar upload circle (80×80px) with Camera icon overlay
- Form fields: Họ và tên (*), Email, Ngày sinh (date picker), Thành phố (dropdown)
- "Hoàn tất" CTA button
- Form validation: inline error messages below each field

Design all 6 screens as a cohesive mobile-first flow (375×812px viewport).
```
