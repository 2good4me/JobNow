export interface Application {
    id: string;
    jobId: string;
    shiftId: string;
    candidateId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
    coverLetter?: string;
}

export interface Checkin {
    id: string;
    applicationId: string;
    checkInTime: string;
    checkInLat: number;
    checkInLong: number;
    status: 'VALID' | 'INVALID';
}
