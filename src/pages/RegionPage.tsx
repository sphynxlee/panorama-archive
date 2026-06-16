import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import { usePhotos } from "../hooks/usePhotos";
import { usePhotoText } from "../hooks/usePhotoText";
import { useLanguage } from "../i18n/LanguageProvider";
import PhotoCard from "../components/PhotoCard";
import "./GalleryPage.css";

export default function RegionPage() {
  const { key } = useParams<{ key: string }>();
  const { photos, regions, loading, error } = usePhotos();
  const { t } = useLanguage();
  const { regionName, regionDesc } = usePhotoText();

  const region = key ? regions[key] : undefined;

  const filtered = useMemo(
    () => (key ? photos.filter((p) => p.regionKey === key) : []),
    [photos, key]
  );

  if (loading) return <div className="page-state">{t("loadingPhotos")}</div>;
  if (error) return <div className="page-state error">{error || t("loadError")}</div>;

  if (!region) {
    return (
      <main className="gallery-page">
        <div className="page-state">
          <h1>{t("photoNotFound")}</h1>
          <Link to="/">{t("backToGallery")}</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="gallery-page">
      <section className="gallery-hero">
        <p className="region-eyebrow">{t("regionBrowse")}</p>
        <h1>{regionName(region)}</h1>
        <p>{regionDesc(region)}</p>
        <p className="region-count">{t("regionPhotoCount", { count: filtered.length })}</p>
      </section>

      <div className="photo-grid">
        {filtered.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} />
        ))}
      </div>

      <p className="search-back">
        <Link to="/">{t("backToGallery")}</Link>
      </p>
    </main>
  );
}
