# Create Job Form - Refactoring Documentation

## Overview

The **Create Job** form has been refactored from a basic form into a **professional multi-step job posting experience** optimized for mobile devices.

## New Architecture

### File Structure

```
apps/web/src/routes/employer/
├── post-job.tsx                          # Route component (entry point)
├── components/
│   ├── CreateJobForm.tsx                 # Multi-step form logic
│   ├── CategoryBottomSheet.tsx           # Category selector (bottom sheet)
│   └── LocationSelector.tsx              # GPS location picker
└── schemas/
    └── create-job.schema.ts              # Zod validation schema + constants
```

## Features

### 1. **Multi-Step Form (3 Steps)**

#### Step 1: Job Information
- **Title**: Required, min 5 characters
- **Category**: Bottom sheet selector with 7 categories 🎯
- **Description**: Optional, rich text support

#### Step 2: Job Details
- **Salary**: Hourly rate in VND, required, > 0
- **Quantity**: Number of workers, required, > 0
- **Budget Preview**: Auto-calculated (salary × quantity)
- **Start Time**: Time picker (HH:mm format)
- **End Time**: Time picker (with validation: must be after start time)

#### Step 3: Location
- **Address Input**: Street address (required, min 5 chars)
- **GPS Selector**: "Use Current Location" button
- **Location Confirmation**: Displays latitude/longitude

### 2. **Validation**

**Zod Schema with 7 Rules:**

```typescript
createJobValidationSchema = z.object({
  title: string (min 5, max 100),
  category: string (required),
  description: string (optional, min 10 if provided),
  salary: number (> 0),
  quantity: number (> 0),
  startTime: string (HH:mm format),
  endTime: string (HH:mm format, must be after startTime),
  location: object {
    latitude: number,
    longitude: number
  },
  address: string (min 5, max 200),
})
```

**Error Handling:**
- Real-time validation with React Hook Form (`mode: 'onChange'`)
- Red error messages under each field
- Submit button disabled if form is invalid

### 3. **Business Logic**

#### Budget Calculation
```typescript
const budget = salary * quantity
// Auto-updated when salary or quantity changes
// Displayed in blue box with breakdown
```

#### Time Guard
- Prevents `endTime` from being earlier than `startTime`
- Real-time validation with Zod `.refine()`

#### Location Guard
- User must select GPS coordinates (lat/lng) before posting
- Cannot use zero values (0°, 0°)

### 4. **Category Bottom Sheet**

Mobile-friendly category selector:
- 7 categories with emojis
- Grid layout (2 columns)
- Single tap to select and confirm
- Selected category shows checkmark

Categories:
```typescript
🍜 Nhà hàng
🚚 Giao hàng
🧹 Lao động phổ thông
🛍️ Bán hàng
🧽 Vệ sinh
🛡️ Bảo vệ
📌 Khác
```

### 5. **Loading State**

Using `@tanstack/react-query`:

```typescript
const mutation = useMutation({
  mutationFn: createJob,
  onSuccess: () => { /* redirect */ },
  onError: (error) => { /* show error */ },
})
```

**UI Feedback:**
- Spinning loader icon
- "Đang đăng tin..." text
- Button disabled during submission
- Prevents double-submission

### 6. **Step Progress Indicator**

Visual progress display:
- Step circles (1, 2, 3)
- Current step: Blue & enlarged
- Completed steps: Green with checkmark
- Progress line fills as you advance

## Code Quality Standards

✅ **React Hook Form** with `zodResolver`
✅ **Zod Validation** - Type-safe schema
✅ **TypeScript Types** from `@jobnow/types`
✅ **TailwindCSS** - Utility-first styling
✅ **Modular Components** - Separation of concerns
✅ **Async Handling** - React Query mutations
✅ **Accessibility** - Semantic HTML, ARIA labels
✅ **Mobile Optimized** - Bottom sheet, touch-friendly

## Integration with Backend

### API Endpoint

**POST** `/api/jobs/create`

**Request Body:**
```typescript
{
  title: string,
  category: string,
  description?: string,
  salary: number,
  quantity: number,
  startTime: string, // "HH:mm"
  endTime: string,   // "HH:mm"
  address: string,
  location: {
    latitude: number,
    longitude: number
  }
}
```

**Response:**
```typescript
{
  id: string,
  employerId: string,
  status: "OPEN" | "FULL" | "CLOSED" | "HIDDEN",
  createdAt: Date
}
```

### Error Responses

```typescript
// 400 Bad Request
{ error: "Invalid form data" }

// 401 Unauthorized
{ error: "Please login first" }

// 500 Server Error
{ error: "Failed to create job" }
```

## Usage Example

```tsx
import { Route } from '@tanstack/react-router'
import PostJobRoute from './post-job'

// The form is automatically loaded when user navigates to:
// /employer/post-job
```

## Future Enhancements

- [ ] Shift template library (re-use previous shifts)
- [ ] Image upload for job preview
- [ ] Job draft auto-save
- [ ] Recurring job posting
- [ ] Real map picker (Google Maps integration)
- [ ] Camera QR code for quick location
- [ ] Job post history/analytics

## Troubleshooting

### "Location not found" error
- Check browser permissions for GPS
- Ensure user has allowed location access
- Fallback: Allow manual coordinate input

### "Form submission failed"
- Check network connectivity
- Verify API endpoint is running
- Check browser console for detailed errors

### "Time validation failed"
- Ensure end time is after start time
- Format must be HH:mm (24-hour)

## Performance Notes

- Form uses `mode: 'onChange'` for real-time validation
- Memoized components prevent unnecessary re-renders
- Budget calculation is instant (no debounce needed)
- Location selector uses browser's native Geolocation API
- Images and assets are lazy-loaded

## Mobile Responsiveness

- **Full-width input fields** (no multi-column)
- **Bottom sheet** for category selection
- **Touch-friendly buttons** with large hit areas (minimum 44px)
- **Native time/date pickers** on mobile
- **Smooth animations** (fade-in/slide-up effects)

## TypeScript Types

The form is fully typed using:
- `@jobnow/types` package for Job domain types
- Zod-inferred types for form data: `CreateJobFormData`
- React Hook Form types for form state

```typescript
type CreateJobFormData = z.infer<typeof createJobValidationSchema>
// Automatically typed from Zod schema
```
