import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  Heart,
  Star,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Car,
  Phone,
  MessageSquare,
  Landmark,
  Train,
  Utensils,
  GraduationCap,
  Bus,
  Activity,
  Trees,
  ShoppingBag,
  Dumbbell,
  CheckCircle2,
  X,
  Send,
  Layers,
  ShieldCheck,
  Clock
} from 'lucide-react';
import { Property, Review } from '../types';
import { InteractiveMap } from './InteractiveMap';

interface PropertyDetailPageProps {
  property: Property;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onBookNow: (property: Property) => void;
  onContactAgent: (property: Property) => void;
  onOpenMap: (property: Property) => void;
  onAddReview?: (propertyId: string, review: Partial<Review>) => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  property,
  onBack,
  isFavorite,
  onToggleFavorite,
  onBookNow,
  onContactAgent,
  onOpenMap,
  onAddReview
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [showGallery, setShowGallery] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showReviewInput, setShowReviewInput] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newName, setNewName] = useState('');
  const [copiedShare, setCopiedShare] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const formattedPrice = `${property.price.toLocaleString()} ${property.currency}`;
  const priceSubtitle = property.dealType === 'rent' ? (property.pricePeriod || '/ мес') : '';

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'metro':
      case 'station':
        return <Train className="w-4 h-4 text-amber-700" />;
      case 'restaurant':
        return <Utensils className="w-4 h-4 text-amber-700" />;
      case 'school':
        return <GraduationCap className="w-4 h-4 text-amber-700" />;
      case 'bus':
        return <Bus className="w-4 h-4 text-amber-700" />;
      case 'hospital':
        return <Activity className="w-4 h-4 text-amber-700" />;
      case 'park':
        return <Trees className="w-4 h-4 text-amber-700" />;
      case 'mall':
        return <ShoppingBag className="w-4 h-4 text-amber-700" />;
      case 'gym':
        return <Dumbbell className="w-4 h-4 text-amber-700" />;
      default:
        return <Landmark className="w-4 h-4 text-amber-700" />;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: `Посмотрите объект "${property.title}" на портале UzEstate!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    if (onAddReview) {
      onAddReview(property.id, {
        userName: newName.trim() || 'Гость портала',
        userRole: 'Арендатор / Покупатель',
        rating: newRating,
        comment: newComment.trim()
      });
    }

    setNewComment('');
    setNewName('');
    setShowReviewInput(false);
  };

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 pb-28 sm:pb-20" id="property-detail-page">
      
      {/* Top Header & Breadcrumbs Bar */}
      <div className="bg-white border-b border-stone-200/90 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <button
            id="page-back-btn"
            onClick={onBack}
            className="flex items-center gap-2 text-stone-700 hover:text-stone-950 font-bold text-xs sm:text-sm bg-stone-100 hover:bg-stone-200/90 px-3.5 py-2 rounded-xl transition-all cursor-pointer border border-stone-200/80"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Назад ко всем объявлениям</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              id="page-share-btn"
              onClick={handleShare}
              aria-label="Поделиться"
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 hover:text-stone-900 transition-colors relative cursor-pointer border border-stone-200/80"
              title="Поделиться ссылкой"
            >
              <Share2 className="w-4 h-4" />
              {copiedShare && (
                <span className="absolute -bottom-8 right-0 bg-stone-900 text-white text-[10px] px-2 py-1 rounded shadow whitespace-nowrap z-40">
                  Ссылка скопирована!
                </span>
              )}
            </button>

            <button
              id="page-favorite-btn"
              onClick={onToggleFavorite}
              aria-label="В избранное"
              className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors cursor-pointer border border-stone-200/80"
              title={isFavorite ? 'Удалить из избранного' : 'Добавить в избранное'}
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite ? 'fill-red-500 text-red-500' : 'text-stone-700'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Main Page Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-7 space-y-6">
        
        {/* Photo Gallery Hero Section */}
        <div className="bg-white rounded-3xl p-3 sm:p-5 border border-stone-200 shadow-sm space-y-3.5">
          <div className="relative w-full h-[280px] sm:h-[450px] rounded-2xl bg-stone-900 overflow-hidden shadow-inner group">
            <img
              src={property.photos[activePhotoIdx] || property.photos[0]}
              alt={property.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              referrerPolicy="no-referrer"
            />
            
            {/* Ambient gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

            {/* Top Badges */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
              <span className={`text-xs uppercase font-black px-3.5 py-1 rounded-full shadow-md ${
                property.dealType === 'rent' ? 'bg-stone-900 text-white' : 'bg-emerald-700 text-white'
              }`}>
                {property.dealType === 'rent' ? 'В аренду' : 'На продажу'}
              </span>
              {property.featured && (
                <span className="text-xs font-bold bg-amber-400 text-stone-950 px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  ★ Рекомендуем
                </span>
              )}
            </div>

            {/* Bottom Hero Info inside image */}
            <div className="absolute bottom-4 left-4 right-4 z-10 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-3xl font-black text-white drop-shadow-md">
                  {property.title}
                </h1>
                <div className="flex items-center gap-1.5 text-stone-200 text-xs sm:text-sm mt-1 drop-shadow">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{property.location.address}, {property.location.neighborhood}, {property.location.city}</span>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="text-2xl sm:text-3xl font-black text-amber-300 drop-shadow-md">
                  {formattedPrice}
                  {priceSubtitle && <span className="text-sm font-normal text-white"> {priceSubtitle}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Photo Thumbnails Strip */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none flex-1">
              {property.photos.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhotoIdx(idx)}
                  className={`relative w-20 h-16 sm:w-24 sm:h-18 rounded-xl overflow-hidden shrink-0 transition-all border-2 cursor-pointer ${
                    activePhotoIdx === idx
                      ? 'border-amber-500 ring-2 ring-amber-400/40 scale-105 shadow-md'
                      : 'border-stone-200 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`Фото ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowGallery(true)}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer shrink-0 border border-stone-200"
            >
              Смотреть все ({property.photos.length})
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Layout for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN (8 cols): Main Specs, Description, Facilities, Map, Reviews */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Specs Grid Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-extrabold text-base sm:text-lg text-stone-900">Параметры недвижимости</h2>
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-xs sm:text-sm font-bold text-amber-900">{property.rating.toFixed(1)} / 5.0</span>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 text-center">
                  <div className="flex items-center justify-center gap-1 text-stone-800 font-bold text-sm sm:text-base">
                    <Bed className="w-4 h-4 text-stone-500" />
                    <span>{property.specs.bedrooms}</span>
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">Спален</span>
                </div>

                <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 text-center">
                  <div className="flex items-center justify-center gap-1 text-stone-800 font-bold text-sm sm:text-base">
                    <Bath className="w-4 h-4 text-stone-500" />
                    <span>{property.specs.bathrooms}</span>
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">Санузлов</span>
                </div>

                <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 text-center">
                  <div className="flex items-center justify-center gap-1 text-stone-800 font-bold text-sm sm:text-base">
                    <Maximize2 className="w-4 h-4 text-stone-500" />
                    <span>{property.specs.areaSqFt}</span>
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">Площадь (м²)</span>
                </div>

                <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 text-center">
                  <div className="flex items-center justify-center gap-1 text-stone-800 font-bold text-sm sm:text-base">
                    <Layers className="w-4 h-4 text-stone-500" />
                    <span>{property.specs.floor || 1}/{property.specs.totalFloors || 9}</span>
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">Этаж</span>
                </div>

                <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 text-center">
                  <div className="flex items-center justify-center gap-1 text-stone-800 font-bold text-sm sm:text-base">
                    <Calendar className="w-4 h-4 text-stone-500" />
                    <span>{property.specs.builtYear}</span>
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">Год постройки</span>
                </div>

                <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200 text-center">
                  <div className="flex items-center justify-center gap-1 text-stone-800 font-bold text-sm sm:text-base">
                    <Car className="w-4 h-4 text-stone-500" />
                    <span>{property.specs.parkingSpaces}</span>
                  </div>
                  <span className="text-[11px] text-stone-500 mt-1 block">Паркомест</span>
                </div>
              </div>
            </div>

            {/* Description & Amenities Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-5">
              <div>
                <h2 className="font-extrabold text-base sm:text-lg text-stone-900 mb-2">Описание объекта</h2>
                <p className={`text-stone-600 text-xs sm:text-sm leading-relaxed ${!isDescExpanded ? 'line-clamp-4' : ''}`}>
                  {property.description}
                </p>
                <button
                  onClick={() => setIsDescExpanded(!isDescExpanded)}
                  className="mt-2 text-xs font-bold text-amber-700 hover:text-amber-900 underline cursor-pointer"
                >
                  {isDescExpanded ? 'Свернуть описание' : 'Читать полностью'}
                </button>
              </div>

              {property.amenities && property.amenities.length > 0 && (
                <div className="pt-3 border-t border-stone-100 space-y-2.5">
                  <h3 className="font-bold text-sm text-stone-900">Удобства и особенности</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-3.5 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-stone-700"
                      >
                        ✓ {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Public Facilities / Infrastructure */}
            {property.facilities && property.facilities.length > 0 && (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-3.5">
                <h2 className="font-extrabold text-base sm:text-lg text-stone-900">Инфраструктура поблизости</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {property.facilities.map((fac, idx) => (
                    <div
                      key={idx}
                      className="bg-stone-50 rounded-2xl p-3 border border-stone-200 flex items-center gap-3"
                    >
                      <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
                        {getFacilityIcon(fac.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-stone-900 truncate">{fac.name}</p>
                        <p className="text-[11px] text-stone-500 truncate">{fac.distance}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Interactive Map Preview */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-3.5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-base sm:text-lg text-stone-900">Расположение на карте</h2>
                  <p className="text-xs text-stone-500">{property.location.address}, {property.location.city}</p>
                </div>
                <button
                  onClick={() => onOpenMap(property)}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors cursor-pointer border border-stone-200"
                >
                  Открыть интерактивную карту
                </button>
              </div>

              <div className="h-[280px] sm:h-[320px] rounded-2xl overflow-hidden border border-stone-200 shadow-inner relative">
                <InteractiveMap
                  properties={[property]}
                  selectedProperty={property}
                  center={[property.location.lat, property.location.lng]}
                  zoom={14}
                  className="w-full h-full"
                  showCityQuickJump={false}
                />
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h2 className="font-extrabold text-base sm:text-lg text-stone-900">
                    Отзывы ({property.reviewsCount || property.reviews.length})
                  </h2>
                  <p className="text-xs text-stone-500">Реальные оценки арендаторов и покупателей</p>
                </div>

                <button
                  onClick={() => setShowReviewInput(!showReviewInput)}
                  className="px-3.5 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer shadow-2xs"
                >
                  {showReviewInput ? 'Закрыть форму' : 'Оставить отзыв'}
                </button>
              </div>

              {/* Add Review Form */}
              {showReviewInput && (
                <form
                  onSubmit={handleSubmitReview}
                  className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3 animate-fade-in"
                >
                  <h4 className="font-bold text-xs sm:text-sm text-stone-900">Ваш отзыв об объекте</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Ваше имя"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 rounded-xl bg-white border border-stone-200 focus:outline-none"
                    />

                    <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-stone-200">
                      <span className="text-xs text-stone-500">Оценка:</span>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setNewRating(s)}
                            className="p-0.5 text-stone-300 hover:text-amber-400 cursor-pointer"
                          >
                            <Star className={`w-4 h-4 ${s <= newRating ? 'fill-amber-400 text-amber-400' : ''}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <textarea
                    placeholder="Поделитесь впечатлением о состоянии объекта, чистоте, ремонте и районе..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-white border border-stone-200 focus:outline-none resize-none"
                  />

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Опубликовать отзыв
                  </button>
                </form>
              )}

              {/* Reviews List */}
              <div className="space-y-3">
                {property.reviews.slice(0, showAllReviews ? undefined : 3).map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.avatar}
                          alt={rev.userName}
                          className="w-9 h-9 rounded-full object-cover border border-stone-200"
                        />
                        <div>
                          <h5 className="font-bold text-xs text-stone-900">{rev.userName}</h5>
                          <p className="text-[10px] text-stone-400">{rev.date} • {rev.userRole}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-stone-200">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-bold text-stone-800">{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}

                {property.reviews.length > 3 && (
                  <button
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    className="w-full py-2 text-center text-xs font-bold text-stone-700 hover:text-stone-950 underline cursor-pointer"
                  >
                    {showAllReviews ? 'Скрыть часть отзывов' : `Показать все отзывы (${property.reviews.length})`}
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (4 cols): Sticky Booking & Agent Contact Box */}
          <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-20">
            
            {/* Main Action & Pricing Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-md space-y-5">
              <div className="space-y-1">
                <span className="text-[11px] text-stone-400 uppercase tracking-wider font-bold">Стоимость предложения</span>
                <div className="text-2xl sm:text-3xl font-black text-stone-900">
                  {formattedPrice}
                  {priceSubtitle && <span className="text-sm font-normal text-stone-500"> {priceSubtitle}</span>}
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  id="page-book-property-btn"
                  onClick={() => onBookNow(property)}
                  className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-sm shadow-md transition-all active:scale-95 text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  Забронировать просмотр
                </button>

                <button
                  id="page-contact-agent-btn"
                  onClick={() => onContactAgent(property)}
                  className="w-full py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm shadow-sm transition-all active:scale-95 text-center flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  Написать сообщение
                </button>
              </div>

              {/* Guarantees / Safety Badge */}
              <div className="bg-stone-50 rounded-2xl p-3.5 border border-stone-200 space-y-2 text-xs text-stone-600">
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Проверенное объявление</span>
                </div>
                <p className="text-[11px] text-stone-500 leading-normal">
                  Документы права собственности и технический паспорт объекта проверены модерацией UzEstate.
                </p>
              </div>
            </div>

            {/* Agent / Owner Profile Card */}
            <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-sm space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-stone-400">Контакты собственника / риелтора</h3>
              
              <div className="flex items-center gap-3">
                <img
                  src={property.agent.avatar}
                  alt={property.agent.name}
                  className="w-13 h-13 rounded-2xl object-cover border border-stone-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-stone-900">{property.agent.name}</h4>
                    {property.agent.verified && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-stone-500">{property.agent.role}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-600">
                    <span>★ {property.agent.rating.toFixed(1)}</span>
                    <span>•</span>
                    <span>{property.agent.dealsCount} сделок</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-100">
                <a
                  href={`tel:${property.agent.phone}`}
                  className="w-full py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-900 flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer border border-stone-200"
                >
                  <Phone className="w-4 h-4 text-stone-700" />
                  <span>{property.agent.phone}</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Mobile Sticky Bottom Floating Action Bar */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md p-3.5 border-t border-stone-200 flex items-center justify-between gap-3 z-40 sm:hidden shadow-2xl">
        <div className="min-w-0">
          <span className="text-[9px] text-stone-400 uppercase tracking-wider block font-bold">Цена</span>
          <div className="text-base font-black text-stone-900 truncate">
            {formattedPrice}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${property.agent.phone}`}
            className="p-2.5 rounded-xl bg-stone-100 text-stone-800 border border-stone-200 flex items-center justify-center cursor-pointer"
            title="Позвонить"
          >
            <Phone className="w-4 h-4" />
          </a>

          <button
            onClick={() => onBookNow(property)}
            className="py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md active:scale-95 text-center cursor-pointer whitespace-nowrap"
          >
            Забронировать
          </button>
        </div>
      </div>

      {/* Fullscreen Lightbox Gallery */}
      {showGallery && (
        <div className="fixed inset-0 z-60 bg-black/95 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between text-white pb-4">
            <span className="text-sm font-semibold">{activePhotoIdx + 1} / {property.photos.length}</span>
            <button
              onClick={() => setShowGallery(false)}
              className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center cursor-pointer hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <img
              src={property.photos[activePhotoIdx]}
              alt={property.title}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex items-center justify-center gap-2 overflow-x-auto py-4 scrollbar-none">
            {property.photos.map((photo, i) => (
              <button
                key={i}
                onClick={() => setActivePhotoIdx(i)}
                className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 cursor-pointer ${
                  activePhotoIdx === i ? 'border-amber-400 scale-105' : 'border-transparent opacity-50 hover:opacity-100'
                }`}
              >
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
