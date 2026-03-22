import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface CategoryBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export function CategoryBottomSheet({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onSelect,
}: CategoryBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl border border-t-slate-200 dark:border-t-slate-700 bg-white dark:bg-[#1f2937] shadow-[0_-8px_32px_rgba(0,0,0,0.12)] transition-all duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-2.5 pb-2">
          <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-4 py-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Chọn ngành nghề</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto px-4 py-3">
          <div className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  onSelect(category);
                  onClose();
                }}
                className={`
                  rounded-2xl border-2 px-4 py-3 text-center font-semibold transition-all duration-200
                  ${
                    selectedCategory === category
                      ? 'border-emerald-500 dark:border-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 shadow-md shadow-emerald-200/50 dark:shadow-emerald-900/50'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f172a] text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Footer with safe area */}
        <div className="border-t border-slate-100 dark:border-slate-800 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-emerald-600 py-3 text-center font-bold text-white shadow-md transition-all hover:bg-emerald-700 active:scale-[0.98]"
          >
            Xác nhận
          </button>
        </div>
      </div>
    </>
  );
}
