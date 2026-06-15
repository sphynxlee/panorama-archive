import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getLocalizedText, translate } from "./messages";

const LanguageContext = createContext(null);
const STORAGE_KEY = "landscape-locale";

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "zh" ? "zh" : "en";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key, vars) => translate(locale, key, vars),
      text: (value) => getLocalizedText(value, locale),
    }),
    [locale]
  );

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
