# Panorama Archive · 全景典藏

A lightweight, [Panoramio](https://en.wikipedia.org/wiki/Google_Panoramio)-inspired gallery for **geotagged landscape photography** — preserving photos rescued after Google Panoramio shut down, especially work from the photographer known as **Yellow River Lensman (黄河影人)**.

**Live site:** [panorama-archive.vercel.app](https://panorama-archive.vercel.app)

---

## Features

| Area | Included |
|------|----------|
| Gallery | 79 official geotagged photos, region browse, daily featured photo |
| Map | Leaflet map with photo thumbnails |
| Detail | GPS (DMS + decimal), mini map, nearby photos, watermarked download |
| Search | Title and region search |
| i18n | English / 中文 |
| About | Panoramio history and Yellow River Lensman story |

**Roadmap (planned):** Supabase CDN, invite-only community uploads, guestbook, admin moderation. Product docs live locally under `docs/` (not in this repo).

---

## Tech stack

- **Frontend:** React 19, TypeScript, Vite, React Router, Leaflet
- **Hosting:** [Vercel](https://vercel.com) (auto-deploy from `main`)
- **Source:** [GitHub](https://github.com/sphynxlee/panorama-archive)
- **Planned backend:** Supabase (Auth, PostgreSQL, Storage)

---

## Development

```bash
git clone https://github.com/sphynxlee/panorama-archive.git
cd panorama-archive
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Regenerate `photos.json` and start Vite dev server |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Preview production build |
| `npm run typecheck` | TypeScript check only |
| `npm run generate` | Build `public/photos.json` from `scripts/photo-catalog.json` |
| `npm run upload:photos` | Upload official images to Supabase Storage (requires `.env.local`) |

### Environment variables

Copy `.env.example` to `.env.local` when setting up Supabase / CDN:

- `VITE_PHOTO_CDN` — public Storage URL prefix (optional until Phase 3)
- `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` — Supabase client (Phase 4+)
- `SUPABASE_SERVICE_ROLE_KEY` — upload script only, never commit

---

## Project layout

```
public/photos/          Official JPEG files (until CDN migration)
public/photos.json      Generated catalog (do not edit by hand)
scripts/
  photo-catalog.json    Source metadata for official photos
  generate-photos.mjs   Catalog → photos.json
src/                    React SPA (TypeScript)
supabase/migrations/    SQL schema for future community features
```

To add official photos: edit `scripts/photo-catalog.json`, place files under `public/photos/<region>/`, run `npm run generate`.

---

## Deployment

Push to `main` on GitHub; Vercel builds and deploys automatically.

```bash
git push origin main
```

Build command: `npm run build` · Output: `dist/`

---

## Versioning

This project follows [Semantic Versioning](https://semver.org/):

| Version | Milestone |
|---------|-----------|
| **1.0.0** | Phase 1 — initial gallery, map, about, watermark, bilingual UI |
| **1.1.0** | Phase 2 — TypeScript, featured photo, search, region pages, archive badges |
| **1.2.0** | Home region previews, pagination, page cards, map controls, scroll & layout polish |
| **1.3.0** | Phase 3 (planned) — Supabase CDN, images out of Git |
| **2.0.0** | Phase 4+ (planned) — accounts, invites, uploads, moderation |

Current version: see `package.json`.

### Release commands

| Command | When to use | Example |
|---------|-------------|---------|
| `npm run release:patch` | Bug fixes | `1.2.0` → `1.2.1` |
| `npm run release:minor` | New features | `1.2.0` → `1.3.0` |
| `npm run release:major` | Breaking changes | `1.2.0` → `2.0.0` |

Each `release:*` command runs `npm run build`, bumps `package.json`, creates a git commit, and tags `vX.Y.Z`.

```bash
# 1. Commit your feature/fixes first (working tree must be clean)
git add -A && git commit -m "feat: your change"

# 2. Bump version + tag
npm run release:minor

# 3. Push to GitHub (Vercel auto-deploys)
npm run release:push
```

To bump the version number only (no commit/tag): `npm run version:patch|minor|major`.

---

## Credits

Photos preserved from the Panoramio era · Producer: **sphynxlee + Cursor**

Inspired by Google Panoramio — shared for public enjoyment.
