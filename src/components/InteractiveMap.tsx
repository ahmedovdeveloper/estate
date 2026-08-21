import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Property } from '../types';
import { MapPin, Navigation, Plus, Minus } from 'lucide-react';

interface InteractiveMapProps {
  properties?: Property[];
  selectedProperty?: Property | null;
  onSelectProperty?: (property: Property) => void;
  center?: [number, number];
  zoom?: number;
  activeCity?: string;
  onSelectCity?: (city: string) => void;
  interactive?: boolean;
  pickerMode?: boolean;
  pickedLocation?: { lat: number; lng: number } | null;
  onPickLocation?: (lat: number, lng: number) => void;
  className?: string;
  showCityQuickJump?: boolean;
}

export const UZBEKISTAN_CITIES = [
  { id: 'all', name: 'Все города', coords: [41.3775, 64.5853] as [number, number], zoom: 6 },
  { id: 'Ташкент', name: 'Ташкент', coords: [41.311081, 69.240562] as [number, number], zoom: 12 },
  { id: 'Самарканд', name: 'Самарканд', coords: [39.6542, 66.9750] as [number, number], zoom: 13 },
  { id: 'Бухара', name: 'Бухара', coords: [39.7715, 64.4215] as [number, number], zoom: 13 }
];

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  properties = [],
  selectedProperty,
  onSelectProperty,
  center = [41.311081, 69.240562],
  zoom = 12,
  activeCity,
  onSelectCity,
  interactive = true,
  pickerMode = false,
  pickedLocation,
  onPickLocation,
  className = 'w-full h-full',
  showCityQuickJump = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [center[0], center[1]] as [number, number],
        zoom: zoom,
        zoomControl: false, // We add zoom control explicitly with custom position
        attributionControl: false,
        dragging: interactive,
        touchZoom: interactive,
        scrollWheelZoom: interactive,
        doubleClickZoom: interactive
      });

      // We use our custom React-based zoom buttons for consistent styling and positioning
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Handle map clicks in picker mode
      map.on('click', (e: L.LeafletMouseEvent) => {
        if (pickerMode && onPickLocation) {
          onPickLocation(e.latlng.lat, e.latlng.lng);
        }
      });
    }

    return () => {
      // Map cleanup on unmount
    };
  }, []);

  // Update map view if center/zoom changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(center, zoom, { animate: true });
    }
  }, [center[0], center[1], zoom]);

  // Handle Resize correctly with ResizeObserver
  useEffect(() => {
    if (!mapContainerRef.current) return;
    
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    });
    
    resizeObserver.observe(mapContainerRef.current);
    
    // Also trigger immediate multiple timeouts to ensure Leaflet renders tiles properly
    const t1 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);
    const t2 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 400);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  // Pan to selected property
  useEffect(() => {
    if (selectedProperty && mapInstanceRef.current && !pickerMode) {
      mapInstanceRef.current.flyTo(
        [selectedProperty.location.lat, selectedProperty.location.lng],
        14,
        { duration: 0.8 }
      );
    }
  }, [selectedProperty]);

  // Render property markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    if (pickerMode) return;

    properties.forEach((prop) => {
      const isSelected = selectedProperty?.id === prop.id;
      const formattedPrice = prop.price >= 100000 
        ? `${Math.round(prop.price / 1000)}k ${prop.currency}`
        : `${prop.price.toLocaleString()} ${prop.currency}`;

      // Custom sleek pill marker with price
      const customIcon = L.divIcon({
        className: 'custom-property-marker',
        html: `
          <div class="cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95 ${
            isSelected ? 'scale-110 z-50' : 'z-10'
          }" id="marker-${prop.id}">
            <div class="px-2.5 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 border border-white/90 ${
              isSelected
                ? 'bg-amber-600 text-white ring-4 ring-amber-500/30'
                : prop.dealType === 'rent'
                ? 'bg-stone-900 text-white hover:bg-amber-600'
                : 'bg-emerald-700 text-white hover:bg-amber-600'
            }">
              <span>${formattedPrice}</span>
              ${prop.dealType === 'rent' ? '<span class="text-[9px] opacity-80 font-normal">/мес</span>' : ''}
            </div>
            <div class="w-2 h-2 ${isSelected ? 'bg-amber-600' : prop.dealType === 'rent' ? 'bg-stone-900' : 'bg-emerald-700'} rotate-45 mx-auto -mt-1 shadow"></div>
          </div>
        `,
        iconSize: [95, 34],
        iconAnchor: [47, 17]
      });

      const marker = L.marker([prop.location.lat, prop.location.lng], { icon: customIcon });

      marker.on('click', () => {
        if (onSelectProperty) {
          onSelectProperty(prop);
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [properties, selectedProperty, pickerMode]);

  // Handle picker mode marker
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (pickerMarkerRef.current) {
      mapInstanceRef.current.removeLayer(pickerMarkerRef.current);
      pickerMarkerRef.current = null;
    }

    if (pickerMode && pickedLocation) {
      const pickerIcon = L.divIcon({
        className: 'custom-picker-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-9 h-9 rounded-full bg-amber-600 text-white shadow-2xl flex items-center justify-center text-sm font-bold animate-bounce border-2 border-white ring-4 ring-amber-500/30">
              📍
            </div>
            <div class="absolute -bottom-1 w-4 h-1.5 bg-black/40 rounded-full blur-[1px]"></div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36]
      });

      const marker = L.marker([pickedLocation.lat, pickedLocation.lng], {
        icon: pickerIcon,
        draggable: true
      });

      marker.on('dragend', (e: any) => {
        const newPos = e.target.getLatLng();
        if (onPickLocation) {
          onPickLocation(newPos.lat, newPos.lng);
        }
      });

      marker.addTo(mapInstanceRef.current);
      pickerMarkerRef.current = marker;
      mapInstanceRef.current.panTo([pickedLocation.lat, pickedLocation.lng]);
    }
  }, [pickerMode, pickedLocation]);

  // Fly to activeCity if changed
  useEffect(() => {
    if (!mapInstanceRef.current || !activeCity) return;
    const cityData = UZBEKISTAN_CITIES.find((c) => c.id === activeCity || c.name === activeCity);
    if (cityData) {
      mapInstanceRef.current.flyTo(cityData.coords, cityData.zoom, { duration: 1.2 });
    }
  }, [activeCity]);

  const handleFlyToCity = (coords: [number, number], targetZoom: number, cityId?: string) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(coords, targetZoom, { duration: 1.2 });
    }
    if (cityId && onSelectCity) {
      onSelectCity(cityId);
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`} id="uzbekistan-interactive-map-container">
      <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 1 }} />
      
      {/* Quick City Navigation Bar */}
      {showCityQuickJump && !pickerMode && (
        <div className="absolute top-3 left-3 z-[10] flex flex-wrap items-center gap-1.5 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-stone-200/80 shadow-md">
          <span className="text-[11px] font-semibold text-stone-500 px-2 flex items-center gap-1">
            <Navigation className="w-3 h-3 text-amber-600" /> Города:
          </span>
          {UZBEKISTAN_CITIES.map((city) => (
            <button
              key={city.name}
              id={`map-city-${city.name}`}
              onClick={() => handleFlyToCity(city.coords, city.zoom, city.id)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                activeCity === city.id || activeCity === city.name
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80'
              }`}
            >
              {city.name}
            </button>
          ))}
        </div>
      )}

      {pickerMode && (
        <div className="absolute top-3 left-3 right-3 z-[10] bg-stone-900/90 backdrop-blur-md text-white text-xs px-3.5 py-2.5 rounded-xl shadow-lg flex items-center justify-between pointer-events-none">
          <span className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" /> Нажмите на карту или перетащите маркер для выбора точного адреса объекта
          </span>
          <span className="font-mono text-[11px] text-amber-300">
            {pickedLocation ? `${pickedLocation.lat.toFixed(4)}, ${pickedLocation.lng.toFixed(4)}` : 'Точка не выбрана'}
          </span>
        </div>
      )}

      {/* Zoom In/Out Controls Right-Centered */}
      {interactive && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-[20] flex flex-col gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-2xl border border-stone-200/90 shadow-xl">
          <button
            id="map-zoom-in-btn"
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.zoomIn();
              }
            }}
            className="w-10 h-10 rounded-xl bg-white hover:bg-stone-100 text-stone-900 flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Приблизить"
            aria-label="Приблизить карту"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
          <div className="h-px bg-stone-200 mx-1" />
          <button
            id="map-zoom-out-btn"
            onClick={() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.zoomOut();
              }
            }}
            className="w-10 h-10 rounded-xl bg-white hover:bg-stone-100 text-stone-900 flex items-center justify-center transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Отдалить"
            aria-label="Отдалить карту"
          >
            <Minus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Map Legend */}
      {!pickerMode && (
        <div className="absolute bottom-3 left-3 z-[10] hidden sm:flex items-center gap-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-stone-200 text-[11px] font-medium text-stone-600 shadow-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-stone-900"></span> Аренда
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700"></span> Продажа
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600"></span> Выбрано
          </span>
        </div>
      )}
    </div>
  );
};
