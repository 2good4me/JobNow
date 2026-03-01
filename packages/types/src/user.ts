export interface User {
    id: string;
    phoneNumber: string;
    role: 'CANDIDATE' | 'EMPLOYER' | 'ADMIN';
    status: 'ACTIVE' | 'LOCKED' | 'BANNED';
    reputationScore: number;
}

export interface Profile {
    userId: string;
    fullName: string;
    avatarUrl?: string;
    bio?: string;
    skills: string[];
}
