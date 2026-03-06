import React, { useEffect, useState } from 'react';

interface Location {
  latitude: number;
  longitude: number;
}

interface LocationSelectorProps {
  onLocationSelect: (location: Location, address: string) => void;
  currentLocation?: Location;
  currentAddress?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelect,
  currentLocation,
  currentAddress,
}) => {
  const [address, setAddress] = useState(currentAddress || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    currentLocation || null
  );

  useEffect(() => {
    if (typeof currentAddress === 'string') {
      setAddress(currentAddress);
    }
  }, [currentAddress]);

  useEffect(() => {
    if (currentLocation) {
      setSelectedLocation(currentLocation);
    }
  }, [currentLocation]);

  const handleGetCurrentLocation = () => {
    setLoading(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Trình duyệt của bạn không hỗ trợ định vị GPS');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };

        const autoAddress = `Lat: ${location.latitude.toFixed(6)}, Lng: ${location.longitude.toFixed(6)}`;

        setSelectedLocation(location);
        setAddress(autoAddress);
        // Auto-sync to parent form state immediately.
        onLocationSelect(location, autoAddress);
        setLoading(false);
      },
      (err) => {
        setError('Không thể lấy vị trí. Vui lòng kiểm tra quyền GPS.');
        console.error(err);
        setLoading(false);
      }
    );
  };

  const handleConfirmLocation = () => {
    if (selectedLocation && address.trim()) {
      onLocationSelect(selectedLocation, address);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextAddress = e.target.value;
    setAddress(nextAddress);
    if (selectedLocation) {
      onLocationSelect(selectedLocation, nextAddress);
    }
  };

  const isValid = !!selectedLocation && address.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Address Input */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Địa chỉ công việc
        </label>
        <input
          type="text"
          value={address}
          onChange={handleAddressChange}
          placeholder="Ví dụ: 123 Đường Nguyễn Huệ, Q.1, TP.HCM"
          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* GPS Button */}
      <button
        type="button"
        onClick={handleGetCurrentLocation}
        disabled={loading}
        className="w-full px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:bg-slate-400 transition flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Đang xác định vị trí...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            Sử dụng vị trí hiện tại
          </>
        )}
      </button>

      {/* Location Info */}
      {selectedLocation && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="text-sm text-green-800">
            <p className="font-medium mb-2">✓ Vị trí đã được chọn:</p>
            <p className="text-xs font-mono">
              {selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}
            </p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Confirm Button */}
      <button
        type="button"
        onClick={handleConfirmLocation}
        disabled={!isValid}
        className="w-full px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 disabled:bg-slate-400 transition"
      >
        Xác nhận vị trí
      </button>
    </div>
  );
};
