import { useEffect, useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { scrollPageToTop } from "../utils/scroll";

export default function ScrollToTop() {
  const location = useLocation();

  useEffect(() => {
    if ("scrollRestoration" in history) {
      history.scrollRestoration = "manual";
    }
  }, []);

  useLayoutEffect(() => {
    scrollPageToTop();
  }, [location.pathname, location.search, location.key]);

  // Catch late layout shifts (images, Leaflet maps) after route paint.
  useEffect(() => {
    scrollPageToTop();
  }, [location.pathname, location.search, location.key]);

  return null;
}
