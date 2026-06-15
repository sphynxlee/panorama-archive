export function encodeSrc(src) {
  return `/${src.split("/").map(encodeURIComponent).join("/")}`;
}

export function formatDms(coords, locale = "en") {
  if (!coords) {
    return locale === "zh" ? "坐标不可用" : "Coordinates unavailable";
  }
  if (locale === "zh") {
    return `${coords.lat} 北纬 · ${coords.lng} 东经`;
  }
  return `${coords.lat} N · ${coords.lng} E`;
}

export function formatDecimal(lat, lng, locale = "en") {
  if (lat == null || lng == null) return null;
  if (locale === "zh") {
    return `${lat.toFixed(6)}° 北纬，${lng.toFixed(6)}° 东经`;
  }
  return `${lat.toFixed(6)}° N, ${lng.toFixed(6)}° E`;
}

export function googleMapsUrl(lat, lng) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function osmUrl(lat, lng) {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=12/${lat}/${lng}`;
}

export function haversineKm(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getNearbyPhotos(photos, current, limit = 6) {
  if (current.lat == null || current.lng == null) return [];

  return photos
    .filter((p) => p.id !== current.id && p.lat != null && p.lng != null)
    .map((p) => ({
      ...p,
      distance: haversineKm(current.lat, current.lng, p.lat, p.lng),
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
}
