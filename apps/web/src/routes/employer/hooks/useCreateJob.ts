import { useMutation, useQuery, type UseMutationOptions } from '@tanstack/react-query';
import { auth } from '@/config/firebase';
import type { CreateJobFormData } from '../schemas/create-job.schema';

interface BackendCreateJobPayload {
  title: string;
  category: string;
  description: string;
  salary: number;
  quantity: number;
  startTime: string;
  endTime: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  employer_name: string;
  salary_type: 'HOURLY' | 'DAILY' | 'JOB';
  is_gps_required: boolean;
  status: 'OPEN' | 'FULL' | 'CLOSED' | 'HIDDEN';
  shifts: Array<{
    id: string;
    name: string;
    start_time: string;
    end_time: string;
    quantity: number;
  }>;
}

interface CreateJobApiResponse {
  message: string;
  job: Record<string, unknown>;
}

const LOCAL_TOKEN_KEYS = ['idToken', 'token', 'accessToken', 'authToken'] as const;

const normalizeToken = (rawToken: string): string => rawToken.replace(/^Bearer\s+/i, '').trim();

const getTokenFromLocalStorage = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  for (const key of LOCAL_TOKEN_KEYS) {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      return normalizeToken(raw);
    }
  }

  // Firebase Web SDK persistence shape: firebase:authUser:<apiKey>:[DEFAULT]
  const firebaseAuthKey = Object.keys(window.localStorage).find((key) =>
    key.startsWith('firebase:authUser:')
  );

  if (!firebaseAuthKey) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(firebaseAuthKey);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as {
      stsTokenManager?: { accessToken?: string };
    };

    return parsed.stsTokenManager?.accessToken
      ? normalizeToken(parsed.stsTokenManager.accessToken)
      : null;
  } catch {
    return null;
  }
};

const resolveAuthToken = async (): Promise<string | null> => {
  try {
    const refreshedToken = await auth.currentUser?.getIdToken(true);
    if (refreshedToken) {
      return normalizeToken(refreshedToken);
    }
  } catch {
    // Fallback to persisted token below.
  }

  return getTokenFromLocalStorage();
};

const toBackendPayload = (data: CreateJobFormData): BackendCreateJobPayload => {
  const salary = Number(data.salary);
  const quantity = Number(data.quantity);
  const latitude = Number(data.location.latitude);
  const longitude = Number(data.location.longitude);

  return {
    title: data.title.trim(),
    category: data.category,
    description: data.description?.trim() ?? '',
    salary,
    quantity,
    startTime: data.startTime,
    endTime: data.endTime,
    address: data.address.trim(),
    location: {
      latitude,
      longitude,
    },
    employer_name: auth.currentUser?.displayName || 'Nhà tuyển dụng',
    salary_type: 'HOURLY',
    is_gps_required: true,
    status: 'OPEN',
    shifts: [
      {
        id: '',
        name: 'Ca làm việc chính',
        start_time: data.startTime,
        end_time: data.endTime,
        quantity,
      },
    ],
  };
};

/**
 * Create Job Mutation Hook
 * Handles job creation with loading, error, and success states
 */
export const useCreateJob = (
  options?: UseMutationOptions<CreateJobApiResponse, Error, CreateJobFormData>
) => {
  return useMutation({
    mutationFn: async (data: CreateJobFormData) => {
      const token = await resolveAuthToken();
      if (!token) {
        throw new Error('Vui lòng đăng nhập để đăng tin');
      }

      const payload = toBackendPayload(data);
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get('content-type') || '';
      const responseBody = contentType.includes('application/json')
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        const message =
          typeof responseBody === 'string'
            ? responseBody
            : responseBody?.error || responseBody?.message;
        throw new Error(message || 'Không thể đăng tin');
      }

      return responseBody as CreateJobApiResponse;
    },
    ...options,
  });
};

/**
 * Fetch Job Categories
 * Get available job categories from the server
 */
export const useJobCategories = () => {
  return useQuery({
    queryKey: ['job-categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
  });
};

/**
 * Fetch User's Jobs
 * Get all jobs posted by the current employer
 */
export const useEmployerJobs = () => {
  return useQuery({
    queryKey: ['employer-jobs'],
    queryFn: async () => {
      const response = await fetch('/api/jobs/my-jobs');
      if (!response.ok) {
        throw new Error('Failed to fetch your jobs');
      }
      return response.json();
    },
  });
};

/**
 * Helper: Format currency for display
 */
export const formatCurrency = (value: number): string => {
  return value.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
};

/**
 * Helper: Calculate working hours from start and end time
 */
export const calculateWorkingHours = (startTime: string, endTime: string): number => {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startTotalMins = startHour * 60 + startMin;
  const endTotalMins = endHour * 60 + endMin;

  return (endTotalMins - startTotalMins) / 60;
};

/**
 * Helper: Format time for API (ensure HH:mm format)
 */
export const formatTimeString = (time: string): string => {
  const [hour, minute] = time.split(':');
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
};

/**
 * Helper: Validate GPS coordinates
 */
export const isValidCoordinate = (lat: number, lng: number): boolean => {
  return (
    isFinite(lat) &&
    isFinite(lng) &&
    lat !== 0 &&
    lng !== 0 &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

/**
 * Helper: Calculate distance between two GPS coordinates (in km)
 * Uses Haversine formula
 */
export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
