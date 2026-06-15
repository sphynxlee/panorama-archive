import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  LEGACY_FOLDER_TO_REGION,
  REGIONS,
  dmsToDecimal,
  fixKnownBadCoords,
  lookupTitle,
  parseCoords,
  parseTitle,
  toSlug,
} from "./photo-data.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const publicDir = path.join(root, "public");
const photosRoot = path.join(publicDir, "photos");
const catalogPath = path.join(__dirname, "photo-catalog.json");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function uniqueSlug(base, used) {
  let slug = base;
  let counter = 2;
  while (used.has(slug)) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  used.add(slug);
  return slug;
}

function migrateLegacyFolders() {
  const legacyFolders = fs
    .readdirSync(publicDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && /^\d+$/.test(entry.name));

  if (legacyFolders.length === 0) return false;

  ensureDir(photosRoot);
  const catalog = [];
  const usedSlugs = new Set();

  for (const folder of legacyFolders.sort(
    (a, b) => Number(a.name) - Number(b.name)
  )) {
    const regionKey = LEGACY_FOLDER_TO_REGION[folder.name];
    if (!regionKey) continue;

    const targetDir = path.join(photosRoot, regionKey);
    ensureDir(targetDir);

    const files = fs
      .readdirSync(path.join(publicDir, folder.name))
      .filter((name) => /\.jpe?g$/i.test(name))
      .sort();

    for (const filename of files) {
      const stem = filename.replace(/\.jpe?g$/i, "");
      const cnTitle = parseTitle(stem);
      const titles = lookupTitle(cnTitle);
      let coords = parseCoords(stem);
      coords = fixKnownBadCoords(coords, titles.en);

      const baseSlug = toSlug(titles.en) || `photo-${catalog.length + 1}`;
      const slug = uniqueSlug(baseSlug, usedSlugs);
      const newFilename = `${slug}.jpg`;
      const src = `photos/${regionKey}/${newFilename}`;

      fs.copyFileSync(
        path.join(publicDir, folder.name, filename),
        path.join(targetDir, newFilename)
      );

      catalog.push({ slug, src, regionKey, title: titles, coords });
    }

    fs.rmSync(path.join(publicDir, folder.name), { recursive: true, force: true });
    console.log(`Migrated folder ${folder.name} → photos/${regionKey}/`);
  }

  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), "utf-8");
  return true;
}

function loadCatalog() {
  if (!fs.existsSync(catalogPath)) {
    throw new Error(
      "photo-catalog.json not found. Place photos in public/1-6 to auto-migrate, or run npm run migrate."
    );
  }
  return JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
}

ensureDir(photosRoot);
const migrated = migrateLegacyFolders();
const catalog = loadCatalog();

const photos = catalog.map((entry, index) => {
  const region = REGIONS[entry.regionKey];
  const coords = entry.coords ?? null;
  const lat = coords ? dmsToDecimal(coords.lat) : null;
  const lng = coords ? dmsToDecimal(coords.lng) : null;
  const filePath = path.join(publicDir, entry.src);

  if (!fs.existsSync(filePath)) {
    console.warn(`Missing file: ${entry.src}`);
  }

  return {
    id: index + 1,
    slug: entry.slug,
    src: entry.src,
    regionKey: entry.regionKey,
    region: region.name,
    regionDesc: region.desc,
    title: entry.title,
    coords,
    lat,
    lng,
    ...(entry.photographerPortrait && { photographerPortrait: true }),
    ...(entry.annotation && { annotation: entry.annotation }),
  };
});

const regions = Object.fromEntries(
  Object.entries(REGIONS).map(([key, region]) => [
    key,
    { key, name: region.name, desc: region.desc },
  ])
);

const output = {
  generatedAt: new Date().toISOString(),
  total: photos.length,
  regions,
  photos,
};

fs.writeFileSync(
  path.join(publicDir, "photos.json"),
  JSON.stringify(output, null, 2),
  "utf-8"
);

console.log(
  `${migrated ? "Migration complete." : "Catalog loaded."} Generated ${photos.length} photos → public/photos.json`
);
