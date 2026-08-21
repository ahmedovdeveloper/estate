import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, KeyRound, Building, Search, AlertCircle, ArrowRight } from 'lucide-react';
import { User, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  
  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('+998 ');
  const [regRole, setRegRole] = useState<UserRole>('seeker');
  const [regAgency, setRegAgency] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDirectLogin = async (username: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Ошибка авторизации');
      }

      onLoginSuccess(data.user);
      onClose();
    } catch (err: any) {
      // Local fallback for admin or mock users if server is unresponsive
      if (username.trim().toLowerCase() === 'admin' && password.trim() === 'admin') {
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
        onClose();
        return;
      }
      setError(err.message || 'Не удалось войти в систему');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFillAdmin = (autoSubmit = false) => {
    setLoginUsername('admin');
    setLoginPassword('admin');
    setTab('login');
    setError(null);
    if (autoSubmit) {
      handleDirectLogin('admin', 'admin');
    }
  };

  const handleQuickFillOwner = (autoSubmit = false) => {
    setLoginUsername('sardor_realty');
    setLoginPassword('123');
    setTab('login');
    setError(null);
    if (autoSubmit) {
      handleDirectLogin('sardor_realty', '123');
    }
  };

  const handleQuickFillSeeker = (autoSubmit = false) => {
    setLoginUsername('timur_invest');
    setLoginPassword('123');
    setTab('login');
    setError(null);
    if (autoSubmit) {
      handleDirectLogin('timur_invest', '123');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleDirectLogin(loginUsername, loginPassword);
  };

  const handleRegister = async (e: React.FormEvent) => {
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
      onClose();
    } catch (err: any) {
      setError(err.message || 'Не удалось зарегистрироваться');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" id="auth-modal-overlay">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]" id="auth-modal-content">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div>
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              {tab === 'login' ? 'Вход в UzEstate' : 'Регистрация аккаунта'}
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Единый портал недвижимости Узбекистана
            </p>
          </div>
          <button
            id="close-auth-modal"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="grid grid-cols-2 p-2 bg-stone-100/70 border-b border-stone-200 text-sm font-medium">
          <button
            id="tab-login"
            onClick={() => { setTab('login'); setError(null); }}
            className={`py-2.5 rounded-xl transition-all cursor-pointer text-center ${
              tab === 'login'
                ? 'bg-white text-stone-900 shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Вход
          </button>
          <button
            id="tab-register"
            onClick={() => { setTab('register'); setError(null); }}
            className={`py-2.5 rounded-xl transition-all cursor-pointer text-center ${
              tab === 'register'
                ? 'bg-white text-stone-900 shadow-sm font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Регистрация
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Имя пользователя (Логин)
                </label>
                <input
                  type="text"
                  id="login-username-input"
                  required
                  placeholder="admin или ваш логин"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Пароль
                </label>
                <input
                  type="password"
                  id="login-password-input"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                id="submit-login-btn"
                disabled={loading}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Вход в систему...' : 'Войти в аккаунт'}
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Demo Test Accounts */}
              <div className="pt-3 border-t border-stone-100">
                <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
                  Быстрый вход для тестирования:
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 w-full">
                    <button
                      type="button"
                      id="quick-admin-login"
                      onClick={() => handleQuickFillAdmin(false)}
                      className="flex-1 p-2 bg-amber-50 hover:bg-amber-100/80 border border-amber-200 rounded-lg text-left text-xs text-amber-900 font-medium flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-700" />
                        <span><strong>Администратор</strong> (admin / admin)</span>
                      </span>
                      <span className="text-[10px] bg-amber-200/80 text-amber-900 px-1.5 py-0.5 rounded font-mono">Заполнить</span>
                    </button>
                    <button
                      type="button"
                      id="quick-admin-direct-login"
                      onClick={() => handleQuickFillAdmin(true)}
                      className="px-2.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                      title="Войти сразу как администратор"
                    >
                      Войти сразу →
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 w-full">
                    <button
                      type="button"
                      id="quick-owner-login"
                      onClick={() => handleQuickFillOwner(false)}
                      className="flex-1 p-2 bg-stone-100 hover:bg-stone-200/80 border border-stone-200 rounded-lg text-left text-xs text-stone-800 font-medium flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-stone-600" />
                        <span><strong>Риелтор / Собственник</strong> (sardor_realty)</span>
                      </span>
                      <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-mono">Заполнить</span>
                    </button>
                    <button
                      type="button"
                      id="quick-owner-direct-login"
                      onClick={() => handleQuickFillOwner(true)}
                      className="px-2.5 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      Войти →
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5 w-full">
                    <button
                      type="button"
                      id="quick-seeker-login"
                      onClick={() => handleQuickFillSeeker(false)}
                      className="flex-1 p-2 bg-stone-100 hover:bg-stone-200/80 border border-stone-200 rounded-lg text-left text-xs text-stone-800 font-medium flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-stone-600" />
                        <span><strong>Ищущий жилье</strong> (timur_invest)</span>
                      </span>
                      <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-mono">Заполнить</span>
                    </button>
                    <button
                      type="button"
                      id="quick-seeker-direct-login"
                      onClick={() => handleQuickFillSeeker(true)}
                      className="px-2.5 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      Войти →
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Цель регистрации:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    id="role-seeker-choice"
                    onClick={() => setRegRole('seeker')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      regRole === 'seeker'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50 text-stone-700'
                    }`}
                  >
                    <Search className="w-4 h-4" />
                    <span className="text-xs font-bold">Ищу жилье</span>
                    <span className={`text-[10px] ${regRole === 'seeker' ? 'text-stone-300' : 'text-stone-500'}`}>
                      Аренда или покупка
                    </span>
                  </button>

                  <button
                    type="button"
                    id="role-owner-choice"
                    onClick={() => setRegRole('owner')}
                    className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all cursor-pointer ${
                      regRole === 'owner'
                        ? 'border-stone-900 bg-stone-900 text-white shadow-sm'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50 text-stone-700'
                    }`}
                  >
                    <Building className="w-4 h-4" />
                    <span className="text-xs font-bold">Собственник / Риелтор</span>
                    <span className={`text-[10px] ${regRole === 'owner' ? 'text-stone-300' : 'text-stone-500'}`}>
                      Размещать объявления
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Ваше имя или название агентства *
                </label>
                <input
                  type="text"
                  id="reg-name-input"
                  required
                  placeholder="Алишер Навои"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Логин *
                  </label>
                  <input
                    type="text"
                    id="reg-username-input"
                    required
                    placeholder="alisher99"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Пароль *
                  </label>
                  <input
                    type="password"
                    id="reg-password-input"
                    required
                    placeholder="••••••••"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Телефон
                  </label>
                  <input
                    type="tel"
                    id="reg-phone-input"
                    placeholder="+998 90 123-45-67"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="reg-email-input"
                    placeholder="user@uzestate.uz"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white"
                  />
                </div>
              </div>

              {regRole === 'owner' && (
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Агентство или частный риелтор (необязательно)
                  </label>
                  <input
                    type="text"
                    id="reg-agency-input"
                    placeholder="Например: Tashkent Realty Agency"
                    value={regAgency}
                    onChange={(e) => setRegAgency(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-stone-900 focus:bg-white"
                  />
                </div>
              )}

              <button
                type="submit"
                id="submit-register-btn"
                disabled={loading}
                className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
                <UserCheck className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
