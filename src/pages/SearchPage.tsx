import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePhotos } from "../hooks/usePhotos";
import { usePhotoText } from "../hooks/usePhotoText";
import { useLanguage } from "../i18n/LanguageProvider";
import PhotoCard from "../components/PhotoCard";
import { searchPhotos } from "../utils/photos";
import "./GalleryPage.css";

export default function SearchPage() {
  const [params] = useSearchParams();
  const query = params.get("q") ?? "";
  const { photos, loading, error } = usePhotos();
  const { t } = useLanguage();
  const { photoTitle, photoRegion } = usePhotoText();

  const results = useMemo(
    () => searchPhotos(photos, query, photoTitle, photoRegion),
    [photos, query, photoTitle, photoRegion]
  );

  if (loading) return <div className="page-state">{t("loadingPhotos")}</div>;
  if (error) return <div className="page-state error">{error || t("loadError")}</div>;

  return (
    <main className="gallery-page">
      <section className="gallery-hero">
        <h1>{t("searchTitle")}</h1>
        {!query.trim() ? (
          <p>{t("searchNoQuery")}</p>
        ) : (
          <p>{t("searchResults", { count: results.length, query })}</p>
        )}
      </section>

      {query.trim() && results.length === 0 ? (
        <p className="page-state">{t("searchEmpty")}</p>
      ) : (
        <div className="photo-grid">
          {results.map((photo) => (
            <PhotoCard key={photo.id} photo={photo} />
          ))}
        </div>
      )}

      <p className="search-back">
        <Link to="/">{t("backToGallery")}</Link>
      </p>
    </main>
  );
}
