import React from 'react';
import { Home, Compass, Heart, Sparkles, PlusCircle, User as UserIcon, ShieldCheck } from 'lucide-react';
import { User } from '../types';

export type NavTab = 'home' | 'map' | 'favorites' | 'assistant' | 'add' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  favoritesCount?: number;
  currentUser?: User | null;
  onProfileClick?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  favoritesCount = 0,
  currentUser,
  onProfileClick
}) => {
  const handleProfilePress = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      onTabChange('profile');
    }
  };

  // Only realtors (owner) and admins can post properties; normal seekers/clients do not see the + button
  const canAddProperty = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  return (
    <div className="fixed bottom-3 sm:bottom-5 inset-x-0 z-40 flex justify-center px-3 sm:px-4 pointer-events-none" id="bottom-navigation-bar">
      <nav
        aria-label="Bottom Navigation"
        className="pointer-events-auto bg-stone-900/95 backdrop-blur-xl text-white px-3 sm:px-6 py-2 rounded-2xl sm:rounded-full shadow-2xl border border-white/15 flex items-center justify-around sm:justify-center gap-3 sm:gap-7 transition-all max-w-lg sm:max-w-none"
      >
        {/* 1. Home */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center gap-0.5 text-xs transition-colors py-1 cursor-pointer ${
            activeTab === 'home' ? 'text-white font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
          aria-label="Главная"
          id="nav-tab-home"
        >
          <div className="relative">
            <Home className="w-5 h-5" />
            {activeTab === 'home' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] hidden sm:block">Главная</span>
        </button>

        {/* 2. Explore Map */}
        <button
          onClick={() => onTabChange('map')}
          className={`flex flex-col items-center gap-0.5 text-xs transition-colors py-1 cursor-pointer ${
            activeTab === 'map' ? 'text-white font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
          aria-label="Карта"
          id="nav-tab-map"
        >
          <div className="relative">
            <Compass className="w-5 h-5" />
            {activeTab === 'map' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] hidden sm:block">Карта</span>
        </button>

        {/* 3. Add Property Quick Action (Visible only for realtors/owners and admins) */}
        {canAddProperty && (
          <button
            onClick={() => onTabChange('add')}
            className="w-10 h-10 -my-1 rounded-xl sm:rounded-full bg-amber-500 hover:bg-amber-400 text-stone-950 flex items-center justify-center shadow-lg transition-transform active:scale-90 hover:scale-105 shrink-0 cursor-pointer"
            aria-label="Добавить объявление"
            title="Добавить новое объявление"
            id="nav-tab-add"
          >
            <PlusCircle className="w-5 h-5 fill-stone-950 text-amber-500" />
          </button>
        )}

        {/* 4. Favorites */}
        <button
          onClick={() => onTabChange('favorites')}
          className={`flex flex-col items-center gap-0.5 text-xs transition-colors py-1 relative cursor-pointer ${
            activeTab === 'favorites' ? 'text-white font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
          aria-label="Избранное"
          id="nav-tab-favorites"
        >
          <div className="relative">
            <Heart className="w-5 h-5" />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {favoritesCount}
              </span>
            )}
            {activeTab === 'favorites' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] hidden sm:block">Избранное</span>
        </button>

        {/* 5. AI Assistant */}
        <button
          onClick={() => onTabChange('assistant')}
          className={`flex flex-col items-center gap-0.5 text-xs transition-colors py-1 cursor-pointer ${
            activeTab === 'assistant' ? 'text-amber-400 font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
          aria-label="AI Подбор"
          id="nav-tab-ai"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-400" />
            {activeTab === 'assistant' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] hidden sm:block">AI Подбор</span>
        </button>

        {/* 6. Profile / User */}
        <button
          onClick={handleProfilePress}
          className={`flex flex-col items-center gap-0.5 text-xs transition-colors py-1 cursor-pointer relative ${
            activeTab === 'profile' ? 'text-white font-bold' : 'text-stone-400 hover:text-stone-200'
          }`}
          aria-label="Профиль"
          id="nav-tab-profile"
        >
          <div className="relative">
            {currentUser ? (
              <div className="relative">
                <img
                  src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover ring-1.5 ring-amber-400"
                />
                {currentUser.role === 'admin' && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full border border-stone-900 flex items-center justify-center text-[6px] text-stone-900 font-black">
                    ★
                  </span>
                )}
              </div>
            ) : (
              <UserIcon className="w-5 h-5" />
            )}
            {activeTab === 'profile' && (
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-amber-400 rounded-full" />
            )}
          </div>
          <span className="text-[10px] hidden sm:block truncate max-w-[50px]">
            {currentUser ? currentUser.name.split(' ')[0] : 'Войти'}
          </span>
        </button>
      </nav>
    </div>
  );
};
