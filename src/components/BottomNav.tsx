import React from 'react';
import { Home, Compass, Heart, Sparkles, PlusCircle } from 'lucide-react';

export type NavTab = 'home' | 'map' | 'favorites' | 'assistant' | 'add';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  favoritesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  favoritesCount = 0
}) => {
  return (
    <div className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-4 pointer-events-none">
      <nav
        aria-label="Bottom Navigation"
        className="pointer-events-auto bg-stone-900/95 backdrop-blur-xl text-white px-5 py-2.5 rounded-full shadow-2xl border border-white/15 flex items-center gap-6 sm:gap-8 transition-all"
      >
        {/* Home */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center gap-0.5 text-xs transition-colors py-1 ${
            activeTab === 'home' ? 'text-white font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
          aria-label="Главная"
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {activeTab === 'home' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
            )}
          </div>
          <span className="text-[10px] hidden sm:block">Главная</span>
        </button>

        {/* Explore Map */}
        <button
          onClick={() => onTabChange('map')}
          className={`flex flex-col items-center gap-0.5 text-xs transition-colors py-1 ${
            activeTab === 'map' ? 'text-white font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
          aria-label="Карта"
        >
          <div className="relative">
            <Compass className="w-5 h-5" />
            {activeTab === 'map' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
            )}
          </div>
          <span className="text-[10px] hidden sm:block">Карта</span>
        </button>

        {/* Add Property Quick Action */}
        <button
          onClick={() => onTabChange('add')}
          className="w-10 h-10 -my-2 rounded-full bg-white text-stone-900 hover:bg-stone-100 flex items-center justify-center shadow-lg transition-transform active:scale-90 hover:scale-105 shrink-0"
          aria-label="Добавить объявление"
          title="Добавить новое объявление"
        >
          <PlusCircle className="w-5 h-5 fill-stone-900 text-white" />
        </button>

        {/* Favorites */}
        <button
          onClick={() => onTabChange('favorites')}
          className={`flex flex-col items-center gap-0.5 text-xs transition-colors py-1 relative ${
            activeTab === 'favorites' ? 'text-white font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
          aria-label="Избранное"
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
            {activeTab === 'favorites' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full" />
            )}
          </div>
          <span className="text-[10px] hidden sm:block">Избранное</span>
        </button>

        {/* AI Assistant */}
        <button
          onClick={() => onTabChange('assistant')}
          className={`flex flex-col items-center gap-0.5 text-xs transition-colors py-1 ${
            activeTab === 'assistant' ? 'text-white font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
          aria-label="AI Подбор"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300" />
            {activeTab === 'assistant' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-amber-300 rounded-full" />
            )}
          </div>
          <span className="text-[10px] hidden sm:block">AI Подбор</span>
        </button>
      </nav>
    </div>
  );
};
