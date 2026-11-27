/* Otomatik ürün ve sürüm tarayıcısı (GitHub Actions / Node.js 20+).
   İki kaynaktan ürünleri otomatik toplar:
     A) bmenderes/bmenderes.github.io Releases (ör. hidude-v0.1.0 — kaynak kodu yerel/kapalı kalan APK/kurulum paketleri)
     B) bmenderes kullanıcısındaki açık depolar (GitHub Release sahibi olanlar veya `urun` / `aktapokus` topic'li depolar)
   Sonucu `urunler/katalog.json` editöryal bilgileriyle birleştirip `urunler/urunler.js` dosyasına yazar.

   Kullanım:
     node otomasyon/urunler.mjs          (depo kökü)
     node otomasyon/urunler.mjs --kuru   (dosya yazmadan özet basar)
     node otomasyon/urunler.mjs --zorla  (içerik değişmese bile zaman damgasını günceller)
*/

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BURASI = dirname(fileURLToPath(import.meta.url));
const KOK = resolve(BURASI, "..");
const ARG = process.argv.slice(2);
const KURU = ARG.includes("--kuru");
const ZORLA = ARG.includes("--zorla");

const KATALOG_YOLU = join(KOK, "urunler", "katalog.json");
const CIKTI_YOLU = join(KOK, "urunler", "urunler.js");
const TOKEN = (process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "").trim();

const DEFAULT_TOPICS = ["urun", "aktapokus", "aktapokus-urun"];
const DOWNLOAD_EXTENSIONS = [
  ".apk",
  ".aab",
  ".exe",
  ".msi",
  ".dmg",
  ".pkg",
  ".appimage",
  ".deb",
  ".rpm",
  ".zip",
  ".tar.gz",
  ".tgz",
  ".7z"
];

function createHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "bmenderes-urunler-bot"
  };
  if (TOKEN) {
    headers.Authorization = `Bearer ${TOKEN}`;
  }
  return headers;
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: createHeaders() });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`GitHub API ${res.status} (${url}): ${body.slice(0, 180)}`);
  }
  return res.json();
}

function classifyAssetPlatform(fileName) {
  const lower = String(fileName || "").toLowerCase();
  if (lower.endsWith(".apk") || lower.endsWith(".aab")) return "android";
  if (lower.endsWith(".exe") || lower.endsWith(".msi")) return "windows";
  if (lower.endsWith(".dmg") || lower.endsWith(".pkg")) return "macos";
  if (lower.endsWith(".appimage") || lower.endsWith(".deb") || lower.endsWith(".rpm")) return "linux";
  if (lower.endsWith(".zip") || lower.endsWith(".tar.gz") || lower.endsWith(".tgz") || lower.endsWith(".7z")) return "archive";
  return "file";
}

function isDownloadableAsset(fileName) {
  const lower = String(fileName || "").toLowerCase();
  return DOWNLOAD_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function formatBytes(bytes) {
  const num = Number(bytes || 0);
  if (!Number.isFinite(num) || num <= 0) return "";
  if (num < 1024 * 1024) {
    return `${Math.max(1, Math.round(num / 1024))} KB`;
  }
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
}

function parseSelfReleaseTag(tagName, releaseName) {
  const raw = String(tagName || "").trim();
  const match = /^([a-z0-9][a-z0-9-]*)[-_](v?\d+\.\d+.*)$/i.exec(raw);
  if (match && match[1]) {
    const prefix = match[1].toLowerCase();
    if (prefix && prefix !== "v") {
      const ver = match[2].toLowerCase().startsWith("v") ? match[2] : `v${match[2]}`;
      return { slug: prefix, version: ver };
    }
  }
  const fallbackSlug = String(releaseName || raw || "urun")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return { slug: fallbackSlug || "urun", version: raw };
}

function normalizeAssets(releaseObj) {
  const assets = Array.isArray(releaseObj?.assets) ? releaseObj.assets : [];
  return assets
    .filter((asset) => asset && asset.name && asset.browser_download_url && isDownloadableAsset(asset.name))
    .map((asset) => ({
      name: asset.name,
      platform: classifyAssetPlatform(asset.name),
      sizeBytes: Number(asset.size || 0),
      sizeLabel: formatBytes(asset.size),
      downloadCount: Number(asset.download_count || 0),
      url: asset.browser_download_url
    }));
}

function deriveCategories(overrideCategory, assets, homepage, topics) {
  const cats = new Set();
  if (overrideCategory) cats.add(overrideCategory);
  for (const asset of assets) {
    if (asset.platform === "android") cats.add("android");
    if (["windows", "macos", "linux", "archive"].includes(asset.platform)) cats.add("desktop");
  }
  if (homepage) cats.add("web");
  for (const t of topics || []) {
    const lower = String(t).toLowerCase();
    if (lower === "android") cats.add("android");
    if (lower === "web" || lower === "pwa") cats.add("web");
    if (lower === "desktop" || lower === "cli") cats.add("desktop");
  }
  if (cats.size === 0) cats.add("desktop");
  return Array.from(cats);
}

function buildTextPair(overrideObj, fallbackText) {
  if (overrideObj && (overrideObj.tr || overrideObj.en)) {
    return {
      tr: String(overrideObj.tr || overrideObj.en || fallbackText || ""),
      en: String(overrideObj.en || overrideObj.tr || fallbackText || "")
    };
  }
  const base = String(fallbackText || "");
  return { tr: base, en: base };
}

function pickLocalizedList(overrideObj) {
  if (!overrideObj) return { tr: [], en: [] };
  return {
    tr: Array.isArray(overrideObj.tr) ? overrideObj.tr.map(String) : [],
    en: Array.isArray(overrideObj.en) ? overrideObj.en.map(String) : []
  };
}

async function discoverSelfReleases(owner, selfRepo) {
  const releases = await fetchJson(`https://api.github.com/repos/${owner}/${selfRepo}/releases?per_page=100`);
  const grouped = new Map();

  for (const rel of releases) {
    if (!rel || rel.draft) continue;
    const { slug, version } = parseSelfReleaseTag(rel.tag_name, rel.name);
    const relTime = Date.parse(rel.published_at || rel.created_at || 0) || 0;
    const existing = grouped.get(slug);
    if (!existing || relTime > existing.relTime) {
      grouped.set(slug, { slug, version, rel, relTime });
    }
  }
  return grouped;
}

async function discoverOwnerRepos(owner, selfRepo, topicAllowList, catalogItems) {
  const repos = await fetchJson(`https://api.github.com/users/${owner}/repos?type=owner&per_page=100&sort=pushed`);
  const results = [];

  for (const repo of repos) {
    if (!repo || repo.private || repo.archived || repo.fork) continue;
    if (String(repo.name).toLowerCase() === String(selfRepo).toLowerCase()) continue;

    const slug = String(repo.name).toLowerCase();
    const override = catalogItems[slug] || null;
    if (override?.hidden) continue;

    const repoTopics = Array.isArray(repo.topics) ? repo.topics.map((t) => String(t).toLowerCase()) : [];
    const hasMatchingTopic = repoTopics.some((t) => topicAllowList.includes(t));

    let latestRelease = null;
    try {
      const releases = await fetchJson(`https://api.github.com/repos/${owner}/${repo.name}/releases?per_page=5`);
      latestRelease = Array.isArray(releases) ? releases.find((r) => r && !r.draft) || null : null;
    } catch (err) {
      console.warn(`[uyarı] ${repo.name} sürümleri alınamadı: ${err.message}`);
    }

    if (!latestRelease && !hasMatchingTopic && !override) {
      continue;
    }

    results.push({ repo, latestRelease, repoTopics });
  }

  return results;
}

function mergeProduct({ slug, discovery, repoEntry, override }) {
  const assetsFromSelf = discovery ? normalizeAssets(discovery.rel) : [];
  const assetsFromRepo = repoEntry?.latestRelease ? normalizeAssets(repoEntry.latestRelease) : [];
  const assets = assetsFromSelf.length > 0 ? assetsFromSelf : assetsFromRepo;

  const activeRelease = discovery?.rel || repoEntry?.latestRelease || null;
  const version = discovery?.version || activeRelease?.tag_name || "";
  const releaseUrl = activeRelease?.html_url || "";
  const releaseNotes = String(activeRelease?.body || "").trim();
  const updatedAt = activeRelease?.published_at || activeRelease?.created_at || repoEntry?.repo?.pushed_at || "";

  const rawTitle = repoEntry?.repo?.name || slug;
  const title = buildTextPair(override?.title, rawTitle);
  const tagline = buildTextPair(override?.tagline, repoEntry?.repo?.description || "");
  const description = buildTextPair(override?.description, repoEntry?.repo?.description || "");
  const highlights = pickLocalizedList(override?.highlights);
  const installNote = pickLocalizedList(override?.installNote);

  const homepageUrl = String(override?.homepage || repoEntry?.repo?.homepage || "").trim();
  const sourceUrl = override?.hideSourceLink ? "" : String(repoEntry?.repo?.html_url || "");
  const totalDownloads = assets.reduce((sum, item) => sum + (item.downloadCount || 0), 0);
  const categories = deriveCategories(override?.category, assets, homepageUrl, repoEntry?.repoTopics || []);

  return {
    slug,
    featured: Boolean(override?.featured),
    icon: String(override?.icon || ""),
    sourceType: discovery ? "self-release" : "github-repo",
    title,
    tagline,
    description,
    highlights,
    installNote,
    version,
    updatedAt,
    categories,
    language: repoEntry?.repo?.language || "",
    stars: Number(repoEntry?.repo?.stargazers_count || 0),
    totalDownloads,
    homepageUrl,
    sourceUrl,
    releaseUrl,
    releaseNotes,
    assets
  };
}

function readPreviousGeneratedData() {
  if (!existsSync(CIKTI_YOLU)) return null;
  try {
    const raw = readFileSync(CIKTI_YOLU, "utf8");
    const jsonStart = raw.indexOf("{");
    const jsonEnd = raw.lastIndexOf("}");
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      return JSON.parse(raw.slice(jsonStart, jsonEnd + 1));
    }
  } catch {
    return null;
  }
  return null;
}

async function main() {
  const catalog = JSON.parse(readFileSync(KATALOG_YOLU, "utf8"));
  const owner = catalog.owner || "bmenderes";
  const selfRepo = catalog.selfRepo || "bmenderes.github.io";
  const topicAllowList = Array.isArray(catalog.topics) && catalog.topics.length > 0
    ? catalog.topics.map((t) => String(t).toLowerCase())
    : DEFAULT_TOPICS;
  const catalogItems = catalog.items || {};

  const selfReleases = await discoverSelfReleases(owner, selfRepo);
  const repoDiscoveries = await discoverOwnerRepos(owner, selfRepo, topicAllowList, catalogItems);

  const repoBySlug = new Map();
  for (const entry of repoDiscoveries) {
    repoBySlug.set(String(entry.repo.name).toLowerCase(), entry);
  }

  const allSlugs = new Set([
    ...selfReleases.keys(),
    ...repoBySlug.keys(),
    ...Object.keys(catalogItems).filter((slug) => catalogItems[slug]?.alwaysShow && !catalogItems[slug]?.hidden)
  ]);

  const products = [];
  for (const slug of allSlugs) {
    const override = catalogItems[slug] || null;
    if (override?.hidden) continue;
    products.push(
      mergeProduct({
        slug,
        discovery: selfReleases.get(slug) || null,
        repoEntry: repoBySlug.get(slug) || null,
        override
      })
    );
  }

  products.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    const tA = Date.parse(a.updatedAt || 0) || 0;
    const tB = Date.parse(b.updatedAt || 0) || 0;
    if (tA !== tB) return tB - tA;
    return a.slug.localeCompare(b.slug);
  });

  const previous = readPreviousGeneratedData();
  const isSameItems =
    !ZORLA &&
    previous &&
    previous.owner === owner &&
    JSON.stringify(previous.items) === JSON.stringify(products);

  const generatedAt = isSameItems && previous.generatedAt ? previous.generatedAt : new Date().toISOString();

  const payload = {
    generatedAt,
    owner,
    totalCount: products.length,
    items: products
  };

  console.log(`Toplam ${products.length} ürün bulundu (${isSameItems ? "değişiklik yok" : "güncel liste üretildi"}):`);
  for (const p of products) {
    console.log(`  - ${p.slug} [${p.categories.join(",")}] sürüm=${p.version || "yok"} dosya=${p.assets.length}`);
  }

  if (KURU) {
    return;
  }

  const output = `/* Otomatik üretildi: otomasyon/urunler.mjs — elle düzenlemeyin. */\nwindow.URUNLER_DATA = ${JSON.stringify(payload, null, 2)};\n`;
  writeFileSync(CIKTI_YOLU, output, "utf8");
}

main().catch((err) => {
  console.error("Ürün otomasyonu hatası:", err);
  process.exit(1);
});
