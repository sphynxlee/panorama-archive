import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n/LanguageProvider";
import { getWatermarkText } from "../utils/watermark";
import { encodeSrc } from "../utils/geo";
import "./WatermarkedPhoto.css";

type WatermarkedPhotoProps = {
  src: string;
  alt: string;
  className?: string;
};

export default function WatermarkedPhoto({
  src,
  alt,
  className = "",
}: WatermarkedPhotoProps) {
  const { locale } = useLanguage();
  const watermark = getWatermarkText(locale);
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    if (imgRef.current?.complete) setLoaded(true);
  }, [src]);

  return (
    <div
      className={`watermarked-photo ${className} ${loaded ? "is-loaded" : ""}`.trim()}
    >
      <img
        ref={imgRef}
        src={encodeSrc(src)}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
      <span className="photo-watermark" aria-hidden="true">
        {watermark}
      </span>
    </div>
  );
}
