import React from 'react';
import { X, RotateCcw, Check } from 'lucide-react';
import { FilterState, DealType, PropertyType } from '../types';

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onUpdateFilters: (newFilters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export const FiltersModal: React.FC<FiltersModalProps> = ({
  isOpen,
  onClose,
  filters,
  onUpdateFilters,
  onResetFilters,
  totalResults
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4 overflow-y-auto animate-fade-in" id="filters-modal-overlay">
      <div className="bg-stone-50 w-full max-w-lg max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-stone-200" id="filters-modal-content">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-stone-900">Фильтры поиска</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onResetFilters}
              className="text-xs font-semibold text-stone-500 hover:text-stone-900 flex items-center gap-1 p-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Сбросить
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Options */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5 flex-1">
          
          {/* Deal Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
              Тип сделки
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'all', label: 'Все объекты' },
                { id: 'rent', label: 'В аренду' },
                { id: 'sale', label: 'На продажу' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onUpdateFilters({ dealType: item.id as any })}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filters.dealType === item.id
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Property Category */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
              Тип недвижимости
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'all', label: 'Все категории' },
                { id: 'apartment', label: 'Квартира' },
                { id: 'house', label: 'Дом / Коттедж' },
                { id: 'villa', label: 'Вилла' },
                { id: 'office', label: 'Офис' },
                { id: 'land', label: 'Участок' },
                { id: 'commercial', label: 'Коммерческая' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onUpdateFilters({ propertyType: cat.id as any })}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    filters.propertyType === cat.id
                      ? 'bg-stone-900 text-white shadow-sm'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
              Количество комнат
            </label>
            <div className="flex items-center gap-2">
              {(['all', 1, 2, 3, 4, 5] as const).map((b) => (
                <button
                  key={b}
                  onClick={() => onUpdateFilters({ bedrooms: b })}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    filters.bedrooms === b
                      ? 'bg-stone-900 text-white'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {b === 'all' ? 'Любое' : `${b}+`}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                Максимальная стоимость
              </label>
              <span className="text-xs font-bold text-stone-900 font-mono">
                {filters.maxPrice >= 500000 ? 'Без ограничений' : `$ ${filters.maxPrice.toLocaleString()}`}
              </span>
            </div>
            <input
              type="range"
              min="200"
              max="500000"
              step="500"
              value={filters.maxPrice}
              onChange={(e) => onUpdateFilters({ maxPrice: Number(e.target.value) })}
              className="w-full accent-stone-900 h-2 bg-stone-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-400 font-mono">
              <span>$200</span>
              <span>$1,500</span>
              <span>$50,000</span>
              <span>$500,000+</span>
            </div>
          </div>

        </div>

        {/* Footer Apply */}
        <div className="p-4 bg-white border-t border-stone-200">
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-stone-900 text-white font-bold text-sm rounded-2xl hover:bg-stone-800 shadow-md transition-all active:scale-98 cursor-pointer"
          >
            Применить фильтры
          </button>
        </div>

      </div>
    </div>
  );
};
