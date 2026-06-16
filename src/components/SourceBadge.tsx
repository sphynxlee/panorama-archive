import type { Photo, PhotoSource } from "../types";
import { useLanguage } from "../i18n/LanguageProvider";
import "./SourceBadge.css";

type SourceBadgeProps = {
  source?: PhotoSource;
  className?: string;
};

export default function SourceBadge({ source = "official", className = "" }: SourceBadgeProps) {
  const { t } = useLanguage();
  const label = source === "community" ? t("badgeCommunity") : t("badgeArchive");
  const variant = source === "community" ? "community" : "archive";

  return (
    <span className={`source-badge source-badge--${variant} ${className}`.trim()}>
      {label}
    </span>
  );
}

type PhotoSourceLineProps = {
  photo: Photo | null | undefined;
  authorName?: string;
};

export function PhotoSourceLine({ photo, authorName }: PhotoSourceLineProps) {
  const { t } = useLanguage();
  if (!photo) return null;

  const isCommunity = photo.source === "community";
  const text = isCommunity
    ? t("sourceLineCommunity", { author: authorName ?? photo.authorName ?? "—" })
    : t("sourceLineOfficial");

  return <p className="photo-source-line">{text}</p>;
}
