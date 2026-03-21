import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet's default icon path issues with Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { ArrowLeft, Check, Loader2, MapPin, Search, LocateFixed } from 'lucide-react';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  onSelect: (lat: number, lng: number, address?: string) => void;
  onClose: () => void;
  initialLocation?: { lat: number; lng: number, address?: string };
}

function MapController({ position }: { position: L.LatLng | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, 15, { animate: true });
    }
  }, [position, map]);
  return null;
}

function LocationMarker({ position, setPosition, onPositionChanged }: { position: L.LatLng | null, setPosition: (p: L.LatLng) => void, onPositionChanged: (p: L.LatLng) => void }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      onPositionChanged(e.latlng);
    },
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      onPositionChanged(e.latlng);
    },
  });

  // Force map to recalculate size when mounted in a modal/fixed container to prevent rendering issues
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export function MapPicker({ onSelect, onClose, initialLocation }: MapPickerProps) {
  const hanoiCenter = { lat: 21.0285, lng: 105.8542 };
  const initialLatLng = initialLocation ? new L.LatLng(initialLocation.lat, initialLocation.lng) : null;
  
  const [position, setPosition] = useState<L.LatLng | null>(initialLatLng);
  const [address, setAddress] = useState<string>(initialLocation?.address || '');
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const defaultCenter = initialLocation ? [initialLocation.lat, initialLocation.lng] : [hanoiCenter.lat, hanoiCenter.lng];

  const fetchAddress = async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    setAddress('');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=vi`);
      const data = await res.json();
      if (data && data.display_name) {
        // Rút gọn địa chỉ cho dễ nhìn
        const parts = data.display_name.split(', ');
        const shortAddress = parts.slice(0, 4).join(', ');
        setAddress(shortAddress);
      } else {
        setAddress('Không tìm thấy địa chỉ cụ thể');
      }
    } catch (error) {
      setAddress('Không thể lấy địa chỉ (lỗi mạng)');
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handlePositionChanged = (p: L.LatLng) => {
    fetchAddress(p.lat, p.lng);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&countrycodes=vn`);
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: any) => {
    const newPos = new L.LatLng(parseFloat(result.lat), parseFloat(result.lon));
    setPosition(newPos);
    setSearchResults([]);
    setSearchQuery('');
    
    // Set address immediately from search result, then optionally refine it
    const parts = result.display_name.split(', ');
    const shortAddress = parts.slice(0, 4).join(', ');
    setAddress(shortAddress);
  };

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const newPos = new L.LatLng(lat, lng);
          setPosition(newPos);
          fetchAddress(lat, lng);
          setIsLocating(false);
        },
        (err) => {
          console.error("Lỗi lấy vị trí:", err);
          alert("Không thể lấy vị trí của bạn để định vị.");
          setIsLocating(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Trình duyệt của bạn không hỗ trợ định vị.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white px-4 py-3 border-b border-slate-200 flex justify-between items-center shadow-sm z-20 relative">
        <button onClick={onClose} className="p-2 -ml-2 text-slate-600 rounded-full hover:bg-slate-100">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-[17px] font-bold text-slate-900">Chọn vị trí tìm việc</h2>
        <button 
          onClick={() => position && onSelect(position.lat, position.lng, address)}
          disabled={!position || isLoadingAddress}
          className={`p-2 -mr-2 rounded-full ${position && !isLoadingAddress ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-300'}`}
        >
          <Check className="w-6 h-6" />
        </button>
      </div>
      
      <div className="flex-1 relative z-0">
        {/* Search Overlay */}
        <div className="absolute top-4 left-4 right-4 z-[1000]">
          <form onSubmit={handleSearch} className="relative flex items-center">
            <input
              type="text"
              placeholder="Tìm kiếm khu vực (VD: Thanh Xuân)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-12 rounded-xl shadow-lg border border-slate-200 bg-white text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-4 w-5 h-5 text-slate-400" />
            <button 
              type="submit" 
              className="absolute right-2 px-3 py-1.5 bg-blue-50 text-blue-600 text-[12px] font-bold rounded-lg hover:bg-blue-100 transition-colors"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Tìm'}
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden max-h-60 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full text-left px-4 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors"
                >
                  <div className="text-[13px] font-medium text-slate-800 line-clamp-1">{result.display_name.split(',')[0]}</div>
                  <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{result.display_name}</div>
                </button>
              ))}
            </div>
          )}
        </div>

        <MapContainer 
          center={defaultCenter as [number, number]} 
          zoom={13} 
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController position={position} />
          <LocationMarker position={position} setPosition={setPosition} onPositionChanged={handlePositionChanged} />
        </MapContainer>
        
        {!position && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-[1000] bg-white px-4 py-2 rounded-full shadow-lg text-[13px] font-medium text-slate-700 pointer-events-none whitespace-nowrap">
            Chạm vào bản đồ để chọn vị trí
          </div>
        )}

        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="absolute bottom-6 right-4 z-[1000] p-3 bg-white rounded-full shadow-lg border border-slate-200 text-slate-700 hover:text-blue-600 focus:outline-none flex items-center justify-center transition-colors disabled:opacity-70"
          title="Vị trí của tôi"
        >
          {isLocating ? <Loader2 className="w-6 h-6 animate-spin" /> : <LocateFixed className="w-6 h-6" />}
        </button>
      </div>

      {position && (
        <div className="bg-white p-4 pb-8 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-[1000] relative">
          <div className="mb-4 flex gap-3 items-start bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="mt-0.5">
              {isLoadingAddress ? (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              ) : (
                <MapPin className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <div>
              <p className="text-[12px] text-slate-500 font-medium mb-0.5">Vị trí đã chọn:</p>
              <p className="text-[14px] font-semibold text-slate-800 leading-snug">
                {isLoadingAddress ? 'Đang xác định địa chỉ...' : address || `${position.lat.toFixed(4)}, ${position.lng.toFixed(4)}`}
              </p>
            </div>
          </div>
          <button 
            onClick={() => onSelect(position.lat, position.lng, address)}
            disabled={isLoadingAddress}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
          >
            {isLoadingAddress ? 'ĐANG TẢI...' : 'XÁC NHẬN VỊ TRÍ'}
          </button>
        </div>
      )}
    </div>
  );
}
