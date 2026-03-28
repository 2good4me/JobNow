import { X, Search, MapPin } from 'lucide-react';
import { useState } from 'react';

const DISTRICTS = [
  'Tất cả',
  'Ba Đình',
  'Hoàn Kiếm',
  'Tây Hồ',
  'Long Biên',
  'Cầu Giấy',
  'Đống Đa',
  'Hai Bà Trưng',
  'Hoàng Mai',
  'Thanh Xuân',
  'Nam Từ Liêm',
  'Bắc Từ Liêm',
  'Hà Đông',
];

interface DistrictPickerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDistrict: string;
  onSelect: (district: string) => void;
}

export function DistrictPicker({ isOpen, onClose, selectedDistrict, onSelect }: DistrictPickerProps) {
  const [search, setSearch] = useState('');

  if (!isOpen) return null;

  const filteredDistricts = DISTRICTS.filter(d => 
    d.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-[70] max-h-[80dvh] rounded-t-[32px] bg-white p-6 shadow-2xl animate-in slide-in-from-bottom flex flex-col">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 shrink-0" />
        
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h3 className="text-xl font-black text-slate-900">Chọn khu vực</h3>
            <p className="text-sm text-slate-500 mt-1">Tìm kiếm việc làm theo quận/huyện</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative mb-6 shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm quận, huyện..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-medium focus:ring-2 ring-blue-500/20 transition-all outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 pb-6">
          {filteredDistricts.map((district) => (
            <button
              key={district}
              onClick={() => {
                onSelect(district);
                onClose();
              }}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                selectedDistrict === district 
                  ? 'bg-blue-50 text-blue-600 ring-1 ring-blue-100' 
                  : 'bg-white hover:bg-slate-50 text-slate-700 active:scale-[0.98]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${selectedDistrict === district ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="font-bold text-[15px]">{district}</span>
              </div>
              {selectedDistrict === district && (
                <div className="w-2 h-2 rounded-full bg-blue-600 shadow-lg shadow-blue-200" />
              )}
            </button>
          ))}
          
          {filteredDistricts.length === 0 && (
            <div className="text-center py-10">
              <p className="text-slate-400 font-medium">Không tìm thấy khu vực này</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
