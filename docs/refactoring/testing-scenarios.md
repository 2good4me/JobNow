# Employer Job Posting - Testing Scenarios

## Test Environment Setup

**Browser:** Chrome/Safari (latest)  
**Device:** Mobile (375px width) & Desktop  
**Build:** `pnpm dev`  
**URL:** `http://localhost:5173/employer/post-job`

---

## 🧪 Test Cases

### SCENARIO 1: HOURLY Payment Flow

#### Step 1: Job Information
| Input | Value | Validation |
|-------|-------|-----------|
| Title | "Cần 10 bạn phục vụ tiệc cưới tối 30/3" | ✅ >= 5 chars |
| Category | "F&B Service" | ✅ Selected |
| Description | "Phục vụ tiệc cưới, hỗ trợ chế biến, vệ sinh..." | ✅ 50-500 chars |
| Workers | 10 | ✅ >= 1 |
| Salary | 50000 | ✅ > 0 |
| Pay Type | **Theo giờ** | ✅ Selected |

**Expected Dynamic Changes:**
- [ ] Salary label becomes "Lương (VNĐ / giờ)"
- [ ] Info box shows: "Tiền lương được tính dựa trên số giờ làm việc thực tế của mỗi ca. VD: 9 giờ × 50,000đ/giờ × 2 người = 900,000đ"
- [ ] System shows icon next to salary field

**Result:** ✅ Proceed to Step 2

---

#### Step 2: Work Details & Location
| Input | Value | Validation |
|-------|-------|-----------|
| Address | "123 Nguyễn Huệ, Q.1, TP.HCM" | ✅ >= 5 chars |
| Start Date | "2025-03-30" | ✅ Valid date |
| Deadline | "2025-03-29" | ❌ Must be >= Start Date |
| Deadline (corrected) | "2025-03-30" | ✅ Valid |
| GPS | [Tap "Lấy vị trí GPS"] | ✅ Coordinates set |

**Expected GPS Banner:**
- [ ] Shows location coordinates
- [ ] Disappears when GPS is set
- Shows error: "⚠️ Vui lòng chọn vị trí GPS trước khi tiếp tục" if skipped

**Result:** ✅ Proceed to Step 3

---

#### Step 3: Work Shifts
| Shift | Start | End | Qty | Expected Hours |
|-------|-------|-----|-----|-----------------|
| Shift 1 | 08:00 | 12:00 | 5 | 4 hours × 5 = 20h |
| Shift 2 | 14:00 | 17:00 | 3 | 3 hours × 3 = 9h |
| **Total** | | | | **29 hours** |

**Budget Calculation Expected:**
```
Total = 50,000đ/hour × 29 hours = 1,450,000đ

Breakdown shown:
✓ Ca 1 (08:00-12:00, 5 người) - 1,000,000đ
✓ Ca 2 (14:00-17:00, 3 người) - 450,000đ

⏱️ Tổng số giờ: 29.0 giờ
```

**Test Actions:**
- [ ] Add first shift → Budget updates to 1,000,000đ
- [ ] Add second shift → Budget updates to 1,450,000đ  
- [ ] Change Shift 1 end time to 17:00 → Budget recalculates to 1,850,000đ
- [ ] Try to set end time before start → Error: "Giờ kết thúc phải >= giờ bắt đầu"
- [ ] Delete Shift 2 → Budget returns to 1,000,000đ
- [ ] Remove both shifts → Error: "Phải có ít nhất 1 ca làm" (Next button disabled)

**Result:** ✅ Proceed to Step 4

---

#### Step 4: Final Review
**Expected Summary Card:**
```
─────────────────────────────
Cần 10 bạn phục vụ tiệc cưới...
F&B Service

💰 50,000đ / giờ
📍 123 Nguyễn Huệ, Q.1, TP.HCM
👥 10 người — Cả hai
📅 30/3/2025
─────────────────────────────

Mô tả:
Phục vụ tiệc cưới, hỗ trợ chế biến, vệ sinh...

Ca làm việc (2):
  Ca 1  08:00 — 12:00 · 5 người
  Ca 2  14:00 — 17:00 · 3 người

TỔNG NGÂN SÁCH DỰ KIẾN [Theo giờ]
1,450,000 VNĐ

Tính toán:
✓ Ca 1 (08:00-12:00, 5 người) - 1,000,000đ
✓ Ca 2 (14:00-17:00, 3 người) - 450,000đ

⏱️ Tổng số giờ: 29.0 giờ
─────────────────────────────
```

**Test Actions:**
- [ ] Upload image (max 5MB)
- [ ] Toggle Premium option
- [ ] Verify all data matches Step 3 exactly
- [ ] Click "Đăng tin ngay"

**Expected Result:**
```
✅ Toast: "Đăng tin thành công!"
✅ Redirect to /employer dashboard
```

---

### SCENARIO 2: SHIFT Payment Flow

#### Step 1: Job Information
| Input | Value |
|-------|-------|
| Title | "Tuyển nhân viên kho 3 ca" |
| Category | "Warehouse" |
| Description | "Sắp xếp hàng, quản lý kho..." |
| Workers | 8 |
| Salary | 120000 |
| **Pay Type** | **Theo ca** |

**Expected Changes:**
- [ ] Salary label: "Lương (VNĐ / ca)"
- [ ] Explanation: "Tiền lương được tính theo số ca làm. VD: 120,000đ/ca × 3 ca = 360,000đ"

---

#### Step 3: Work Shifts (Shift Payment)
| Shift | Duration | Qty | Calc |
|-------|----------|-----|------|
| Ca sáng | 06:00-14:00 | 3 | 120,000 × 3 = 360,000đ |
| Ca chiều | 14:00-22:00 | 4 | 120,000 × 4 = 480,000đ |
| Ca đêm | 22:00-06:00 | 2 | 120,000 × 2 = 240,000đ |

**Budget Expected:**
```
Total = 120,000 × (3+4+2) = 1,080,000đ

Breakdown:
✓ Ca sáng (3 ca) - 360,000đ
✓ Ca chiều (4 ca) - 480,000đ
✓ Ca đêm (2 ca) - 240,000đ

⏱️ No hours shown (SHIFT type)
```

**Key Test:**
- [ ] Budget does NOT multiply by hours (time fields are for reference only)
- [ ] Budget recalculates when shift quantities change
- [ ] NO working hours counter (unlike Hourly)

---

### SCENARIO 3: DAILY Payment Flow

#### Step 1: Job Information
| Input | Value |
|-------|-------|
| Title | "Tuyển event staff 2 ngày" |
| Category | "Event Helper" |
| Description | "Hỗ trợ setup, hướng dẫn khách..." |
| Workers | 5 |
| Salary | 250000 |
| **Pay Type** | **Theo ngày** |

**Expected Changes:**
- [ ] Salary label: "Lương (VNĐ / ngày)"
- [ ] Explanation: "Tiền lương được tính theo ngày làm. VD: 250,000đ/ngày × 3 người × 2 ngày = 1,500,000đ"

---

#### Step 3: Work Shifts (Daily - Shifts track working days)
| Shift | Duration | Qty | Purpose |
|-------|----------|-----|---------|
| Ngày 1 | 08:00-20:00 | 5 | Day 1 |
| Ngày 2 | 08:00-20:00 | 5 | Day 2 |

**Budget Expected:**
```
Total = 250,000 × 5 people × 2 days = 2,500,000đ

Breakdown:
✓ 2 ngày × 5 người - 2,500,000đ

⏱️ No hours shown
```

**Key Test:**
- [ ] Time ranges don't affect calculation (purely for reference)
- [ ] Budget ignores hours and shift duration
- [ ] Simple: salary × workers × 2 days

---

### SCENARIO 4: Validation Guards

#### Time Guard Test
1. Go to Step 3
2. Add Shift with:
   - Start: 14:00
   - End: 08:00
3. Try to go to Step 4

**Expected:**
```
Error: "Giờ kết thúc phải >= giờ bắt đầu"
Next button DISABLED
```

---

#### Location Guard Test
1. Go to Step 2
2. Skip GPS selection (don't tap button)
3. Try to go to Step 3

**Expected:**
```
Banner appears: "⚠️ Vui lòng chọn vị trí GPS trước khi tiếp tục"
Next button DISABLED (yellow/gray)
```

---

#### Salary Guard Test
1. Go to Step 1
2. Leave Salary empty
3. Try to go to Step 2

**Expected:**
```
Error: "Mức lương không được để trống"
Next button DISABLED
```

Or enter Salary = 0:
```
Error: "Mức lương phải > 0"
Next button DISABLED
```

---

### SCENARIO 5: Job Detail Page Consistency

#### Create HOURLY Job:
- Salary: 50,000đ/h
- Workers: 3
- Shift: 08:00-17:00 (9 hours)

**Expected Budget:** 50,000 × 9 × 3 = 1,350,000đ

#### Navigate to Job Detail:
1. Create job with above data
2. Go back to /employer
3. Click on the job posted
4. Navigate to /employer/job-detail with jobId

**Expected Detail Page Display:**
```
Tổng ngân sách dự kiến [Theo giờ]
1,350,000 VNĐ

Tính toán:
✓ Ca làm (09:00-17:00, 3 người) - 1,350,000đ

⏱️ Tổng số giờ: 27.0 giờ
```

**Verification:**
- [ ] Budget MATCHES what was shown in Step 4 posting wizard
- [ ] Breakdown MATCHES Step 4 format
- [ ] Working hours MATCHES Step 3 display

---

### SCENARIO 6: Edit Existing Job

#### Setup:
1. Create SHIFT job: 8 ca × 120,000đ = 960,000đ
2. From job detail, tap "Chỉnh sửa"
3. Modify: Add 2 more shifts

#### Expected:
```
Before edit: 960,000đ (8 ca)
After adding 2 shifts: 1,200,000đ (10 ca)
```

**Verification:**
- [ ] Form pre-populates with existing data
- [ ] Budget updates correctly
- [ ] All existing fields preserved
- [ ] Can modify payment type (Step 1)

---

## ✅ Regression Tests

### Form State Conservation
- [ ] Edit job → navigates back → data preserved
- [ ] All 4 steps maintain state while navigating
- [ ] Clear button works (if exists)

### Mobile UI
- [ ] Buttons reachable with thumb (52px+ height)
- [ ] Inputs touch-friendly (no overlays)
- [ ] Modals scroll if content overflows
- [ ] Bottom action bar doesn't cover content

### Accessibility
- [ ] Error messages associated with fields
- [ ] Color-blind friendly (not red/green only)
- [ ] All interactive elements labeled
- [ ] Keyboard navigation works (Tab/Enter)

### Performance
- [ ] Budget updates instantly (no lag)
- [ ] Adding 10+ shifts remains responsive
- [ ] Image upload doesn't freeze UI
- [ ] No memory leaks on page revisit

---

## 🐛 Known Issues & Edge Cases

| Issue | Status | Notes |
|-------|--------|-------|
| Time crossing midnight | ❌ Not supported | e.g., 22:00-06:00 returns 0h |
| Leap seconds | ⚠️ Edge case | Handled by JS Date |
| Negative coordinates | ❌ Rejected | GPS validation required |
| Very large numbers | ⚠️ Edge case | > 2^53 may lose precision |

---

## 📊 Test Coverage Checklist

### Functionality
- [ ] All 3 payment types work end-to-end
- [ ] Time guard prevents invalid times
- [ ] Location guard prevents submission without GPS
- [ ] Budget calculations accurate for all types
- [ ] Edit existing job maintains data

### UI/UX
- [ ] Dynamic labels update correctly
- [ ] Explanation boxes appear on type change
- [ ] Breakdown shows all line items
- [ ] Progress indicator highlights current step
- [ ] Error messages clear and actionable

### Integration
- [ ] Job detail shows modified budget correctly
- [ ] Database stores correct salaryType enum
- [ ] React Query mutations work
- [ ] Toast notifications appear
- [ ] Navigation works on success/cancel

### Edge Cases
- [ ] 0 salary handled gracefully
- [ ] 0 workers handled gracefully
- [ ] Empty shifts array rejected
- [ ] Missing GPS rejected
- [ ] Invalid dates rejected

---

**Test Date:** _______________  
**Tester:** _______________  
**Result:** ✅ PASS / ❌ FAIL

