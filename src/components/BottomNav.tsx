import React from 'react';
import { Home, Compass, Heart, Sparkles, Plus, Search, User as UserIcon } from 'lucide-react';
import { User } from '../types';

export type NavTab = 'home' | 'map' | 'favorites' | 'assistant' | 'add' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  favoritesCount?: number;
  currentUser?: User | null;
  onProfileClick?: () => void;
  onQuickAction?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  favoritesCount = 0,
  currentUser,
  onProfileClick,
  onQuickAction
}) => {
  const handleProfilePress = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      onTabChange('profile');
    }
  };

  // Realtor / Owner role check
  const isRealtorOrAdmin = currentUser?.role === 'owner' || currentUser?.role === 'admin';
  // AI assistant visibility
  const showAIAssistant = currentUser?.role !== 'owner';

  const handleCompanionClick = () => {
    if (onQuickAction) {
      onQuickAction();
    } else if (isRealtorOrAdmin) {
      onTabChange('add');
    } else {
      const searchEl = document.getElementById('search-input');
      if (searchEl) {
        searchEl.focus();
        searchEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        onTabChange('home');
      }
    }
  };

  return (
    <div
      className="fixed bottom-3 sm:bottom-5 inset-x-0 z-40 flex items-center justify-center gap-2.5 px-3 sm:px-4 pointer-events-none"
      id="bottom-navigation-bar"
    >
      {/* Main Ultra-Gentle Translucent iOS Glass Capsule */}
      <nav
        aria-label="iOS Navigation Bar"
        className="pointer-events-auto bg-white/80 backdrop-blur-3xl border border-white/90 ring-1 ring-black/[0.04] text-stone-800 px-1.5 sm:px-2.5 py-1 rounded-full shadow-[0_14px_40px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between gap-0.5 sm:gap-1.5 transition-all max-w-[390px] w-full sm:w-auto"
      >
        {/* 1. Home / Catalog */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex-1 sm:flex-initial min-w-[54px] sm:min-w-[62px] py-1 px-1.5 rounded-full flex flex-col items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 ${
            activeTab === 'home'
              ? 'bg-stone-900/6 text-[#007AFF] shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
          aria-label="Главная"
          id="nav-tab-home"
        >
          <Home
            className={`w-[20px] h-[20px] transition-transform ${
              activeTab === 'home' ? 'stroke-[2.3] scale-105 text-[#007AFF]' : 'stroke-[1.8] text-stone-600'
            }`}
          />
          <span
            className={`text-[9.5px] sm:text-[10px] tracking-tight mt-0.5 leading-none transition-colors ${
              activeTab === 'home' ? 'font-bold text-[#007AFF]' : 'font-medium text-stone-500'
            }`}
          >
            Главная
          </span>
        </button>

        {/* 2. Map */}
        <button
          onClick={() => onTabChange('map')}
          className={`flex-1 sm:flex-initial min-w-[54px] sm:min-w-[62px] py-1 px-1.5 rounded-full flex flex-col items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 ${
            activeTab === 'map'
              ? 'bg-stone-900/6 text-[#007AFF] shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
          aria-label="Карта"
          id="nav-tab-map"
        >
          <Compass
            className={`w-[20px] h-[20px] transition-transform ${
              activeTab === 'map' ? 'stroke-[2.3] scale-105 text-[#007AFF]' : 'stroke-[1.8] text-stone-600'
            }`}
          />
          <span
            className={`text-[9.5px] sm:text-[10px] tracking-tight mt-0.5 leading-none transition-colors ${
              activeTab === 'map' ? 'font-bold text-[#007AFF]' : 'font-medium text-stone-500'
            }`}
          >
            Карта
          </span>
        </button>

        {/* 3. Favorites with Telegram-Style Red Counter Badge */}
        <button
          onClick={() => onTabChange('favorites')}
          className={`flex-1 sm:flex-initial min-w-[54px] sm:min-w-[62px] py-1 px-1.5 rounded-full flex flex-col items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 relative ${
            activeTab === 'favorites'
              ? 'bg-rose-500/10 text-[#FF2D55] shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
          aria-label="Избранное"
          id="nav-tab-favorites"
        >
          <div className="relative">
            <Heart
              className={`w-[20px] h-[20px] transition-transform ${
                activeTab === 'favorites'
                  ? 'fill-[#FF2D55] text-[#FF2D55] stroke-[1.8] scale-105'
                  : 'text-stone-600 stroke-[1.8]'
              }`}
            />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#FF2D55] text-white text-[9px] font-black min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center border-2 border-white shadow-xs animate-in zoom-in-50">
                {favoritesCount}
              </span>
            )}
          </div>
          <span
            className={`text-[9.5px] sm:text-[10px] tracking-tight mt-0.5 leading-none transition-colors ${
              activeTab === 'favorites' ? 'font-bold text-[#FF2D55]' : 'font-medium text-stone-500'
            }`}
          >
            Избранное
          </span>
        </button>

        {/* 4. AI Assistant (for seekers / guests) */}
        {showAIAssistant && (
          <button
            onClick={() => onTabChange('assistant')}
            className={`flex-1 sm:flex-initial min-w-[54px] sm:min-w-[62px] py-1 px-1.5 rounded-full flex flex-col items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 ${
              activeTab === 'assistant'
                ? 'bg-amber-500/12 text-amber-700 shadow-xs'
                : 'text-stone-500 hover:text-stone-800'
            }`}
            aria-label="AI Подбор"
            id="nav-tab-ai"
          >
            <Sparkles
              className={`w-[20px] h-[20px] transition-transform ${
                activeTab === 'assistant'
                  ? 'text-amber-600 fill-amber-500/20 stroke-[2] scale-105'
                  : 'text-amber-500 stroke-[1.8]'
              }`}
            />
            <span
              className={`text-[9.5px] sm:text-[10px] tracking-tight mt-0.5 leading-none transition-colors ${
                activeTab === 'assistant' ? 'font-bold text-amber-700' : 'font-medium text-stone-500'
              }`}
            >
              AI Поиск
            </span>
          </button>
        )}

        {/* 5. Profile / Account Settings */}
        <button
          onClick={handleProfilePress}
          className={`flex-1 sm:flex-initial min-w-[54px] sm:min-w-[62px] py-1 px-1.5 rounded-full flex flex-col items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 ${
            activeTab === 'profile'
              ? 'bg-stone-900/6 text-[#007AFF] shadow-xs'
              : 'text-stone-500 hover:text-stone-800'
          }`}
          aria-label="Профиль"
          id="nav-tab-profile"
        >
          <div className="relative">
            {currentUser ? (
              <img
                src={
                  currentUser.avatar ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
                }
                alt={currentUser.name}
                className="w-[20px] h-[20px] rounded-full object-cover ring-1 ring-stone-300"
              />
            ) : (
              <UserIcon
                className={`w-[20px] h-[20px] transition-transform ${
                  activeTab === 'profile'
                    ? 'stroke-[2.3] scale-105 text-[#007AFF]'
                    : 'stroke-[1.8] text-stone-600'
                }`}
              />
            )}
            {currentUser?.role === 'admin' && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-white flex items-center justify-center text-[6px] text-stone-950 font-black">
                ★
              </span>
            )}
          </div>
          <span
            className={`text-[9.5px] sm:text-[10px] tracking-tight mt-0.5 leading-none transition-colors truncate max-w-[55px] ${
              activeTab === 'profile' ? 'font-bold text-[#007AFF]' : 'font-medium text-stone-500'
            }`}
          >
            {currentUser ? currentUser.name.split(' ')[0] : 'Профиль'}
          </span>
        </button>
      </nav>

      {/* Detached Gentle Companion Action Orb */}
      <button
        onClick={handleCompanionClick}
        className={`pointer-events-auto w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/80 backdrop-blur-3xl border border-white/90 ring-1 ring-black/[0.04] shadow-[0_14px_40px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-center transition-all duration-200 active:scale-90 hover:scale-105 shrink-0 cursor-pointer ${
          isRealtorOrAdmin
            ? 'text-amber-600 hover:bg-amber-50/70'
            : 'text-stone-800 hover:bg-stone-50/70'
        }`}
        aria-label={isRealtorOrAdmin ? 'Добавить объявление' : 'Быстрый поиск'}
        title={isRealtorOrAdmin ? 'Подать объявление' : 'Поиск по каталогу'}
        id="telegram-companion-btn"
      >
        {isRealtorOrAdmin ? (
          <Plus className="w-[21px] h-[21px] stroke-[2.4] text-amber-600" />
        ) : (
          <Search className="w-[19px] h-[19px] stroke-[2.2] text-stone-700" />
        )}
      </button>
    </div>
  );
};
