export interface Job {
    id: string;
    employerId: string;
    employerName: string;
    title: string;
    description: string;
    category: string;
    salary: number;
    salaryType: 'HOURLY' | 'DAILY' | 'JOB';
    address: string;
    location: {
        latitude: number;
        longitude: number;
    };
    geohash: string;
    isGpsRequired: boolean;
    status: 'OPEN' | 'FULL' | 'CLOSED' | 'HIDDEN';
    shifts: Shift[];
    createdAt?: any;
    updatedAt?: any;
}

export interface Shift {
    id: string;
    jobId: string;
    name: string;
    startTime: string; // Time string e.g. "08:00"
    endTime: string;   // Time string e.g. "12:00"
    quantity: number;
}

/**
 * Response type from GET /api/jobs/nearby
 */
export interface NearbyJobResponse extends Job {
    distance: number; // in meters
}
