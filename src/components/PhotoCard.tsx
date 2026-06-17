import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Photo, PhotoSource } from "../types";
import { usePhotoText } from "../hooks/usePhotoText";
import { useLanguage } from "../i18n/LanguageProvider";
import { encodeSrc, formatDecimal } from "../utils/geo";
import SourceBadge from "./SourceBadge";
import "./PhotoCard.css";

type PhotoCardProps = {
  photo: Photo;
};

export default function PhotoCard({ photo }: PhotoCardProps) {
  const { photoTitle, photoRegion } = usePhotoText();
  const { locale } = useLanguage();
  const title = photoTitle(photo);
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Cached images may finish loading before onLoad is bound.
    if (imgRef.current?.complete) setLoaded(true);
  }, []);

  return (
    <Link to={`/photo/${photo.id}`} className="photo-card">
      <div className={`photo-card-thumb${loaded ? " is-loaded" : ""}`}>
        <img
          ref={imgRef}
          src={encodeSrc(photo.src)}
          alt={title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
        />
        <SourceBadge source={(photo.source ?? "official") as PhotoSource} />
      </div>
      <div className="photo-card-body">
        <h3>{title}</h3>
        <p>{photoRegion(photo)}</p>
        {photo.lat != null && photo.lng != null && (
          <span className="coords">{formatDecimal(photo.lat, photo.lng, locale)}</span>
        )}
      </div>
    </Link>
  );
}
