import { createContext, useContext, useEffect, useMemo, useState } from "react";

const PhotosContext = createContext(null);

export function PhotosProvider({ children }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/photos.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load photos.json");
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err.message))
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
