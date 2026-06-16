import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PhotosProvider } from "./hooks/usePhotos";
import { LanguageProvider } from "./i18n/LanguageProvider";
import ScrollToTop from "./components/ScrollToTop";
import Layout from "./components/Layout";
import GalleryPage from "./pages/GalleryPage";
import MapPage from "./pages/MapPage";
import AboutPage from "./pages/AboutPage";
import PhotoDetailPage from "./pages/PhotoDetailPage";
import SearchPage from "./pages/SearchPage";
import RegionPage from "./pages/RegionPage";

export default function App() {
  return (
    <LanguageProvider>
      <PhotosProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<GalleryPage />} />
              <Route path="map" element={<MapPage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="search" element={<SearchPage />} />
              <Route path="region/:key" element={<RegionPage />} />
              <Route path="photo/:id" element={<PhotoDetailPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </PhotosProvider>
    </LanguageProvider>
  );
}
