export type UserRole = 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED';
import type { ReputationTier } from '@jobnow/types';

export interface UserProfile {
    uid: string;
    email: string;
    full_name: string;
    role: UserRole;
    phone_number: string;
    avatar_url: string | null;
    bio: string | null;
    address_text: string | null;
    status: 'ACTIVE' | 'LOCKED' | 'BANNED';
    balance: number;
    reputation_score: number;
    current_tier?: ReputationTier;
    average_rating?: number;          // Average rating từ evaluations
    total_ratings?: number;           // Số lượt đánh giá
    skills: string[];
    achievements?: string[];
    canceled_count?: number;
    percentage?: number;
    identity_images: string[];
    cccd_number?: string | null;
    cccd_full_name?: string | null;
    cccd_dob?: string | null;
    experience?: string;
    education?: {
        school: string;
        degree: string;
        field: string;
        start_date: string;
        end_date?: string;
        description?: string;
    }[];
    certifications?: {
        name: string;
        organization: string;
        issue_date: string;
        expiry_date?: string;
        credential_id?: string;
        credential_url?: string;
    }[];
    resume_url?: string | null;
    created_at: Date;
    updated_at: Date;

    // Employer-specific fields
    company_name?: string;
    company_tax_id?: string;
    industry?: string;
    company_logo_url?: string | null;
    company_description?: string;
    company_website?: string;
    business_license_url?: string | null;
    verification_status?: VerificationStatus;
    notification_push?: boolean;
    notification_email?: boolean;
    theme_mode?: 'light' | 'dark';
    preferred_language?: 'vi' | 'en';
}
