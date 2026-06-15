import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { usePhotos } from "../hooks/usePhotos";
import { usePhotoText } from "../hooks/usePhotoText";
import { useLanguage } from "../i18n/LanguageProvider";
import { getLocalizedText } from "../i18n/messages";
import PhotoMap from "../components/PhotoMap";
import WatermarkedPhoto from "../components/WatermarkedPhoto";
import {
  encodeSrc,
  formatDecimal,
  formatDms,
  getNearbyPhotos,
  googleMapsUrl,
  osmUrl,
} from "../utils/geo";
import { downloadWatermarkedPhoto, getWatermarkText } from "../utils/watermark";
import "./PhotoDetailPage.css";

export default function PhotoDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { photos, photoById, loading, error } = usePhotos();
  const { t, locale } = useLanguage();
  const { photoTitle, photoRegion, photoRegionDesc } = usePhotoText();
  const [downloading, setDownloading] = useState(false);

  const photoId = Number(id);
  const photo = photoById.get(photoId);
  const index = photos.findIndex((p) => p.id === photoId);
  const prev = index > 0 ? photos[index - 1] : null;
  const next = index >= 0 && index < photos.length - 1 ? photos[index + 1] : null;
  const nearby = photo ? getNearbyPhotos(photos, photo) : [];
  const title = photo ? photoTitle(photo) : "";

  async function handleDownload() {
    if (!photo || downloading) return;
    setDownloading(true);
    try {
      await downloadWatermarkedPhoto(
        photo.src,
        `${photo.slug}.jpg`,
        getWatermarkText(locale)
      );
    } catch {
      window.alert(t("downloadFailed"));
    } finally {
      setDownloading(false);
    }
  }

  if (loading) return <div className="page-state">{t("loadingPhoto")}</div>;
  if (error) return <div className="page-state error">{error || t("loadError")}</div>;

  if (!photo) {
    return (
      <main className="detail-page">
        <div className="detail-not-found">
          <h1>{t("photoNotFound")}</h1>
          <Link to="/">{t("backToGallery")}</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="detail-page">
      <div className="detail-toolbar">
        <button type="button" onClick={() => navigate(-1)}>
          {t("back")}
        </button>
        <div className="detail-nav">
          {prev && (
            <Link to={`/photo/${prev.id}`} className="nav-link">
              {t("previous")}
            </Link>
          )}
          <span className="counter">
            {index + 1} / {photos.length}
          </span>
          {next && (
            <Link to={`/photo/${next.id}`} className="nav-link">
              {t("next")}
            </Link>
          )}
        </div>
      </div>

      <div className="detail-layout">
        <section className="detail-photo-panel">
          <WatermarkedPhoto
            src={photo.src}
            alt={title}
            className="detail-watermarked-photo"
          />
        </section>

        <aside className="detail-info-panel">
          <div className="info-card">
            <h1>{title}</h1>
            {photo.photographerPortrait && (
              <span className="photographer-badge">{t("photoPhotographerBadge")}</span>
            )}
            <p className="region">{photoRegion(photo)}</p>
            <p className="region-desc">{photoRegionDesc(photo)}</p>

            <button
              type="button"
              className="download-btn"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? t("downloadingPhoto") : t("downloadPhoto")}
            </button>

            {photo.annotation && (
              <div className="photo-annotation">
                <h2>{t("photoAnnotationLabel")}</h2>
                <p>{getLocalizedText(photo.annotation, locale)}</p>
              </div>
            )}

            <div className="location-block">
              <h2>{t("location")}</h2>
              <dl>
                <div>
                  <dt>{t("coordsDms")}</dt>
                  <dd>{formatDms(photo.coords, locale)}</dd>
                </div>
                {photo.lat != null && photo.lng != null && (
                  <>
                    <div>
                      <dt>{t("coordsDecimal")}</dt>
                      <dd>{formatDecimal(photo.lat, photo.lng, locale)}</dd>
                    </div>
                    <div>
                      <dt>{t("latitude")}</dt>
                      <dd>
                        {photo.lat.toFixed(6)}° {t("north")}
                      </dd>
                    </div>
                    <div>
                      <dt>{t("longitude")}</dt>
                      <dd>
                        {photo.lng.toFixed(6)}° {t("east")}
                      </dd>
                    </div>
                  </>
                )}
              </dl>

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
              <PhotoMap photos={[photo]} activePhoto={photo} height={240} zoom={10} />
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
    </main>
  );
}
