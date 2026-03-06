/**
 * TEST SCENARIOS & EXAMPLE DATA
 * 
 * Use these to test the Create Job form implementation
 */

import type { CreateJobFormData } from './schemas/create-job.schema';

// ============================================================================
// VALID TEST CASES
// ============================================================================

export const VALID_JOB_DATA: CreateJobFormData = {
  title: 'Phục vụ quán cà phê ca tối',
  category: 'restaurant',
  description: 'Tìm phục vụ có kinh nghiệm, thái độ phục vụ tốt, lương n/n',
  salary: 120000,
  quantity: 3,
  startTime: '18:00',
  endTime: '22:00',
  location: {
    latitude: 10.7769,
    longitude: 106.6966,
  },
  address: '123 Trần Hưng Đạo, Q.1, TP.HCM',
};

export const VALID_DELIVERY_JOB: CreateJobFormData = {
  title: 'Giao hàng nhanh trong giờ cao điểm',
  category: 'delivery',
  description: 'Giao hàng trong khu vực Q.1, Q.2, Q.3',
  salary: 150000,
  quantity: 5,
  startTime: '11:00',
  endTime: '13:00',
  location: {
    latitude: 10.8109,
    longitude: 106.6747,
  },
  address: '456 Nguyễn Huệ, Q.1, TP.HCM',
};

export const VALID_LABOR_JOB: CreateJobFormData = {
  title: 'Tìm công nhân vệ sinh',
  category: 'labor',
  description: 'Vệ sinh văn phòng chiều tối, yêu cầu chỉn chu',
  salary: 80000,
  quantity: 2,
  startTime: '17:00',
  endTime: '19:00',
  location: {
    latitude: 10.7580,
    longitude: 106.6757,
  },
  address: '789 Lê Lợi, Q.1, TP.HCM',
};

// ============================================================================
// INVALID TEST CASES
// ============================================================================

export const INVALID_CASES = {
  // Title validation
  titleTooShort: {
    ...VALID_JOB_DATA,
    title: 'Phục', // Less than 5 characters
  },

  titleEmpty: {
    ...VALID_JOB_DATA,
    title: '',
  },

  titleTooLong: {
    ...VALID_JOB_DATA,
    title: 'A'.repeat(101), // More than 100 characters
  },

  // Category validation
  categoryEmpty: {
    ...VALID_JOB_DATA,
    category: '',
  },

  categoryInvalid: {
    ...VALID_JOB_DATA,
    category: 'non-existent-category',
  },

  // Description validation
  descriptionTooShort: {
    ...VALID_JOB_DATA,
    description: 'Mô tả ngắn', // Less than 10 characters when provided
  },

  // Salary validation
  salaryZero: {
    ...VALID_JOB_DATA,
    salary: 0,
  },

  salaryNegative: {
    ...VALID_JOB_DATA,
    salary: -100000,
  },

  salaryDecimal: {
    ...VALID_JOB_DATA,
    salary: 120000.5, // Should be integer
  },

  // Quantity validation
  quantityZero: {
    ...VALID_JOB_DATA,
    quantity: 0,
  },

  quantityNegative: {
    ...VALID_JOB_DATA,
    quantity: -5,
  },

  quantityDecimal: {
    ...VALID_JOB_DATA,
    quantity: 3.5, // Should be integer
  },

  // Time validation
  invalidStartTimeFormat: {
    ...VALID_JOB_DATA,
    startTime: '18.30', // Should be HH:mm
  },

  invalidEndTimeFormat: {
    ...VALID_JOB_DATA,
    endTime: '22h00', // Should be HH:mm
  },

  endTimeBeforeStartTime: {
    ...VALID_JOB_DATA,
    startTime: '22:00',
    endTime: '18:00', // Earlier than start time
  },

  endTimeSameAsStartTime: {
    ...VALID_JOB_DATA,
    startTime: '18:00',
    endTime: '18:00', // Same as start time
  },

  // Location validation
  locationMissingLatitude: {
    ...VALID_JOB_DATA,
    location: {
      latitude: 0,
      longitude: 106.6966,
    },
  },

  locationMissingLongitude: {
    ...VALID_JOB_DATA,
    location: {
      latitude: 10.7769,
      longitude: 0,
    },
  },

  locationInvalidLatitude: {
    ...VALID_JOB_DATA,
    location: {
      latitude: 95, // Out of range (-90 to 90)
      longitude: 106.6966,
    },
  },

  locationInvalidLongitude: {
    ...VALID_JOB_DATA,
    location: {
      latitude: 10.7769,
      longitude: 200, // Out of range (-180 to 180)
    },
  },

  // Address validation
  addressTooShort: {
    ...VALID_JOB_DATA,
    address: 'Q.1', // Less than 5 characters
  },

  addressEmpty: {
    ...VALID_JOB_DATA,
    address: '',
  },

  addressTooLong: {
    ...VALID_JOB_DATA,
    address: 'A'.repeat(201), // More than 200 characters
  },
};

// ============================================================================
// EDGE CASES
// ============================================================================

export const EDGE_CASES = {
  // Boundary values
  minimumValidTitle: {
    ...VALID_JOB_DATA,
    title: 'Abcde', // Exactly 5 characters
  },

  maximumValidTitle: {
    ...VALID_JOB_DATA,
    title: 'A'.repeat(100), // Exactly 100 characters
  },

  minimumValidSalary: {
    ...VALID_JOB_DATA,
    salary: 1, // Smallest positive integer
  },

  maximumValidSalary: {
    ...VALID_JOB_DATA,
    salary: 9999999, // Large salary
  },

  minimumValidQuantity: {
    ...VALID_JOB_DATA,
    quantity: 1, // Just one person
  },

  maximumValidQuantity: {
    ...VALID_JOB_DATA,
    quantity: 999, // Large quantity
  },

  minimumWorkDuration: {
    ...VALID_JOB_DATA,
    startTime: '08:00',
    endTime: '08:01', // Just 1 minute
  },

  maximumWorkDuration: {
    ...VALID_JOB_DATA,
    startTime: '00:00',
    endTime: '23:59', // Nearly 24 hours
  },

  // Special characters
  titleWithSpecialChars: {
    ...VALID_JOB_DATA,
    title: 'Phục vụ @Quán#Cà$Phê%2024!',
  },

  addressWithSpecialChars: {
    ...VALID_JOB_DATA,
    address: '123/45A Đường Trần Hưng Đạo, Phường Bến Nghé, Quận 1',
  },

  // International characters
  titleWithVietnamese: {
    ...VALID_JOB_DATA,
    title: 'Tìm phục vụ Quán Cà Phê Đặc Biệt',
  },

  addressWithUnicode: {
    ...VALID_JOB_DATA,
    address: '123 Đường Trần Hưng Đạo, Quận 1, TP Hồ Chí Minh',
  },

  // Precise GPS coordinates
  preciseLocation: {
    ...VALID_JOB_DATA,
    location: {
      latitude: 10.776919,
      longitude: 106.696553,
    },
  },

  // Extended description
  longDescription: {
    ...VALID_JOB_DATA,
    description: `
      Tìm nhân viên phục vụ có kinh nghiệm làm việc tại quán cà phê.
      Yêu cầu:
      - Có kinh nghiệm phục vụ ít nhất 1 năm
      - Thái độ phục vụ chuyên nghiệp và thân thiện
      - Biết được các loại cà phê cơ bản
      - Có khả năng làm việc trong môi trường cao áp
      - Lương cơ bản + hoa hồng
      Liên hệ: 0909123456
    `.trim(),
  },
};

// ============================================================================
// API RESPONSE MOCK DATA
// ============================================================================

export const API_RESPONSES = {
  success: {
    id: 'job-123456',
    employerId: 'emp-789',
    title: 'Phục vụ quán cà phê ca tối',
    status: 'OPEN' as const,
    createdAt: new Date('2024-03-06T10:30:00Z'),
  },

  validationError: {
    error: 'Validation failed',
    details: {
      title: ['Title must be at least 5 characters'],
      salary: ['Salary must be greater than 0'],
    },
    code: 'VALIDATION_ERROR',
    statusCode: 400,
  },

  unauthorizedError: {
    error: 'Please login first',
    code: 'UNAUTHORIZED',
    statusCode: 401,
  },

  serverError: {
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    statusCode: 500,
  },

  rateLimitError: {
    error: 'You have posted too many jobs. Please wait before posting another.',
    code: 'RATE_LIMIT_EXCEEDED',
    statusCode: 429,
  },

  duplicateError: {
    error: 'You already posted this job today',
    code: 'DUPLICATE_JOB',
    statusCode: 409,
  },
};

// ============================================================================
// USER INTERACTION SCENARIOS
// ============================================================================

export const SCENARIOS = {
  // From empty form to successful submission
  completeJourneyRestaurant: {
    step1: {
      title: 'Phục vụ quán cà phê',
      category: 'restaurant',
      description: 'Phục vụ tại quán cà phê',
    },
    step2: {
      salary: 120000,
      quantity: 3,
      startTime: '18:00',
      endTime: '22:00',
    },
    step3: {
      address: 'Quán Cà Phê ABC, Q.1, TP.HCM',
      location: {
        latitude: 10.7769,
        longitude: 106.6966,
      },
    },
  },

  // User goes back and edits
  journeyWithEdits: {
    // User fills step 1
    step1Initial: {
      title: 'Giao hàng',
      category: 'delivery',
      description: 'Giao hàng nhanh',
    },
    // Goes back and changes category
    step1Edited: {
      title: 'Giao hàng',
      category: 'labor', // Changed
      description: 'Giao hàng nhanh',
    },
  },

  // Mobile scenario: GPS selection fails, user enters manually
  mobileWithFallback: {
    gpsAttempt: 'User clicks GPS button but permission denied',
    fallback: 'User manually enters coordinates or address',
    result: 'Job created with manual address',
  },

  // Accessibility scenario: Keyboard navigation only
  keyboardOnlyFlow: {
    navigation: [
      'Tab through Step 1 fields',
      'Press Enter on "Tiếp tục"',
      'Tab through Step 2 fields',
      'Press Enter on "Tiếp tục"',
      'Tab through Step 3 fields',
      'Press Enter on "Đăng tin"',
    ],
  },
};

// ============================================================================
// PERFORMANCE TEST DATA
// ============================================================================

export const PERFORMANCE_TESTS = {
  // Large quantity
  largeBudget: {
    ...VALID_JOB_DATA,
    salary: 5000000, // 5 million dong
    quantity: 100, // 100 workers
    // Expected budget: 500 billion dong
  },

  // Very long description
  largeDocument: {
    ...VALID_JOB_DATA,
    description: 'A'.repeat(1000), // Maximum allowed
  },

  // Multiple form submissions in quick succession
  rapidSubmissions: [
    { ...VALID_JOB_DATA, title: 'Job 1' },
    { ...VALID_JOB_DATA, title: 'Job 2' },
    { ...VALID_JOB_DATA, title: 'Job 3' },
  ],
};

export {};
