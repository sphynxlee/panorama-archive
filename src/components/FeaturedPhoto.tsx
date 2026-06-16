import { Link } from "react-router-dom";
import type { Photo } from "../types";
import { usePhotoText } from "../hooks/usePhotoText";
import { useLanguage } from "../i18n/LanguageProvider";
import { encodeSrc, formatDms } from "../utils/geo";
import SourceBadge from "./SourceBadge";
import "./FeaturedPhoto.css";

type FeaturedPhotoProps = {
  photo: Photo | null;
};

export default function FeaturedPhoto({ photo }: FeaturedPhotoProps) {
  const { t, locale } = useLanguage();
  const { photoTitle, photoRegion } = usePhotoText();
  if (!photo) return null;

  const title = photoTitle(photo);

  return (
    <section className="featured-section">
      <h2>{t("featuredTitle")}</h2>
      <Link to={`/photo/${photo.id}`} className="featured-card">
        <img src={encodeSrc(photo.src)} alt={title} loading="eager" />
        <SourceBadge source={photo.source ?? "official"} />
        <div className="featured-overlay">
          <strong>{title}</strong>
          <span>{photoRegion(photo)}</span>
          {photo.coords && (
            <span className="featured-coords">{formatDms(photo.coords, locale)}</span>
          )}
          <em>{t("featuredCta")}</em>
        </div>
      </Link>
    </section>
  );
}
