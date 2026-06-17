import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { usePhotos } from "../hooks/usePhotos";
import { usePhotoText } from "../hooks/usePhotoText";
import { useLanguage } from "../i18n/LanguageProvider";
import { getLocalizedText } from "../i18n/messages";
import PhotoMap from "../components/PhotoMap";
import WatermarkedPhoto from "../components/WatermarkedPhoto";
import PhotoLightbox from "../components/PhotoLightbox";
import { PhotoSourceLine } from "../components/SourceBadge";
import PageShell from "../components/PageShell";
import { useScrollToTopWhenReady } from "../hooks/useScrollToTopWhenReady";
import {
  encodeSrc,
  getNearbyPhotos,
  googleMapsUrl,
  osmUrl,
} from "../utils/geo";
import "./PhotoDetailPage.css";

export default function PhotoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { photos, photoById, loading, error } = usePhotos();
  const { t, locale } = useLanguage();
  const { photoTitle, photoRegion, photoRegionDesc } = usePhotoText();
  const [viewerOpen, setViewerOpen] = useState(false);

  const photoId = Number(id);
  const photo = photoById.get(photoId);
  const index = photos.findIndex((p) => p.id === photoId);
  const prev = index > 0 ? photos[index - 1] : null;
  const next = index >= 0 && index < photos.length - 1 ? photos[index + 1] : null;
  const nearby = photo ? getNearbyPhotos(photos, photo) : [];
  const title = photo ? photoTitle(photo) : "";

  useScrollToTopWhenReady(!loading);

  if (loading) {
    return (
      <PageShell>
        <div className="page-state">{t("loadingPhoto")}</div>
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

  if (!photo) {
    return (
      <PageShell>
        <div className="page-state">
          <h1>{t("photoNotFound")}</h1>
          <Link to="/">{t("backToGallery")}</Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell cardClassName="detail-page-card">
      <div className="detail-toolbar">
        <button type="button" className="toolbar-back" onClick={() => navigate(-1)}>
          {t("back")}
        </button>
        <span className="counter">
          {index + 1} / {photos.length}
        </span>
        <div className="detail-nav">
          {prev ? (
            <Link to={`/photo/${prev.id}`} className="nav-arrow" aria-label={t("previous")}>
              ‹
            </Link>
          ) : (
            <span className="nav-arrow disabled" aria-hidden="true">
              ‹
            </span>
          )}
          {next ? (
            <Link to={`/photo/${next.id}`} className="nav-arrow" aria-label={t("next")}>
              ›
            </Link>
          ) : (
            <span className="nav-arrow disabled" aria-hidden="true">
              ›
            </span>
          )}
        </div>
      </div>

      <div className="detail-layout">
        <section className="detail-photo-panel">
          <button
            type="button"
            className="detail-photo-trigger"
            onClick={() => setViewerOpen(true)}
            aria-label={t("photoZoomHint")}
          >
            <WatermarkedPhoto
              src={photo.src}
              alt={title}
              className="detail-watermarked-photo"
            />
            <span className="detail-zoom-hint">
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </span>
          </button>
        </section>

        <aside className="detail-info-panel">
          <div className="info-card">
            <h1>{title}</h1>
            <PhotoSourceLine photo={photo} />
            {photo.photographerPortrait && (
              <span className="photographer-badge">{t("photoPhotographerBadge")}</span>
            )}
            <p className="region">{photoRegion(photo)}</p>
            <p className="region-desc">{photoRegionDesc(photo)}</p>

            {photo.annotation && (
              <div className="photo-annotation">
                <h2>{t("photoAnnotationLabel")}</h2>
                <p>{getLocalizedText(photo.annotation, locale)}</p>
              </div>
            )}

            <div className="location-block">
              <h2>{t("location")}</h2>
              {photo.lat != null && photo.lng != null && (
                <dl>
                  <div>
                    <dt>
                      {t("latitude")}, {t("longitude")}
                    </dt>
                    <dd>
                      {photo.lat.toFixed(6)}, {photo.lng.toFixed(6)}
                    </dd>
                  </div>
                </dl>
              )}

              {photo.lat != null && photo.lng != null && (
                <div className="map-links">
                  <a href={googleMapsUrl(photo.lat, photo.lng)} target="_blank" rel="noreferrer">
                    {t("viewGoogleMaps")}
                  </a>
                  <a href={osmUrl(photo.lat, photo.lng)} target="_blank" rel="noreferrer">
                    {t("viewOsm")}
                  </a>
                </div>
              )}
            </div>

            <div className="map-block">
              <h2>{t("map")}</h2>
              <Link
                to={`/map?focus=${photo.id}`}
                className="map-preview-link"
                aria-label={t("mapOpenFull")}
              >
                <PhotoMap
                  photos={[photo]}
                  activePhoto={photo}
                  height={240}
                  zoom={10}
                  interactive={false}
                />
                <span className="map-expand-hint" aria-hidden="true">
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {nearby.length > 0 && (
        <section className="nearby-section">
          <h2>{t("nearbyPhotos")}</h2>
          <div className="nearby-grid">
            {nearby.map((item) => (
              <Link key={item.id} to={`/photo/${item.id}`} className="nearby-card">
                <img src={encodeSrc(item.src)} alt={photoTitle(item)} loading="lazy" />
                <div>
                  <strong>{photoTitle(item)}</strong>
                  <span>{t("kmAway", { distance: item.distance.toFixed(1) })}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {viewerOpen && (
        <PhotoLightbox src={photo.src} alt={title} onClose={() => setViewerOpen(false)} />
      )}
    </PageShell>
  );
}
