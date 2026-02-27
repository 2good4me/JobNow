export interface Job {
    id: string;
    employerId: string;
    title: string;
    description: string;
    salary: number;
    salaryType: 'HOURLY' | 'DAILY' | 'JOB';
    latitude?: number;
    longitude?: number;
    isGpsRequired: boolean;
    status: 'OPEN' | 'FULL' | 'CLOSED' | 'HIDDEN';
}

export interface Shift {
    id: string;
    jobId: string;
    name: string;
    startTime: string; // Time string
    endTime: string; // Time string
    quantity: number;
}
