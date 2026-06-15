import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { usePhotos } from "../hooks/usePhotos";
import { usePhotoText } from "../hooks/usePhotoText";
import { useLanguage } from "../i18n/LanguageProvider";
import PhotoCard from "../components/PhotoCard";
import "./GalleryPage.css";

export default function GalleryPage() {
  const { photos, regions, loading, error } = usePhotos();
  const { t } = useLanguage();
  const { regionName } = usePhotoText();
  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    if (filter === "all") return photos;
    return photos.filter((p) => p.regionKey === filter);
  }, [photos, filter]);

  if (loading) return <div className="page-state">{t("loadingPhotos")}</div>;
  if (error) return <div className="page-state error">{error || t("loadError")}</div>;

  return (
    <main className="gallery-page">
      <section className="gallery-hero">
        <h1>{t("galleryTitle")}</h1>
        <p>{t("galleryDesc")}</p>
      </section>

      <aside className="mission-banner">
        <p>{t("galleryMission")}</p>
        <Link to="/about">{t("galleryReadStory")}</Link>
      </aside>

      <div className="filter-bar">
        <button
          type="button"
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          {t("filterAll")} ({photos.length})
        </button>
        {Object.entries(regions).map(([key, region]) => {
          const count = photos.filter((p) => p.regionKey === key).length;
          return (
            <button
              key={key}
              type="button"
              className={filter === key ? "active" : ""}
              onClick={() => setFilter(key)}
            >
              {regionName(region)} ({count})
            </button>
          );
        })}
      </div>

      <div className="photo-grid">
        {filtered.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} />
        ))}
      </div>
    </main>
  );
}
