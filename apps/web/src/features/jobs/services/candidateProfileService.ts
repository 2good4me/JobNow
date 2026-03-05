import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '@/config/firebase';

export interface CandidatePublicProfile {
    uid: string;
    fullName: string;
    bio: string | null;
    addressText: string | null;
    skills: string[];
    experiences: string[];
    avatarUrl: string | null;
    verificationStatus: 'UNVERIFIED' | 'PENDING' | 'VERIFIED';
    reputationScore: number;
}

export interface CandidatePrivateProfile {
    identityImages: string[];
    ekycSubmittedAt?: any;
    ekycVerifiedAt?: any;
}

export interface EkycSubmitPayload {
    identityImages: string[];
}

export interface ProfileCompleteness {
    score: number;
    missing: string[];
}

function asStringArray(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

export async function getCandidateProfile(uid: string): Promise<CandidatePublicProfile | null> {
    const snapshot = await getDoc(doc(db, 'users', uid));
    if (!snapshot.exists()) return null;

    const d = snapshot.data();
    return {
        uid,
        fullName: String(d.full_name ?? d.fullName ?? ''),
        bio: (d.bio as string | null | undefined) ?? null,
        addressText: (d.address_text as string | null | undefined) ?? null,
        skills: asStringArray(d.skills),
        experiences: asStringArray(d.experiences),
        avatarUrl: (d.avatar_url as string | null | undefined) ?? null,
        verificationStatus: (d.verification_status as CandidatePublicProfile['verificationStatus'] | undefined) ?? 'UNVERIFIED',
        reputationScore: Number(d.reputation_score ?? 100),
    };
}

export async function updateCandidatePublicProfile(
    uid: string,
    payload: Partial<Pick<CandidatePublicProfile, 'fullName' | 'bio' | 'addressText' | 'skills' | 'experiences' | 'avatarUrl'>>
): Promise<void> {
    await updateDoc(doc(db, 'users', uid), {
        ...(payload.fullName !== undefined ? { full_name: payload.fullName } : {}),
        ...(payload.bio !== undefined ? { bio: payload.bio } : {}),
        ...(payload.addressText !== undefined ? { address_text: payload.addressText } : {}),
        ...(payload.skills !== undefined ? { skills: payload.skills } : {}),
        ...(payload.experiences !== undefined ? { experiences: payload.experiences } : {}),
        ...(payload.avatarUrl !== undefined ? { avatar_url: payload.avatarUrl } : {}),
        updated_at: serverTimestamp(),
    });
}

export async function uploadEkycAssets(uid: string, files: File[]): Promise<string[]> {
    const uploads = files.map(async (file) => {
        const fileRef = ref(storage, `users_private/${uid}/ekyc/${Date.now()}_${file.name}`);
        await uploadBytes(fileRef, file);
        return getDownloadURL(fileRef);
    });

    return Promise.all(uploads);
}

export async function submitEkyc(uid: string, payload: EkycSubmitPayload): Promise<void> {
    await setDoc(doc(db, 'users_private', uid), {
        identity_images: payload.identityImages,
        ekyc_metadata: {
            submitted_at: serverTimestamp(),
        },
        updated_at: serverTimestamp(),
    }, { merge: true });

    await updateDoc(doc(db, 'users', uid), {
        verification_status: 'PENDING',
        updated_at: serverTimestamp(),
    });
}

export async function getProfileCompleteness(uid: string): Promise<ProfileCompleteness> {
    const publicProfile = await getCandidateProfile(uid);
    const privateSnapshot = await getDoc(doc(db, 'users_private', uid));

    if (!publicProfile) {
        return {
            score: 0,
            missing: ['profile'],
        };
    }

    const privateData = privateSnapshot.exists() ? privateSnapshot.data() : {};
    const identityImages = asStringArray(privateData.identity_images);

    const checks: Array<{ key: string; ok: boolean }> = [
        { key: 'full_name', ok: publicProfile.fullName.trim().length > 0 },
        { key: 'skills', ok: publicProfile.skills.length > 0 },
        { key: 'bio', ok: !!publicProfile.bio && publicProfile.bio.trim().length > 10 },
        { key: 'address', ok: !!publicProfile.addressText && publicProfile.addressText.trim().length > 5 },
        { key: 'ekyc', ok: identityImages.length >= 2 },
    ];

    const successCount = checks.filter((check) => check.ok).length;
    const score = Math.round((successCount / checks.length) * 100);

    return {
        score,
        missing: checks.filter((check) => !check.ok).map((check) => check.key),
    };
}
