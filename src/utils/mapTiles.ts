export type MapTileStyle = "street" | "satellite";

export const MAP_TILE_LAYERS: Record<
  MapTileStyle,
  { url: string; attribution: string }
> = {
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
  },
};

/** Fixed tile patch (north-central China) for the layer-toggle thumbnail. */
export const MAP_PREVIEW_ZOOM = 6;
export const MAP_PREVIEW_ORIGIN = { x: 50, y: 23 };

export function getPreviewTileUrl(style: MapTileStyle, x: number, y: number): string {
  if (style === "street") {
    return `https://tile.openstreetmap.org/${MAP_PREVIEW_ZOOM}/${x}/${y}.png`;
  }
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${MAP_PREVIEW_ZOOM}/${y}/${x}`;
}
