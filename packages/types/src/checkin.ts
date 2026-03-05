export type CheckInType = 'QR' | 'GPS' | 'MANUAL';
export type CheckInStatus = 'CHECKED_IN' | 'CHECKED_OUT' | 'VERIFIED' | 'DISPUTED';

export interface CheckIn {
    id: string;
    applicationId: string;
    type: CheckInType;
    checkInTime: any;            // Timestamp
    checkOutTime?: any;          // Timestamp
    gpsLocation?: {
        latitude: number;
        longitude: number;
    };
    verifiedBy?: string;         // UID of employer who verified
    status: CheckInStatus;
    notes?: string;
    createdAt?: any;
}
