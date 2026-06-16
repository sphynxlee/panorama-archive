import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import type { Photo } from "../types";
import { usePhotoText } from "../hooks/usePhotoText";
import { useLanguage } from "../i18n/LanguageProvider";
import { encodeSrc } from "../utils/geo";
import "leaflet/dist/leaflet.css";
import "./PhotoMap.css";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type FitBoundsProps = {
  photos: Photo[];
  activePhoto: Photo | null;
};

function FitBounds({ photos, activePhoto }: FitBoundsProps) {
  const map = useMap();

  useEffect(() => {
    if (activePhoto?.lat != null && activePhoto?.lng != null) {
      map.setView([activePhoto.lat, activePhoto.lng], activePhoto ? 11 : map.getZoom(), {
        animate: true,
      });
      return;
    }

    const points: [number, number][] = photos
      .filter((p) => p.lat != null && p.lng != null)
      .map((p) => [p.lat!, p.lng!]);

    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 10);
      return;
    }
    map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
  }, [map, photos, activePhoto]);

  return null;
}

function createThumbIcon(src: string) {
  return L.divIcon({
    className: "photo-thumb-marker",
    html: `<img src="${encodeSrc(src)}" alt="" />`,
    iconSize: [52, 52],
    iconAnchor: [26, 26],
    popupAnchor: [0, -28],
  });
}

type PhotoMapProps = {
  photos: Photo[];
  activePhoto?: Photo | null;
  height?: number | string;
  interactive?: boolean;
  showPopups?: boolean;
  useThumbnails?: boolean;
  zoom?: number | null;
};

export default function PhotoMap({
  photos,
  activePhoto = null,
  height = 320,
  interactive = true,
  showPopups = false,
  useThumbnails = false,
  zoom = null,
}: PhotoMapProps) {
  const { t } = useLanguage();
  const { photoTitle } = usePhotoText();
  const mappable = photos.filter((p) => p.lat != null && p.lng != null);
  const center = activePhoto ?? mappable[0];

  if (!center || center.lat == null || center.lng == null) {
    return <div className="map-empty">{t("noMapData")}</div>;
  }

  const mapZoom = zoom ?? (activePhoto ? 11 : 5);

  return (
    <div className="photo-map" style={{ height }}>
      <MapContainer
        key={activePhoto?.id ?? "overview"}
        center={[center.lat, center.lng]}
        zoom={mapZoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive}
        className="photo-map-container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds photos={mappable} activePhoto={activePhoto} />

        {mappable.map((photo) => (
          <Marker
            key={photo.id}
            position={[photo.lat!, photo.lng!]}
            icon={
              useThumbnails
                ? createThumbIcon(photo.src)
                : photo.id === activePhoto?.id
                  ? defaultIcon
                  : createThumbIcon(photo.src)
            }
          >
            {showPopups && (
              <Popup>
                <div className="map-popup">
                  <img src={encodeSrc(photo.src)} alt={photoTitle(photo)} />
                  <strong>{photoTitle(photo)}</strong>
                  <Link to={`/photo/${photo.id}`}>{t("viewPhoto")}</Link>
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
