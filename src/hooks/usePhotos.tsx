import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Photo, PhotosData, Region } from "../types";

type PhotosContextValue = {
  loading: boolean;
  error: string | null;
  photos: Photo[];
  photoById: Map<number, Photo>;
  mappable: Photo[];
  regions: Record<string, Region>;
  total: number;
};

const PhotosContext = createContext<PhotosContextValue | null>(null);

export function PhotosProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PhotosData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/photos.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load photos.json");
        return res.json() as Promise<PhotosData>;
      })
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => {
    const photos = data?.photos ?? [];
    const photoById = new Map(photos.map((p) => [p.id, p]));
    const mappable = photos.filter((p) => p.lat != null && p.lng != null);
    return {
      loading,
      error,
      photos,
      photoById,
      mappable,
      regions: data?.regions ?? {},
      total: data?.total ?? 0,
    };
  }, [data, loading, error]);

  return (
    <PhotosContext.Provider value={value}>{children}</PhotosContext.Provider>
  );
}

export function usePhotos() {
  const ctx = useContext(PhotosContext);
  if (!ctx) throw new Error("usePhotos must be used within PhotosProvider");
  return ctx;
}
