import { useEffect } from "react";
import { useLanguage } from "../i18n/LanguageProvider";
import { getWatermarkText } from "../utils/watermark";
import { encodeSrc } from "../utils/geo";
import "./WatermarkedPhoto.css";
import "./PhotoLightbox.css";

type PhotoLightboxProps = {
  src: string;
  alt: string;
  onClose: () => void;
};

export default function PhotoLightbox({ src, alt, onClose }: PhotoLightboxProps) {
  const { t, locale } = useLanguage();
  const watermark = getWatermarkText(locale);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="lightbox-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label={alt}
      onClick={onClose}
    >
      <button
        type="button"
        className="lightbox-close"
        onClick={onClose}
        aria-label={t("photoCloseViewer")}
      >
        ×
      </button>
      <figure className="lightbox-figure" onClick={(event) => event.stopPropagation()}>
        <img src={encodeSrc(src)} alt={alt} />
        <span className="photo-watermark" aria-hidden="true">
          {watermark}
        </span>
      </figure>
    </div>
  );
}
