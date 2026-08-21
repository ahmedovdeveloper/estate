import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Heart,
  Compass,
  Sparkles,
  Plus,
  RefreshCw,
  Eye,
  Building2,
  Home,
  Layers,
  Map as MapIcon,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Filter,
  ArrowUpDown,
  Building,
  Briefcase,
  Trees,
  Store,
  Bell,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { Property, FilterState, PropertyType, DealType, User } from './types';
import { INITIAL_PROPERTIES } from './data/mockProperties';
import { MOCK_USERS } from './data/mockUsers';
import { PropertyCard } from './components/PropertyCard';
import { PropertyNearbyCard } from './components/PropertyNearbyCard';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { InteractiveMap } from './components/InteractiveMap';
import { AddPropertyModal } from './components/AddPropertyModal';
import { AIAssistantModal } from './components/AIAssistantModal';
import { FiltersModal } from './components/FiltersModal';
import { BookingModal } from './components/BookingModal';
import { ContactAgentModal } from './components/ContactAgentModal';
import { NotificationsModal } from './components/NotificationsModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { BottomNav, NavTab } from './components/BottomNav';

export default function App() {
  // Navigation Tab State
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('uzestate_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return MOCK_USERS[0]; // Admin by default
  });

  // Properties State
  const [properties, setProperties] = useState<Property[]>(INITIAL_PROPERTIES);
  const [isLoading, setIsLoading] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('uzestate_favorites');
    return saved ? JSON.parse(saved) : ['uz-prop-1', 'uz-prop-2'];
  });

  // Modals & Selection
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [contactProperty, setContactProperty] = useState<Property | null>(null);
  const [bookingProperty, setBookingProperty] = useState<Property | null>(null);
  const [editProperty, setEditProperty] = useState<Property | null>(null);

  // Modals visibility
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    dealType: 'all',
    propertyType: 'all',
    minPrice: 0,
    maxPrice: 500000,
    bedrooms: 'all',
    bathrooms: 'all',
    city: 'all',
    sortBy: 'featured'
  });

  // Toast Notification Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('uzestate_favorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('uzestate_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('uzestate_user');
    }
  }, [currentUser]);

  // Filter properties client-side
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // City filter
      if (filters.city !== 'all' && p.location.city.toLowerCase() !== filters.city.toLowerCase()) {
        return false;
      }
      // Deal type
      if (filters.dealType !== 'all' && p.dealType !== filters.dealType) {
        return false;
      }
      // Property type
      if (filters.propertyType !== 'all' && p.propertyType !== filters.propertyType) {
        return false;
      }
      // Bedrooms
      if (filters.bedrooms !== 'all' && p.specs.bedrooms < Number(filters.bedrooms)) {
        return false;
      }
      // Max price
      if (filters.maxPrice < 500000 && p.price > filters.maxPrice) {
        return false;
      }
      // Search text
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesCity = p.location.city.toLowerCase().includes(q);
        const matchesNeighborhood = p.location.neighborhood.toLowerCase().includes(q);
        const matchesAddress = p.location.address.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCity && !matchesNeighborhood && !matchesAddress) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price_asc') return a.price - b.price;
      if (filters.sortBy === 'price_desc') return b.price - a.price;
      if (filters.sortBy === 'rating') return b.rating - a.rating;
      if (filters.sortBy === 'newest') return b.specs.builtYear - a.specs.builtYear;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [properties, filters]);

  // Featured Properties list
  const featuredProperties = useMemo(() => {
    const featured = filteredProperties.filter((p) => p.featured);
    return featured.length > 0 ? featured : filteredProperties.slice(0, 4);
  }, [filteredProperties]);

  // Favorite Properties list
  const favoriteProperties = useMemo(() => {
    return properties.filter((p) => favorites.includes(p.id));
  }, [properties, favorites]);

  // User's own properties
  const userProperties = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return properties;
    return properties.filter((p) => p.ownerId === currentUser.id);
  }, [properties, currentUser]);

  // Toggle favorite
  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (favorites.includes(id)) {
      setFavorites((prev) => prev.filter((favId) => favId !== id));
      showToast('Удалено из избранного');
    } else {
      setFavorites((prev) => [...prev, id]);
      showToast('Добавлено в избранное ❤️');
    }
  };

  // Handle Authentication
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setShowAuthModal(false);
    
    // Automatically open Admin Dashboard if admin
    if (user.role === 'admin' || user.username.toLowerCase() === 'admin') {
      showToast('Добро пожаловать, Администратор! Панель управления открыта 🛡️');
      setShowAdminModal(true);
    } else {
      showToast(`Успешный вход! Добро пожаловать, ${user.name}`);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Вы вышли из системы');
  };

  // Add / Edit Property
  const handleSaveProperty = async (propertyData: Partial<Property>, isEdit = false, editId?: string) => {
    if (isEdit && editId) {
      setProperties((prev) =>
        prev.map((p) => (p.id === editId ? ({ ...p, ...propertyData } as Property) : p))
      );
      showToast('Объект успешно обновлен!');
    } else {
      const newP: Property = {
        id: `prop-${Date.now()}`,
        title: propertyData.title || 'Новый объект',
        dealType: propertyData.dealType || 'rent',
        propertyType: propertyData.propertyType || 'apartment',
        price: propertyData.price || 1000,
        currency: propertyData.currency || '$',
        pricePeriod: propertyData.dealType === 'rent' ? '/ мес' : '',
        description: propertyData.description || '',
        featured: Boolean(propertyData.featured),
        location: propertyData.location || {
          address: 'ул. Амира Темура',
          neighborhood: 'Мирабад',
          city: 'Ташкент',
          country: 'Узбекистан',
          lat: 41.311081,
          lng: 69.240562
        },
        specs: propertyData.specs || {
          bedrooms: 2,
          bathrooms: 1,
          areaSqFt: 85,
          builtYear: 2024,
          livingRooms: 1,
          parkingSpaces: 1
        },
        photos: propertyData.photos || [
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
        ],
        amenities: propertyData.amenities || ['Кондиционер', 'Паркинг', 'Wi-Fi'],
        facilities: [],
        agent: propertyData.agent || {
          id: 'ag-1',
          name: currentUser?.name || 'Собственник',
          role: 'Собственник',
          phone: currentUser?.phone || '+998 90 123-45-67',
          email: currentUser?.email || 'contact@uzestate.uz',
          avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
          verified: true,
          rating: 5.0,
          dealsCount: 1
        },
        rating: 5.0,
        reviewsCount: 1,
        reviews: [],
        ownerId: currentUser?.id,
        createdAt: new Date().toISOString()
      };
      setProperties((prev) => [newP, ...prev]);
      showToast('Объявление опубликовано на карте!');
    }
  };

  const handleDeleteProperty = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
    showToast('Объявление удалено');
  };

  // Handle Tab Switch
  const handleTabChange = (tab: NavTab) => {
    if (tab === 'assistant') {
      setShowAIModal(true);
      return;
    }
    if (tab === 'add') {
      if (!currentUser) {
        setShowAuthModal(true);
      } else {
        setEditProperty(null);
        setShowAddModal(true);
      }
      return;
    }
    setActiveTab(tab);
  };

  // Category Tabs (Russian translations)
  const categoryTabs = [
    { id: 'all', label: 'Все объекты' },
    { id: 'apartment', label: 'Квартира' },
    { id: 'house', label: 'Дом / Коттедж' },
    { id: 'villa', label: 'Вилла' },
    { id: 'office', label: 'Офис' },
    { id: 'land', label: 'Участок' },
    { id: 'commercial', label: 'Коммерческая' }
  ];

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.city !== 'all') count++;
    if (filters.propertyType !== 'all') count++;
    if (filters.dealType !== 'all') count++;
    if (filters.priceMin > 0 || filters.priceMax < 1000000) count++;
    if (filters.bedrooms > 0) count++;
    if (filters.searchQuery.trim()) count++;
    if (filters.verifiedOnly) count++;
    return count;
  }, [filters]);

  const handleResetFilters = () => {
    setFilters({
      city: 'all',
      propertyType: 'all',
      dealType: 'all',
      priceMin: 0,
      priceMax: 1000000,
      bedrooms: 0,
      searchQuery: '',
      verifiedOnly: false,
      sortBy: 'newest'
    });
    showToast('Фильтры сброшены');
  };

  return (
    <div className={`min-h-screen bg-stone-100 text-stone-900 flex justify-center selection:bg-amber-200 selection:text-stone-900 ${
      activeTab === 'map' ? 'h-[100dvh] overflow-hidden pb-0' : 'pb-24'
    }`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 z-70 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-stone-700 text-xs font-semibold flex items-center gap-2 animate-bounce" id="app-toast">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Responsive App Container */}
      <div className={`w-full max-w-lg bg-stone-50 shadow-2xl relative flex flex-col border-x border-stone-200/60 ${
        activeTab === 'map' ? 'h-[100dvh] overflow-hidden' : 'min-h-screen pb-24'
      }`}>
        
        {/* Top Header Bar (Hidden on Map page per user request for full-screen map experience) */}
        {activeTab !== 'map' && (
          <header className="sticky top-0 z-30 bg-stone-50/90 backdrop-blur-md px-5 pt-4 pb-3 flex items-center justify-between border-b border-stone-200/60">
            
            {/* Location Selector */}
            <div>
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Локация
              </span>
              <div className="flex items-center gap-1 mt-0.5">
                <MapPin className="w-4 h-4 text-stone-800 shrink-0" />
                <select
                  id="header-city-select"
                  value={filters.city}
                  onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
                  className="font-bold text-stone-900 text-sm bg-transparent border-none focus:outline-none cursor-pointer pr-1"
                >
                  <option value="all">Узбекистан (Все)</option>
                  <option value="Ташкент">Ташкент</option>
                  <option value="Самарканд">Самарканд</option>
                  <option value="Бухара">Бухара</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500 pointer-events-none -ml-1" />
              </div>
            </div>

            {/* Right Action Icons (Notifications & Profile) */}
            <div className="flex items-center gap-2.5">
              {/* Notification Bell */}
              <button
                id="notifications-btn"
                onClick={() => setShowNotificationsModal(true)}
                className="w-10 h-10 rounded-full bg-white border border-stone-200/80 hover:bg-stone-100 flex items-center justify-center text-stone-700 shadow-xs relative transition-colors cursor-pointer"
                title="Уведомления"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              {/* Admin Badge Quick Jump (if admin) */}
              {currentUser?.role === 'admin' && (
                <button
                  id="admin-quick-jump-btn"
                  onClick={() => setShowAdminModal(true)}
                  className="w-10 h-10 rounded-full bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 flex items-center justify-center shadow-xs transition-colors cursor-pointer"
                  title="Панель администратора"
                >
                  <ShieldCheck className="w-5 h-5" />
                </button>
              )}

              {/* Profile Avatar / Login Button */}
              {currentUser ? (
                <button
                  id="user-profile-btn"
                  onClick={() => setShowProfileModal(true)}
                  className="relative cursor-pointer"
                  title="Профиль"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-stone-900 shadow-xs"
                  />
                </button>
              ) : (
                <button
                  id="header-login-btn"
                  onClick={() => setShowAuthModal(true)}
                  className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center shadow-xs hover:bg-stone-800 cursor-pointer"
                  title="Войти"
                >
                  <UserIcon className="w-4 h-4" />
                </button>
              )}
            </div>
          </header>
        )}

        {/* TAB CONTENT: HOME */}
        {activeTab === 'home' && (
          <main className="flex-1 px-5 py-4 space-y-6">
            
            {/* Search Bar & Filter Button */}
            <div className="flex items-center gap-2.5">
              <div className="flex-1 flex items-center bg-white rounded-2xl px-3.5 py-3 border border-stone-200 shadow-xs">
                <Search className="w-4 h-4 text-stone-400 mr-2.5 shrink-0" />
                <input
                  type="text"
                  id="search-input"
                  placeholder="Поиск по адресу, району или названию..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
                  className="w-full text-xs bg-transparent border-none focus:outline-none placeholder:text-stone-400 font-medium"
                />
                {filters.searchQuery && (
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                    className="text-stone-400 hover:text-stone-600 text-xs px-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              <button
                id="open-filters-btn"
                onClick={() => setShowFiltersModal(true)}
                className="w-12 h-12 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center shadow-md shrink-0 transition-colors cursor-pointer"
                title="Фильтры"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Category Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-5 px-5 scrollbar-none">
              {categoryTabs.map((tab) => {
                const active = filters.propertyType === tab.id || (tab.id === 'all' && filters.propertyType === 'all');
                return (
                  <button
                    key={tab.id}
                    id={`cat-pill-${tab.id}`}
                    onClick={() => setFilters((prev) => ({ ...prev, propertyType: tab.id as any }))}
                    className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      active
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'bg-white text-stone-600 hover:bg-stone-200/80 border border-stone-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Deal Type Switch (Rent / Sale / All) */}
            <div className="flex bg-stone-200/80 p-1 rounded-xl text-xs font-bold text-stone-700">
              <button
                onClick={() => setFilters((prev) => ({ ...prev, dealType: 'all' }))}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                  filters.dealType === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                Все типы
              </button>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, dealType: 'rent' }))}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                  filters.dealType === 'rent' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600'
                }`}
              >
                В аренду
              </button>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, dealType: 'sale' }))}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all cursor-pointer ${
                  filters.dealType === 'sale' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-600'
                }`}
              >
                На продажу
              </button>
            </div>

            {/* Section: Featured Properties (Horizontal Carousel) */}
            {featuredProperties.length > 0 && !filters.searchQuery && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base text-stone-900">Избранные предложения</h3>
                  <button
                    onClick={() => setActiveTab('map')}
                    className="text-xs font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
                  >
                    Смотреть на карте →
                  </button>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 -mx-5 px-5 scrollbar-none snap-x">
                  {featuredProperties.map((property) => (
                    <div key={property.id} className="w-72 shrink-0 snap-start">
                      <PropertyCard
                        property={property}
                        onClick={() => setSelectedProperty(property)}
                        isFavorite={favorites.includes(property.id)}
                        onToggleFavorite={(e) => toggleFavorite(property.id, e)}
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section: Nearby Your Location / All Results */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-stone-900">
                  {filters.searchQuery ? `Результаты поиска (${filteredProperties.length})` : 'Рядом с вами'}
                </h3>
                <span className="text-xs text-stone-500 font-semibold">
                  {filteredProperties.length} объявлений
                </span>
              </div>

              {filteredProperties.length === 0 ? (
                <div className="bg-white rounded-3xl p-8 text-center space-y-2 border border-stone-200">
                  <Search className="w-8 h-8 text-stone-300 mx-auto" />
                  <h4 className="font-bold text-sm text-stone-800">Объекты не найдены</h4>
                  <p className="text-xs text-stone-500">Попробуйте изменить параметры фильтров или поисковый запрос</p>
                  <button
                    onClick={() =>
                      setFilters({
                        searchQuery: '',
                        dealType: 'all',
                        propertyType: 'all',
                        minPrice: 0,
                        maxPrice: 500000,
                        bedrooms: 'all',
                        bathrooms: 'all',
                        city: 'all',
                        sortBy: 'featured'
                      })
                    }
                    className="mt-2 px-4 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold"
                  >
                    Сбросить фильтры
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredProperties.map((property) => (
                    <PropertyNearbyCard
                      key={property.id}
                      property={property}
                      onClick={() => setSelectedProperty(property)}
                      isFavorite={favorites.includes(property.id)}
                      onToggleFavorite={(e) => toggleFavorite(property.id, e)}
                    />
                  ))}
                </div>
              )}
            </section>

          </main>
        )}

        {/* TAB CONTENT: EXPLORE MAP (Full Screen with Floating Search & Filters) */}
        {activeTab === 'map' && (
          <main className="flex-1 w-full h-full relative overflow-hidden">
            
            {/* 1. Full-Screen Interactive Map Canvas */}
            <InteractiveMap
              properties={filteredProperties}
              selectedProperty={selectedProperty}
              onSelectProperty={(p) => setSelectedProperty(p)}
              activeCity={filters.city}
              onSelectCity={(city) => setFilters((prev) => ({ ...prev, city }))}
              showCityQuickJump={false}
              className="w-full h-full absolute inset-0 z-0"
            />

            {/* 2. Floating Top Filter & Search Controls */}
            <div className="absolute top-3 inset-x-3 z-30 flex flex-col gap-2 pointer-events-none">
              
              {/* Search Bar & Filter Button & Profile */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <div className="flex-1 flex items-center bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2.5 border border-stone-200/80 shadow-lg">
                  <Search className="w-4 h-4 text-stone-400 mr-2 shrink-0" />
                  <input
                    type="text"
                    id="map-search-input"
                    placeholder="Поиск по городу, району или названию..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
                    className="w-full text-xs bg-transparent border-none focus:outline-none placeholder:text-stone-400 font-medium text-stone-900"
                  />
                  {filters.searchQuery && (
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                      className="text-stone-400 hover:text-stone-600 text-xs px-1 font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <button
                  id="map-filters-btn"
                  onClick={() => setShowFiltersModal(true)}
                  className="relative h-10 px-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center gap-1.5 shadow-lg shrink-0 transition-all active:scale-95 cursor-pointer"
                  title="Открыть фильтры"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  {activeFiltersCount > 0 && (
                    <span className="bg-amber-500 text-stone-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>

              {/* City Quick Pills & Deal Type Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none pointer-events-auto">
                {/* Cities */}
                <div className="flex items-center bg-white/90 backdrop-blur-md p-1 rounded-xl border border-stone-200/80 shadow-md shrink-0">
                  <span className="text-[10px] font-bold text-stone-400 px-1.5 uppercase">Город:</span>
                  {[
                    { id: 'all', label: 'Все' },
                    { id: 'Ташкент', label: 'Ташкент' },
                    { id: 'Самарканд', label: 'Самарканд' },
                    { id: 'Бухара', label: 'Бухара' }
                  ].map((city) => (
                    <button
                      key={city.id}
                      onClick={() => setFilters((prev) => ({ ...prev, city: city.id }))}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        filters.city === city.id
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                      }`}
                    >
                      {city.label}
                    </button>
                  ))}
                </div>

                {/* Deal Type Switcher */}
                <div className="flex items-center bg-white/90 backdrop-blur-md p-1 rounded-xl border border-stone-200/80 shadow-md shrink-0">
                  {[
                    { id: 'all', label: 'Все' },
                    { id: 'rent', label: 'Аренда' },
                    { id: 'sale', label: 'Купить' }
                  ].map((deal) => (
                    <button
                      key={deal.id}
                      onClick={() => setFilters((prev) => ({ ...prev, dealType: deal.id as any }))}
                      className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                        filters.dealType === deal.id
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                      }`}
                    >
                      {deal.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Pills Slider */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pointer-events-auto">
                {categoryTabs.map((tab) => {
                  const active = filters.propertyType === tab.id || (tab.id === 'all' && filters.propertyType === 'all');
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setFilters((prev) => ({ ...prev, propertyType: tab.id as any }))}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all shadow-sm cursor-pointer border ${
                        active
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white/90 backdrop-blur-md text-stone-700 hover:bg-white border-stone-200/80'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* 3. Floating Bottom Layer: Property Card Slider or Empty state */}
            <div className="absolute bottom-20 inset-x-3 z-30 pointer-events-none">
              {filteredProperties.length === 0 ? (
                <div className="pointer-events-auto bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-stone-200/90 shadow-2xl flex items-center justify-between gap-3 max-w-sm mx-auto animate-fade-in">
                  <div className="text-xs text-stone-700">
                    <p className="font-bold">Нет объектов по фильтрам</p>
                    <p className="text-[10px] text-stone-500">Попробуйте изменить параметры</p>
                  </div>
                  <button
                    onClick={handleResetFilters}
                    className="px-3 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold shrink-0 hover:bg-stone-800 transition-colors"
                  >
                    Сбросить
                  </button>
                </div>
              ) : (
                <div className="flex gap-2.5 overflow-x-auto pb-1 pointer-events-auto scrollbar-none">
                  {filteredProperties.map((property) => {
                    const isSelected = selectedProperty?.id === property.id;
                    return (
                      <div
                        key={property.id}
                        onClick={() => setSelectedProperty(property)}
                        className={`bg-white/95 backdrop-blur-md p-2 rounded-2xl border shadow-xl flex items-center gap-3 cursor-pointer shrink-0 w-72 transition-all hover:scale-[1.02] ${
                          isSelected
                            ? 'border-amber-500 ring-2 ring-amber-400/40 shadow-amber-500/10'
                            : 'border-stone-200/80 hover:border-stone-400'
                        }`}
                      >
                        <img
                          src={property.photos[0]}
                          alt={property.title}
                          className="w-14 h-14 rounded-xl object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                              property.dealType === 'rent' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {property.dealType === 'rent' ? 'Аренда' : 'Продажа'}
                            </span>
                            <span className="text-xs font-black text-stone-900">
                              {property.price.toLocaleString()} {property.currency}
                            </span>
                          </div>
                          <h4 className="font-bold text-xs text-stone-900 truncate mt-0.5">{property.title}</h4>
                          <p className="text-[10px] text-stone-500 truncate">{property.location.neighborhood}, {property.location.city}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </main>
        )}

        {/* TAB CONTENT: FAVORITES */}
        {activeTab === 'favorites' && (
          <main className="flex-1 px-5 py-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="font-extrabold text-base text-stone-900 flex items-center gap-2">
                <span>Избранные объекты</span>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">
                  {favoriteProperties.length}
                </span>
              </h3>
            </div>

            {favoriteProperties.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center space-y-3 border border-stone-200 my-8">
                <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                  <Heart className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-sm text-stone-800">Список избранного пуст</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Нажмите на иконку сердечка на любой карточке объекта, чтобы сохранить его в избранное.
                </p>
                <button
                  onClick={() => setActiveTab('home')}
                  className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold"
                >
                  Смотреть объекты
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {favoriteProperties.map((property) => (
                  <PropertyNearbyCard
                    key={property.id}
                    property={property}
                    onClick={() => setSelectedProperty(property)}
                    isFavorite={true}
                    onToggleFavorite={(e) => toggleFavorite(property.id, e)}
                  />
                ))}
              </div>
            )}
          </main>
        )}

        {/* Floating Bottom Navigation Bar */}
        <BottomNav
          activeTab={activeTab}
          onTabChange={handleTabChange}
          favoritesCount={favorites.length}
        />

      </div>

      {/* ALL MODALS & DIALOGS */}

      {/* 1. Property Details Modal */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          isFavorite={favorites.includes(selectedProperty.id)}
          onToggleFavorite={() => toggleFavorite(selectedProperty.id)}
          onBookNow={(p) => {
            setBookingProperty(p);
          }}
          onContactAgent={(p) => {
            setContactProperty(p);
          }}
          onOpenMap={(p) => {
            setSelectedProperty(null);
            setActiveTab('map');
          }}
        />
      )}

      {/* 2. Contact Agent Modal */}
      {contactProperty && (
        <ContactAgentModal
          property={contactProperty}
          isOpen={Boolean(contactProperty)}
          onClose={() => setContactProperty(null)}
        />
      )}

      {/* 3. Booking / Schedule Visit Modal */}
      {bookingProperty && (
        <BookingModal
          property={bookingProperty}
          isOpen={Boolean(bookingProperty)}
          onClose={() => setBookingProperty(null)}
        />
      )}

      {/* 4. Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* 5. Admin Dashboard */}
      {showAdminModal && (
        <AdminDashboard
          isOpen={showAdminModal}
          onClose={() => setShowAdminModal(false)}
          properties={properties}
          onAddProperty={() => {
            setEditProperty(null);
            setShowAddModal(true);
          }}
          onEditProperty={(prop) => {
            setEditProperty(prop);
            setShowAddModal(true);
          }}
          onDeleteProperty={handleDeleteProperty}
          currentUser={currentUser}
        />
      )}

      {/* 6. Add / Edit Property Modal */}
      <AddPropertyModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditProperty(null);
        }}
        onSubmitProperty={handleSaveProperty}
        editProperty={editProperty}
        currentUser={currentUser}
      />

      {/* 7. AI Assistant Modal */}
      <AIAssistantModal
        isOpen={showAIModal}
        onClose={() => setShowAIModal(false)}
        properties={properties}
        onSelectProperty={(p) => setSelectedProperty(p)}
      />

      {/* 8. Filters Modal */}
      <FiltersModal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        filters={filters}
        onUpdateFilters={(newF) => setFilters((prev) => ({ ...prev, ...newF }))}
        onResetFilters={() =>
          setFilters({
            searchQuery: '',
            dealType: 'all',
            propertyType: 'all',
            minPrice: 0,
            maxPrice: 500000,
            bedrooms: 'all',
            bathrooms: 'all',
            city: 'all',
            sortBy: 'featured'
          })
        }
        totalResults={filteredProperties.length}
      />

      {/* 9. Notifications Modal */}
      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
      />

      {/* 10. User Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenAddProperty={() => {
          setEditProperty(null);
          setShowAddModal(true);
        }}
        onOpenAIAssistant={() => setShowAIModal(true)}
        onOpenAdmin={() => setShowAdminModal(true)}
        onOpenFavorites={() => {
          setShowProfileModal(false);
          setActiveTab('favorites');
        }}
        favoritesCount={favorites.length}
        userProperties={userProperties}
        onSelectProperty={(p) => setSelectedProperty(p)}
        onDeleteProperty={handleDeleteProperty}
      />

    </div>
  );
}

