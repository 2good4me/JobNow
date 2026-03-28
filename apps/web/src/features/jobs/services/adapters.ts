import type { Application, ApplicationDoc, ApplicationStatus, Job, JobDoc, JobStatus, SalaryType } from '@jobnow/types';

function getValue<T = unknown>(source: Record<string, unknown>, keys: string[]): T | undefined {
    for (const key of keys) {
        const value = source[key];
        if (value !== undefined && value !== null) {
            return value as T;
        }
    }
    return undefined;
}

export function mapNearbyApiToJobDoc(data: Record<string, unknown>): JobDoc {
    return {
        employer_id: String(getValue(data, ['employer_id', 'employerId']) ?? ''),
        employer_name: String(getValue(data, ['employer_name', 'employerName']) ?? ''),
        category_id: String(getValue(data, ['category_id']) ?? ''),
        category: String(getValue(data, ['category']) ?? ''),
        title: String(getValue(data, ['title']) ?? ''),
        description: String(getValue(data, ['description']) ?? ''),
        salary: Number(getValue(data, ['salary']) ?? 0),
        salary_type: (getValue(data, ['salary_type', 'salaryType']) as SalaryType | 'JOB') ?? 'HOURLY',
        address: String(getValue(data, ['address', 'address_text']) ?? ''),
        location: (getValue(data, ['location']) as { latitude: number; longitude: number }) ?? {
            latitude: 0,
            longitude: 0,
        },
        geohash: String(getValue(data, ['geohash']) ?? ''),
        is_gps_required: Boolean(getValue(data, ['is_gps_required', 'isGpsRequired']) ?? false),
        status: (getValue(data, ['status']) as JobStatus) ?? 'OPEN',
        shifts: (getValue(data, ['shifts']) as JobDoc['shifts']) ?? [],
        vacancies: getValue<number>(data, ['vacancies']),
        deadline: getValue(data, ['deadline']),
        requirements: getValue<string[]>(data, ['requirements']),
        images: getValue<string[]>(data, ['images']),
        gender_preference: getValue(data, ['gender_preference', 'genderPreference']),
        contact_info: getValue(data, ['contact_info', 'contactInfo']),
        age_range: getValue(data, ['age_range', 'ageRange']),
        start_date: getValue<string>(data, ['start_date', 'startDate']),
        is_premium: getValue<boolean>(data, ['is_premium', 'isPremium']),
        moderation_status: getValue(data, ['moderation_status', 'moderationStatus']),
        moderation_reason: getValue(data, ['moderation_reason', 'moderationReason']),
        is_boosted: getValue<boolean>(data, ['is_boosted', 'isBoosted']),
        boost_expires_at: getValue(data, ['boost_expires_at', 'boostExpiresAt']),
        boost_package_code: getValue(data, ['boost_package_code', 'boostPackageCode']),
        created_at: getValue(data, ['created_at', 'createdAt']),
        updated_at: getValue(data, ['updated_at', 'updatedAt']),
    };
}

export function mapJobDocToJob(id: string, data: Partial<JobDoc>): Job {
    return {
        id,
        employerId: data.employer_id ?? '',
        employerName: data.employer_name,
        categoryId: data.category_id ?? '',
        category: data.category,
        title: data.title ?? '',
        description: data.description ?? '',
        salary: data.salary ?? 0,
        salaryType: (data.salary_type === 'JOB' ? 'DAILY' : data.salary_type) ?? 'HOURLY',
        location: {
            latitude: data.location?.latitude ?? 0,
            longitude: data.location?.longitude ?? 0,
            address: data.address,
        },
        geohash: data.geohash ?? '',
        isGpsRequired: data.is_gps_required ?? false,
        status: data.status ?? 'OPEN',
        shifts: (Array.isArray(data.shifts) ? data.shifts : []).map(s => ({
            id: s.id ?? '',
            name: s.name ?? '',
            startTime: s.start_time ?? '',
            endTime: s.end_time ?? '',
            quantity: s.quantity ?? 1,
        })),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        deadline: data.deadline,
        requirements: Array.isArray(data.requirements) ? data.requirements : (data.requirements ? [String(data.requirements)] : []),
        images: Array.isArray(data.images) ? data.images : (data.images ? [String(data.images)] : []),
        vacancies: data.vacancies,
        genderPreference: data.gender_preference ?? 'ANY',
        contactInfo: data.contact_info,
        ageRange: data.age_range,
        startDate: data.start_date ?? '',
        isPremium: data.is_premium ?? false,
        moderationStatus: data.moderation_status,
        moderationReason: data.moderation_reason,
        isBoosted: data.is_boosted ?? false,
        boostExpiresAt: data.boost_expires_at,
        boostPackageCode: data.boost_package_code,
        totalAppliedCount: data.shift_capacity && Object.keys(data.shift_capacity).length > 0
            ? Object.values(data.shift_capacity).reduce((sum, shift) => sum + (shift.applied_count || 0), 0)
            : undefined,
    };
}

export function mapApplicationDocToApplication(id: string, data: Partial<ApplicationDoc> & Record<string, unknown>): Application {
    const status = (data.status as ApplicationStatus | undefined) ?? 'NEW';

    return {
        id,
        jobId: String(getValue(data, ['job_id', 'jobId']) ?? ''),
        shiftId: String(getValue(data, ['shift_id', 'shiftId']) ?? ''),
        employerId: String(getValue(data, ['employer_id', 'employerId']) ?? ''),
        candidateId: String(getValue(data, ['candidate_id', 'candidateId']) ?? ''),
        status,
        paymentStatus: (getValue(data, ['payment_status', 'paymentStatus']) as Application['paymentStatus']) ?? 'UNPAID',
        coverLetter: String(getValue(data, ['cover_letter', 'coverLetter']) ?? ''),
        notes: getValue(data, ['notes']) as string | undefined,
        rating: getValue(data, ['rating']) as number | undefined,
        appliedAt: getValue(data, ['applied_at', 'appliedAt']),
        createdAt: getValue(data, ['created_at', 'createdAt']),
        updatedAt: getValue(data, ['updated_at', 'updatedAt']),
        // ─── Denormalized candidate snapshot ───
        candidateName: getValue(data, ['candidate_name', 'candidateName']) as string | undefined,
        candidateAvatar: getValue(data, ['candidate_avatar', 'candidateAvatar']) as string | undefined,
        candidateSkills: getValue(data, ['candidate_skills', 'candidateSkills']) as string[] | undefined,
        candidateRating: getValue(data, ['candidate_rating', 'candidateRating']) as number | undefined,
        candidateVerified: getValue(data, ['candidate_verified', 'candidateVerified']) as boolean | undefined,
        // ─── Denormalized job/shift info ───
        jobTitle: getValue(data, ['job_title', 'jobTitle']) as string | undefined,
        shiftTime: getValue(data, ['shift_time', 'shiftTime']) as string | undefined,
        employerName: getValue(data, ['employer_name', 'employerName']) as string | undefined,
        isLate: getValue(data, ['is_late', 'isLate']) as boolean | undefined,
        lateMinutes: getValue(data, ['late_minutes', 'lateMinutes']) as number | undefined,
        checkInTime: getValue(data, ['check_in_time', 'checkInTime']),
        checkOutTime: getValue(data, ['check_out_time', 'checkOutTime']),
    };
}
