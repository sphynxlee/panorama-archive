import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/LanguageProvider";
import "./Pagination.css";

type PaginationProps = {
  basePath: string;
  page: number;
  totalPages: number;
  search?: string;
};

export default function Pagination({ basePath, page, totalPages, search }: PaginationProps) {
  const { t } = useLanguage();

  if (totalPages <= 1) return null;

  function pageUrl(targetPage: number) {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <nav className="pagination" aria-label={t("paginationLabel")}>
      {page > 1 ? (
        <Link to={pageUrl(page - 1)} className="pagination-btn">
          {t("pagePrevious")}
        </Link>
      ) : (
        <span className="pagination-btn disabled">{t("pagePrevious")}</span>
      )}

      <span className="pagination-status">
        {t("paginationStatus", { page, totalPages })}
      </span>

      {page < totalPages ? (
        <Link to={pageUrl(page + 1)} className="pagination-btn">
          {t("pageNext")}
        </Link>
      ) : (
        <span className="pagination-btn disabled">{t("pageNext")}</span>
      )}
    </nav>
  );
}
