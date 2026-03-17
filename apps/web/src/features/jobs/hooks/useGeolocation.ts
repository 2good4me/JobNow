import { useState, useEffect } from 'react';

interface GeolocationState {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    error: string | null;
    loading: boolean;
    isDefault: boolean; // true if using fallback coords
    refresh: () => void; // Function to manually trigger a re-fetch
}

// Default: Nam Từ Liêm, Hà Nội
const DEFAULT_LAT = 21.0180;
const DEFAULT_LNG = 105.7657;

/**
 * Custom hook to get the user's GPS position.
 * Falls back to Nam Từ Liêm, Hà Nội coordinates if denied or unavailable.
 */
export function useGeolocation(): GeolocationState {
    const [state, setState] = useState<Omit<GeolocationState, 'refresh'>>({
        latitude: DEFAULT_LAT,
        longitude: DEFAULT_LNG,
        accuracy: null,
        error: null,
        loading: true,
        isDefault: true,
    });

    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const refresh = () => setRefreshTrigger(prev => prev + 1);

    useEffect(() => {
        if (!navigator.geolocation) {
            setState(prev => ({
                ...prev,
                error: 'Trình duyệt không hỗ trợ GPS',
                loading: false,
            }));
            return;
        }

        setState(prev => ({ ...prev, loading: true }));

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setState({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    error: null,
                    loading: false,
                    isDefault: false,
                });
            },
            (err) => {
                console.warn('Geolocation error:', err.message);
                setState({
                    latitude: DEFAULT_LAT,
                    longitude: DEFAULT_LNG,
                    accuracy: null,
                    error: 'Không thể lấy vị trí. Đang hiển thị khu vực Nam Từ Liêm.',
                    loading: false,
                    isDefault: true,
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0, // Force fresh location
            }
        );
    }, [refreshTrigger]);

    return { ...state, refresh };
}
