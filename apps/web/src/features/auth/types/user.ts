export type UserRole = 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';

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
    skills: string[];
    identity_images: string[];
    created_at: Date;
    updated_at: Date;
}
