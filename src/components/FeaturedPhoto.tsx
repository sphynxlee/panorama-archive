import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Photo } from "../types";
import { usePhotoText } from "../hooks/usePhotoText";
import { useLanguage } from "../i18n/LanguageProvider";
import { encodeSrc, formatDecimal } from "../utils/geo";
import { getFeaturedPhoto, pickRandomFeaturedPhoto } from "../utils/photos";
import SourceBadge from "./SourceBadge";
import "./FeaturedPhoto.css";

type FeaturedPhotoProps = {
  photos: Photo[];
};

export default function FeaturedPhoto({ photos }: FeaturedPhotoProps) {
  const { t, locale } = useLanguage();
  const { photoTitle, photoRegion } = usePhotoText();
  const [featured, setFeatured] = useState<Photo | null>(() => getFeaturedPhoto(photos));
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setFeatured(getFeaturedPhoto(photos));
  }, [photos]);

  useEffect(() => {
    setLoaded(false);
    if (imgRef.current?.complete) setLoaded(true);
  }, [featured?.id]);

  if (!featured) return null;

  const title = photoTitle(featured);

  function handleShuffle() {
    setFeatured((current) => pickRandomFeaturedPhoto(photos, current));
  }

  return (
    <section className="featured-section">
      <div className="featured-header">
        <h2>{t("featuredTitle")}</h2>
        <button
          type="button"
          className="featured-shuffle"
          onClick={handleShuffle}
          disabled={photos.length <= 1}
          aria-label={t("featuredShuffle")}
        >
          {t("featuredShuffle")}
        </button>
      </div>

      <Link to={`/photo/${featured.id}`} className="featured-card">
        <div className={`featured-media${loaded ? " is-loaded" : ""}`}>
          <img
            ref={imgRef}
            src={encodeSrc(featured.src)}
            alt={title}
            loading="eager"
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
          />
          <SourceBadge source={featured.source ?? "official"} />
        </div>
        <div className="featured-overlay">
          <strong>{title}</strong>
          <span>{photoRegion(featured)}</span>
          {featured.lat != null && featured.lng != null && (
            <span className="featured-coords">
              {formatDecimal(featured.lat, featured.lng, locale)}
            </span>
          )}
          <em>{t("featuredCta")}</em>
        </div>
      </Link>
    </section>
  );
}
