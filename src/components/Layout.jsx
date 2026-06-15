import { Link, NavLink, Outlet } from "react-router-dom";
import { usePhotos } from "../hooks/usePhotos";
import { useLanguage } from "../i18n/LanguageProvider";
import "./Layout.css";

export default function Layout() {
  const { total, mappable } = usePhotos();
  const { locale, setLocale, t } = useLanguage();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">
            <span className="brand-mark">◉</span>
            <span className="brand-text">
              <strong>{t("brandTitle")}</strong>
              <small>{t("brandSubtitle")}</small>
            </span>
          </Link>

          <nav className="nav-links">
            <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
              {t("navPhotos")}
            </NavLink>
            <NavLink to="/map" className={({ isActive }) => (isActive ? "active" : "")}>
              {t("navMap")}
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
              {t("navAbout")}
            </NavLink>
          </nav>

          <div className="topbar-actions">
            <div className="lang-switch" aria-label={t("language")}>
              <button
                type="button"
                className={locale === "en" ? "active" : ""}
                onClick={() => setLocale("en")}
              >
                EN
              </button>
              <button
                type="button"
                className={locale === "zh" ? "active" : ""}
                onClick={() => setLocale("zh")}
              >
                中文
              </button>
            </div>
            <div className="topbar-meta">
              {t("stats", { total, mapped: mappable.length })}
            </div>
          </div>
        </div>
      </header>

      <Outlet />

      <footer className="site-footer">
        <p>{t("footerText")}</p>
        <p className="site-footer-producer">{t("footerProducer")}</p>
        <Link to="/about">{t("navAbout")}</Link>
      </footer>
    </div>
  );
}
