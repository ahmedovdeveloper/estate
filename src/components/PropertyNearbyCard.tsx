import React from 'react';
import { Heart, MapPin, Bed, Bath } from 'lucide-react';
import { Property } from '../types';

interface PropertyNearbyCardProps {
  property: Property;
  onClick: () => void;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

export const PropertyNearbyCard: React.FC<PropertyNearbyCardProps> = ({
  property,
  onClick,
  isFavorite,
  onToggleFavorite
}) => {
  const formattedPrice = `${property.currency}${property.price.toLocaleString()}`;
  const priceSubtitle = property.dealType === 'rent' ? (property.pricePeriod || '/mo') : '';

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl p-3 border border-stone-200/80 hover:border-stone-400/80 shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-between gap-3.5"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Thumbnail */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-stone-100 relative">
          <img
            src={property.photos[0]}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            referrerPolicy="no-referrer"
            loading="lazy"
          />
          <div className="absolute top-1 left-1 bg-stone-900/80 text-[8px] font-bold uppercase tracking-wider text-white px-1.5 py-0.5 rounded">
            {property.dealType === 'rent' ? 'Аренда' : 'Продажа'}
          </div>
        </div>

        {/* Info */}
        <div className="min-w-0 space-y-0.5">
          <h4 className="font-bold text-sm text-stone-900 truncate group-hover:text-stone-700">
            {property.title}
          </h4>

          <div className="flex items-center gap-1 text-stone-500 text-xs truncate">
            <MapPin className="w-3 h-3 shrink-0 text-stone-400" />
            <span className="truncate">{property.location.neighborhood}, {property.location.city}</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-stone-600 pt-0.5">
            <span className="font-bold text-stone-900">
              {formattedPrice}
              {priceSubtitle && <span className="text-[10px] text-stone-500 font-normal"> {priceSubtitle}</span>}
            </span>
            <span className="text-stone-300">•</span>
            <div className="flex items-center gap-1.5 text-stone-500">
              <span className="flex items-center gap-0.5"><Bed className="w-3 h-3" /> {property.specs.bedrooms} комн</span>
              <span className="flex items-center gap-0.5"><Bath className="w-3 h-3" /> {property.specs.bathrooms} с/у</span>
            </div>
          </div>
        </div>
      </div>

      {/* Heart Icon */}
      <button
        onClick={onToggleFavorite}
        aria-label="Сохранить объект"
        className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 shrink-0 transition-colors"
      >
        <Heart
          className={`w-4 h-4 transition-transform active:scale-125 ${
            isFavorite ? 'fill-red-500 text-red-500' : 'text-stone-400 hover:text-stone-700'
          }`}
        />
      </button>
    </div>
  );
};
