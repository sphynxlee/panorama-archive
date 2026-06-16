import { Link, useParams, useSearchParams } from "react-router-dom";
import { useMemo } from "react";
import { usePhotos } from "../hooks/usePhotos";
import { usePhotoText } from "../hooks/usePhotoText";
import { useLanguage } from "../i18n/LanguageProvider";
import PhotoCard from "../components/PhotoCard";
import Pagination from "../components/Pagination";
import PageShell from "../components/PageShell";
import { useScrollToTopWhenReady } from "../hooks/useScrollToTopWhenReady";
import { paginate, parsePageParam } from "../utils/pagination";
import "./GalleryPage.css";

export default function RegionPage() {
  const { key } = useParams<{ key: string }>();
  const [searchParams] = useSearchParams();
  const page = parsePageParam(searchParams.get("page"));

  const { photos, regions, loading, error } = usePhotos();
  const { t } = useLanguage();
  const { regionName, regionDesc } = usePhotoText();

  const region = key ? regions[key] : undefined;

  const filtered = useMemo(
    () => (key ? photos.filter((p) => p.regionKey === key) : []),
    [photos, key]
  );

  const paged = useMemo(() => paginate(filtered, page), [filtered, page]);

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

  if (!region) {
    return (
      <PageShell>
        <div className="page-state">
          <h1>{t("photoNotFound")}</h1>
          <Link to="/">{t("backToGallery")}</Link>
        </div>
      </PageShell>
    );
  }

  const basePath = `/region/${key}`;

  return (
    <PageShell>
      <section className="gallery-hero">
        <p className="region-eyebrow">{t("regionBrowse")}</p>
        <h1>{regionName(region)}</h1>
        <p>{regionDesc(region)}</p>
        <p className="region-count">{t("regionPhotoCount", { count: filtered.length })}</p>
      </section>

      <div className="photo-grid">
        {paged.items.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} />
        ))}
      </div>

      <Pagination basePath={basePath} page={paged.page} totalPages={paged.totalPages} />

      <p className="search-back">
        <Link to="/">{t("backToGallery")}</Link>
      </p>
    </PageShell>
  );
}
