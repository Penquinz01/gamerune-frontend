export interface Game {
  id: string;
  name: string;
  imageUrl?: string;
}

export interface SteamPrice {
  currency?: string;
  initial?: number;
  final?: number;
  discount_percent?: number;
  initial_formatted?: string;
  final_formatted?: string;
}

export interface GameDetail extends Game {
  description?: string;
  released?: string;
  rating?: number;
  steamAppId?: number;
  steamPrice?: SteamPrice;
  extraImageUrls: string[];
}
