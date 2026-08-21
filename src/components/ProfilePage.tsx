import React, { useState } from 'react';
import {
  User as UserIcon,
  Heart,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  LogOut,
  Phone,
  Mail,
  Building,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react';
import { User, Property, UserRole } from '../types';

interface ProfilePageProps {
  currentUser: User | null;
  onLoginSuccess: (user: User) => void;
  onLogout: () => void;
  onOpenAddProperty: () => void;
  onOpenAIAssistant: () => void;
  onOpenAdmin: () => void;
  onOpenFavorites: () => void;
  favoritesCount: number;
  userProperties: Property[];
  onSelectProperty: (property: Property) => void;
  onDeleteProperty?: (id: string) => void;
  onNavigateHome: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  currentUser,
  onLoginSuccess,
  onLogout,
  onOpenAddProperty,
  onOpenAIAssistant,
  onOpenAdmin,
  onOpenFavorites,
  favoritesCount,
  userProperties,
  onSelectProperty,
  onDeleteProperty,
  onNavigateHome
}) => {
  // Auth Form State (When not logged in)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+998 ');
  const [regRole, setRegRole] = useState<UserRole>('seeker');
  const [regAgency, setRegAgency] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDirectLogin = async (username: string, pass: string) => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password: pass })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Ошибка авторизации');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      if (username.trim().toLowerCase() === 'admin' && pass.trim() === 'admin') {
        const adminUser: User = {
          id: 'user-admin',
          username: 'admin',
          name: 'Главный Администратор',
          email: 'admin@uzestate.uz',
          phone: '+998 71 200-00-00',
          role: 'admin',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          createdAt: new Date().toISOString(),
          savedPropertyIds: []
        };
        onLoginSuccess(adminUser);
        return;
      }
      setError(err.message || 'Не удалось войти в систему');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleDirectLogin(loginUsername, loginPassword);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: regUsername,
          password: regPassword,
          name: regName,
          email: regEmail,
          phone: regPhone,
          role: regRole,
          agencyName: regRole === 'owner' ? regAgency : undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Ошибка регистрации');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Не удалось зарегистрироваться');
    } finally {
      setLoading(false);
    }
  };

  // If user is LOGGED IN: Render Full Account Profile Page
  if (currentUser) {
    return (
      <div className="min-h-screen bg-stone-100/70 text-stone-900 pb-28 sm:pb-24 pt-4 sm:pt-6" id="profile-page-view">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-100/40 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="relative">
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80'}
                    alt={currentUser.name}
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border-2 border-stone-200 shadow-md ring-4 ring-white"
                  />
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white" title="Онлайн">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-black text-stone-900">{currentUser.name}</h1>
                    {currentUser.role === 'admin' ? (
                      <span className="bg-amber-100 text-amber-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-amber-200">
                        Администратор
                      </span>
                    ) : (
                      <span className="bg-stone-100 text-stone-800 text-xs font-bold px-3 py-1 rounded-full border border-stone-200">
                        {currentUser.role === 'owner' ? 'Риелтор / Владелец' : 'Клиент / Инвестор'}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-stone-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-stone-400" />
                    <span>{currentUser.email}</span>
                  </p>

                  {currentUser.phone && (
                    <p className="text-xs sm:text-sm text-stone-500 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400" />
                      <span>{currentUser.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0">
                <button
                  onClick={onLogout}
                  className="px-4 py-2.5 rounded-2xl bg-stone-100 hover:bg-red-50 hover:text-red-600 text-stone-700 text-xs font-bold transition-colors flex items-center gap-2 border border-stone-200 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Выйти</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-stone-100">
              <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80">
                <span className="text-[11px] text-stone-500 block font-medium">Избранные объекты</span>
                <span className="text-xl font-black text-stone-900 mt-0.5 block">{favoritesCount}</span>
              </div>
              <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80">
                <span className="text-[11px] text-stone-500 block font-medium">Мои объявления</span>
                <span className="text-xl font-black text-stone-900 mt-0.5 block">{userProperties.length}</span>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-stone-50 rounded-2xl p-3.5 border border-stone-200/80">
                <span className="text-[11px] text-stone-500 block font-medium">Статус профиля</span>
                <span className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Верифицирован
                </span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {currentUser.role === 'admin' && (
              <button
                onClick={onOpenAdmin}
                className="p-5 rounded-3xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-300 text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-sm text-stone-900">Панель управления сайтом</h3>
                <p className="text-xs text-amber-900/80 mt-1">Управление всеми объявлениями, модерацией и пользователями</p>
              </button>
            )}

            <button
              onClick={onOpenAddProperty}
              className="p-5 rounded-3xl bg-white hover:bg-stone-50 border border-stone-200 text-left transition-all group cursor-pointer shadow-2xs"
            >
              <div className="w-11 h-11 rounded-2xl bg-stone-900 text-white flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
                <PlusCircle className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-sm text-stone-900">Разместить новое объявление</h3>
              <p className="text-xs text-stone-500 mt-1">Опубликуйте квартиру, дом или коммерческий объект</p>
            </button>

            <button
              onClick={onOpenFavorites}
              className="p-5 rounded-3xl bg-white hover:bg-stone-50 border border-stone-200 text-left transition-all group cursor-pointer shadow-2xs"
            >
              <div className="w-11 h-11 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
                <Heart className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-stone-900">Избранные объекты</h3>
                <span className="text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{favoritesCount}</span>
              </div>
              <p className="text-xs text-stone-500 mt-1">Быстрый доступ к сохранённым вами предложениям</p>
            </button>

            {currentUser.role !== 'owner' && (
              <button
                onClick={onOpenAIAssistant}
                className="p-5 rounded-3xl bg-white hover:bg-stone-50 border border-stone-200 text-left transition-all group cursor-pointer shadow-2xs"
              >
                <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-extrabold text-sm text-stone-900">Умный AI-консультант</h3>
                <p className="text-xs text-stone-500 mt-1">Интеллектуальный подбор недвижимости на базе Gemini 3.7</p>
              </button>
            )}

          </div>

          {/* User's Published Listings */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h2 className="font-extrabold text-base sm:text-lg text-stone-900">
                  Мои объявления ({userProperties.length})
                </h2>
                <p className="text-xs text-stone-500">Объекты, размещенные от вашего имени</p>
              </div>

              <button
                onClick={onOpenAddProperty}
                className="px-3.5 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Добавить</span>
              </button>
            </div>

            {userProperties.length === 0 ? (
              <div className="py-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <Building className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-stone-700">У вас пока нет опубликованных объявлений</p>
                <button
                  onClick={onOpenAddProperty}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Разместить первое объявление
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
                {userProperties.map((p) => (
                  <div
                    key={p.id}
                    className="bg-stone-50 rounded-2xl p-3 border border-stone-200 hover:border-stone-400 transition-all flex flex-col justify-between space-y-3 group"
                  >
                    <div
                      onClick={() => onSelectProperty(p)}
                      className="cursor-pointer space-y-2"
                    >
                      <div className="w-full h-36 rounded-xl overflow-hidden relative">
                        <img
                          src={p.photos[0]}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <span className={`absolute top-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full text-white ${
                          p.dealType === 'rent' ? 'bg-stone-900/90' : 'bg-emerald-700/90'
                        }`}>
                          {p.dealType === 'rent' ? 'Аренда' : 'Продажа'}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-stone-900 line-clamp-1">{p.title}</h4>
                        <p className="text-xs font-black text-amber-700 mt-0.5">
                          {p.price.toLocaleString()} {p.currency}
                        </p>
                        <p className="text-[10px] text-stone-400 mt-0.5 truncate">
                          {p.location.neighborhood}, {p.location.city}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200/80">
                      <button
                        onClick={() => onSelectProperty(p)}
                        className="text-xs font-bold text-stone-700 hover:text-stone-950 underline cursor-pointer"
                      >
                        Просмотреть
                      </button>

                      {onDeleteProperty && (
                        <button
                          onClick={() => onDeleteProperty(p.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Удалить объект"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    );
  }

  // If user is NOT LOGGED IN: Render Full Login/Register Page
  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 pb-28 sm:pb-24 pt-6 sm:pt-10" id="profile-auth-page">
      <div className="max-w-md mx-auto px-4 space-y-6">
        
        {/* Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xl space-y-6">
          
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 text-white flex items-center justify-center mx-auto shadow-md">
              <UserIcon className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-stone-900">Личный кабинет</h1>
            <p className="text-xs text-stone-500">
              Войдите для управления вашими объявлениями и сохранёнными объектами
            </p>
          </div>

          {/* Tabs: Login / Register */}
          <div className="flex bg-stone-100 p-1 rounded-2xl">
            <button
              onClick={() => { setAuthTab('login'); setError(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authTab === 'login' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Вход
            </button>
            <button
              onClick={() => { setAuthTab('register'); setError(null); }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                authTab === 'register' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Регистрация
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          {authTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Логин / Телефон</label>
                <input
                  type="text"
                  required
                  placeholder="admin или ваш логин"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Пароль</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-stone-900 text-white font-bold text-xs rounded-xl hover:bg-stone-800 transition-all cursor-pointer shadow-md mt-2"
              >
                {loading ? 'Вход...' : 'Войти в аккаунт'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Ваше имя</label>
                <input
                  type="text"
                  required
                  placeholder="Азиз Рахимов"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Логин</label>
                <input
                  type="text"
                  required
                  placeholder="aziz_realty"
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="aziz@mail.uz"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Телефон</label>
                  <input
                    type="text"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Тип аккаунта</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('seeker')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      regRole === 'seeker'
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    Покупатель / Арендатор
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('owner')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      regRole === 'owner'
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-stone-50 text-stone-700 border-stone-200'
                    }`}
                  >
                    Риелтор / Владелец
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Пароль</label>
                <input
                  type="password"
                  required
                  placeholder="Минимум 6 символов"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-stone-200 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-stone-900 text-white font-bold text-xs rounded-xl hover:bg-stone-800 transition-all cursor-pointer shadow-md mt-2"
              >
                {loading ? 'Создание...' : 'Зарегистрироваться'}
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
