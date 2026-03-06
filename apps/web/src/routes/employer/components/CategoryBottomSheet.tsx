import React from 'react';
import { JOB_CATEGORIES } from '../schemas/create-job.schema';

interface CategoryBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCategory: string;
  onSelect: (categoryId: string) => void;
}

export const CategoryBottomSheet: React.FC<CategoryBottomSheetProps> = ({
  isOpen,
  onClose,
  selectedCategory,
  onSelect,
}) => {
  if (!isOpen) return null;

  const handleSelect = (categoryId: string) => {
    onSelect(categoryId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-3 sm:p-4 pt-8 pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Bottom Sheet */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto overscroll-contain animate-in fade-in duration-200">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-0">
          <div className="w-12 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 z-10">
          <h2 className="text-lg font-bold text-slate-900">Chọn loại công việc</h2>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 gap-3 p-6">
          {JOB_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => handleSelect(category.id)}
              className={`relative p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center gap-2 ${
                selectedCategory === category.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 bg-white hover:border-blue-300'
              }`}
              aria-pressed={selectedCategory === category.id}
            >
              <span className="text-3xl">{category.icon}</span>
              <span className="text-sm font-medium text-center text-slate-700">
                {category.label.split(' ').slice(1).join(' ')}
              </span>
              {selectedCategory === category.id && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
          >
            Hủy
          </button>
          <button
            onClick={() => selectedCategory && handleSelect(selectedCategory)}
            className="flex-1 px-4 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition"
            disabled={!selectedCategory}
          >
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  );
};
