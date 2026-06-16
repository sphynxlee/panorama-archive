import type { Photo, Region } from "../types";
import { useLanguage } from "../i18n/LanguageProvider";

export function usePhotoText() {
  const { text } = useLanguage();

  return {
    photoTitle: (photo: Photo) => text(photo.title),
    photoRegion: (photo: Photo) => text(photo.region),
    photoRegionDesc: (photo: Photo) => text(photo.regionDesc),
    regionName: (region: Region) => text(region.name),
    regionDesc: (region: Region) => text(region.desc),
  };
}
