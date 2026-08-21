import React from 'react';
import { Heart, Star, MapPin, Bed, Bath, Maximize2 } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
  isSelected?: boolean;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onClick,
  isFavorite,
  onToggleFavorite,
  isSelected = false
}) => {
  const formattedPrice = property.price >= 100000 
    ? `${(property.price / 1000).toLocaleString()}k ${property.currency}`
    : `${property.price.toLocaleString()} ${property.currency}`;

  const priceSubtitle = property.dealType === 'rent' ? (property.pricePeriod || '/ мес') : '';

  return (
    <div
      id={`property-card-${property.id}`}
      onClick={onClick}
      className={`group relative cursor-pointer rounded-2xl overflow-hidden bg-white border transition-all duration-300 transform hover:-translate-y-1 flex flex-col ${
        isSelected
          ? 'ring-2 ring-amber-600 border-amber-600 shadow-xl'
          : 'border-stone-200 hover:border-stone-300 hover:shadow-lg shadow-xs'
      }`}
    >
      {/* Image Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
        <img
          src={property.photos[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Ambient Top Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Deal Type Badge (Аренда / Продажа) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase tracking-wide shadow-sm ${
            property.dealType === 'rent'
              ? 'bg-stone-900 text-white'
              : 'bg-emerald-700 text-white'
          }`}>
            {property.dealType === 'rent' ? 'В аренду' : 'На продажу'}
          </span>
          {property.featured && (
            <span className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500 text-stone-950 uppercase shadow-sm">
              ТОП
            </span>
          )}
        </div>

        {/* Price Pill */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-stone-900 text-xs font-black px-3 py-1 rounded-xl shadow-md border border-white/60">
          <span>{formattedPrice}</span>
          {priceSubtitle && <span className="text-[10px] text-stone-500 font-normal ml-0.5">{priceSubtitle}</span>}
        </div>

        {/* Favorite Button */}
        <button
          id={`favorite-btn-${property.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(e);
          }}
          aria-label="В избранное"
          className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-800 backdrop-blur-md flex items-center justify-center transition-all shadow-md active:scale-125 cursor-pointer"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-stone-700'
            }`}
          />
        </button>

        {/* Rating */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md text-[11px] text-white font-bold">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span>{property.rating.toFixed(1)}</span>
          <span className="text-white/60 text-[10px]">({property.reviewsCount || 0})</span>
        </div>
      </div>

      {/* Card Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1">
          <div className="text-[11px] font-semibold text-amber-700 uppercase tracking-wide">
            {property.propertyType === 'apartment' ? 'Квартира' :
             property.propertyType === 'house' ? 'Дом / Коттедж' :
             property.propertyType === 'villa' ? 'Вилла' :
             property.propertyType === 'office' ? 'Офис' :
             property.propertyType === 'land' ? 'Земельный участок' : 'Коммерция'}
          </div>

          <h3 className="font-bold text-sm sm:text-base text-stone-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
            {property.title}
          </h3>

          <div className="flex items-center gap-1 text-stone-500 text-xs line-clamp-1">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>{property.location.neighborhood}, {property.location.city}</span>
          </div>
        </div>

        {/* Specs Pill Grid */}
        <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600 font-medium">
          <div className="flex items-center gap-1" title="Количество комнат">
            <Bed className="w-3.5 h-3.5 text-stone-400" />
            <span>{property.specs.bedrooms} комн.</span>
          </div>

          <div className="flex items-center gap-1" title="Санузлы">
            <Bath className="w-3.5 h-3.5 text-stone-400" />
            <span>{property.specs.bathrooms} с/у</span>
          </div>

          <div className="flex items-center gap-1" title="Площадь">
            <Maximize2 className="w-3.5 h-3.5 text-stone-400" />
            <span>{property.specs.areaSqFt} м²</span>
          </div>
        </div>
      </div>
    </div>
  );
};
