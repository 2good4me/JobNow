export type JobStatus = 'ACTIVE' | 'OPEN' | 'FULL' | 'CLOSED' | 'HIDDEN' | 'DRAFT';
export type SalaryType = 'HOURLY' | 'DAILY' | 'PER_SHIFT' | 'MONTHLY';
export type GenderPreference = 'MALE' | 'FEMALE' | 'ANY';
export type ShiftTimeBucket = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
export type JobModerationStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
export type BoostPackageCode = 'BOOST_24H' | 'BOOST_3D' | 'BOOST_7D';

export interface Shift {
    id: string;
    name: string;
    startTime: string; // Time string e.g. "08:00"
    endTime: string;   // Time string e.g. "12:00"
    quantity: number;
}

export interface JobLocation {
    latitude: number;
    longitude: number;
    address?: string;
}

export interface JobContactInfo {
    name: string;
    phone: string;
}

export interface ShiftCapacity {
    totalSlots: number;
    remainingSlots: number;
    appliedCount: number;
}

export interface Job {
    id: string;
    employerId: string;
    employerName?: string;
    categoryId: string;
    category?: string;
    title: string;
    description: string;
    salary: number;
    salaryType: SalaryType;
    location: JobLocation;
    geohash: string;
    isGpsRequired: boolean;
    status: JobStatus;
    shifts: Shift[];
    createdAt?: any;
    updatedAt?: any;

    // New structured fields (GĐ1)
    deadline?: any;              // Timestamp — hạn nộp đơn
    requirements?: string[];     // Yêu cầu cụ thể
    images?: string[];           // Ảnh nơi làm việc
    vacancies?: number;          // Tổng số lượng cần tuyển
    genderPreference?: GenderPreference;
    contactInfo?: JobContactInfo;
    ageRange?: { min: number; max: number };
    startDate?: string;          // Ngày bắt đầu làm việc
    isPremium?: boolean;         // Tin ưu tiên
    totalAppliedCount?: number;  // Computed from shift_capacity for fast empty state
    moderationStatus?: JobModerationStatus;
    moderationReason?: string;
    isBoosted?: boolean;
    boostExpiresAt?: any;
    boostPackageCode?: BoostPackageCode;
}

/**
 * Canonical Firestore document shape for jobs (snake_case).
 * Keep this interface for data layer, then map to Job (camelCase) in services.
 */
export interface JobDoc {
    employer_id: string;
    employer_name?: string;
    category_id?: string;
    category?: string;
    title: string;
    description: string;
    salary: number;
    salary_type: SalaryType | 'JOB';
    address?: string;
    location: {
        latitude: number;
        longitude: number;
    };
    geohash: string;
    is_gps_required: boolean;
    status: JobStatus;
    shifts: Array<{
        id: string;
        name: string;
        start_time: string;
        end_time: string;
        quantity: number;
    }>;
    shift_capacity?: Record<string, {
        total_slots: number;
        remaining_slots: number;
        applied_count: number;
    }>;
    vacancies?: number;
    deadline?: any;
    requirements?: string[];
    images?: string[];
    gender_preference?: GenderPreference;
    contact_info?: {
        name: string;
        phone: string;
    };
    age_range?: { min: number; max: number };
    start_date?: string;
    is_premium?: boolean;
    moderation_status?: JobModerationStatus;
    moderation_reason?: string;
    is_boosted?: boolean;
    boost_expires_at?: any;
    boost_package_code?: BoostPackageCode;
    created_at?: any;
    updated_at?: any;
}

export interface JobPostingQuota {
    monthlyLimit: number;
    monthlyUsed: number;
    monthlyRemaining: number;
    activeShiftLimit: number;
    activeShiftUsed: number;
    activeShiftRemaining: number;
    verificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED';
    tierLabel: 'Starter' | 'Verified';
}

export interface BoostPackage {
    id: string;
    code: BoostPackageCode;
    name: string;
    description: string;
    price: number;
    durationHours: number;
    active: boolean;
}

export interface JobSearchFilters {
    radius_m: number;
    salary_min?: number;
    salary_max?: number;
    category_ids?: string[];
    shift_time?: ShiftTimeBucket;
    keyword?: string;
    limit?: number;
}

export interface JobSearchCursor {
    offset: number;
}

export interface JobSearchPage {
    items: Job[];
    nextCursor?: string;
}

export interface JobWishlistItem {
    userId: string;
    jobId: string;
    savedAt?: any;
}
