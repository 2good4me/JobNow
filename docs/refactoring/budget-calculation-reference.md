# Budget Calculation - Quick Reference Guide

## Import

```typescript
import { 
  calculateBudget,
  calculateWorkingHours,
  getSalaryLabel,
  getSalaryUnit,
  getSalaryExplanation,
  type BudgetBreakdown 
} from '@/routes/employer/-utils/budgetCalculations';
import type { PayType, Shift } from '@/routes/employer/-schemas/jobFormSchema';
```

---

## Main Function: `calculateBudget()`

### Signature
```typescript
function calculateBudget(
  payType: PayType,
  salaryAmount: number,
  workers: number,
  shifts: Shift[] = [],
  numberOfDays: number = 1
): BudgetBreakdown
```

### Return Object
```typescript
interface BudgetBreakdown {
  totalBudget: number;                    // Final amount in VNĐ
  breakdown: Array<{                      // Per-item breakdown
    label: string;
    amount: number;
  }>;
  explanation: string;                    // Human-readable calculation
  workingHours?: number;                  // Only for HOURLY type
}
```

### Usage Examples

#### Example 1: HOURLY Payment
```typescript
const shifts: Shift[] = [
  {
    id: 'shift-1',
    name: 'Ca sáng',
    startTime: '08:00',
    endTime: '12:00',
    quantity: 5
  }
];

const result = calculateBudget('Theo giờ', 50000, 5, shifts);

console.log(result);
// {
//   totalBudget: 1000000,  // 4 hours × 50000 × 5 people
//   breakdown: [
//     { label: 'Ca sáng (08:00-12:00, 5 người)', amount: 1000000 }
//   ],
//   explanation: 'Tính là: Lương 50,000đ/giờ × 20 giờ làm = 1,000,000đ',
//   workingHours: 20
// }
```

#### Example 2: SHIFT Payment
```typescript
const shifts: Shift[] = [
  {
    id: 'shift-1',
    name: 'Morning',
    startTime: '08:00',
    endTime: '17:00',
    quantity: 3
  },
  {
    id: 'shift-2',
    name: 'Afternoon',
    startTime: '14:00',
    endTime: '22:00',
    quantity: 2
  }
];

const result = calculateBudget('Theo ca', 120000, 5, shifts);

console.log(result);
// {
//   totalBudget: 600000,  // 120000 × (3 + 2) shifts
//   breakdown: [
//     { label: 'Morning (3 ca)', amount: 360000 },
//     { label: 'Afternoon (2 ca)', amount: 240000 }
//   ],
//   explanation: 'Tính là: Lương 120,000đ/ca × 5 ca = 600,000đ'
// }
```

#### Example 3: DAILY Payment
```typescript
const result = calculateBudget('Theo ngày', 250000, 3, [], 2);

console.log(result);
// {
//   totalBudget: 1500000,  // 250000 × 3 people × 2 days
//   breakdown: [
//     { label: '2 ngày × 3 người', amount: 1500000 }
//   ],
//   explanation: 'Tính là: Lương 250,000đ/ngày × 3 người × 2 ngày = 1,500,000đ'
// }
```

---

## Helper Functions

### `calculateWorkingHours(startTime, endTime)`

Convert time strings to decimal hours.

```typescript
calculateWorkingHours('08:00', '12:00')  // → 4
calculateWorkingHours('08:00', '17:00')  // → 9
calculateWorkingHours('08:00', '20:30')  // → 12.5
calculateWorkingHours('', '12:00')       // → 0 (invalid)
```

### `getSalaryLabel(payType)`

Get dynamic label for input field based on payment type.

```typescript
getSalaryLabel('Theo giờ')   // → 'Lương (VNĐ / giờ)'
getSalaryLabel('Theo ca')    // → 'Lương (VNĐ / ca)'
getSalaryLabel('Theo ngày')  // → 'Lương (VNĐ / ngày)'
```

### `getSalaryUnit(payType)`

Get unit suffix for displaying salary.

```typescript
getSalaryUnit('Theo giờ')   // → 'đ/giờ'
getSalaryUnit('Theo ca')    // → 'đ/ca'
getSalaryUnit('Theo ngày')  // → 'đ/ngày'
```

### `getSalaryExplanation(payType)`

Get user-friendly explanation of how the salary is calculated.

```typescript
getSalaryExplanation('Theo giờ')
// → 'Tiền lương được tính dựa trên số giờ làm việc thực tế của mỗi ca. VD: 9 giờ × 50,000đ/giờ × 2 người = 900,000đ'

getSalaryExplanation('Theo ca')
// → 'Tiền lương được tính theo số ca làm. VD: 120,000đ/ca × 3 ca = 360,000đ'

getSalaryExplanation('Theo ngày')
// → 'Tiền lương được tính theo ngày làm. VD: 250,000đ/ngày × 3 người × 2 ngày = 1,500,000đ'
```

---

## Common Use Cases

### Display Budget in UI
```tsx
const budgetResult = calculateBudget(payType, salary, workers, shifts);

return (
  <div>
    <h3>Tổng ngân sách dự kiến</h3>
    <p className="text-2xl font-bold">
      {budgetResult.totalBudget.toLocaleString('vi-VN')} VNĐ
    </p>
    
    {/* Show breakdown */}
    {budgetResult.breakdown.map((item, idx) => (
      <div key={idx} className="flex justify-between">
        <span>{item.label}</span>
        <span>{item.amount.toLocaleString('vi-VN')} VNĐ</span>
      </div>
    ))}
  </div>
);
```

### Real-Time Budget Updates
```tsx
const [form, setForm] = useState({...});

// This runs on every form change
const budgetResult = useMemo(() => {
  return calculateBudget(
    form.payType,
    Number(form.salary.replace(/\D/g, '')) || 0,
    form.workers,
    form.shifts
  );
}, [form.payType, form.salary, form.workers, form.shifts]);

// Use budgetResult to display updated budget
```

### Validation Before Submit
```tsx
const handleSubmit = () => {
  const budgetResult = calculateBudget(
    form.payType,
    Number(form.salary.replace(/\D/g, '')) || 0,
    form.workers,
    form.shifts
  );

  // Check if budget is valid
  if (budgetResult.totalBudget === 0) {
    toast.error('Budget must be greater than 0');
    return;
  }

  // Proceed with submission
  submitJob({ ...form, estimatedBudget: budgetResult.totalBudget });
};
```

---

## Payment Type Constants

```typescript
type PayType = 'Theo giờ' | 'Theo ca' | 'Theo ngày';

// Or use the literal values
const HOURLY: PayType = 'Theo giờ';
const SHIFT: PayType = 'Theo ca';
const DAILY: PayType = 'Theo ngày';
```

---

## Database Mapping

When storing/retrieving from Firestore, map the display types:

```typescript
// From UI to Database
function mapPayType(payType: PayType): SalaryType {
  if (payType === 'Theo giờ') return 'HOURLY';
  if (payType === 'Theo ca') return 'PER_SHIFT';
  return 'DAILY';
}

// From Database to UI
function mapSalaryType(salaryType: SalaryType): PayType {
  if (salaryType === 'HOURLY') return 'Theo giờ';
  if (salaryType === 'PER_SHIFT') return 'Theo ca';
  return 'Theo ngày';
}
```

---

## Formulas Reference

### HOURLY
```
totalBudget = salaryPerHour × sum(hours × quantity for each shift)
totalHours = sum(hours × quantity for each shift)

Example: 08:00-12:00 (4h) × 50,000đ × 5 people
= 4 × 50000 × 5 = 1,000,000đ
```

### SHIFT
```
totalBudget = salaryPerShift × sum(quantity for each shift)

Example: 120,000đ × 5 shifts (3+2)
= 120000 × 5 = 600,000đ
```

### DAILY
```
totalBudget = salaryPerDay × workers × numberOfDays

Example: 250,000đ × 3 people × 2 days
= 250000 × 3 × 2 = 1,500,000đ
```

---

## Type Definitions

```typescript
// From jobFormSchema.ts
export interface Shift {
  id: string;
  name: string;
  startTime: string;  // HH:MM format
  endTime: string;    // HH:MM format
  quantity: number;   // Number of people for this shift
}

// From budgetCalculations.ts
export interface BudgetBreakdown {
  totalBudget: number;
  breakdown: Array<{ label: string; amount: number }>;
  explanation: string;
  workingHours?: number;
}
```

---

## Error Handling

### Invalid Times
```typescript
calculateWorkingHours('25:00', '12:00')  // → 0 (invalid)
calculateWorkingHours('08:00', 'invalid') // → 0 (invalid)
```

### Zero Values
```typescript
calculateBudget('Theo giờ', 0, 5, shifts)        // salary = 0
calculateBudget('Theo giờ', 50000, 0, shifts)    // workers = 0
calculateBudget('Theo giờ', 50000, 5, [])        // shifts = []
// All result in totalBudget = 0
```

### Null/Undefined
```typescript
calculateBudget('Theo giờ', null as any, 5, shifts)  // Treated as 0
calculateBudget('Theo ngày', 50000, 5, undefined)     // Shifts default to []
```

---

## Performance Considerations

- ✅ Pure functions - no side effects
- ✅ Fast calculations - O(n) where n = number of shifts
- ✅ Safe to call frequently (real-time updates)
- ✅ No dependencies - works standalone

---

## Changelog

### v1.0.0 (Current)
- ✅ Three payment models implemented
- ✅ Dynamic labels and explanations
- ✅ Unified calculation engine
- ✅ Breakdown display support
- ✅ Vietnamese localization

---

**Last Updated:** March 10, 2026  
**Status:** Production Ready
