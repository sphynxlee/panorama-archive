import { useLanguage } from "../i18n/LanguageProvider";

export function usePhotoText() {
  const { text } = useLanguage();

  return {
    photoTitle: (photo) => text(photo.title),
    photoRegion: (photo) => text(photo.region),
    photoRegionDesc: (photo) => text(photo.regionDesc),
    regionName: (region) => text(region.name),
    regionDesc: (region) => text(region.desc),
  };
}
