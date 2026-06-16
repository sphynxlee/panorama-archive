/**
 * Upload public/photos/ → Supabase Storage bucket "photos" under official/
 *
 * Requires .env.local: VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * Usage: node scripts/upload-official-photos.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const photosRoot = path.join(root, "public", "photos");

function loadEnvFile() {
  for (const name of [".env.local", ".env"]) {
    const envPath = path.join(root, name);
    if (!fs.existsSync(envPath)) continue;
    for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      if (!process.env[key]) process.env[key] = trimmed.slice(eq + 1).trim();
    }
  }
}

loadEnvFile();

const supabaseUrl = process.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = "photos";

if (!supabaseUrl || !serviceKey) {
  console.error("Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

function walkDir(dir, base = "") {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walkDir(full, rel));
    else if (/\.jpe?g$/i.test(entry.name)) files.push({ rel, full });
  }
  return files;
}

async function uploadFile(storagePath, fullPath) {
  const res = await fetch(
    `${supabaseUrl}/storage/v1/object/${BUCKET}/${storagePath}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "image/jpeg",
        "x-upsert": "true",
      },
      body: fs.readFileSync(fullPath),
    }
  );
  if (!res.ok) {
    throw new Error(`${storagePath}: ${res.status} ${await res.text()}`);
  }
}

if (!fs.existsSync(photosRoot)) {
  console.error("Missing public/photos/");
  process.exit(1);
}

const files = walkDir(photosRoot);
console.log(`Uploading ${files.length} files…`);

for (let i = 0; i < files.length; i++) {
  const { rel, full } = files[i];
  await uploadFile(`official/${rel}`, full);
  if ((i + 1) % 10 === 0) console.log(`  ${i + 1}/${files.length}`);
}

console.log(`Done. Set VITE_PHOTO_CDN=${supabaseUrl}/storage/v1/object/public/${BUCKET}`);
