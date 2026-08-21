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
  Sofa,
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
  Building,
  Layers
} from 'lucide-react';
import { Property, Review } from '../types';
import { InteractiveMap } from './InteractiveMap';

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onBookNow: (property: Property) => void;
  onContactAgent: (property: Property) => void;
  onOpenMap: (property: Property) => void;
  onAddReview?: (propertyId: string, review: Partial<Review>) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  isFavorite,
  onToggleFavorite,
  onBookNow,
  onContactAgent,
  onOpenMap,
  onAddReview
}) => {
  if (!property) return null;

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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-center items-center p-2 sm:p-4 overflow-y-auto animate-fade-in" id="property-detail-modal">
      <div className="bg-stone-50 w-full max-w-3xl max-h-[92vh] rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden relative border border-stone-200" id="property-detail-container">
        
        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 pb-24">
          
          {/* Top Hero Image */}
          <div className="relative w-full h-[300px] sm:h-[380px] bg-stone-900 overflow-hidden">
            <img
              src={property.photos[activePhotoIdx] || property.photos[0]}
              alt={property.title}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            
            {/* Ambient gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/50 pointer-events-none" />

            {/* Top Navigation */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
              <button
                id="back-detail-btn"
                onClick={onClose}
                aria-label="Назад"
                className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-stone-900 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  id="share-detail-btn"
                  onClick={handleShare}
                  aria-label="Поделиться"
                  className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-stone-900 flex items-center justify-center shadow-lg transition-transform active:scale-95 relative cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  {copiedShare && (
                    <span className="absolute -bottom-8 right-0 bg-stone-900 text-white text-[10px] px-2 py-1 rounded shadow whitespace-nowrap">
                      Ссылка скопирована!
                    </span>
                  )}
                </button>

                <button
                  id="favorite-detail-btn"
                  onClick={onToggleFavorite}
                  aria-label="В избранное"
                  className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-stone-900 flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite ? 'fill-red-500 text-red-500' : 'text-stone-700'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Bottom Hero Info */}
            <div className="absolute bottom-5 left-5 z-10 text-white space-y-1">
              <span className={`text-xs uppercase font-extrabold px-3 py-1 rounded-full shadow-sm ${
                property.dealType === 'rent' ? 'bg-stone-900 text-white' : 'bg-emerald-700 text-white'
              }`}>
                {property.dealType === 'rent' ? 'В аренду' : 'На продажу'}
              </span>
              <div className="text-2xl sm:text-3xl font-black drop-shadow-md">
                {formattedPrice}
                {priceSubtitle && <span className="text-base font-normal opacity-85"> {priceSubtitle}</span>}
              </div>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-5 sm:p-6 space-y-6">
            
            {/* Title, Location & Rating */}
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                    {property.title}
                  </h1>
                  <div className="flex items-center gap-1.5 text-stone-500 text-xs sm:text-sm mt-1">
                    <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>{property.location.address}, {property.location.neighborhood}, {property.location.city}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl shrink-0">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-amber-900">{property.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Photos Strip Gallery */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-stone-900">Галерея фотографий</h3>
                <button
                  onClick={() => setShowGallery(true)}
                  className="text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors cursor-pointer"
                >
                  Смотреть все ({property.photos.length})
                </button>
              </div>

              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {property.photos.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActivePhotoIdx(idx)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden shrink-0 transition-all border-2 cursor-pointer ${
                      activePhotoIdx === idx
                        ? 'border-stone-900 ring-2 ring-stone-900/20 scale-105'
                        : 'border-transparent opacity-80 hover:opacity-100'
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
            </div>

            {/* Specs Grid */}
            <div className="space-y-2.5">
              <h3 className="font-bold text-sm text-stone-900">Параметры недвижимости</h3>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <div className="bg-white rounded-xl p-2.5 border border-stone-200 text-center">
                  <div className="flex items-center justify-center gap-1 text-stone-800 font-bold text-sm">
                    <Bed className="w-4 h-4 text-stone-500" />
                    <span>{property.specs.bedrooms}</span>
                  </div>
                  <span className="text-[10px] text-stone-500 mt-0.5 block">Спален</span>
                </div>

                <div className="bg-white rounded-xl p-2.5 border border-stone-200 text-center">
                  <div className="flex items-center justify-center gap-1 text-stone-800 font-bold text-sm">
                    <Bath className="w-4 h-4 text-stone-500" />
                    <span>{property.specs.bathrooms}</span>
                  </div>
                  <span className="text-[10px] text-stone-500 mt-0.5 block">Санузлов</span>
                </div>

                <div className="bg-white rounded-xl p-2.5 border border-stone-200 text-center">
                  <div className="flex items-center justify-center gap-1 text-stone-800 font-bold text-sm">
                    <Maximize2 className="w-4 h-4 text-stone-500" />
                    <span>{property.specs.areaSqFt}</span>
                  </div>
                  <span className="text-[10px] text-stone-500 mt-0.5 block">Площадь (м²)</span>
                </div>

                <div className="bg-white rounded-xl p-2.5 border border-stone-200 text-center">
                  <div className="flex items-center justify-center gap-1 text-stone-800 font-bold text-sm">
                    <Layers className="w-4 h-4 text-stone-500" />
                    <span>{property.specs.floor || 1}/{property.specs.totalFloors || 9}</span>
                  </div>
                  <span className="text-[10px] text-stone-500 mt-0.5 block">Этаж</span>
                </div>

                <div className="bg-white rounded-xl p-2.5 border border-stone-200 text-center">
                  <div className="flex items-center justify-center gap-1 text-stone-800 font-bold text-sm">
                    <Calendar className="w-4 h-4 text-stone-500" />
                    <span>{property.specs.builtYear}</span>
                  </div>
                  <span className="text-[10px] text-stone-500 mt-0.5 block">Год постройки</span>
                </div>

                <div className="bg-white rounded-xl p-2.5 border border-stone-200 text-center">
                  <div className="flex items-center justify-center gap-1 text-stone-800 font-bold text-sm">
                    <Car className="w-4 h-4 text-stone-500" />
                    <span>{property.specs.parkingSpaces}</span>
                  </div>
                  <span className="text-[10px] text-stone-500 mt-0.5 block">Паркомест</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h3 className="font-bold text-sm text-stone-900">Описание</h3>
              <p className={`text-stone-600 text-xs sm:text-sm leading-relaxed ${!isDescExpanded ? 'line-clamp-3' : ''}`}>
                {property.description}
              </p>
              <button
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className="text-xs font-bold text-stone-900 hover:underline cursor-pointer"
              >
                {isDescExpanded ? 'Свернуть' : 'Читать полностью'}
              </button>
            </div>

            {/* Amenities list */}
            {property.amenities && property.amenities.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-bold text-sm text-stone-900">Удобства</h3>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((item, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs font-medium text-stone-700"
                    >
                      ✓ {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Agent / Owner Contact */}
            <div className="bg-white rounded-2xl p-4 border border-stone-200 flex items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3">
                <img
                  src={property.agent.avatar}
                  alt={property.agent.name}
                  className="w-12 h-12 rounded-xl object-cover border border-stone-200"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900">{property.agent.name}</h4>
                    {property.agent.verified && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500">{property.agent.role}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${property.agent.phone}`}
                  className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 flex items-center gap-1 text-xs font-bold transition-colors cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">{property.agent.phone}</span>
                </a>

                <button
                  onClick={() => onContactAgent(property)}
                  className="p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white flex items-center gap-1 text-xs font-bold transition-colors shadow-sm cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Написать</span>
                </button>
              </div>
            </div>

            {/* Public Facilities */}
            {property.facilities && property.facilities.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="font-bold text-sm text-stone-900">Инфраструктура поблизости</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {property.facilities.map((fac, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl p-2.5 border border-stone-200 flex items-center gap-2.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center shrink-0">
                        {getFacilityIcon(fac.type)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-stone-900 truncate">{fac.name}</p>
                        <p className="text-[10px] text-stone-500 truncate">{fac.distance}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Map Preview */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-stone-900">Расположение на карте Узбекистана</h3>
                <button
                  onClick={() => onOpenMap(property)}
                  className="text-xs font-semibold text-stone-900 underline cursor-pointer"
                >
                  Открыть на общей карте
                </button>
              </div>

              <div className="h-[220px] rounded-2xl overflow-hidden border border-stone-200 shadow-sm relative">
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-stone-900">
                  Отзывы ({property.reviewsCount || property.reviews.length})
                </h3>
              </div>

              <div className="space-y-2.5">
                {property.reviews.slice(0, showAllReviews ? undefined : 2).map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white rounded-xl p-3.5 border border-stone-200 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={rev.avatar}
                          alt={rev.userName}
                          className="w-8 h-8 rounded-full object-cover border border-stone-200"
                        />
                        <div>
                          <h5 className="font-bold text-xs text-stone-900">{rev.userName}</h5>
                          <p className="text-[10px] text-stone-500">{rev.userRole} • {rev.date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-amber-600 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{rev.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-stone-600 italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}

                {/* Add Review */}
                {!showReviewInput ? (
                  <button
                    onClick={() => setShowReviewInput(true)}
                    className="w-full py-2.5 rounded-xl border border-dashed border-stone-300 text-stone-600 text-xs font-medium hover:bg-stone-100 transition-colors cursor-pointer"
                  >
                    + Оставить отзыв об объекте
                  </button>
                ) : (
                  <form onSubmit={handleSubmitReview} className="bg-white rounded-2xl p-4 border border-stone-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900">Ваш отзыв</span>
                      <button
                        type="button"
                        onClick={() => setShowReviewInput(false)}
                        className="text-stone-400 hover:text-stone-600 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <input
                      type="text"
                      placeholder="Ваше имя"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 focus:outline-none"
                    />

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stone-500">Оценка:</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setNewRating(s)}
                            className="p-1 text-stone-300 hover:text-amber-400 cursor-pointer"
                          >
                            <Star className={`w-4 h-4 ${s <= newRating ? 'fill-amber-400 text-amber-400' : ''}`} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <textarea
                      placeholder="Поделитесь впечатлением о состоянии квартиры, районе, чистоте..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={2}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-stone-200 focus:outline-none resize-none"
                    />

                    <button
                      type="submit"
                      className="w-full py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Отправить отзыв
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Sticky Fixed Bottom Bar */}
        <div className="absolute bottom-0 inset-x-0 bg-white/95 backdrop-blur-md p-4 border-t border-stone-200 flex items-center justify-between gap-4 z-20">
          <div className="min-w-0">
            <span className="text-[10px] text-stone-500 uppercase tracking-wider block font-bold">Стоимость</span>
            <div className="text-lg font-black text-stone-900 truncate">
              {formattedPrice}
              {priceSubtitle && <span className="text-xs font-normal text-stone-500"> {priceSubtitle}</span>}
            </div>
          </div>

          <button
            id="book-property-btn"
            onClick={() => onBookNow(property)}
            className="flex-1 max-w-[260px] py-3 px-6 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 text-center flex items-center justify-center gap-2 cursor-pointer"
          >
            Забронировать просмотр
          </button>
        </div>

        {/* Lightbox Gallery */}
        {showGallery && (
          <div className="fixed inset-0 z-60 bg-black/95 p-4 flex flex-col justify-between">
            <div className="flex items-center justify-between text-white pb-4">
              <span className="text-sm font-semibold">{activePhotoIdx + 1} / {property.photos.length}</span>
              <button
                onClick={() => setShowGallery(false)}
                className="w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <img
                src={property.photos[activePhotoIdx]}
                alt={property.title}
                className="max-w-full max-h-[75vh] object-contain rounded-xl"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex items-center justify-center gap-2 overflow-x-auto py-4">
              {property.photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhotoIdx(i)}
                  className={`w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 cursor-pointer ${
                    activePhotoIdx === i ? 'border-white' : 'border-transparent opacity-50'
                  }`}
                >
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
