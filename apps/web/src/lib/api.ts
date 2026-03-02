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
}

export async function fetchNearbyJobs(params: NearbyJobsParams): Promise<NearbyJobResponse[]> {
    const searchParams = new URLSearchParams();
    searchParams.set('lat', params.lat.toString());
    searchParams.set('lng', params.lng.toString());
    if (params.radius) {
        searchParams.set('radius', params.radius.toString());
    }
    const url = `${API_BASE}/jobs/nearby?${searchParams.toString()}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result.data;
}

export async function seedJobs(): Promise<{ count: number }> {
    const response = await fetch(`${API_BASE}/jobs/seed`, { method: 'POST' });
    if (!response.ok) {
        throw new Error(`Seed Error: ${response.status}`);
    }
    return response.json();
}
