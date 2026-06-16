import type { Coords, Locale, Photo, PhotoWithDistance } from "../types";

export function encodeSrc(src: string | undefined): string {
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;

  const cdn = import.meta.env.VITE_PHOTO_CDN?.replace(/\/$/, "");
  if (cdn) {
    return `${cdn}/${src.split("/").map(encodeURIComponent).join("/")}`;
  }

  const localSrc = src.startsWith("official/")
    ? src.replace(/^official\//, "photos/")
    : src;
  return `/${localSrc.split("/").map(encodeURIComponent).join("/")}`;
}

export function formatDms(coords: Coords | null | undefined, locale: Locale = "en"): string {
  if (!coords) {
    return locale === "zh" ? "坐标不可用" : "Coordinates unavailable";
  }
  if (locale === "zh") {
    return `${coords.lat} 北纬 · ${coords.lng} 东经`;
  }
  return `${coords.lat} N · ${coords.lng} E`;
}

export function formatDecimal(
  lat: number | null,
  lng: number | null,
  locale: Locale = "en"
): string | null {
  if (lat == null || lng == null) return null;
  if (locale === "zh") {
    return `${lat.toFixed(6)}° 北纬，${lng.toFixed(6)}° 东经`;
  }
  return `${lat.toFixed(6)}° N, ${lng.toFixed(6)}° E`;
}

export function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function osmUrl(lat: number, lng: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=12/${lat}/${lng}`;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getNearbyPhotos(
  photos: Photo[],
  current: Photo,
  limit = 6
): PhotoWithDistance[] {
  if (current.lat == null || current.lng == null) return [];

  return photos
    .filter((p) => p.id !== current.id && p.lat != null && p.lng != null)
    .map((p) => ({
      ...p,
      distance: haversineKm(current.lat!, current.lng!, p.lat!, p.lng!),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}
