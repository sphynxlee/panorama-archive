import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollPageToTop } from "../utils/scroll";

export function useScrollToTopWhenReady(ready: boolean) {
  const location = useLocation();

  useLayoutEffect(() => {
    if (ready) scrollPageToTop();
  }, [location.pathname, location.search, location.key, ready]);

  useEffect(() => {
    if (!ready) return;
    scrollPageToTop();
    const raf = requestAnimationFrame(() => scrollPageToTop());
    return () => cancelAnimationFrame(raf);
  }, [location.pathname, location.search, location.key, ready]);
}
