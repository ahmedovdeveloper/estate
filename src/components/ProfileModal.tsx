import React from 'react';
import { X, User as UserIcon, Heart, PlusCircle, ShieldCheck, Sparkles, LogOut, Phone, Mail, Building, Trash2 } from 'lucide-react';
import { User, Property } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  onOpenAddProperty: () => void;
  onOpenAIAssistant: () => void;
  onOpenAdmin: () => void;
  onOpenFavorites: () => void;
  favoritesCount: number;
  userProperties: Property[];
  onSelectProperty: (property: Property) => void;
  onDeleteProperty?: (id: string) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  onOpenAuth,
  onOpenAddProperty,
  onOpenAIAssistant,
  onOpenAdmin,
  onOpenFavorites,
  favoritesCount,
  userProperties,
  onSelectProperty,
  onDeleteProperty
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex justify-center items-center p-3 sm:p-4 overflow-y-auto animate-fade-in" id="profile-modal-overlay">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 relative border border-stone-200" id="profile-modal-content">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {currentUser ? (
          <>
            {/* User Header */}
            <div className="flex items-center gap-4 pb-5 border-b border-stone-100">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                alt={currentUser.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-stone-900 shadow-sm"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-stone-900 truncate">{currentUser.name}</h3>
                  {currentUser.role === 'admin' ? (
                    <span className="bg-amber-100 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase">
                      Admin
                    </span>
                  ) : (
                    <span className="bg-stone-100 text-stone-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                      {currentUser.role === 'owner' ? 'Риелтор / Владелец' : 'Клиент'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-stone-500 truncate">{currentUser.email}</p>
                {currentUser.phone && (
                  <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-stone-400" />
                    <span>{currentUser.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="py-4 space-y-2">
              
              {currentUser.role === 'admin' && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenAdmin();
                  }}
                  className="w-full p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold text-xs text-stone-900 block">Панель управления сайтом</span>
                      <span className="text-[10px] text-amber-800">Управление базой, пользователями и объектами</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-900">Открыть →</span>
                </button>
              )}

              <button
                onClick={() => {
                  onClose();
                  onOpenFavorites();
                }}
                className="w-full p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-stone-900">Избранные объекты</span>
                </div>
                <span className="text-xs font-bold bg-stone-200 px-2 py-0.5 rounded-full text-stone-700">
                  {favoritesCount}
                </span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenAddProperty();
                }}
                className="w-full p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-stone-900 text-white flex items-center justify-center">
                    <PlusCircle className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-stone-900">Разместить новое объявление</span>
                </div>
                <span className="text-xs text-stone-400">Подать →</span>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onOpenAIAssistant();
                }}
                className="w-full p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-stone-900">AI Консультант</span>
                </div>
                <span className="text-xs text-amber-700 font-semibold">Gemini 3.7</span>
              </button>

            </div>

            {/* My Active Listings */}
            {userProperties.length > 0 && (
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700">Мои объявления ({userProperties.length})</span>
                </div>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                  {userProperties.map((p) => (
                    <div
                      key={p.id}
                      className="p-2 bg-stone-50 rounded-xl flex items-center justify-between gap-2 border border-stone-200 hover:border-stone-900 transition-colors"
                    >
                      <div
                        onClick={() => {
                          onClose();
                          onSelectProperty(p);
                        }}
                        className="flex items-center gap-2 cursor-pointer min-w-0 flex-1"
                      >
                        <img src={p.photos[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-stone-900 truncate">{p.title}</p>
                          <p className="text-[10px] text-stone-500">{p.price.toLocaleString()} {p.currency}</p>
                        </div>
                      </div>

                      {onDeleteProperty && (
                        <button
                          onClick={() => onDeleteProperty(p.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg cursor-pointer"
                          title="Удалить объявление"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Logout button */}
            <div className="pt-4 border-t border-stone-100">
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl border border-stone-200 hover:bg-red-50 hover:border-red-200 text-stone-700 hover:text-red-600 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Выйти из учетной записи</span>
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-stone-100 text-stone-700 flex items-center justify-center mx-auto">
              <UserIcon className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-stone-900">Вы не авторизованы</h3>
              <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                Войдите в систему или зарегистрируйтесь, чтобы размещать объявления и сохранять избранное.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full py-3 bg-stone-900 text-white font-bold text-xs rounded-xl hover:bg-stone-800 transition-all cursor-pointer"
            >
              Войти / Зарегистрироваться
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
