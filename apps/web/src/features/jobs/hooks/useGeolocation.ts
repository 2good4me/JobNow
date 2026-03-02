import { useState, useEffect } from 'react';

interface GeolocationState {
    latitude: number;
    longitude: number;
    error: string | null;
    loading: boolean;
    isDefault: boolean; // true if using fallback coords
}

// Default: Nam Từ Liêm, Hà Nội
const DEFAULT_LAT = 21.0180;
const DEFAULT_LNG = 105.7657;

/**
 * Custom hook to get the user's GPS position.
 * Falls back to Nam Từ Liêm, Hà Nội coordinates if denied or unavailable.
 */
export function useGeolocation(): GeolocationState {
    const [state, setState] = useState<GeolocationState>({
        latitude: DEFAULT_LAT,
        longitude: DEFAULT_LNG,
        error: null,
        loading: true,
        isDefault: true,
    });

    useEffect(() => {
        if (!navigator.geolocation) {
            setState(prev => ({
                ...prev,
                error: 'Trình duyệt không hỗ trợ GPS',
                loading: false,
            }));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setState({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
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
                    error: 'Không thể lấy vị trí. Đang hiển thị khu vực Nam Từ Liêm.',
                    loading: false,
                    isDefault: true,
                });
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
            }
        );
    }, []);

    return state;
}
