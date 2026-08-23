import React, { useState } from 'react';
import { X, ShieldCheck, UserCheck, KeyRound, Building, Search, AlertCircle, ArrowRight } from 'lucide-react';
import { User, UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

// API_URL is injected at build/runtime (see .env / vite define). Falls back to local backend for dev.
// Guarded because `process` doesn't exist in the browser unless the bundler replaces it.
const getApiUrl = (): string => {
  try {
    // @ts-ignore - process may be replaced at build time by the bundler (e.g. Vite `define`)
    if (typeof process !== 'undefined' && process.env && process.env.API_URL) {
      // @ts-ignore
      return process.env.API_URL;
    }
  } catch {
    // process is not defined in this environment, fall through
  }
  // @ts-ignore - Vite-style env var as a fallback
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) {
    return (import.meta as any).env.VITE_API_URL;
  }
  return 'http://127.0.0.1:8000/';
};

const API_URL = getApiUrl().replace(/\/+$/, '');
console.log('[AuthModal] Resolved API_URL:', API_URL);

// Backend returns snake_case fields (agency_name, created_at) inside `user`.
// Normalize to whatever camelCase shape the frontend User type expects,
// while keeping the original fields too in case something else reads them directly.
function normalizeUser(rawUser: any): User {
  return {
    ...rawUser,
    id: rawUser.id,
    username: rawUser.username,
    name: rawUser.name,
    email: rawUser.email,
    phone: rawUser.phone,
    role: rawUser.role,
    agencyName: rawUser.agency_name ?? rawUser.agencyName ?? null,
    createdAt: rawUser.created_at ?? rawUser.createdAt,
    savedPropertyIds: rawUser.savedPropertyIds ?? [],
  } as User;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url = `${API_URL}/api/auth/login`;
    const payload = { email: loginEmail, password: loginPassword };

    console.log('[AuthModal][login] → Request', { url, method: 'POST', payload });

    try {
      let res: Response;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (networkErr: any) {
        // fetch itself threw: server unreachable, wrong URL, CORS block, no network, etc.
        console.error('[AuthModal][login] ✗ Network/fetch error (backend unreachable, CORS, or bad URL):', networkErr);
        throw new Error(
          `Не удалось подключиться к серверу (${url}). Проверьте, что backend запущен и доступен, а также настройки CORS.`
        );
      }

      console.log('[AuthModal][login] ← Response status:', res.status, res.statusText);

      let data: any = null;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.error('[AuthModal][login] ✗ Response is not valid JSON:', parseErr);
        throw new Error('Сервер вернул некорректный ответ (не JSON).');
      }

      console.log('[AuthModal][login] ← Response body:', data);

      if (!res.ok) {
        throw new Error(data.detail || data.error || `Ошибка авторизации (HTTP ${res.status})`);
      }

      // Real backend contract: { access_token, token_type, user }
      if (!data.user || !data.access_token) {
        throw new Error('Сервер вернул неожиданный формат ответа (нет user/access_token).');
      }

      localStorage.setItem('access_token', data.access_token);
      onLoginSuccess(normalizeUser(data.user));
      onClose();
    } catch (err: any) {
      console.error('[AuthModal][login] ✗ Final error:', err);
      setError(err.message || 'Не удалось войти в систему');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const url = `${API_URL}/api/auth/register`;
    const payload = {
      username: regUsername,
      email: regEmail,
      password: regPassword,
      name: regName,
      phone: regPhone,
      role: regRole,
      agency_name: regRole === 'owner' ? regAgency : undefined
    };

    console.log('[AuthModal][register] → Request', { url, method: 'POST', payload });

    try {
      let res: Response;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (networkErr: any) {
        console.error('[AuthModal][register] ✗ Network/fetch error (backend unreachable, CORS, or bad URL):', networkErr);
        throw new Error(
          `Не удалось подключиться к серверу (${url}). Проверьте, что backend запущен и доступен, а также настройки CORS.`
        );
      }

      console.log('[AuthModal][register] ← Response status:', res.status, res.statusText);

      let data: any = null;
      try {
        data = await res.json();
      } catch (parseErr) {
        console.error('[AuthModal][register] ✗ Response is not valid JSON:', parseErr);
        throw new Error('Сервер вернул некорректный ответ (не JSON).');
      }

      console.log('[AuthModal][register] ← Response body:', data);

      if (!res.ok) {
        throw new Error(data.detail || data.error || `Ошибка регистрации (HTTP ${res.status})`);
      }

      // Real backend contract: { access_token, token_type, user }
      if (!data.user || !data.access_token) {
        throw new Error('Сервер вернул неожиданный формат ответа (нет user/access_token).');
      }

      localStorage.setItem('access_token', data.access_token);
      onLoginSuccess(normalizeUser(data.user));
      onClose();
    } catch (err: any) {
      console.error('[AuthModal][register] ✗ Final error:', err);
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
                  Email
                </label>
                <input
                  type="email"
                  id="login-email-input"
                  required
                  placeholder="user@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
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
                    Email *
                  </label>
                  <input
                    type="email"
                    id="reg-email-input"
                    required
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