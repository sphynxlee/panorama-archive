import { Link } from "react-router-dom";
import type { Photo, PhotoSource } from "../types";
import { usePhotoText } from "../hooks/usePhotoText";
import { useLanguage } from "../i18n/LanguageProvider";
import { encodeSrc, formatDms } from "../utils/geo";
import SourceBadge from "./SourceBadge";
import "./PhotoCard.css";

type PhotoCardProps = {
  photo: Photo;
};

export default function PhotoCard({ photo }: PhotoCardProps) {
  const { photoTitle, photoRegion } = usePhotoText();
  const { locale } = useLanguage();
  const title = photoTitle(photo);

  return (
    <Link to={`/photo/${photo.id}`} className="photo-card">
      <div className="photo-card-thumb">
        <img src={encodeSrc(photo.src)} alt={title} loading="lazy" />
        <SourceBadge source={(photo.source ?? "official") as PhotoSource} />
      </div>
      <div className="photo-card-body">
        <h3>{title}</h3>
        <p>{photoRegion(photo)}</p>
        {photo.coords && (
          <span className="coords">{formatDms(photo.coords, locale)}</span>
        )}
      </div>
    </Link>
  );
}
