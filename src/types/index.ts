export type Locale = "en" | "zh";

export type LocalizedText = {
  en: string;
  zh: string;
};

export type PhotoSource = "official" | "community";

export type Coords = {
  lat: string;
  lng: string;
};

export type Photo = {
  id: number;
  slug: string;
  src: string;
  source?: PhotoSource;
  regionKey: string;
  region: LocalizedText;
  regionDesc: LocalizedText;
  title: LocalizedText;
  coords: Coords | null;
  lat: number | null;
  lng: number | null;
  photographerPortrait?: boolean;
  annotation?: LocalizedText;
  authorName?: string;
};

export type PhotoWithDistance = Photo & { distance: number };

export type Region = {
  key: string;
  name: LocalizedText;
  desc: LocalizedText;
};

export type PhotosData = {
  generatedAt: string;
  total: number;
  regions: Record<string, Region>;
  photos: Photo[];
};

export type RegionsMap = Record<string, Region>;
