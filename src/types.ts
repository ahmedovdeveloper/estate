export type DealType = 'rent' | 'sale';

export type PropertyType = 'house' | 'apartment' | 'office' | 'villa' | 'land' | 'commercial';

export type UserRole = 'admin' | 'owner' | 'seeker';

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar: string;
  createdAt: string;
  savedPropertyIds?: string[];
  agencyName?: string;
}

export interface LocationInfo {
  address: string;
  neighborhood: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export interface PropertySpecs {
  bedrooms: number;
  bathrooms: number;
  areaSqFt: number; // in m² or sqft
  builtYear: number;
  livingRooms: number;
  parkingSpaces: number;
  floor?: number;
  totalFloors?: number;
}

export interface Facility {
  type: 'school' | 'hospital' | 'restaurant' | 'station' | 'bus' | 'temple' | 'park' | 'mall' | 'gym' | 'metro';
  name: string;
  distance: string;
}

export interface Agent {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  avatar: string;
  verified: boolean;
  rating: number;
  dealsCount: number;
}

export interface Review {
  id: string;
  userName: string;
  userRole: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  pricePeriod?: string; // e.g. "/ мес" or "" for sale
  currency: string; // e.g. "$", "сум", "€"
  dealType: DealType;
  propertyType: PropertyType;
  location: LocationInfo;
  rating: number;
  reviewsCount: number;
  photos: string[];
  featured: boolean;
  specs: PropertySpecs;
  facilities: Facility[];
  amenities: string[];
  agent: Agent;
  reviews: Review[];
  createdAt: string;
  ownerId?: string;
}

export interface FilterState {
  searchQuery: string;
  dealType: 'all' | DealType;
  propertyType: 'all' | PropertyType;
  minPrice: number;
  maxPrice: number;
  bedrooms: number | 'all';
  bathrooms: number | 'all';
  city: string;
  neighborhood: string;
  sortBy: 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'agent';
  text: string;
  timestamp: string;
  matchedPropertyIds?: string[];
}
