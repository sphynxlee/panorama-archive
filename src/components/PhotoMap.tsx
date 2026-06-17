import { useEffect, useRef, useState } from "react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import type { Photo } from "../types";
import { usePhotoText } from "../hooks/usePhotoText";
import { useLanguage } from "../i18n/LanguageProvider";
import { encodeSrc } from "../utils/geo";
import {
  MAP_PREVIEW_ORIGIN,
  MAP_TILE_LAYERS,
  getPreviewTileUrl,
  type MapTileStyle,
} from "../utils/mapTiles";
import "leaflet/dist/leaflet.css";
import "./PhotoMap.css";

type FitBoundsProps = {
  photos: Photo[];
  activePhoto: Photo | null;
  focusZoom: number;
};

function FitBounds({ photos, activePhoto, focusZoom }: FitBoundsProps) {
  const map = useMap();

  useEffect(() => {
    if (activePhoto?.lat != null && activePhoto?.lng != null) {
      map.setView([activePhoto.lat, activePhoto.lng], focusZoom, {
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
  }, [map, photos, activePhoto, focusZoom]);

  return null;
}

function MapClickHandler({ onClear }: { onClear: () => void }) {
  useMapEvents({
    click: () => onClear(),
  });
  return null;
}

function DisableMapRotation() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    container.style.touchAction = "pan-x pan-y pinch-zoom";

    const extendedMap = map as L.Map & {
      touchRotate?: { disable(): void };
      rotate?: (angle: number, options?: { animate?: boolean }) => void;
    };

    extendedMap.touchRotate?.disable?.();
    extendedMap.rotate?.(0, { animate: false });
  }, [map]);

  return null;
}

type UserLocation = {
  lat: number;
  lng: number;
  accuracy: number;
};

type MapTypeControlProps = {
  mapStyle: MapTileStyle;
  onStyleChange: (style: MapTileStyle) => void;
};

function MapTypePreview({ variant }: { variant: MapTileStyle }) {
  const { x, y } = MAP_PREVIEW_ORIGIN;
  const offsets = [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ] as const;

  return (
    <span className="map-type-preview">
      {offsets.map(([dx, dy]) => (
        <img
          key={`${variant}-${dx}-${dy}`}
          src={getPreviewTileUrl(variant, x + dx, y + dy)}
          alt=""
          loading="lazy"
          decoding="async"
        />
      ))}
    </span>
  );
}

function MapTypeControl({ mapStyle, onStyleChange }: MapTypeControlProps) {
  const { t } = useLanguage();
  const nextStyle: MapTileStyle = mapStyle === "street" ? "satellite" : "street";
  const nextLabel = nextStyle === "satellite" ? t("mapSatellite") : t("mapStreet");

  return (
    <button
      type="button"
      className="map-type-toggle"
      onClick={() => onStyleChange(nextStyle)}
      aria-label={`${t("mapStyleToggle")}: ${nextLabel}`}
      title={nextLabel}
    >
      <MapTypePreview variant={nextStyle} />
    </button>
  );
}

type MapToolControlsProps = {
  onUserLocation: (location: UserLocation | null) => void;
  hasUserLocation: boolean;
};

function MapToolControls({ onUserLocation, hasUserLocation }: MapToolControlsProps) {
  const map = useMap();
  const { t } = useLanguage();
  const [locating, setLocating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep clicks on the controls from bubbling to the map (which would otherwise
  // clear the photo focus / popup and re-trigger map interactions).
  useEffect(() => {
    if (!containerRef.current) return;
    L.DomEvent.disableClickPropagation(containerRef.current);
    L.DomEvent.disableScrollPropagation(containerRef.current);
  }, []);

  function handleLocate() {
    if (!navigator.geolocation || !window.isSecureContext) {
      window.alert(t("mapLocateUnavailable"));
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        map.setView([latitude, longitude], 12, { animate: true });
        onUserLocation({ lat: latitude, lng: longitude, accuracy });
        setLocating(false);
      },
      (err) => {
        window.alert(
          err.code === err.PERMISSION_DENIED
            ? t("mapLocateDenied")
            : t("mapLocateUnavailable")
        );
        onUserLocation(null);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }

  const locateActive = locating || hasUserLocation;

  return (
    <div className="map-tool-controls" ref={containerRef}>
      <button
        type="button"
        className={`map-tool-circle${locateActive ? " is-active" : ""}`}
        onClick={handleLocate}
        disabled={locating}
        aria-label={t("mapLocate")}
        title={t("mapLocate")}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <circle cx="12" cy="12" r="2.2" fill="currentColor" />
          <path
            d="M8 6.5V8.5M8 6.5H6.5M16 6.5V8.5M16 6.5H17.5M8 17.5V15.5M8 17.5H6.5M16 17.5V15.5M16 17.5H17.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="map-zoom-pill">
        <button
          type="button"
          className="map-zoom-pill-btn"
          onClick={() => map.zoomOut()}
          aria-label={t("mapZoomOut")}
          title={t("mapZoomOut")}
        >
          −
        </button>
        <span className="map-zoom-divider" aria-hidden="true" />
        <button
          type="button"
          className="map-zoom-pill-btn"
          onClick={() => map.zoomIn()}
          aria-label={t("mapZoomIn")}
          title={t("mapZoomIn")}
        >
          +
        </button>
      </div>
    </div>
  );
}

function createThumbIcon(src: string, active = false) {
  const size = active ? 66 : 52;
  return L.divIcon({
    className: `photo-thumb-marker${active ? " is-active" : ""}`,
    html: `<img src="${encodeSrc(src)}" alt="" />`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 2)],
  });
}

type PhotoMapProps = {
  photos: Photo[];
  activePhoto?: Photo | null;
  height?: number | string;
  interactive?: boolean;
  showPopups?: boolean;
  zoom?: number | null;
  showControls?: boolean;
};

export default function PhotoMap({
  photos,
  activePhoto = null,
  height = 320,
  interactive = true,
  showPopups = false,
  zoom = null,
  showControls = false,
}: PhotoMapProps) {
  const { t } = useLanguage();
  const { photoTitle } = usePhotoText();
  const [mapStyle, setMapStyle] = useState<MapTileStyle>("street");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [focusedId, setFocusedId] = useState<number | null>(activePhoto?.id ?? null);
  const markerRefs = useRef(new Map<number, L.Marker>());
  const mappable = photos.filter((p) => p.lat != null && p.lng != null);
  const center = activePhoto ?? mappable[0];
  const tiles = MAP_TILE_LAYERS[mapStyle];

  useEffect(() => {
    setFocusedId(activePhoto?.id ?? null);
  }, [activePhoto]);

  useEffect(() => {
    if (!showPopups || focusedId == null) return;
    // Defer so the marker and its bound popup are fully mounted before opening.
    const timer = window.setTimeout(() => {
      markerRefs.current.get(focusedId)?.openPopup();
    }, 200);
    return () => window.clearTimeout(timer);
  }, [focusedId, showPopups, mappable.length]);

  if (!center || center.lat == null || center.lng == null) {
    return <div className="map-empty">{t("noMapData")}</div>;
  }

  const mapZoom = zoom ?? (activePhoto ? 11 : 5);

  return (
    <div
      className={`photo-map${showControls ? " photo-map-with-controls" : ""}`}
      style={{ height }}
    >
      <MapContainer
        key={activePhoto?.id ?? "overview"}
        center={[center.lat, center.lng]}
        zoom={mapZoom}
        scrollWheelZoom={interactive}
        dragging={interactive}
        zoomControl={interactive && !showControls}
        touchZoom={interactive}
        doubleClickZoom={interactive}
        className="photo-map-container"
      >
        <DisableMapRotation />
        {showPopups && <MapClickHandler onClear={() => setFocusedId(null)} />}
        <TileLayer key={mapStyle} attribution={tiles.attribution} url={tiles.url} />
        <FitBounds photos={mappable} activePhoto={activePhoto} focusZoom={mapZoom} />

        {showControls && (
          <>
            <MapTypeControl mapStyle={mapStyle} onStyleChange={setMapStyle} />
            <MapToolControls
              onUserLocation={setUserLocation}
              hasUserLocation={userLocation != null}
            />
          </>
        )}

        {userLocation && (
          <>
            <CircleMarker
              center={[userLocation.lat, userLocation.lng]}
              radius={8}
              pathOptions={{
                color: "#fff",
                weight: 2,
                fillColor: "#1a73e8",
                fillOpacity: 1,
              }}
            />
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={Math.max(userLocation.accuracy, 40)}
              pathOptions={{
                color: "#1a73e8",
                weight: 1,
                fillColor: "#1a73e8",
                fillOpacity: 0.12,
              }}
            />
          </>
        )}

        {mappable.map((photo) => (
          <Marker
            key={photo.id}
            position={[photo.lat!, photo.lng!]}
            icon={createThumbIcon(photo.src, photo.id === focusedId)}
            ref={(marker) => {
              if (marker) markerRefs.current.set(photo.id, marker);
              else markerRefs.current.delete(photo.id);
            }}
            eventHandlers={{
              click: () => setFocusedId(photo.id),
            }}
          >
            {showPopups && (
              <Popup>
                <div className="map-popup">
                  <Link to={`/photo/${photo.id}`} className="map-popup-image">
                    <img src={encodeSrc(photo.src)} alt={photoTitle(photo)} />
                  </Link>
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
