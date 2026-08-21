import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Home, 
  BarChart3, 
  Plus, 
  Trash2, 
  Edit3, 
  Star, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  Search, 
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X
} from 'lucide-react';
import { Property, User } from '../types';

interface AdminDashboardProps {
  currentUser?: User | null;
  isOpen?: boolean;
  properties: Property[];
  onAddProperty: () => void;
  onEditProperty: (property: Property) => void;
  onDeleteProperty: (propertyId: string) => void;
  onToggleFeatured?: (property: Property) => void;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  isOpen = true,
  properties,
  onAddProperty,
  onEditProperty,
  onDeleteProperty,
  onToggleFeatured,
  onClose
}) => {
  if (isOpen === false) return null;
  const [activeTab, setActiveTab] = useState<'properties' | 'users' | 'analytics'>('properties');
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [propSearch, setPropSearch] = useState('');
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<User | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserRole, setEditUserRole] = useState<'admin' | 'owner' | 'seeker'>('seeker');
  const [editUserPhone, setEditUserPhone] = useState('');

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch (e) {
      console.error('Failed to fetch users:', e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users' || activeTab === 'analytics') {
      fetchUsers();
    }
  }, [activeTab]);

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (userId === 'user-admin') {
      alert('Нельзя удалить главного администратора');
      return;
    }
    if (!window.confirm(`Вы уверены, что хотите удалить пользователя "${userName}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter((u) => u.id !== userId));
      } else {
        alert(data.error || 'Ошибка удаления пользователя');
      }
    } catch (e) {
      console.error('Delete user error:', e);
    }
  };

  const handleSaveUserEdit = async () => {
    if (!selectedUserToEdit) return;
    try {
      const res = await fetch(`/api/admin/users/${selectedUserToEdit.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editUserName,
          role: editUserRole,
          phone: editUserPhone
        })
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map((u) => (u.id === selectedUserToEdit.id ? { ...u, ...data.user } : u)));
        setSelectedUserToEdit(null);
      }
    } catch (e) {
      console.error('Update user error:', e);
    }
  };

  const filteredProperties = properties.filter(
    (p) =>
      p.title.toLowerCase().includes(propSearch.toLowerCase()) ||
      p.location.city.toLowerCase().includes(propSearch.toLowerCase()) ||
      p.location.neighborhood.toLowerCase().includes(propSearch.toLowerCase())
  );

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone.includes(userSearch)
  );

  // Analytics stats
  const totalRentCount = properties.filter((p) => p.dealType === 'rent').length;
  const totalSaleCount = properties.filter((p) => p.dealType === 'sale').length;
  const tashkentCount = properties.filter((p) => p.location.city.toLowerCase().includes('ташкент')).length;
  const samarkandCount = properties.filter((p) => p.location.city.toLowerCase().includes('самарканд')).length;
  const bukharaCount = properties.filter((p) => p.location.city.toLowerCase().includes('бухара')).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/70 backdrop-blur-sm animate-fade-in" id="admin-dashboard-modal">
      <div className="bg-white w-full max-w-6xl h-[92vh] rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden" id="admin-dashboard-container">
        
        {/* Top Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">Панель Администратора UzEstate</h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500 text-stone-950">
                  ADMIN ACCESS
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Полный контроль над базой объектов, пользователями и аналитикой
              </p>
            </div>
          </div>
          <button
            id="admin-close-btn"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-stone-100 border-b border-stone-200 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              id="admin-tab-properties"
              onClick={() => setActiveTab('properties')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'properties'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
              }`}
            >
              <Home className="w-4 h-4" />
              Все объекты ({properties.length})
            </button>

            <button
              id="admin-tab-users"
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
              }`}
            >
              <Users className="w-4 h-4" />
              Пользователи & Роли
            </button>

            <button
              id="admin-tab-analytics"
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === 'analytics'
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Статистика
            </button>
          </div>

          {activeTab === 'properties' && (
            <button
              id="admin-add-property-btn"
              onClick={onAddProperty}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Добавить объект в базу
            </button>
          )}
        </div>

        {/* TAB 1: PROPERTIES MANAGEMENT */}
        {activeTab === 'properties' && (
          <div className="flex-1 flex flex-col overflow-hidden p-6 bg-stone-50/50">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Поиск по названию, городу, району..."
                  value={propSearch}
                  onChange={(e) => setPropSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>
              <span className="text-xs text-stone-500">
                Найдено объектов: <strong>{filteredProperties.length}</strong>
              </span>
            </div>

            <div className="flex-1 overflow-y-auto border border-stone-200 rounded-xl bg-white shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100/90 text-stone-700 font-semibold border-b border-stone-200 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Объект</th>
                    <th className="py-3 px-3">Локация</th>
                    <th className="py-3 px-3">Тип</th>
                    <th className="py-3 px-3">Цена</th>
                    <th className="py-3 px-3">Комнаты / Площадь</th>
                    <th className="py-3 px-3 text-center">Топ</th>
                    <th className="py-3 px-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {filteredProperties.map((p) => (
                    <tr key={p.id} className="hover:bg-amber-50/40 transition-colors" id={`admin-row-${p.id}`}>
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={p.photos[0]}
                          alt={p.title}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-stone-200"
                        />
                        <div>
                          <div className="font-bold text-stone-900 line-clamp-1">{p.title}</div>
                          <div className="text-[11px] text-stone-400 font-mono">ID: {p.id}</div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-stone-900">{p.location.city}</div>
                        <div className="text-[11px] text-stone-500">{p.location.neighborhood}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.dealType === 'rent'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {p.dealType === 'rent' ? 'Аренда' : 'Продажа'}
                        </span>
                        <div className="text-[10px] text-stone-500 capitalize mt-0.5">{p.propertyType}</div>
                      </td>
                      <td className="py-3 px-3 font-bold text-stone-900">
                        {p.price.toLocaleString()} {p.currency}{p.pricePeriod}
                      </td>
                      <td className="py-3 px-3">
                        <div>{p.specs.bedrooms} комн. • {p.specs.bathrooms} с/у</div>
                        <div className="text-[11px] text-stone-500">{p.specs.areaSqFt} м²</div>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onToggleFeatured(p)}
                          title="Переключить Рекомендуемое"
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            p.featured ? 'text-amber-500 bg-amber-50' : 'text-stone-300 hover:text-amber-400'
                          }`}
                        >
                          <Star className={`w-4 h-4 ${p.featured ? 'fill-amber-500' : ''}`} />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`edit-prop-${p.id}`}
                            onClick={() => onEditProperty(p)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
                            title="Редактировать объект"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            id={`del-prop-${p.id}`}
                            onClick={() => {
                              if (window.confirm(`Удалить "${p.title}" из каталога?`)) {
                                onDeleteProperty(p.id);
                              }
                            }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                            title="Удалить объект"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: USERS & ROLES */}
        {activeTab === 'users' && (
          <div className="flex-1 flex flex-col overflow-hidden p-6 bg-stone-50/50">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Поиск по имени, логину, телефону или email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-stone-900"
                />
              </div>
              <button
                onClick={fetchUsers}
                className="px-3 py-2 bg-white border border-stone-200 hover:bg-stone-100 rounded-xl text-xs font-semibold text-stone-700 flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingUsers ? 'animate-spin' : ''}`} />
                Обновить список
              </button>
            </div>

            <div className="flex-1 overflow-y-auto border border-stone-200 rounded-xl bg-white shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-stone-100/90 text-stone-700 font-semibold border-b border-stone-200 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Пользователь</th>
                    <th className="py-3 px-3">Роль в системе</th>
                    <th className="py-3 px-3">Контакты</th>
                    <th className="py-3 px-3">Агентство / Организация</th>
                    <th className="py-3 px-3 text-center">Объявлений</th>
                    <th className="py-3 px-4 text-right">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-amber-50/30 transition-colors" id={`user-row-${u.id}`}>
                      <td className="py-3 px-4 flex items-center gap-3">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-stone-200"
                        />
                        <div>
                          <div className="font-bold text-stone-900">{u.name}</div>
                          <div className="text-[11px] text-stone-500 font-mono">@{u.username}</div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          u.role === 'admin'
                            ? 'bg-amber-500 text-stone-950 font-mono'
                            : u.role === 'owner'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {u.role === 'admin' ? 'АДМИНИСТРАТОР' : u.role === 'owner' ? 'Риелтор / Собственник' : 'Покупатель / Арендатор'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5 text-stone-700">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{u.phone || 'Не указан'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-stone-500 text-[11px] mt-0.5">
                          <Mail className="w-3 h-3 text-stone-400" />
                          <span>{u.email}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-stone-600">
                        {u.agencyName || '—'}
                      </td>
                      <td className="py-3 px-3 text-center font-bold text-stone-900">
                        {u.savedPropertyIds ? (u as any).listingsCount ?? 0 : 0}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`edit-user-btn-${u.id}`}
                            onClick={() => {
                              setSelectedUserToEdit(u);
                              setEditUserName(u.name);
                              setEditUserRole(u.role);
                              setEditUserPhone(u.phone);
                            }}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition-colors cursor-pointer"
                            title="Изменить данные пользователя"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {u.id !== 'user-admin' && (
                            <button
                              id={`del-user-btn-${u.id}`}
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors cursor-pointer"
                              title="Удалить пользователя"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* User Edit Mini Modal */}
            {selectedUserToEdit && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-stone-200 space-y-4">
                  <h3 className="text-sm font-bold text-stone-900">
                    Редактировать пользователя @{selectedUserToEdit.username}
                  </h3>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Имя</label>
                    <input
                      type="text"
                      value={editUserName}
                      onChange={(e) => setEditUserName(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Телефон</label>
                    <input
                      type="text"
                      value={editUserPhone}
                      onChange={(e) => setEditUserPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">Роль</label>
                    <select
                      value={editUserRole}
                      onChange={(e) => setEditUserRole(e.target.value as any)}
                      className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs bg-white"
                    >
                      <option value="seeker">Ищущий жилье (seeker)</option>
                      <option value="owner">Собственник / Риелтор (owner)</option>
                      <option value="admin">Администратор (admin)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setSelectedUserToEdit(null)}
                      className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold"
                    >
                      Отмена
                    </button>
                    <button
                      onClick={handleSaveUserEdit}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold"
                    >
                      Сохранить
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="flex-1 overflow-y-auto p-6 bg-stone-50 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Всего объектов</div>
                <div className="text-3xl font-black text-stone-900 mt-2">{properties.length}</div>
                <div className="text-[11px] text-stone-400 mt-1">Активных в базе данных</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Аренда vs Продажа</div>
                <div className="text-2xl font-black text-stone-900 mt-2">
                  {totalRentCount} / {totalSaleCount}
                </div>
                <div className="text-[11px] text-stone-400 mt-1">{totalRentCount} аренда, {totalSaleCount} на продажу</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Пользователей</div>
                <div className="text-3xl font-black text-stone-900 mt-2">{users.length || 5}</div>
                <div className="text-[11px] text-stone-400 mt-1">Админы, риелторы, клиенты</div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
                <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">География</div>
                <div className="text-sm font-bold text-stone-900 mt-2 space-y-1">
                  <div>Ташкент: {tashkentCount}</div>
                  <div>Самарканд: {samarkandCount}</div>
                  <div>Бухара: {bukharaCount}</div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
              <h3 className="text-sm font-bold text-stone-900 mb-2">Статус платформы UzEstate</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Платформа функционирует в штатном режиме. Все изменения параметров объектов, гео-координат на интерактивной карте Узбекистана и регистрационные данные пользователей синхронизируются в реальном времени.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
