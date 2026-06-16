import { Link } from "react-router-dom";
import { useMemo } from "react";
import { usePhotos } from "../hooks/usePhotos";
import { usePhotoText } from "../hooks/usePhotoText";
import { useLanguage } from "../i18n/LanguageProvider";
import PhotoCard from "../components/PhotoCard";
import FeaturedPhoto from "../components/FeaturedPhoto";
import { getFeaturedPhoto } from "../utils/photos";
import "./GalleryPage.css";

export default function GalleryPage() {
  const { photos, regions, loading, error } = usePhotos();
  const { t } = useLanguage();
  const { regionName } = usePhotoText();

  const featured = useMemo(() => getFeaturedPhoto(photos), [photos]);

  if (loading) return <div className="page-state">{t("loadingPhotos")}</div>;
  if (error) return <div className="page-state error">{error || t("loadError")}</div>;

  return (
    <main className="gallery-page">
      <section className="gallery-hero">
        <h1>{t("galleryTitle")}</h1>
        <p>{t("galleryDesc")}</p>
      </section>

      <FeaturedPhoto photo={featured} />

      <aside className="mission-banner">
        <p>{t("galleryMission")}</p>
        <Link to="/about">{t("galleryReadStory")}</Link>
      </aside>

      <div className="filter-bar">
        <span className="filter-label">{t("filterAll")} ({photos.length})</span>
        {Object.entries(regions).map(([key, region]) => {
          const count = photos.filter((p) => p.regionKey === key).length;
          return (
            <Link key={key} to={`/region/${key}`} className="filter-link">
              {regionName(region)} ({count})
            </Link>
          );
        })}
      </div>

      <div className="photo-grid">
        {photos.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} />
        ))}
      </div>
    </main>
  );
}
