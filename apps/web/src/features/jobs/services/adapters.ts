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
        created_at: getValue(data, ['created_at', 'createdAt']),
        updated_at: getValue(data, ['updated_at', 'updatedAt']),
    };
}

export function mapJobDocToJob(id: string, data: Partial<JobDoc>): Job {
    return {
        id,
        employerId: data.employer_id ?? '',
        categoryId: data.category_id ?? '',
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
        shifts: (data.shifts ?? []).map((shift) => ({
            id: shift.id,
            name: shift.name,
            startTime: shift.start_time,
            endTime: shift.end_time,
            quantity: shift.quantity,
        })),
        vacancies: data.vacancies,
        deadline: data.deadline,
        requirements: data.requirements,
        images: data.images,
        genderPreference: data.gender_preference,
        contactInfo: data.contact_info
            ? {
                  name: data.contact_info.name,
                  phone: data.contact_info.phone,
              }
            : undefined,
        ageRange: data.age_range,
        startDate: data.start_date,
        isPremium: data.is_premium,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
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
    };
}
