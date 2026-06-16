import { usePhotos } from "../hooks/usePhotos";
import { useLanguage } from "../i18n/LanguageProvider";
import PhotoMap from "../components/PhotoMap";
import "./MapPage.css";

export default function MapPage() {
  const { mappable, loading, error } = usePhotos();
  const { t } = useLanguage();

  if (loading) return <div className="page-state">{t("loadingMap")}</div>;
  if (error) return <div className="page-state error">{error || t("loadError")}</div>;

  return (
    <main className="map-page">
      <div className="map-page-header">
        <h1>{t("mapTitle")}</h1>
        <p>{t("mapDesc")}</p>
      </div>
      <PhotoMap
        photos={mappable}
        height="calc(100vh - 56px - 88px)"
        showPopups
        useThumbnails
        zoom={5}
      />
    </main>
  );
}
