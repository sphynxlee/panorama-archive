import { Link } from "react-router-dom";
import { usePhotoText } from "../hooks/usePhotoText";
import { useLanguage } from "../i18n/LanguageProvider";
import { encodeSrc, formatDms } from "../utils/geo";
import "./PhotoCard.css";

export default function PhotoCard({ photo }) {
  const { photoTitle, photoRegion } = usePhotoText();
  const { locale } = useLanguage();
  const title = photoTitle(photo);

  return (
    <Link to={`/photo/${photo.id}`} className="photo-card">
      <img src={encodeSrc(photo.src)} alt={title} loading="lazy" />
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
