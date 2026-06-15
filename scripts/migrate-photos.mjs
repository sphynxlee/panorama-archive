import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  LEGACY_FOLDER_TO_REGION,
  REGIONS,
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

ensureDir(photosRoot);

const legacyFolders = fs
  .readdirSync(publicDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^\d+$/.test(entry.name));

if (legacyFolders.length === 0) {
  console.log("Nothing to migrate — legacy folders already removed.");
  process.exit(0);
}

const catalog = [];
const usedSlugs = new Set();

for (const folder of legacyFolders.sort((a, b) => Number(a.name) - Number(b.name))) {
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
  console.log(`Migrated ${files.length} photos from folder ${folder.name} → photos/${regionKey}/`);
}

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), "utf-8");
console.log(`Saved ${catalog.length} entries to scripts/photo-catalog.json`);
