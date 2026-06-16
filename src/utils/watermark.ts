import { encodeSrc } from "./geo";
import type { Locale } from "../types";

export const SITE_URL = "panorama-archive.vercel.app";

export function getWatermarkText(locale: Locale): string {
  if (locale === "zh") {
    return `来自 Panorama Archive · ${SITE_URL}`;
  }
  return `From Panorama Archive · ${SITE_URL}`;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  text: string,
  width: number,
  height: number
) {
  const padding = Math.max(16, Math.round(width * 0.015));
  const fontSize = Math.max(14, Math.round(width * 0.018));
  ctx.font = `600 ${fontSize}px "Segoe UI", system-ui, -apple-system, sans-serif`;
  ctx.textBaseline = "bottom";

  const textWidth = ctx.measureText(text).width;
  const boxPadX = 10;
  const boxPadY = 8;
  const boxWidth = textWidth + boxPadX * 2;
  const boxHeight = fontSize + boxPadY * 2;
  const boxX = width - padding - boxWidth;
  const boxY = height - padding - boxHeight;

  ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
  drawRoundedRect(ctx, boxX, boxY, boxWidth, boxHeight, 4);
  ctx.fill();

  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  ctx.fillText(text, boxX + boxPadX, boxY + boxHeight - boxPadY);
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = encodeSrc(src);
  });
}

export async function downloadWatermarkedPhoto(
  src: string,
  filename: string,
  watermarkText: string
): Promise<void> {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(img, 0, 0);
  drawWatermark(ctx, watermarkText, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.92);
  });

  if (!blob) throw new Error("Failed to create image");

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
