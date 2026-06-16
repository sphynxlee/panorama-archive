import type { Photo } from "../types";

export function getFeaturedPhoto(photos: Photo[]): Photo | null {
  if (!photos.length) return null;
  const start = new Date(new Date().getFullYear(), 0, 0);
  const dayOfYear = Math.floor((Date.now() - start.getTime()) / 86400000);
  return photos[dayOfYear % photos.length] ?? null;
}

export function pickRandomFeaturedPhoto(
  photos: Photo[],
  exclude?: Photo | null
): Photo | null {
  if (!photos.length) return null;
  if (photos.length === 1) return photos[0];

  const pool = exclude ? photos.filter((p) => p.id !== exclude.id) : photos;
  if (!pool.length) return photos[0];

  return pool[Math.floor(Math.random() * pool.length)] ?? photos[0];
}

export function searchPhotos(
  photos: Photo[],
  query: string,
  getTitle: (p: Photo) => string,
  getRegion: (p: Photo) => string
): Photo[] {
  const q = query.trim().toLowerCase();
  if (!q) return photos;
  return photos.filter((p) => {
    const title = getTitle(p).toLowerCase();
    const region = getRegion(p).toLowerCase();
    const slug = (p.slug ?? "").toLowerCase();
    return title.includes(q) || region.includes(q) || slug.includes(q);
  });
}
