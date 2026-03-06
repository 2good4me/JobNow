/**
 * INTEGRATION GUIDE - Create Job Form
 * 
 * This file demonstrates how to integrate the refactored Create Job form
 * with your backend API and other services.
 */

// ============================================================================
// 1. UPDATE YOUR BACKEND API ENDPOINT
// ============================================================================

/*
Expected API Endpoint:

POST /api/jobs/create

Request Payload:
{
  "title": "Phục vụ quán cà phê ca tối",
  "category": "restaurant",
  "description": "Tìm phục vụ có kinh nghiệm...",
  "salary": 120000,
  "quantity": 3,
  "startTime": "18:00",
  "endTime": "22:00",
  "location": {
    "latitude": 10.7769,
    "longitude": 106.6966
  },
  "address": "Quán Cà Phê XYZ, Q.1, TP.HCM"
}

Response:
{
  "id": "job-123",
  "employerId": "emp-456",
  "status": "OPEN",
  "createdAt": "2024-03-06T10:30:00Z"
}
*/

// ============================================================================
// 2. CUSTOMIZE JOB CATEGORIES
// ============================================================================

// File: apps/web/src/routes/employer/schemas/create-job.schema.ts

// Add or modify categories:
/*
export const JOB_CATEGORIES = [
  {
    id: 'restaurant',
    label: '🍜 Nhà hàng',
    icon: '🍜',
  },
  {
    id: 'my-custom-category',
    label: '🆕 Loại mới',
    icon: '🆕',
  },
  // ...
];
*/

// ============================================================================
// 3. USAGE IN REACT COMPONENTS
// ============================================================================

/*
// In your employer dashboard:

import { useCreateJob } from './hooks/useCreateJob';
import { CreateJobForm } from './components/CreateJobForm';

function EmployerDashboard() {
  const mutation = useCreateJob();

  return (
    <CreateJobForm 
      onSuccess={() => {
        // Redirect to job detail page
        navigate('/employer/jobs/' + mutation.data?.id);
      }}
      onError={(error) => {
        // Show toast notification
        showErrorToast(error.message);
      }}
    />
  );
}
*/

// ============================================================================
// 4. VALIDATION ERROR HANDLING
// ============================================================================

/*
When validation fails, users will see:

❌ Tên công việc phải có ít nhất 5 ký tự
❌ Vui lòng chọn danh mục công việc
❌ Lương phải lớn hơn 0
❌ Giờ kết thúc phải sau giờ bắt đầu
❌ Vui lòng chọn vị trí chính xác trên bản đồ

And the "Đăng tin" button will be disabled.
*/

// ============================================================================
// 5. CUSTOM FORM SUBMISSION
// ============================================================================

/*
If you need custom logic after form submission:

import { CreateJobForm } from './components/CreateJobForm';

function CustomJobPage() {
  const [jobCreated, setJobCreated] = useState(false);

  const handleSuccess = async () => {
    // Custom logic here
    await trackAnalytics('job_created');
    
    // Show success message
    setJobCreated(true);
    
    // Redirect after delay
    setTimeout(() => {
      navigate('/employer/jobs');
    }, 2000);
  };

  return (
    <div>
      {jobCreated ? (
        <SuccessScreen />
      ) : (
        <CreateJobForm onSuccess={handleSuccess} />
      )}
    </div>
  );
}
*/

// ============================================================================
// 6. TESTING THE FORM
// ============================================================================

/*
// Mock valid form data for testing:

const validFormData = {
  title: 'Phục vụ quán cà phê ca tối',
  category: 'restaurant',
  description: 'Tìm phục vụ có kinh nghiệm, thái độ phục vụ tốt',
  salary: 120000,
  quantity: 3,
  startTime: '18:00',
  endTime: '22:00',
  location: {
    latitude: 10.7769,
    longitude: 106.6966,
  },
  address: 'Quán Cà Phê XYZ, Q.1, TP.HCM',
};

// You can use this to test the API endpoint:
// POST /api/jobs/create with validFormData payload
*/

// ============================================================================
// 7. GPS LOCATION HANDLING
// ============================================================================

/*
The LocationSelector component uses browser's Geolocation API:

navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log(position.coords.latitude);
    console.log(position.coords.longitude);
  },
  (error) => {
    console.error(error);
  }
);

User must grant location permission in browser dialog.
For iOS Safari: Requires HTTPS
For Android Chrome: Requires HTTPS or localhost
*/

// ============================================================================
// 8. STYLING CUSTOMIZATION
// ============================================================================

/*
The form uses TailwindCSS classes. To customize:

1. Colors: Update Tailwind theme in tailwind.config.ts
2. Spacing: Modify margin/padding utilities (p-6, gap-3, etc.)
3. Typography: Edit font sizes (text-sm, text-lg, etc.)
4. Breakpoints: Add responsive classes (md:, lg:, etc.)

Example: Change button color from blue-500 to indigo-600:
Search and replace in CreateJobForm.tsx:
bg-blue-500 → bg-indigo-600
hover:bg-blue-600 → hover:bg-indigo-700
*/

// ============================================================================
// 9. PERFORMANCE OPTIMIZATION
// ============================================================================

/*
The form is optimized for performance:

✓ Real-time validation (not debounced - instant feedback)
✓ Memoized category bottom sheet (prevents re-renders)
✓ React Query for mutations (caching, automatic retries)
✓ Lazy form validation (only when user interacts)
✓ No unnecessary re-renders on every keystroke

For further optimization:
- Add React.memo() to LocationSelector if it has complex logic
- Implement form draft auto-save using localStorage
- Add service worker for offline support
*/

// ============================================================================
// 10. ERROR SCENARIOS
// ============================================================================

/*
Possible error messages from backend:

1. Invalid location:
   - User selects GPS with (0, 0) coordinates
   - Backend should validate: lat !== 0 && lng !== 0

2. Time validation:
   - End time before start time
   - Backend should validate: endTime > startTime

3. Duplicate job:
   - User posts exact same job within 24 hours
   - Backend should return: "You already posted this job today"

4. Rate limiting:
   - User posts more than 5 jobs per hour
   - Backend should return: "Please wait before posting another job"

5. Network error:
   - Form shows: "Failed to create job - Check your internet connection"
   - Implements automatic retry

6. Server error:
   - Backend returns 500
   - Form shows: "Server error. Please try again later"
   - Logs error to Sentry for monitoring
*/

// ============================================================================
// 11. ACCESSIBILITY
// ============================================================================

/*
Form includes:
✓ ARIA labels and descriptions
✓ Semantic HTML (form, fieldset, legend)
✓ Keyboard navigation support
✓ Error messages linked to inputs
✓ Screen reader support
✓ Sufficient color contrast
✓ Focus indicators on all interactive elements

To test accessibility:
1. Use axe DevTools browser extension
2. Test with keyboard only (Tab, Enter, Escape)
3. Test with screen reader (NVDA, JAWS, VoiceOver)
4. Check color contrast ratio (4.5:1 minimum)
*/

// ============================================================================
// 12. MOBILE-SPECIFIC FEATURES
// ============================================================================

/*
Mobile optimizations:
✓ Bottom sheet for category selection (not dropdown)
✓ Native time picker on mobile (type="time")
✓ Minimum button height 44px (touch-friendly)
✓ Full-width inputs (no cramped layout)
✓ Portrait orientation optimized
✓ Smooth scrolling within form steps
✓ GPS detection on mobile devices
✓ Haptic feedback on button press (optional)

For iOS Safari:
- Ensure HTTPS connection
- Test GPS permission dialog
- Check keyboard appearance on inputs

For Android Chrome:
- Test on various screen sizes
- Verify back button behavior
- Check hardware back button handling
*/

// ============================================================================
// 13. FUTURE ENHANCEMENTS
// ============================================================================

/*
Proposed features:

1. Shift Templates
   - Save frequently used shifts (08:00-12:00, 18:00-22:00)
   - Quick reusable templates

2. Job Draft Auto-save
   - Auto-save form state to localStorage
   - Recover draft if page closes unexpectedly

3. Image Upload
   - Upload job photo (restaurant, location preview)
   - Image compression on client side

4. Real Map Picker
   - Interactive Google Maps dropdown on Step 3
   - Click to select exact location

5. Job History & Analytics
   - View all posted jobs
   - Application statistics
   - Most applied shifts

6. Recurring Jobs
   - Create job that repeats daily/weekly
   - Special handling for recurring shifts

7. Team Collaboration
   - Assign job to team members
   - Job approval workflow
*/

export {};
