import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Building, Home, Check, Plus, Image as ImageIcon, Sparkles, Upload, Trash2, Camera, Link as LinkIcon, FileImage } from 'lucide-react';
import { DealType, PropertyType, Property, User } from '../types';
import { InteractiveMap, UZBEKISTAN_CITIES } from './InteractiveMap';

interface AddPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitProperty: (propertyData: Partial<Property>, isEditMode?: boolean, editId?: string) => Promise<void>;
  editProperty?: Property | null;
  currentUser?: User | null;
  // Called after a successful DELETE against the real backend, so the parent
  // can remove the property from its local list/state.
  onPropertyDeleted?: (id: string) => void;
}

// API_URL is injected at build/runtime (see .env / vite define). Falls back to local backend for dev.
const getApiUrl = (): string => {
  try {
    // @ts-ignore
    if (typeof process !== 'undefined' && process.env && process.env.API_URL) {
      // @ts-ignore
      return process.env.API_URL;
    }
  } catch {
    // process is not defined in this environment, fall through
  }
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) {
    return (import.meta as any).env.VITE_API_URL;
  }
  return 'http://localhost:8000';
};

const API_URL = getApiUrl().replace(/\/+$/, '');

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const AddPropertyModal: React.FC<AddPropertyModalProps> = ({
  isOpen,
  onClose,
  onSubmitProperty,
  editProperty = null,
  currentUser = null,
  onPropertyDeleted
}) => {
  const isEdit = Boolean(editProperty);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [dealType, setDealType] = useState<DealType>('rent');
  const [propertyType, setPropertyType] = useState<PropertyType>('apartment');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('$');
  const [address, setAddress] = useState('ул. Амира Темура, 15');
  const [neighborhood, setNeighborhood] = useState('Мирабадский район');
  const [city, setCity] = useState('Ташкент');
  const [lat, setLat] = useState(41.311081);
  const [lng, setLng] = useState(69.240562);
  const [bedrooms, setBedrooms] = useState(2);
  const [bathrooms, setBathrooms] = useState(1);
  const [areaSqFt, setAreaSqFt] = useState(85);
  const [builtYear, setBuiltYear] = useState(2023);
  const [livingRooms, setLivingRooms] = useState(1);
  const [parkingSpaces, setParkingSpaces] = useState(1);
  const [floor, setFloor] = useState(4);
  const [totalFloors, setTotalFloors] = useState(9);
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [photosList, setPhotosList] = useState<string[]>([
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80'
  ]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Кондиционер',
    'Подземный паркинг',
    'Wi-Fi интернет',
    'Охрана 24/7'
  ]);
  const [agentName, setAgentName] = useState(currentUser?.name || 'Сардор Рахимов');
  const [agentPhone, setAgentPhone] = useState(currentUser?.phone || '+998 90 123-45-67');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (editProperty) {
      setTitle(editProperty.title);
      setDealType(editProperty.dealType);
      setPropertyType(editProperty.propertyType);
      setPrice(String(editProperty.price));
      setCurrency(editProperty.currency || '$');
      setAddress(editProperty.location.address);
      setNeighborhood(editProperty.location.neighborhood);
      setCity(editProperty.location.city);
      setLat(editProperty.location.lat);
      setLng(editProperty.location.lng);
      setBedrooms(editProperty.specs.bedrooms);
      setBathrooms(editProperty.specs.bathrooms);
      setAreaSqFt(editProperty.specs.areaSqFt);
      setBuiltYear(editProperty.specs.builtYear);
      setLivingRooms(editProperty.specs.livingRooms || 1);
      setParkingSpaces(editProperty.specs.parkingSpaces || 1);
      setFloor(editProperty.specs.floor || 1);
      setTotalFloors(editProperty.specs.totalFloors || 9);
      setDescription(editProperty.description);
      setPhotosList(editProperty.photos || []);
      setSelectedAmenities(editProperty.amenities || []);
      setAgentName(editProperty.agent?.name || currentUser?.name || 'Собственник');
      setAgentPhone(editProperty.agent?.phone || currentUser?.phone || '+998 90 123-45-67');
    } else {
      // Reset for add mode
      setTitle('');
      setPrice('');
      if (currentUser) {
        setAgentName(currentUser.name);
        setAgentPhone(currentUser.phone || '+998 90 123-45-67');
      }
    }
    setSubmitError(null);
  }, [editProperty, isOpen, currentUser]);

  if (!isOpen) return null;

  const amenityOptions = [
    'Кондиционер',
    'Подземный паркинг',
    'Охрана 24/7',
    'Wi-Fi интернет',
    'Лифт',
    'Балкон / Лоджия',
    'Бассейн',
    'Сауна / Хаммам',
    'Система Умный дом',
    'Стиральная машина',
    'Посудомоечная машина',
    'Детская площадка',
    'Фруктовый сад',
    'Автономное отопление'
  ];

  const presetPhotos = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80'
  ];

  const toggleAmenity = (item: string) => {
    if (selectedAmenities.includes(item)) {
      setSelectedAmenities(selectedAmenities.filter((a) => a !== item));
    } else {
      setSelectedAmenities([...selectedAmenities, item]);
    }
  };

  const handleFileUpload = (files: FileList | File[] | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    fileArray.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) {
          setPhotosList((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleAddPhoto = () => {
    if (photoUrl.trim() && !photosList.includes(photoUrl.trim())) {
      setPhotosList([...photosList, photoUrl.trim()]);
      setPhotoUrl('');
    }
  };

  // Builds the payload in the EXACT shape the backend expects
  // (snake_case specs, plus facilities/featured/status).
  const buildBackendPayload = () => ({
    title: title.trim(),
    description:
      description.trim() ||
      'Комфортный и благоустроенный объект недвижимости с отличной локацией и развитой инфраструктурой.',
    price: Number(price),
    pricePeriod: dealType === 'rent' ? '/ мес' : '',
    currency,
    dealType,
    propertyType,
    location: {
      address,
      neighborhood,
      city,
      country: 'Узбекистан',
      lat,
      lng
    },
    specs: {
      bedrooms,
      bathrooms,
      area_sq_m: areaSqFt,
      built_year: builtYear,
      living_rooms: livingRooms,
      parking_spaces: parkingSpaces,
      floor,
      total_floors: totalFloors
    },
    photos: photosList.length > 0 ? photosList : presetPhotos.slice(0, 2),
    amenities: selectedAmenities,
    facilities: [],
    featured: false,
    status: 'published'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price) return;

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (isEdit && editProperty) {
        // No confirmed update endpoint from backend yet — delegate to parent's
        // existing handler so nothing regresses. Ask to wire a real PUT/PATCH
        // once that endpoint exists.
        await onSubmitProperty(
          {
            title: title.trim(),
            dealType,
            propertyType,
            price: Number(price),
            currency,
            pricePeriod: dealType === 'rent' ? '/ мес' : '',
            description: description.trim(),
            location: { address, neighborhood, city, country: 'Узбекистан', lat, lng },
            specs: { bedrooms, bathrooms, areaSqFt, builtYear, livingRooms, parkingSpaces, floor, totalFloors },
            amenities: selectedAmenities,
            photos: photosList.length > 0 ? photosList : presetPhotos.slice(0, 2),
            agent: {
              id: editProperty?.agent?.id || `agent-${Date.now()}`,
              name: agentName,
              role: currentUser?.role === 'admin' ? 'Администратор портала' : 'Собственник / Риелтор',
              phone: agentPhone,
              email: currentUser?.email || 'contact@uzestate.uz',
              avatar: currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
              verified: true,
              rating: 5.0,
              dealsCount: 15
            },
            ownerId: currentUser?.id || 'user-admin'
          },
          true,
          editProperty.id
        );
        onClose();
        return;
      }

      // CREATE — real POST to the backend
      const url = `${API_URL}/api/properties`;
      const payload = buildBackendPayload();

      console.log('[AddPropertyModal][create] → Request', { url, method: 'POST', payload });

      let res: Response;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders()
          },
          body: JSON.stringify(payload)
        });
      } catch (networkErr: any) {
        console.error('[AddPropertyModal][create] ✗ Network error:', networkErr);
        throw new Error(`Не удалось подключиться к серверу (${url}). Проверьте, что backend запущен.`);
      }

      console.log('[AddPropertyModal][create] ← Response status:', res.status, res.statusText);

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // No JSON body — fine for some 2xx/204 responses
      }

      console.log('[AddPropertyModal][create] ← Response body:', data);

      if (!res.ok) {
        const msg = data?.detail || data?.error || `Ошибка создания объявления (HTTP ${res.status})`;
        throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      // Let parent know too, in case it keeps its own local list in sync via
      // this same callback (e.g. pushing `data` into state). Parent can choose
      // to ignore the fetch it would normally do, since we already created it.
      try {
        await onSubmitProperty(data ?? payload, false, undefined);
      } catch (parentErr) {
        console.warn('[AddPropertyModal][create] parent onSubmitProperty handler failed (property was still created on backend):', parentErr);
      }

      onClose();
    } catch (err: any) {
      console.error('[AddPropertyModal] ✗ Final error:', err);
      setSubmitError(err.message || 'Не удалось сохранить объявление');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!editProperty) return;
    const confirmed = window.confirm('Удалить это объявление без возможности восстановления?');
    if (!confirmed) return;

    setSubmitError(null);
    setIsDeleting(true);

    const url = `${API_URL}/api/properties/${editProperty.id}`;
    console.log('[AddPropertyModal][delete] → Request', { url, method: 'DELETE' });

    try {
      let res: Response;
      try {
        res = await fetch(url, {
          method: 'DELETE',
          headers: { ...authHeaders() }
        });
      } catch (networkErr: any) {
        console.error('[AddPropertyModal][delete] ✗ Network error:', networkErr);
        throw new Error(`Не удалось подключиться к серверу (${url}).`);
      }

      console.log('[AddPropertyModal][delete] ← Response status:', res.status, res.statusText);

      if (!res.ok && res.status !== 204) {
        let data: any = null;
        try {
          data = await res.json();
        } catch {
          // ignore
        }
        const msg = data?.detail || data?.error || `Ошибка удаления (HTTP ${res.status})`;
        throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg));
      }

      onPropertyDeleted?.(editProperty.id);
      onClose();
    } catch (err: any) {
      console.error('[AddPropertyModal][delete] ✗ Final error:', err);
      setSubmitError(err.message || 'Не удалось удалить объявление');
    } finally {
      setIsDeleting(false);
    }
  };

  const setCityPreset = (cityName: string, defaultDistrict: string, cLat: number, cLng: number) => {
    setCity(cityName);
    setNeighborhood(defaultDistrict);
    setLat(cLat);
    setLng(cLng);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-2 sm:p-4 overflow-y-auto animate-fade-in" id="add-property-modal-overlay">
      <div className="bg-stone-50 w-full max-w-3xl max-h-[92vh] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-stone-200" id="add-property-modal-content">
        
        {/* Header */}
        <div className="p-5 border-b border-stone-200 bg-white flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-stone-900">
              {isEdit ? 'Редактировать объект недвижимости' : 'Разместить новое объявление'}
            </h2>
            <p className="text-xs text-stone-500">
              {isEdit ? 'Изменение характеристик, цены и локации на карте' : 'Добавьте дом, квартиру, виллу или офис на карту Узбекистана'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isEdit && (
              <button
                type="button"
                id="delete-property-btn"
                onClick={handleDelete}
                disabled={isDeleting}
                className="w-9 h-9 rounded-full bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                title="Удалить объявление"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            )}
            <button
              id="close-add-modal-btn"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6">

          {submitError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              {submitError}
            </div>
          )}

          {/* Deal Type & Property Category */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                Тип сделки
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['rent', 'sale'] as DealType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    id={`deal-type-${type}`}
                    onClick={() => setDealType(type)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      dealType === type
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {type === 'rent' ? '🏠 В Аренду' : '💰 На Продажу'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 uppercase tracking-wider">
                Категория недвижимости
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'apartment', label: 'Квартира' },
                  { id: 'house', label: 'Дом / Коттедж' },
                  { id: 'villa', label: 'Вилла' },
                  { id: 'office', label: 'Офис' },
                  { id: 'land', label: 'Участок' },
                  { id: 'commercial', label: 'Коммерческая' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    id={`prop-type-${item.id}`}
                    onClick={() => setPropertyType(item.id as PropertyType)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                      propertyType === item.id
                        ? 'bg-stone-900 text-white shadow-sm'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Название объявления *
              </label>
              <input
                type="text"
                id="prop-title-input"
                required
                placeholder="Например: 3-комнатная квартира в Tashkent City"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Стоимость * {dealType === 'rent' ? '($ в месяц)' : '(полная стоимость)'}
              </label>
              <div className="flex gap-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-20 text-xs sm:text-sm px-2 py-2.5 rounded-xl bg-white border border-stone-200 focus:outline-none font-bold"
                >
                  <option value="$">$ USD</option>
                  <option value="сум">UZS сум</option>
                  <option value="€">€ EUR</option>
                </select>
                <input
                  type="number"
                  id="prop-price-input"
                  required
                  placeholder="Например: 1200"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Interactive Uzbekistan Map Pin Picker */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Точное местоположение на карте Узбекистана
              </label>
              <div className="flex items-center gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setCityPreset('Ташкент', 'Мирабадский район', 41.311081, 69.240562)}
                  className="px-2 py-0.5 bg-stone-200 hover:bg-stone-300 rounded font-medium cursor-pointer"
                >
                  Ташкент
                </button>
                <button
                  type="button"
                  onClick={() => setCityPreset('Самарканд', 'Центр / Регистан', 39.6542, 66.9750)}
                  className="px-2 py-0.5 bg-stone-200 hover:bg-stone-300 rounded font-medium cursor-pointer"
                >
                  Самарканд
                </button>
                <button
                  type="button"
                  onClick={() => setCityPreset('Бухара', 'Старый город', 39.7715, 64.4215)}
                  className="px-2 py-0.5 bg-stone-200 hover:bg-stone-300 rounded font-medium cursor-pointer"
                >
                  Бухара
                </button>
              </div>
            </div>

            <div className="h-[240px] rounded-2xl overflow-hidden border border-stone-300 shadow-sm relative">
              <InteractiveMap
                pickerMode={true}
                center={[lat, lng]}
                zoom={13}
                pickedLocation={{ lat, lng }}
                onPickLocation={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
                className="w-full h-full"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <div>
                <label className="text-[10px] text-stone-500 font-semibold mb-0.5 block">Город</label>
                <input
                  type="text"
                  placeholder="Ташкент"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-stone-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-500 font-semibold mb-0.5 block">Район / Махалля</label>
                <input
                  type="text"
                  placeholder="Мирабадский район"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-stone-200"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-500 font-semibold mb-0.5 block">Улица и дом</label>
                <input
                  type="text"
                  placeholder="ул. Чехова, 10"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-white border border-stone-200"
                />
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Параметры объекта
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              <div className="bg-white p-2.5 rounded-xl border border-stone-200 text-center">
                <span className="text-[10px] text-stone-500 block">Комнат</span>
                <input
                  type="number"
                  min="0"
                  value={bedrooms}
                  onChange={(e) => setBedrooms(Number(e.target.value))}
                  className="w-full font-bold text-sm text-center focus:outline-none"
                />
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-200 text-center">
                <span className="text-[10px] text-stone-500 block">Санузлов</span>
                <input
                  type="number"
                  min="0"
                  value={bathrooms}
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                  className="w-full font-bold text-sm text-center focus:outline-none"
                />
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-200 text-center">
                <span className="text-[10px] text-stone-500 block">Площадь (м²)</span>
                <input
                  type="number"
                  min="1"
                  value={areaSqFt}
                  onChange={(e) => setAreaSqFt(Number(e.target.value))}
                  className="w-full font-bold text-sm text-center focus:outline-none"
                />
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-200 text-center">
                <span className="text-[10px] text-stone-500 block">Этаж</span>
                <input
                  type="number"
                  min="1"
                  value={floor}
                  onChange={(e) => setFloor(Number(e.target.value))}
                  className="w-full font-bold text-sm text-center focus:outline-none"
                />
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-200 text-center">
                <span className="text-[10px] text-stone-500 block">Этажность</span>
                <input
                  type="number"
                  min="1"
                  value={totalFloors}
                  onChange={(e) => setTotalFloors(Number(e.target.value))}
                  className="w-full font-bold text-sm text-center focus:outline-none"
                />
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-stone-200 text-center">
                <span className="text-[10px] text-stone-500 block">Парковка мест</span>
                <input
                  type="number"
                  min="0"
                  value={parkingSpaces}
                  onChange={(e) => setParkingSpaces(Number(e.target.value))}
                  className="w-full font-bold text-sm text-center focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              Удобства и особенности
            </label>
            <div className="flex flex-wrap gap-2">
              {amenityOptions.map((item) => {
                const active = selectedAmenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                      active
                        ? 'bg-stone-900 text-white'
                        : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {active && <Check className="w-3.5 h-3.5" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Photos Upload & Management */}
          <div className="space-y-3" id="photo-upload-section">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                Фотографии объекта ({photosList.length})
              </label>
              {photosList.length > 0 && (
                <button
                  type="button"
                  onClick={() => setPhotosList([])}
                  className="text-[11px] font-bold text-red-600 hover:text-red-700 cursor-pointer"
                >
                  Очистить все
                </button>
              )}
            </div>

            {/* Hidden Native File Input for Multiple Uploads */}
            <input
              ref={fileInputRef}
              type="file"
              id="property-file-upload-input"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                handleFileUpload(e.target.files);
                if (e.target) e.target.value = '';
              }}
            />

            {/* Drag & Drop / Click Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all duration-150 ${
                isDragging
                  ? 'border-amber-500 bg-amber-50/80 scale-[1.01]'
                  : 'border-stone-300 hover:border-stone-500 bg-white hover:bg-stone-50/70 shadow-xs'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                  isDragging ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-700'
                }`}>
                  <Upload className="w-6 h-6 stroke-[2.2]" />
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">
                    Нажмите для загрузки или перетащите фото сюда
                  </p>
                  <p className="text-[11px] text-stone-500 mt-0.5">
                    Поддерживаются форматы JPG, PNG, WEBP, HEIC (можно выбрать несколько файлов сразу)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="mt-1 px-4 py-1.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors shadow-xs"
                >
                  Выбрать файлы с устройства
                </button>
              </div>
            </div>

            {/* Uploaded Photos Grid / List */}
            {photosList.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-stone-600 block">
                  Загруженные изображения (первое будет на обложке):
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
                  {photosList.map((photo, idx) => (
                    <div
                      key={idx}
                      className="relative group rounded-xl overflow-hidden aspect-4/3 border-2 border-stone-200 bg-stone-100 shadow-xs"
                    >
                      <img
                        src={photo}
                        alt={`Объект ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-amber-500 text-stone-950 font-black text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider shadow-sm">
                          Главное
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPhotosList(photosList.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-stone-900/80 hover:bg-red-600 text-white flex items-center justify-center transition-colors cursor-pointer opacity-90 group-hover:opacity-100"
                        title="Удалить фото"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Optional / Alternative Photo Sources */}
            <div className="pt-2 border-t border-stone-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-stone-500 font-medium">
                  Или выберите готовые примеры из галереи:
                </span>
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="text-[11px] font-bold text-stone-700 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                >
                  <LinkIcon className="w-3 h-3" />
                  {showUrlInput ? 'Скрыть URL ссылку' : 'Добавить по URL ссылке'}
                </button>
              </div>

              {/* Collapsible URL Input */}
              {showUrlInput && (
                <div className="flex gap-2 animate-in fade-in duration-150">
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... (вставьте URL)"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-1 focus:ring-stone-900"
                  />
                  <button
                    type="button"
                    onClick={handleAddPhoto}
                    className="px-4 py-2 bg-stone-800 text-white text-xs font-bold rounded-xl hover:bg-stone-700 cursor-pointer shrink-0"
                  >
                    Добавить URL
                  </button>
                </div>
              )}

              {/* Quick sample photo picks */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {presetPhotos.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      if (!photosList.includes(url)) setPhotosList([...photosList, url]);
                    }}
                    className="w-13 h-13 rounded-xl overflow-hidden shrink-0 border border-stone-200 hover:border-amber-500 hover:opacity-100 opacity-75 transition-all cursor-pointer relative"
                    title="Добавить это фото"
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <span className="absolute inset-0 bg-black/20 hover:bg-transparent transition-colors flex items-center justify-center">
                      <Plus className="w-4 h-4 text-white drop-shadow-sm" />
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Описание объекта
            </label>
            <textarea
              rows={3}
              placeholder="Опишите преимущества: ремонт, вид из окна, близость к метро, мебель, условия..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-xl bg-white border border-stone-200 focus:outline-none focus:ring-2 focus:ring-stone-900 resize-none"
            />
          </div>

          {/* Agent / Owner Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Контактное лицо</label>
              <input
                type="text"
                value={agentName}
                onChange={(e) => setAgentName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-stone-200"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Номер телефона</label>
              <input
                type="text"
                value={agentPhone}
                onChange={(e) => setAgentPhone(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-white border border-stone-200"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              id="submit-property-form-btn"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-stone-900 text-white font-bold text-sm rounded-2xl hover:bg-stone-800 shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting
                ? 'Сохранение в базу данных...'
                : isEdit
                ? 'Сохранить изменения объекта'
                : 'Опубликовать объявление на карте'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};