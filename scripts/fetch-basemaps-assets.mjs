// Downloads the Protomaps basemaps glyphs + sprites this app bundles so an
// extracted PMTiles archive can render as a fully offline styled basemap
// (no CDN at runtime). Output: apps/geolibre-desktop/public/basemaps-assets/,
// which bakes into the web and desktop builds and is served at
// /basemaps-assets/. Re-run to refresh:
//
//   node scripts/fetch-basemaps-assets.mjs
//
// Bundle Arabic/Kurdish glyphs in addition to the Latin/Cyrillic ranges so
// MapLibre can shape Arabic-script labels correctly even when the app is
// running fully offline. The default English basemap style still covers most
// of the world, but Arabic-script labels require the Arabic blocks below.
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const BASE = "https://protomaps.github.io/basemaps-assets";
const OUT = fileURLToPath(
  new URL("../apps/geolibre-desktop/public/basemaps-assets/", import.meta.url),
);

const FONTSTACKS = [
  "Noto Sans Arabic",
  "Noto Sans Regular",
  "Noto Sans Medium",
  "Noto Sans Italic",
];
const RANGES = [
  "0-255",
  "256-511",
  "512-767",
  "768-1023",
  "1536-1791",
  "1792-2047",
];
const FLAVORS = ["light", "dark", "white", "grayscale", "black"];
const SPRITE_FILES = (flavor) => [
  `${flavor}.json`,
  `${flavor}.png`,
  `${flavor}@2x.json`,
  `${flavor}@2x.png`,
];

async function download(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} for ${url}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  await mkdir(destPath.slice(0, destPath.lastIndexOf("/")), { recursive: true });
  await writeFile(destPath, bytes);
  return bytes.length;
}

let total = 0;
for (const fontstack of FONTSTACKS) {
  for (const range of RANGES) {
    const url = `${BASE}/fonts/${encodeURIComponent(fontstack)}/${range}.pbf`;
    const dest = `${OUT}fonts/${fontstack}/${range}.pbf`;
    total += await download(url, dest);
  }
}
for (const flavor of FLAVORS) {
  for (const file of SPRITE_FILES(flavor)) {
    const url = `${BASE}/sprites/v4/${file}`;
    const dest = `${OUT}sprites/v4/${file}`;
    total += await download(url, dest);
  }
}
console.log(
  `Wrote ${OUT} (${(total / 1024 / 1024).toFixed(2)} MB: ` +
    `${FONTSTACKS.length}×${RANGES.length} glyph ranges, ${FLAVORS.length} sprite flavors)`,
);
