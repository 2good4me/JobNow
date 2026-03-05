/**
 * API client for JobNow backend
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

export function getApiBase(): string {
    return API_BASE;
}

export interface NearbyJobsParams {
    lat: number;
    lng: number;
    radius?: number; // in meters, default 5000
    salary_min?: number;
    salary_max?: number;
    category_ids?: string[];
    shift_time?: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
    keyword?: string;
    limit?: number;
    cursor?: string;
}

export interface NearbyJobResponse {
    id: string;
    employer_id: string;
    employer_name: string;
    title: string;
    description: string;
    category: string;
    salary: number;
    salary_type: 'HOURLY' | 'DAILY' | 'JOB';
    address: string;
    location: { latitude: number; longitude: number };
    is_gps_required: boolean;
    status: string;
    shifts: {
        id: string;
        name: string;
        start_time: string;
        end_time: string;
        quantity: number;
    }[];
    distance: number; // in meters
    created_at?: string;
    updated_at?: string;
}

export interface NearbyJobsPageResponse {
    message: string;
    count: number;
    center: { lat: number; lng: number };
    radius: number;
    next_cursor?: string;
    data: NearbyJobResponse[];
}

export async function fetchNearbyJobsPage(params: NearbyJobsParams): Promise<NearbyJobsPageResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set('lat', params.lat.toString());
    searchParams.set('lng', params.lng.toString());
    if (params.radius) {
        searchParams.set('radius', params.radius.toString());
    }
    if (params.salary_min !== undefined) {
        searchParams.set('salary_min', String(params.salary_min));
    }
    if (params.salary_max !== undefined) {
        searchParams.set('salary_max', String(params.salary_max));
    }
    if (params.category_ids?.length) {
        searchParams.set('category_ids', params.category_ids.join(','));
    }
    if (params.shift_time) {
        searchParams.set('shift_time', params.shift_time);
    }
    if (params.keyword) {
        searchParams.set('keyword', params.keyword);
    }
    if (params.limit !== undefined) {
        searchParams.set('limit', String(params.limit));
    }
    if (params.cursor) {
        searchParams.set('cursor', params.cursor);
    }
    const url = `${API_BASE}/jobs/nearby?${searchParams.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

export async function fetchNearbyJobs(params: NearbyJobsParams): Promise<NearbyJobResponse[]> {
    const result = await fetchNearbyJobsPage(params);
    return result.data;
}

export async function seedJobs(): Promise<{ count: number }> {
    const response = await fetch(`${API_BASE}/jobs/seed`, { method: 'POST' });
    if (!response.ok) {
        throw new Error(`Seed Error: ${response.status}`);
    }
    return response.json();
}
