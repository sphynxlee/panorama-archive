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

  return (
    <div className={`watermarked-photo ${className}`.trim()}>
      <img src={encodeSrc(src)} alt={alt} />
      <span className="photo-watermark" aria-hidden="true">
        {watermark}
      </span>
    </div>
  );
}
