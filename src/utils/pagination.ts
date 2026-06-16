export const PHOTOS_PER_PAGE = 24;

export const HOME_REGION_PREVIEW = 4;

export function paginate<T>(items: T[], page: number, pageSize = PHOTOS_PER_PAGE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize),
    page: safePage,
    totalPages,
    total: items.length,
  };
}

export function parsePageParam(value: string | null): number {
  const n = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
}
