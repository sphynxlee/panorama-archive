import { Link } from "react-router-dom";
import { useMemo } from "react";
import { usePhotos } from "../hooks/usePhotos";
import { usePhotoText } from "../hooks/usePhotoText";
import { useLanguage } from "../i18n/LanguageProvider";
import PhotoCard from "../components/PhotoCard";
import FeaturedPhoto from "../components/FeaturedPhoto";
import PageShell from "../components/PageShell";
import { useScrollToTopWhenReady } from "../hooks/useScrollToTopWhenReady";
import { HOME_REGION_PREVIEW } from "../utils/pagination";
import "./GalleryPage.css";

export default function GalleryPage() {
  const { photos, regions, loading, error } = usePhotos();
  const { t } = useLanguage();
  const { regionName } = usePhotoText();

  const photosByRegion = useMemo(() => {
    const map = new Map<string, typeof photos>();
    for (const [key] of Object.entries(regions)) {
      map.set(key, photos.filter((p) => p.regionKey === key));
    }
    return map;
  }, [photos, regions]);

  useScrollToTopWhenReady(!loading);

  if (loading) {
    return (
      <PageShell>
        <div className="page-state">{t("loadingPhotos")}</div>
      </PageShell>
    );
  }
  if (error) {
    return (
      <PageShell>
        <div className="page-state error">{error || t("loadError")}</div>
      </PageShell>
    );
  }

  return (
    <PageShell className="home-page">
      <section className="gallery-hero">
        <h1>{t("galleryTitle")}</h1>
        <p>{t("galleryDesc")}</p>
      </section>

      <FeaturedPhoto photos={photos} />

      <aside className="mission-banner">
        <p>{t("galleryMission")}</p>
        <Link to="/about">{t("galleryReadStory")}</Link>
      </aside>

      <nav className="filter-bar" aria-label={t("browseByRegion")}>
        <span className="filter-label">
          {t("filterAll")} ({photos.length})
        </span>
        {Object.entries(regions).map(([key, region]) => {
          const count = photosByRegion.get(key)?.length ?? 0;
          return (
            <Link key={key} to={`/region/${key}`} className="filter-link">
              {regionName(region)} ({count})
            </Link>
          );
        })}
      </nav>

      <section className="region-previews">
        <h2 className="region-previews-title">{t("browseByRegion")}</h2>

        {Object.entries(regions).map(([key, region]) => {
          const regionPhotos = photosByRegion.get(key) ?? [];
          if (regionPhotos.length === 0) return null;

          const preview = regionPhotos.slice(0, HOME_REGION_PREVIEW);

          return (
            <section key={key} className="region-preview-block">
              <div className="region-preview-header">
                <div>
                  <h3>{regionName(region)}</h3>
                  <p className="region-preview-count">
                    {t("regionPhotoCount", { count: regionPhotos.length })}
                  </p>
                </div>
                <Link to={`/region/${key}`} className="region-view-all">
                  {t("regionViewAll", { count: regionPhotos.length })}
                </Link>
              </div>

              <div className="photo-grid region-preview-grid">
                {preview.map((photo) => (
                  <PhotoCard key={photo.id} photo={photo} />
                ))}
              </div>
            </section>
          );
        })}
      </section>
    </PageShell>
  );
}
