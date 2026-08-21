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
    if (tab === 'profile') {
      if (currentUser) {
        setShowProfileModal(true);
      } else {
        setShowAuthModal(true);
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
    if (filters.minPrice > 0 || filters.maxPrice < 500000) count++;
    if (filters.bedrooms !== 'all') count++;
    if (filters.searchQuery.trim()) count++;
    return count;
  }, [filters]);

  const handleResetFilters = () => {
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
    });
    showToast('Фильтры сброшены');
  };

  return (
    <div className={`min-h-screen w-full bg-stone-100 text-stone-900 flex flex-col selection:bg-amber-200 selection:text-stone-900 ${
      activeTab === 'map' ? 'h-[100dvh] overflow-hidden pb-0' : 'pb-24 sm:pb-20'
    }`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-70 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-stone-700 text-xs font-semibold flex items-center gap-2 animate-bounce" id="app-toast">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Full-Screen App Container without top Header */}
      <div className={`w-full bg-stone-50 flex-1 flex flex-col ${
        activeTab === 'map' ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'
      }`}>
        
        {/* TAB CONTENT: HOME (Responsive Full Width Container) */}
        {activeTab === 'home' && (
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-7">
            
            {/* Search Bar & City & Deal Filters & Filter Trigger Card */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-stone-200/90 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                
                {/* City Selector */}
                <div className="flex items-center gap-1.5 bg-stone-100 px-3 py-2.5 rounded-2xl border border-stone-200/80 shrink-0">
                  <MapPin className="w-4 h-4 text-stone-700 shrink-0" />
                  <select
                    id="home-city-select"
                    value={filters.city}
                    onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
                    className="font-bold text-stone-900 text-xs sm:text-sm bg-transparent border-none focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="all">Весь Узбекистан</option>
                    <option value="Ташкент">Ташкент</option>
                    <option value="Самарканд">Самарканд</option>
                    <option value="Бухара">Бухара</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-500 pointer-events-none -ml-1" />
                </div>

                {/* Search input */}
                <div className="flex-1 flex items-center bg-stone-50 rounded-2xl px-4 py-2.5 border border-stone-200/80 focus-within:border-stone-400 focus-within:bg-white transition-all shadow-2xs">
                  <Search className="w-4 h-4 text-stone-400 mr-3 shrink-0" />
                  <input
                    type="text"
                    id="search-input"
                    placeholder="Поиск по адресу, району, городу или названию..."
                    value={filters.searchQuery}
                    onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
                    className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none placeholder:text-stone-400 font-medium text-stone-900"
                  />
                  {filters.searchQuery && (
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
                      className="text-stone-400 hover:text-stone-600 text-xs px-1 font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Deal Type Switch (Rent / Sale / All) */}
                <div className="flex bg-stone-100 p-1 rounded-2xl text-xs font-bold text-stone-700 shrink-0">
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, dealType: 'all' }))}
                    className={`px-3 py-2 rounded-xl text-center transition-all cursor-pointer ${
                      filters.dealType === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Все
                  </button>
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, dealType: 'rent' }))}
                    className={`px-3 py-2 rounded-xl text-center transition-all cursor-pointer ${
                      filters.dealType === 'rent' ? 'bg-stone-900 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Аренда
                  </button>
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, dealType: 'sale' }))}
                    className={`px-3 py-2 rounded-xl text-center transition-all cursor-pointer ${
                      filters.dealType === 'sale' ? 'bg-emerald-700 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Продажа
                  </button>
                </div>

                {/* Filters modal trigger */}
                <button
                  id="open-filters-btn"
                  onClick={() => setShowFiltersModal(true)}
                  className="px-4 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center gap-2 shadow-sm shrink-0 transition-colors cursor-pointer text-xs font-bold"
                  title="Расширенные фильтры"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Фильтры</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-amber-500 text-stone-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>
              </div>

              {/* Quick Category Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
                {categoryTabs.map((tab) => {
                  const active = filters.propertyType === tab.id || (tab.id === 'all' && filters.propertyType === 'all');
                  return (
                    <button
                      key={tab.id}
                      id={`cat-pill-${tab.id}`}
                      onClick={() => setFilters((prev) => ({ ...prev, propertyType: tab.id as any }))}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                        active
                          ? 'bg-stone-900 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 border border-stone-200/80'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section: Featured Properties */}
            {featuredProperties.length > 0 && !filters.searchQuery && (
              <section className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-black text-lg sm:text-xl text-stone-900">Избранные предложения</h3>
                    <p className="text-xs text-stone-500">Лучшие проверенные объекты недвижимости с высоким рейтингом</p>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                    <button
                      id="view-all-properties-btn"
                      onClick={() => {
                        const elem = document.getElementById('all-properties-catalog');
                        if (elem) {
                          elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className="text-xs sm:text-sm font-bold text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200/90 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200/80 shadow-2xs"
                    >
                      <Layers className="w-3.5 h-3.5 text-stone-600" />
                      <span>Рассмотреть все объявления</span>
                    </button>
                    <button
                      id="view-on-map-featured-btn"
                      onClick={() => setActiveTab('map')}
                      className="text-xs sm:text-sm font-bold text-amber-800 hover:text-amber-950 bg-amber-100/90 hover:bg-amber-200 px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-300/60 shadow-2xs"
                    >
                      <Compass className="w-3.5 h-3.5 text-amber-700" />
                      <span>Смотреть на карте →</span>
                    </button>
                  </div>
                </div>

                {/* Responsive Grid for Featured Properties on Web */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {featuredProperties.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      onClick={() => setSelectedProperty(property)}
                      isFavorite={favorites.includes(property.id)}
                      onToggleFavorite={(e) => toggleFavorite(property.id, e)}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Section: All / Filtered Results */}
            <section id="all-properties-catalog" className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-3">
                <div>
                  <h3 className="font-black text-lg sm:text-xl text-stone-900">
                    {filters.searchQuery ? `Результаты поиска (${filteredProperties.length})` : 'Каталог недвижимости'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Найдено {filteredProperties.length} объявлений по заданным критериям
                  </p>
                </div>
                
                {/* View on map quick link */}
                <button
                  onClick={() => setActiveTab('map')}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200/80"
                >
                  <MapIcon className="w-3.5 h-3.5 text-stone-600" />
                  <span>Открыть на карте</span>
                </button>
              </div>

              {filteredProperties.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-stone-200 max-w-lg mx-auto">
                  <Search className="w-10 h-10 text-stone-300 mx-auto" />
                  <h4 className="font-bold text-base text-stone-800">Объекты не найдены</h4>
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
                    className="mt-2 px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Сбросить фильтры
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredProperties.map((property) => (
                    <PropertyCard
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

        {/* TAB CONTENT: EXPLORE MAP (Full Screen Edge-to-Edge with Centered Floating Controls) */}
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

            {/* 2. Floating Top Filter & Search Controls (Centered Container) */}
            <div className="absolute top-4 inset-x-4 sm:inset-x-6 z-30 flex flex-col items-center gap-2 pointer-events-none">
              <div className="w-full max-w-4xl flex flex-col gap-2 pointer-events-none">
                
                {/* Search Bar & Filter Button & Home shortcut */}
                <div className="flex items-center gap-2.5 pointer-events-auto">
                  {/* Brand / Back Home button */}
                  <button
                    onClick={() => setActiveTab('home')}
                    className="h-11 px-3.5 bg-stone-900/95 hover:bg-stone-900 text-white backdrop-blur-md rounded-2xl flex items-center gap-1.5 shadow-lg shrink-0 transition-transform active:scale-95 cursor-pointer font-bold text-xs"
                    title="Вернуться на главную"
                  >
                    <Home className="w-4 h-4" />
                    <span className="hidden sm:inline">Каталог</span>
                  </button>

                  <div className="flex-1 flex items-center bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-stone-200/90 shadow-xl">
                    <Search className="w-4 h-4 text-stone-400 mr-2.5 shrink-0" />
                    <input
                      type="text"
                      id="map-search-input"
                      placeholder="Поиск по городу, району или названию..."
                      value={filters.searchQuery}
                      onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
                      className="w-full text-xs sm:text-sm bg-transparent border-none focus:outline-none placeholder:text-stone-400 font-medium text-stone-900"
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
                    className="relative h-11 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center gap-2 shadow-xl shrink-0 transition-all active:scale-95 cursor-pointer font-bold text-xs"
                    title="Открыть фильтры"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">Фильтры</span>
                    {activeFiltersCount > 0 && (
                      <span className="bg-amber-500 text-stone-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                        {activeFiltersCount}
                      </span>
                    )}
                  </button>

                  {/* AI Quick Button */}
                  <button
                    onClick={() => setShowAIModal(true)}
                    className="h-11 px-3.5 bg-amber-500 hover:bg-amber-600 text-stone-950 rounded-2xl flex items-center gap-1.5 shadow-xl shrink-0 transition-all active:scale-95 cursor-pointer font-bold text-xs"
                    title="AI Консультант"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden md:inline">AI Подбор</span>
                  </button>
                </div>

                {/* City Quick Pills & Deal Type Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none pointer-events-auto">
                  {/* Cities */}
                  <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-stone-200/90 shadow-md shrink-0">
                    <span className="text-[10px] font-bold text-stone-400 px-2 uppercase">Город:</span>
                    {[
                      { id: 'all', label: 'Все' },
                      { id: 'Ташкент', label: 'Ташкент' },
                      { id: 'Самарканд', label: 'Самарканд' },
                      { id: 'Бухара', label: 'Бухара' }
                    ].map((city) => (
                      <button
                        key={city.id}
                        onClick={() => setFilters((prev) => ({ ...prev, city: city.id }))}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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
                  <div className="flex items-center bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-stone-200/90 shadow-md shrink-0">
                    {[
                      { id: 'all', label: 'Все' },
                      { id: 'rent', label: 'Аренда' },
                      { id: 'sale', label: 'Купить' }
                    ].map((deal) => (
                      <button
                        key={deal.id}
                        onClick={() => setFilters((prev) => ({ ...prev, dealType: deal.id as any }))}
                        className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          filters.dealType === deal.id
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                        }`}
                      >
                        {deal.label}
                      </button>
                    ))}
                  </div>

                  {/* Category Pills Slider */}
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                    {categoryTabs.map((tab) => {
                      const active = filters.propertyType === tab.id || (tab.id === 'all' && filters.propertyType === 'all');
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setFilters((prev) => ({ ...prev, propertyType: tab.id as any }))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-xs cursor-pointer border ${
                            active
                              ? 'bg-stone-900 text-white border-stone-900'
                              : 'bg-white/95 backdrop-blur-md text-stone-700 hover:bg-white border-stone-200/90'
                          }`}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            {/* 3. Floating Bottom Layer: Property Card Slider (Centered Container) */}
            <div className="absolute bottom-20 sm:bottom-6 inset-x-4 sm:inset-x-8 z-30 pointer-events-none flex justify-center">
              <div className="w-full max-w-5xl pointer-events-none">
                {filteredProperties.length === 0 ? (
                  <div className="pointer-events-auto bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-stone-200 shadow-2xl flex items-center justify-between gap-3 max-w-sm mx-auto">
                    <div className="text-xs text-stone-700">
                      <p className="font-bold">Нет объектов по фильтрам</p>
                      <p className="text-[10px] text-stone-500">Попробуйте сбросить параметры</p>
                    </div>
                    <button
                      onClick={handleResetFilters}
                      className="px-3.5 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold shrink-0 hover:bg-stone-800 transition-colors"
                    >
                      Сбросить
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 overflow-x-auto pb-2 pointer-events-auto scrollbar-none px-1">
                    {filteredProperties.map((property) => {
                      const isSelected = selectedProperty?.id === property.id;
                      return (
                        <div
                          key={property.id}
                          onClick={() => setSelectedProperty(property)}
                          className={`bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border shadow-2xl flex items-center gap-3 cursor-pointer shrink-0 w-72 sm:w-80 transition-all hover:scale-[1.02] ${
                            isSelected
                              ? 'border-amber-500 ring-2 ring-amber-400/50 shadow-amber-500/20'
                              : 'border-stone-200/90 hover:border-stone-400'
                          }`}
                        >
                          <img
                            src={property.photos[0]}
                            alt={property.title}
                            className="w-16 h-16 rounded-xl object-cover shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                                property.dealType === 'rent' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                              }`}>
                                {property.dealType === 'rent' ? 'Аренда' : 'Продажа'}
                              </span>
                              <span className="text-xs font-black text-stone-900">
                                {property.price.toLocaleString()} {property.currency}
                              </span>
                            </div>
                            <h4 className="font-bold text-xs text-stone-900 truncate mt-1">{property.title}</h4>
                            <p className="text-[10px] text-stone-500 truncate flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 shrink-0 text-stone-400" />
                              <span>{property.location.neighborhood}, {property.location.city}</span>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </main>
        )}

        {/* TAB CONTENT: FAVORITES (Responsive Full Width Container) */}
        {activeTab === 'favorites' && (
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="font-black text-xl text-stone-900 flex items-center gap-2">
                  <span>Избранные объекты</span>
                  <span className="text-xs bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-bold">
                    {favoriteProperties.length}
                  </span>
                </h3>
                <p className="text-xs text-stone-500">Сохраненные вами предложения недвижимости</p>
              </div>
              <button
                onClick={() => setActiveTab('home')}
                className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Все предложения
              </button>
            </div>

            {favoriteProperties.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-stone-200 my-8 max-w-lg mx-auto">
                <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
                  <Heart className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-stone-800">Список избранного пуст</h4>
                <p className="text-xs text-stone-500 max-w-xs mx-auto">
                  Нажмите на иконку сердечка на любой карточке объекта, чтобы сохранить его в избранное.
                </p>
                <button
                  onClick={() => setActiveTab('home')}
                  className="px-5 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors"
                >
                  Смотреть объекты
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {favoriteProperties.map((property) => (
                  <PropertyCard
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
          currentUser={currentUser}
          onProfileClick={() => {
            if (currentUser) {
              setShowProfileModal(true);
            } else {
              setShowAuthModal(true);
            }
          }}
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

