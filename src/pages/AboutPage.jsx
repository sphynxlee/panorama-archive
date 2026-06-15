import { Link } from "react-router-dom";
import { usePhotos } from "../hooks/usePhotos";
import { usePhotoText } from "../hooks/usePhotoText";
import { useLanguage } from "../i18n/LanguageProvider";
import { getLocalizedText } from "../i18n/messages";
import { encodeSrc } from "../utils/geo";
import "./AboutPage.css";

const PORTRAIT_PHOTO_ID = 15;

export default function AboutPage() {
  const { t, locale } = useLanguage();
  const { photoById } = usePhotos();
  const { photoTitle } = usePhotoText();
  const portrait = photoById.get(PORTRAIT_PHOTO_ID);

  return (
    <main className="about-page">
      <article className="about-card">
        <p className="about-eyebrow">{t("aboutEyebrow")}</p>
        <h1>{t("aboutTitle")}</h1>
        <p className="about-lead">{t("aboutLead")}</p>

        <section>
          <h2>{t("aboutSection1Title")}</h2>
          <p>{t("aboutSection1Body")}</p>
        </section>

        <section>
          <h2>{t("aboutSection2Title")}</h2>
          <p>{t("aboutSection2Body")}</p>

          {portrait && (
            <figure className="about-portrait">
              <Link to={`/photo/${PORTRAIT_PHOTO_ID}`} className="about-portrait-link">
                <img
                  src={encodeSrc(portrait.src)}
                  alt={photoTitle(portrait)}
                  loading="lazy"
                />
              </Link>
              <figcaption>
                <span className="about-portrait-badge">{t("photoPhotographerBadge")}</span>
                <strong>{photoTitle(portrait)}</strong>
                {portrait.annotation && (
                  <p>{getLocalizedText(portrait.annotation, locale)}</p>
                )}
                <Link to={`/photo/${PORTRAIT_PHOTO_ID}`} className="about-portrait-cta">
                  {t("aboutSection2PortraitLink")}
                </Link>
              </figcaption>
            </figure>
          )}
        </section>

        <blockquote className="about-quote">
          <p>{t("aboutQuote")}</p>
          <cite>{t("aboutQuoteAuthor")}</cite>
        </blockquote>

        <section>
          <h2>{t("aboutSection3Title")}</h2>
          <p>{t("aboutSection3Body")}</p>
        </section>

        <section>
          <h2>{t("aboutSection4Title")}</h2>
          <p>{t("aboutSection4Body")}</p>
        </section>

        <div className="about-actions">
          <Link to="/" className="about-btn primary">
            {t("aboutBrowsePhotos")}
          </Link>
          <Link to="/map" className="about-btn">
            {t("aboutBrowseMap")}
          </Link>
        </div>
      </article>
    </main>
  );
}
