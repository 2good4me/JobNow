import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import type { VerificationStatus } from '@/features/auth/types/user';
import { db, storage } from '@/config/firebase';
import { updateUserDocument } from '@/lib/firestore';

export type VerificationRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface VerificationRequestRecord {
  id: string;
  userId: string;
  status: VerificationRequestStatus;
  documentType: 'BUSINESS_LICENSE';
  documentUrl: string;
  storagePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  width: number;
  height: number;
  rejectionReason?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface EmployerVerificationRealtimeState {
  verificationStatus: VerificationStatus;
  businessLicenseUrl: string | null;
  latestRequest: VerificationRequestRecord | null;
}

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_SOURCE_FILE_SIZE_BYTES = 12 * 1024 * 1024;
const MIN_IMAGE_DIMENSION = 900;

function parseTimestamp(value: unknown): unknown {
  return value ?? undefined;
}

function mapRequestDocument(id: string, data: Record<string, unknown>): VerificationRequestRecord {
  return {
    id,
    userId: String(data.user_id ?? ''),
    status: (data.status as VerificationRequestStatus) ?? 'PENDING',
    documentType: 'BUSINESS_LICENSE',
    documentUrl: String(data.document_url ?? ''),
    storagePath: String(data.storage_path ?? ''),
    fileName: String(data.file_name ?? ''),
    fileSize: Number(data.file_size ?? 0),
    mimeType: String(data.mime_type ?? ''),
    width: Number(data.width ?? 0),
    height: Number(data.height ?? 0),
    rejectionReason: typeof data.rejection_reason === 'string' ? data.rejection_reason : undefined,
    createdAt: parseTimestamp(data.created_at),
    updatedAt: parseTimestamp(data.updated_at),
  };
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Không thể đọc ảnh đã chọn. Vui lòng thử ảnh khác.'));
    };

    image.src = objectUrl;
  });
}

async function validateSourceFile(file: File): Promise<HTMLImageElement> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error('Định dạng ảnh chưa hợp lệ. Vui lòng dùng JPG, PNG hoặc WEBP.');
  }

  if (file.size > MAX_SOURCE_FILE_SIZE_BYTES) {
    throw new Error('Ảnh quá lớn (tối đa 12MB). Vui lòng chọn ảnh nhỏ hơn.');
  }

  const image = await loadImageFromFile(file);
  if (image.width < MIN_IMAGE_DIMENSION || image.height < MIN_IMAGE_DIMENSION) {
    throw new Error('Ảnh có thể bị mờ hoặc quá nhỏ. Vui lòng chụp lại ảnh rõ nét hơn.');
  }

  return image;
}

async function compressImage(image: HTMLImageElement, fileNameBase: string): Promise<{ file: File; width: number; height: number }> {
  const maxWidth = 1600;
  const maxHeight = 1600;

  const scale = Math.min(maxWidth / image.width, maxHeight / image.height, 1);
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Thiết bị không hỗ trợ xử lý ảnh. Vui lòng thử lại.');
  }

  context.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((output) => resolve(output), 'image/jpeg', 0.82);
  });

  if (!blob) {
    throw new Error('Không thể nén ảnh. Vui lòng thử ảnh khác.');
  }

  const file = new File([blob], `${fileNameBase}.jpg`, { type: 'image/jpeg' });
  return { file, width, height };
}

function buildRequestId(uid: string): string {
  return `${uid}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export async function submitEmployerVerificationRequest(uid: string, sourceFile: File): Promise<VerificationRequestRecord> {
  const sourceImage = await validateSourceFile(sourceFile);
  const requestId = buildRequestId(uid);
  const compressed = await compressImage(sourceImage, requestId);

  const storagePath = `verification-requests/${uid}/${requestId}.jpg`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, compressed.file, {
    contentType: compressed.file.type,
    customMetadata: {
      uid,
      request_id: requestId,
      source_name: sourceFile.name,
    },
  });

  const documentUrl = await getDownloadURL(storageRef);
  const requestRef = doc(db, 'users_private', uid, 'verification_requests', requestId);

  const payload = {
    user_id: uid,
    status: 'PENDING' as const,
    document_type: 'BUSINESS_LICENSE' as const,
    document_url: documentUrl,
    storage_path: storagePath,
    file_name: compressed.file.name,
    file_size: compressed.file.size,
    mime_type: compressed.file.type,
    width: compressed.width,
    height: compressed.height,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  };

  await setDoc(requestRef, payload);

  await updateUserDocument(uid, {
    business_license_url: documentUrl,
    verification_status: 'PENDING',
  });

  return {
    id: requestId,
    userId: uid,
    status: 'PENDING',
    documentType: 'BUSINESS_LICENSE',
    documentUrl,
    storagePath,
    fileName: compressed.file.name,
    fileSize: compressed.file.size,
    mimeType: compressed.file.type,
    width: compressed.width,
    height: compressed.height,
  };
}

export function subscribeEmployerVerificationState(
  uid: string,
  onUpdate: (state: EmployerVerificationRealtimeState) => void
): Unsubscribe {
  let verificationStatus: VerificationStatus = 'UNVERIFIED';
  let businessLicenseUrl: string | null = null;
  let latestRequest: VerificationRequestRecord | null = null;

  const emit = () => {
    onUpdate({
      verificationStatus,
      businessLicenseUrl,
      latestRequest,
    });
  };

  const unsubscribeUser = onSnapshot(doc(db, 'users', uid), (snapshot) => {
    const data = (snapshot.data() ?? {}) as Record<string, unknown>;
    verificationStatus = (data.verification_status as VerificationStatus) ?? 'UNVERIFIED';
    businessLicenseUrl = typeof data.business_license_url === 'string' ? data.business_license_url : null;
    emit();
  });

  const requestQuery = query(
    collection(db, 'users_private', uid, 'verification_requests'),
    orderBy('created_at', 'desc'),
    limit(1)
  );

  const unsubscribeRequest = onSnapshot(requestQuery, (snapshot) => {
    if (snapshot.empty) {
      latestRequest = null;
      emit();
      return;
    }

    const docSnap = snapshot.docs[0];
    latestRequest = mapRequestDocument(docSnap.id, docSnap.data() as Record<string, unknown>);
    emit();
  });

  return () => {
    unsubscribeUser();
    unsubscribeRequest();
  };
}
