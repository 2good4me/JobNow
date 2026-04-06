import { useEffect, useMemo } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from '@tanstack/react-router';
import type { Job } from '@jobnow/types';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const markerIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

type JobMapViewProps = {
    jobs: Job[];
    selectedLocation?: { lat: number; lng: number } | null;
    onSelectLocation?: (location: { lat: number; lng: number }) => void;
    detailVariant?: 'candidate' | 'public';
};

function MapViewport({ center }: { center: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        map.flyTo(center, map.getZoom(), { animate: true });
    }, [center, map]);

    return null;
}

function MapClickHandler({
    onSelectLocation,
}: {
    onSelectLocation?: (location: { lat: number; lng: number }) => void;
}) {
    useMapEvents({
        click(event) {
            onSelectLocation?.({
                lat: event.latlng.lat,
                lng: event.latlng.lng,
            });
        },
    });

    return null;
}

export function JobMapView({
    jobs,
    selectedLocation,
    onSelectLocation,
    detailVariant = 'public',
}: JobMapViewProps) {
    const center = useMemo<[number, number]>(() => {
        if (selectedLocation) {
            return [selectedLocation.lat, selectedLocation.lng];
        }

        const firstWithLocation = jobs.find((job) => job.location?.latitude && job.location?.longitude);
        if (firstWithLocation) {
            return [firstWithLocation.location.latitude, firstWithLocation.location.longitude];
        }

        return [21.0285, 105.8542];
    }, [jobs, selectedLocation]);

    return (
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="h-[68vh] min-h-[420px] w-full">
                <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full">
                    <TileLayer
                        attribution='&copy; OpenStreetMap contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapViewport center={center} />
                    <MapClickHandler onSelectLocation={onSelectLocation} />
                    
                    {/* Marker for selected search location (GPS PIN) */}
                    {selectedLocation && (
                        <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={markerIcon}>
                            <Popup>Vị trí bạn đã ghim</Popup>
                        </Marker>
                    )}

                    {jobs
                        .filter((job) => job.location?.latitude && job.location?.longitude)
                        .map((job) => (
                            <Marker
                                key={job.id}
                                icon={markerIcon}
                                position={[job.location.latitude, job.location.longitude]}
                            >
                                <Popup minWidth={220}>
                                    <div className="space-y-2">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                {job.employerName || 'Nhà tuyển dụng'}
                                            </p>
                                            <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            {(job.location.address || 'Chưa cập nhật địa chỉ').slice(0, 90)}
                                        </p>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700">
                                                {job.salary.toLocaleString('vi-VN')}đ
                                            </span>
                                            {job.isBoosted && (
                                                <span className="rounded-full bg-amber-50 px-2 py-1 font-semibold text-amber-700">
                                                    Boost
                                                </span>
                                            )}
                                        </div>
                                        <Link
                                            to={detailVariant === 'candidate' ? '/candidate/jobs/$jobId' : '/jobs/$jobId'}
                                            params={{ jobId: job.id }}
                                            className="block rounded-xl bg-blue-600 px-3 py-2 text-center text-xs font-bold text-white"
                                        >
                                            Xem chi tiết
                                        </Link>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                </MapContainer>
            </div>
        </div>
    );
}
