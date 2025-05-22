// types/Restaurant.ts

export type Restaurant = {
  place_id: string;
  name: string;
  rating?: number;
  user_ratings_total?: number;
  vicinity?: string; // Address
  address?: string;  // Alternative address (sometimes used)
  types?: string[];
  photos?: { photo_reference: string }[];
  image?: string; // Custom/fallback image URL (not from Google)
  cuisine?: string; // Inferred or provided cuisine type
  price_level?: number; // 0 = free, 1 = cheap, 2 = moderate, 3 = expensive, 4 = very expensive
  priceRange?: string; // "$$", "$$$", etc. (optional for UI display)
  menu?: string; // Direct menu URL (if available)
  website?: string; // Website URL (if available)
  opening_hours?: {
    open_now?: boolean;
    weekday_text?: string[];
  };
  geometry?: {
    location: {
      lat: number;
      lng: number;
    };
  };
  // Add more fields as your UI needs!
};
