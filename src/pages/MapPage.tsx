import { useSearchParams } from "react-router-dom";
import { usePhotos } from "../hooks/usePhotos";
import { useLanguage } from "../i18n/LanguageProvider";
import PhotoMap from "../components/PhotoMap";
import PageShell from "../components/PageShell";
import { useScrollToTopWhenReady } from "../hooks/useScrollToTopWhenReady";
import "./MapPage.css";

export default function MapPage() {
  const { mappable, loading, error } = usePhotos();
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();

  const focusId = Number(searchParams.get("focus"));
  const focusPhoto = mappable.find((p) => p.id === focusId) ?? null;

  useScrollToTopWhenReady(!loading);

  if (loading) {
    return (
      <PageShell>
        <div className="page-state">{t("loadingMap")}</div>
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
    <PageShell className="map-page">
      <section className="gallery-hero">
        <h1>{t("mapTitle")}</h1>
        <p>{t("mapDesc")}</p>
      </section>

      <div className="map-page-frame">
        <div className="map-page-canvas">
          <PhotoMap
            photos={mappable}
            activePhoto={focusPhoto}
            height="100%"
            showPopups
            showControls
            zoom={focusPhoto ? 13 : 5}
          />
        </div>
      </div>
    </PageShell>
  );
}
