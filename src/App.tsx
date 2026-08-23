import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Property, FilterState, PropertyType, DealType, User, Review } from './types';
import { MOCK_USERS } from './data/mockUsers';
import { PropertyCard } from './components/PropertyCard';
import { PropertyNearbyCard } from './components/PropertyNearbyCard';
import { PropertyDetailPage } from './components/PropertyDetailPage';
import { InteractiveMap } from './components/InteractiveMap';
import { AddPropertyModal } from './components/AddPropertyModal';
import { AISearchPage } from './components/AISearchPage';
import { FiltersModal } from './components/FiltersModal';
import { BookingModal } from './components/BookingModal';
import { ContactAgentModal } from './components/ContactAgentModal';
import { NotificationsModal } from './components/NotificationsModal';
import { ProfilePage } from './components/ProfilePage';
import { AuthModal } from './components/AuthModal';
import { AdminDashboard } from './components/AdminDashboard';
import { BottomNav, NavTab } from './components/BottomNav';

// ── Backend base URL ────────────────────────────────────────────────────
// Read from .env (Vite: VITE_API_URL). Falls back to localhost:8000 for local dev.
// Add to your .env file:  VITE_API_URL=http://localhost:8000
const API_URL = (
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) ||
  'http://localhost:8000'
).replace(/\/+$/, '');

function authHeaders(): Record<string, string> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// The backend may return numbers as strings, snake_case keys, a flat location, etc.
// This normalizer is defensive: it accepts several reasonable shapes and always
// returns a fully-populated Property so the UI (cards, detail page, map) never
// has to special-case missing fields.
function normalizeProperty(raw: any): Property {
  const dealType = raw.deal_type ?? raw.dealType ?? 'rent';
  const location = raw.location ?? {};
  const specs = raw.specs ?? {};
  const agent = raw.agent ?? raw.owner ?? {};

  return {
    id: String(raw.id),
    title: raw.title ?? 'Без названия',
    dealType,
    propertyType: raw.property_type ?? raw.propertyType ?? 'apartment',
    price: Number(raw.price ?? 0),
    currency: raw.currency ?? '$',
    pricePeriod: raw.price_period ?? raw.pricePeriod ?? (dealType === 'rent' ? '/ мес' : ''),
    description: raw.description ?? '',
    featured: Boolean(raw.featured),
    location: {
      address: location.address ?? raw.address ?? '',
      neighborhood: location.neighborhood ?? raw.neighborhood ?? '',
      city: location.city ?? raw.city ?? '',
      country: location.country ?? raw.country ?? 'Узбекистан',
      lat: Number(location.lat ?? raw.lat ?? raw.latitude ?? 41.311081),
      lng: Number(location.lng ?? raw.lng ?? raw.longitude ?? 69.240562),
    },
    specs: {
      bedrooms: Number(specs.bedrooms ?? raw.bedrooms ?? 0),
      bathrooms: Number(specs.bathrooms ?? raw.bathrooms ?? 0),
      areaSqFt: Number(specs.area_sq_ft ?? specs.areaSqFt ?? raw.area ?? 0),
      builtYear: Number(specs.built_year ?? specs.builtYear ?? raw.built_year ?? new Date().getFullYear()),
      livingRooms: Number(specs.living_rooms ?? specs.livingRooms ?? 1),
      parkingSpaces: Number(specs.parking_spaces ?? specs.parkingSpaces ?? 0),
    },
    photos: Array.isArray(raw.photos) && raw.photos.length
      ? raw.photos
      : raw.photo_url
        ? [raw.photo_url]
        : ['https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'],
    amenities: raw.amenities ?? [],
    facilities: raw.facilities ?? [],
    agent: {
      id: String(agent.id ?? raw.owner_id ?? 'agent'),
      name: agent.name ?? raw.owner_name ?? 'Собственник',
      role: agent.role ?? 'Собственник',
      phone: agent.phone ?? '+998 90 000-00-00',
      email: agent.email ?? '',
      avatar: agent.avatar ?? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      verified: Boolean(agent.verified ?? true),
      rating: Number(agent.rating ?? raw.rating ?? 5),
      dealsCount: Number(agent.deals_count ?? agent.dealsCount ?? 1),
    },
    rating: Number(raw.rating ?? 0),
    reviewsCount: Number(raw.reviews_count ?? raw.reviewsCount ?? 0),
    reviews: raw.reviews ?? [],
    ownerId: raw.owner_id ?? raw.ownerId,
    createdAt: raw.created_at ?? raw.createdAt ?? new Date().toISOString(),
  } as Property;
}

// Accepts a plain array, or a paginated/wrapped envelope like
// {results: []} / {items: []} / {properties: []} / {data: []}.
function extractList(data: any): any[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.properties)) return data.properties;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

// Simple GET {API_URL}/api/properties — no query params, no filters.
async function fetchProperties(): Promise<Property[]> {
  const url = `${API_URL}/api/properties`;
  console.log('[App][fetchProperties] → GET', url);

  let res: Response;
  try {
    res = await fetch(url, { headers: { ...authHeaders() } });
  } catch (networkErr) {
    console.error('[App][fetchProperties] ✗ network error', networkErr);
    throw new Error(`Не удалось подключиться к серверу (${url}). Проверьте, что backend запущен на ${API_URL}.`);
  }

  if (!res.ok) {
    console.error('[App][fetchProperties] ✗ HTTP', res.status, res.statusText);
    throw new Error(`Сервер вернул ошибку при загрузке объектов (HTTP ${res.status}).`);
  }

  let data: any;
  try {
    data = await res.json();
  } catch (parseErr) {
    console.error('[App][fetchProperties] ✗ invalid JSON', parseErr);
    throw new Error('Сервер вернул некорректный ответ (не JSON).');
  }

  console.log('[App][fetchProperties] ← raw response', data);
  const list = extractList(data);
  console.log('[App][fetchProperties] ← extracted', list.length, 'items, normalizing…');
  const normalized: Property[] = [];
  for (const raw of list) {
    if (!raw || typeof raw !== 'object') continue;
    try {
      normalized.push(normalizeProperty(raw));
    } catch (normErr) {
      console.error('[App][fetchProperties] ✗ failed to normalize item, skipping:', raw, normErr);
    }
  }
  console.log('[App][fetchProperties] ← normalized', normalized);
  return normalized;
}

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

  // Properties State — populated from the real backend (see loadProperties below).
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
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
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

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

  // ── Real backend integration ────────────────────────────────────────────
  // Plain GET {API_URL}/api/properties — no query params. All filtering
  // (city, dealType, propertyType, bedrooms, price, search) happens
  // client-side in filteredProperties below, once we actually have the data.
  const loadProperties = useCallback(async (showErrorToast = false) => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchProperties();
      setProperties(data);
    } catch (err: any) {
      const message = err?.message || 'Не удалось загрузить объекты с сервера.';
      console.error('[App] loadProperties failed:', err);
      setLoadError(message);
      if (showErrorToast) showToast(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load once on mount. Filtering happens client-side (see filteredProperties).
  useEffect(() => {
    loadProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Filter properties client-side (free-text search + safety net on top of
  // whatever the backend already filtered).
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

  // Add Review to Property
  const handleAddReview = (propertyId: string, reviewData: Partial<Review>) => {
    const newRev: Review = {
      id: `rev-${Date.now()}`,
      userName: reviewData.userName || 'Гость',
      userRole: reviewData.userRole || 'Пользователь',
      rating: reviewData.rating || 5,
      comment: reviewData.comment || '',
      date: 'Только что',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80'
    };

    setProperties((prev) =>
      prev.map((p) => {
        if (p.id === propertyId) {
          const updatedReviews = [newRev, ...p.reviews];
          const newRating = Number(
            (updatedReviews.reduce((sum, r) => sum + r.rating, 0) / updatedReviews.length).toFixed(1)
          );
          const updatedProp = {
            ...p,
            reviews: updatedReviews,
            reviewsCount: updatedReviews.length,
            rating: newRating
          };
          if (selectedProperty?.id === propertyId) {
            setSelectedProperty(updatedProp);
          }
          return updatedProp;
        }
        return p;
      })
    );
    showToast('Спасибо за ваш отзыв! Он опубликован ⭐');
  };

  // Handle Tab Switch
  const handleTabChange = (tab: NavTab) => {
    setSelectedProperty(null); // Return from detail page to main tabs
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
      activeTab === 'map' || activeTab === 'assistant' ? 'h-[100dvh] overflow-hidden pb-0' : 'pb-24 sm:pb-20'
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
        activeTab === 'map' || activeTab === 'assistant' ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'
      }`}>
        
        {/* MAIN BODY: DETAIL PAGE OR TAB VIEWS */}
        {selectedProperty ? (
          <PropertyDetailPage
            property={selectedProperty}
            onBack={() => setSelectedProperty(null)}
            isFavorite={favorites.includes(selectedProperty.id)}
            onToggleFavorite={() => toggleFavorite(selectedProperty.id)}
            onBookNow={(p) => setBookingProperty(p)}
            onContactAgent={(p) => setContactProperty(p)}
            onOpenMap={(p) => {
              setSelectedProperty(null);
              setActiveTab('map');
            }}
            onAddReview={handleAddReview}
          />
        ) : (
          <>
            {/* TAB CONTENT: HOME (Responsive Full Width Container) */}
            {activeTab === 'home' && (
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-7">
            
            {/* Search Bar & City & Deal Filters & Filter Trigger Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 border border-stone-200/90 shadow-sm space-y-3" id="home-search-filter-card">
              
              {/* Primary Search & Filter Bar */}
              <div className="flex items-center gap-2 sm:gap-3">
                
                {/* City Selector Pill */}
                <div className="flex items-center gap-1 sm:gap-1.5 bg-stone-100 px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-stone-200/80 shrink-0">
                  <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-700 shrink-0" />
                  <select
                    id="home-city-select"
                    value={filters.city}
                    onChange={(e) => setFilters((prev) => ({ ...prev, city: e.target.value }))}
                    className="font-bold text-stone-900 text-xs sm:text-sm bg-transparent border-none focus:outline-none cursor-pointer pr-1 max-w-[95px] sm:max-w-none truncate"
                  >
                    <option value="all">Узбекистан</option>
                    <option value="Ташкент">Ташкент</option>
                    <option value="Самарканд">Самарканд</option>
                    <option value="Бухара">Бухара</option>
                  </select>
                  <ChevronDown className="w-3 h-3 text-stone-500 pointer-events-none -ml-1 shrink-0" />
                </div>

                {/* Search input */}
                <div className="flex-1 flex items-center bg-stone-50 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 border border-stone-200/80 focus-within:border-stone-400 focus-within:bg-white transition-all shadow-2xs">
                  <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-stone-400 mr-2 sm:mr-3 shrink-0" />
                  <input
                    type="text"
                    id="search-input"
                    placeholder="Поиск по адресу, району или ЖК..."
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

                {/* Deal Type Switch (Desktop only inline, on mobile it's in the quick ribbon below) */}
                <div className="hidden md:flex bg-stone-100 p-1 rounded-2xl text-xs font-bold text-stone-700 shrink-0">
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
                  className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-stone-900 hover:bg-stone-800 text-white flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm shrink-0 transition-colors cursor-pointer text-xs font-bold"
                  title="Расширенные фильтры"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Фильтры</span>
                  {activeFiltersCount > 0 && (
                    <span className="bg-amber-400 text-stone-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center -mr-0.5">
                      {activeFiltersCount}
                    </span>
                  )}
                </button>

                {/* AI Search Quick Trigger Button */}
                <button
                  id="home-ai-search-btn"
                  onClick={() => setActiveTab('assistant')}
                  className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 border border-amber-300 flex items-center justify-center gap-1.5 shadow-2xs shrink-0 transition-all cursor-pointer text-xs font-bold active:scale-95"
                  title="AI Поиск недвижимости"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  <span className="hidden sm:inline">AI Поиск</span>
                </button>
              </div>

              {/* Quick Filter Ribbon (Deal Types + Categories in a smooth horizontal scroll) */}
              <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none pt-0.5">
                
                {/* Mobile Deal Type Toggle Chips */}
                <div className="flex md:hidden items-center gap-1 bg-stone-100 p-0.5 rounded-xl border border-stone-200/80 shrink-0">
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, dealType: 'all' }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filters.dealType === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-500'
                    }`}
                  >
                    Все
                  </button>
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, dealType: 'rent' }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filters.dealType === 'rent' ? 'bg-stone-900 text-white shadow-2xs' : 'text-stone-500'
                    }`}
                  >
                    Аренда
                  </button>
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, dealType: 'sale' }))}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      filters.dealType === 'sale' ? 'bg-emerald-800 text-white shadow-2xs' : 'text-stone-500'
                    }`}
                  >
                    Продажа
                  </button>
                </div>

                <div className="h-4 w-px bg-stone-200 md:hidden shrink-0 mx-0.5" />

                {/* Category Tabs */}
                {categoryTabs.map((tab) => {
                  const active = filters.propertyType === tab.id || (tab.id === 'all' && filters.propertyType === 'all');
                  return (
                    <button
                      key={tab.id}
                      id={`cat-pill-${tab.id}`}
                      onClick={() => setFilters((prev) => ({ ...prev, propertyType: tab.id as any }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
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

              {/* Active Filters Summary Chips (if non-default filters active) */}
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 scrollbar-none text-xs border-t border-stone-100">
                  <span className="text-[10px] sm:text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1">
                    Активные:
                  </span>
                  {filters.city !== 'all' && (
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, city: 'all' }))}
                      className="bg-amber-100/90 hover:bg-amber-200 text-amber-950 font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shrink-0 text-xs transition-colors cursor-pointer"
                    >
                      <span>{filters.city}</span>
                      <span className="text-[10px]">✕</span>
                    </button>
                  )}
                  {filters.dealType !== 'all' && (
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, dealType: 'all' }))}
                      className="bg-amber-100/90 hover:bg-amber-200 text-amber-950 font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shrink-0 text-xs transition-colors cursor-pointer"
                    >
                      <span>{filters.dealType === 'rent' ? 'Аренда' : 'Продажа'}</span>
                      <span className="text-[10px]">✕</span>
                    </button>
                  )}
                  {filters.propertyType !== 'all' && (
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, propertyType: 'all' }))}
                      className="bg-amber-100/90 hover:bg-amber-200 text-amber-950 font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shrink-0 text-xs transition-colors cursor-pointer"
                    >
                      <span>{categoryTabs.find(t => t.id === filters.propertyType)?.label || filters.propertyType}</span>
                      <span className="text-[10px]">✕</span>
                    </button>
                  )}
                  {(filters.minPrice > 0 || filters.maxPrice < 500000) && (
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, minPrice: 0, maxPrice: 500000 }))}
                      className="bg-amber-100/90 hover:bg-amber-200 text-amber-950 font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shrink-0 text-xs transition-colors cursor-pointer"
                    >
                      <span>${filters.minPrice.toLocaleString()} - ${filters.maxPrice.toLocaleString()}</span>
                      <span className="text-[10px]">✕</span>
                    </button>
                  )}
                  {filters.bedrooms !== 'all' && (
                    <button
                      onClick={() => setFilters((prev) => ({ ...prev, bedrooms: 'all' }))}
                      className="bg-amber-100/90 hover:bg-amber-200 text-amber-950 font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shrink-0 text-xs transition-colors cursor-pointer"
                    >
                      <span>{filters.bedrooms} комн.</span>
                      <span className="text-[10px]">✕</span>
                    </button>
                  )}
                  <button
                    onClick={handleResetFilters}
                    className="text-stone-500 hover:text-stone-900 font-bold text-[11px] underline ml-1 shrink-0 cursor-pointer"
                  >
                    Сбросить все
                  </button>
                </div>
              )}
            </div>

            {/* Backend error banner (list still renders whatever we have cached) */}
            {loadError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs text-red-700">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{loadError}</span>
                </div>
                <button
                  onClick={() => loadProperties(true)}
                  className="px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  Повторить
                </button>
              </div>
            )}

            {/* Loading skeleton (first load, nothing to show yet) */}
            {isLoading && properties.length === 0 && !loadError && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden animate-pulse">
                    <div className="w-full h-40 bg-stone-200" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-stone-200 rounded w-3/4" />
                      <div className="h-3 bg-stone-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

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

                <div className="flex items-center gap-2 shrink-0">
                  {/* Manual refresh from backend */}
                  <button
                    onClick={() => loadProperties(true)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200/80 disabled:opacity-50"
                    title="Обновить список из базы данных"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-stone-600 ${isLoading ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Обновить</span>
                  </button>

                  {/* View on map quick link */}
                  <button
                    onClick={() => setActiveTab('map')}
                    className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-stone-200/80"
                  >
                    <MapIcon className="w-3.5 h-3.5 text-stone-600" />
                    <span>Открыть на карте</span>
                  </button>
                </div>
              </div>

              {!isLoading && filteredProperties.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center space-y-3 border border-stone-200 max-w-lg mx-auto">
                  <Search className="w-10 h-10 text-stone-300 mx-auto" />
                  <h4 className="font-bold text-base text-stone-800">Объекты не найдены</h4>
                  <p className="text-xs text-stone-500">
                    {loadError ? 'Не удалось получить данные с сервера.' : 'Попробуйте изменить параметры фильтров или поисковый запрос'}
                  </p>
                  <button
                    onClick={handleResetFilters}
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
            
            {/* 1. Full-Screen Interactive Map Canvas — fed by the same real `filteredProperties`
                 that come from the backend, so the map always mirrors the catalog. */}
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

                  {/* Manual refresh, always available on the map too */}
                  <button
                    onClick={() => loadProperties(true)}
                    disabled={isLoading}
                    className="h-11 px-3.5 rounded-2xl bg-white/95 backdrop-blur-md hover:bg-white text-stone-800 border border-stone-200/90 flex items-center justify-center gap-1.5 shadow-xl shrink-0 transition-all active:scale-95 cursor-pointer font-bold text-xs disabled:opacity-50"
                    title="Обновить объекты из базы данных"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>

                  {/* Action Quick Button (Add Property for Realtors, AI Assistant for Seekers) */}
                  {currentUser?.role === 'owner' || currentUser?.role === 'admin' ? (
                    <button
                      onClick={() => {
                        setEditProperty(null);
                        setShowAddModal(true);
                      }}
                      className="h-11 px-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-2xl flex items-center gap-1.5 shadow-xl shrink-0 transition-all active:scale-95 cursor-pointer font-bold text-xs"
                      title="Добавить объявление"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden md:inline">Подать объявление</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('assistant')}
                      className="h-11 px-3.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-2xl flex items-center gap-1.5 shadow-xl shrink-0 transition-all active:scale-95 cursor-pointer font-bold text-xs"
                      title="AI Поиск & Карта"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span className="hidden md:inline">AI Поиск</span>
                    </button>
                  )}
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
                      <p className="font-bold">{isLoading ? 'Загрузка объектов...' : 'Нет объектов по фильтрам'}</p>
                      <p className="text-[10px] text-stone-500">
                        {loadError ? loadError : 'Попробуйте сбросить параметры'}
                      </p>
                    </div>
                    <button
                      onClick={loadError ? () => loadProperties(true) : handleResetFilters}
                      className="px-3.5 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold shrink-0 hover:bg-stone-800 transition-colors"
                    >
                      {loadError ? 'Повторить' : 'Сбросить'}
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

        {/* TAB CONTENT: AI SEARCH & MAP PAGE */}
        {activeTab === 'assistant' && (
          <AISearchPage
            properties={properties}
            onSelectProperty={(property) => setSelectedProperty(property)}
            favorites={favorites}
            onToggleFavorite={(id, e) => toggleFavorite(id, e)}
            onNavigateToMapTab={(filteredIds) => {
              if (filteredIds && filteredIds.length > 0) {
                // If specific matches, we can switch to map
                setActiveTab('map');
              } else {
                setActiveTab('map');
              }
            }}
          />
        )}

        {/* TAB CONTENT: FULL PROFILE PAGE */}
        {activeTab === 'profile' && (
          <ProfilePage
            currentUser={currentUser}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            onOpenAddProperty={() => {
              setEditProperty(null);
              setShowAddModal(true);
            }}
            onOpenAIAssistant={() => setActiveTab('assistant')}
            onOpenAdmin={() => setShowAdminModal(true)}
            onOpenFavorites={() => setActiveTab('favorites')}
            favoritesCount={favorites.length}
            userProperties={userProperties}
            onSelectProperty={(property) => setSelectedProperty(property)}
            onDeleteProperty={handleDeleteProperty}
            onNavigateHome={() => setActiveTab('home')}
          />
        )}
          </>
        )}

        {/* Floating Bottom Navigation Bar (Hidden when on Property Detail page or shown cleanly) */}
        {!selectedProperty && (
          <BottomNav
            activeTab={activeTab}
            onTabChange={handleTabChange}
            favoritesCount={favorites.length}
            currentUser={currentUser}
            onProfileClick={() => {
              setSelectedProperty(null);
              setActiveTab('profile');
            }}
            onQuickAction={() => {
              if (currentUser?.role === 'owner' || currentUser?.role === 'admin') {
                setEditProperty(null);
                setShowAddModal(true);
              } else {
                setShowFiltersModal(true);
              }
            }}
          />
        )}

      </div>

      {/* ALL MODALS & DIALOGS */}

      {/* 1. Contact Agent Modal */}
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

      {/* 7. Filters Modal */}
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

    </div>
  );
}