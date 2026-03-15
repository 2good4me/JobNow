export type UserRole = 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'LOCKED' | 'BANNED';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED';

export interface User {
    id: string; // The UID from Firebase Auth
    phoneNumber: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    balance: number;
    reputationScore: number;
    fullName: string;
    avatarUrl?: string | null;
    bio?: string | null;
    addressText?: string | null;
    experience?: string;
    education?: {
        school: string;
        degree: string;
        field: string;
        startDate: string;
        endDate?: string;
        description?: string;
    }[];
    certifications?: {
        name: string;
        organization: string;
        issueDate: string;
        expiryDate?: string;
        credentialId?: string;
        credentialUrl?: string;
    }[];
    resumeUrl?: string | null;
    createdAt?: any; // Server timestamp
    updatedAt?: any; // Server timestamp

    // Employer-specific fields
    companyName?: string;
    companyTaxId?: string;
    companyLogoUrl?: string | null;
    companyDescription?: string;
    companyWebsite?: string;
    industry?: string;
    businessLicenseUrl?: string | null;
    verificationStatus?: VerificationStatus;
    notificationPush?: boolean;
    notificationEmail?: boolean;
}

/**
 * Private candidate profile data kept outside public `users` collection.
 */
export interface UserPrivateProfileDoc {
    phone_number?: string;
    date_of_birth?: string;
    identity_images?: string[];
    ekyc_metadata?: {
        front_image_url?: string;
        back_image_url?: string;
        selfie_image_url?: string;
        submitted_at?: any;
        verified_at?: any;
    };
    created_at?: any;
    updated_at?: any;
}
