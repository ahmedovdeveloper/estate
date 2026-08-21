import React from 'react';
import { 
  Building2, 
  MapPin, 
  Sparkles, 
  Plus, 
  ShieldCheck, 
  User as UserIcon, 
  LogOut, 
  Heart,
  ChevronDown,
  Layers,
  Map as MapIcon,
  Compass
} from 'lucide-react';
import { User } from '../types';

interface HeaderProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenAdmin: () => void;
  onOpenAddProperty: () => void;
  onOpenAIAssistant: () => void;
  onOpenProfile: () => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  layoutMode: 'split' | 'grid' | 'map';
  onChangeLayoutMode: (mode: 'split' | 'grid' | 'map') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAuth,
  onLogout,
  onOpenAdmin,
  onOpenAddProperty,
  onOpenAIAssistant,
  onOpenProfile,
  selectedCity,
  onSelectCity,
  favoritesCount,
  onOpenFavorites,
  layoutMode,
  onChangeLayoutMode
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs" id="main-web-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left: Brand Logo & City Switcher */}
          <div className="flex items-center gap-4 sm:gap-6">
            <a href="#" className="flex items-center gap-2.5 group" id="brand-logo-link">
              <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center shadow-md group-hover:bg-amber-600 transition-colors">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-lg sm:text-xl text-stone-900 tracking-tight">UzEstate</span>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-mono uppercase">
                    UZ 🇺🇿
                  </span>
                </div>
                <span className="text-[10px] text-stone-500 font-medium hidden sm:inline">
                  Недвижимость Узбекистана
                </span>
              </div>
            </a>

            {/* City Dropdown Selector */}
            <div className="hidden md:flex items-center bg-stone-100/90 rounded-xl px-2.5 py-1 border border-stone-200">
              <MapPin className="w-3.5 h-3.5 text-amber-600 mr-1.5" />
              <select
                id="header-city-select"
                value={selectedCity}
                onChange={(e) => onSelectCity(e.target.value)}
                className="text-xs font-semibold text-stone-800 bg-transparent border-none focus:outline-none cursor-pointer py-1"
              >
                <option value="all">Весь Узбекистан</option>
                <option value="Ташкент">Ташкент</option>
                <option value="Самарканд">Самарканд</option>
                <option value="Бухара">Бухара</option>
              </select>
            </div>
          </div>

          {/* Center: Layout Mode Switchers (Desktop) */}
          <div className="hidden lg:flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-bold text-stone-700">
            <button
              id="view-mode-split"
              onClick={() => onChangeLayoutMode('split')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                layoutMode === 'split'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Каталог + Карта</span>
            </button>
            <button
              id="view-mode-grid"
              onClick={() => onChangeLayoutMode('grid')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                layoutMode === 'grid'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Только Сетка</span>
            </button>
            <button
              id="view-mode-map"
              onClick={() => onChangeLayoutMode('map')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
                layoutMode === 'map'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Большая Карта</span>
            </button>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            
            {/* AI Assistant Button */}
            <button
              id="open-ai-assistant-btn"
              onClick={onOpenAIAssistant}
              className="px-3 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-amber-900 border border-amber-300/80 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">AI Консультант</span>
            </button>

            {/* Favorites Icon */}
            <button
              id="header-favorites-btn"
              onClick={onOpenFavorites}
              className="w-10 h-10 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 flex items-center justify-center relative transition-colors cursor-pointer"
              title="Избранные объекты"
            >
              <Heart className="w-4 h-4" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Add Property Button */}
            <button
              id="header-add-property-btn"
              onClick={() => {
                if (!currentUser) {
                  onOpenAuth();
                } else {
                  onOpenAddProperty();
                }
              }}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Подать объявление</span>
            </button>

            {/* Admin Panel Button (if admin) */}
            {currentUser?.role === 'admin' && (
              <button
                id="header-admin-btn"
                onClick={onOpenAdmin}
                className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                title="Открыть Панель Администратора"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden md:inline">Админ-панель</span>
              </button>
            )}

            {/* Auth / Profile Area */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-1 border-l border-stone-200">
                <button
                  id="user-profile-menu-btn"
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 p-1 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                  title="Мой профиль"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-lg object-cover border border-stone-200"
                  />
                  <div className="hidden xl:flex flex-col text-left">
                    <span className="text-xs font-bold text-stone-900 leading-tight line-clamp-1">{currentUser.name}</span>
                    <span className="text-[10px] text-stone-500 capitalize">
                      {currentUser.role === 'admin' ? 'Администратор' : currentUser.role === 'owner' ? 'Риелтор' : 'Клиент'}
                    </span>
                  </div>
                </button>

                <button
                  id="header-logout-btn"
                  onClick={onLogout}
                  className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                  title="Выйти из аккаунта"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="header-login-btn"
                onClick={onOpenAuth}
                className="px-4 py-2 border border-stone-300 hover:border-stone-900 text-stone-800 hover:text-stone-900 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Войти
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
