/* haberler otomasyonu — yerel bilgisayardan bağımsız (GitHub Actions) sürüm.
   Kaynaklardan RSS/Atom akışlarını okur, isteğe bağlı olarak bir dil modeliyle
   Türkçe manşet üretir ve sayfanın okuduğu 4 dosyayı yazar:
     haberler/siyaset.js, haberler/teknoloji.js, haberler/spor.js, haberler/ozet.js
   Model erişimi yoksa/hata verirse akışlardaki başlıkları olduğu gibi yazar;
   yani otomasyon hiçbir zaman boş çıktı üretmez.

   Kullanım:
     node otomasyon/haberler.mjs                 (depo kökünde)
     node otomasyon/haberler.mjs --kuru          (dosya yazmaz, sadece rapor)
     node otomasyon/haberler.mjs --kontrol       (sadece akışları dener)
     node otomasyon/haberler.mjs --kok <klasor>  (çıktı kökü; varsayılan depo kökü)

   Ortam değişkenleri:
     MODEL_TOKEN / GITHUB_TOKEN  model anahtarı (yoksa model çağrılmaz)
     MODEL_URL    varsayılan https://models.github.ai/inference/chat/completions
     MODEL        varsayılan openai/gpt-4o-mini
     SAAT         kaç saat geriye bakılacak (varsayılan 36)
     SINIR        kategori başına satır sayısı (varsayılan 5, en fazla 5)
*/

import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BURASI = dirname(fileURLToPath(import.meta.url));
const ARG = process.argv.slice(2);
const KURU = ARG.includes("--kuru");
const KONTROL = ARG.includes("--kontrol");
const KOK_ARG = ARG.indexOf("--kok");
const KOK = KOK_ARG >= 0 && ARG[KOK_ARG + 1] ? resolve(ARG[KOK_ARG + 1]) : resolve(BURASI, "..");
const CIKTI = join(KOK, "haberler");

const SAAT = Number(process.env.SAAT || 36);
const SINIR = Math.min(5, Math.max(1, Number(process.env.SINIR || 5)));
const MODEL = process.env.MODEL || "openai/gpt-4o-mini";
const MODEL_URL = process.env.MODEL_URL || "https://models.github.ai/inference/chat/completions";
const MODEL_TOKEN = process.env.MODEL_TOKEN || process.env.GITHUB_TOKEN || "";

// ---------------------------------------------------------------- kaynaklar
// tur/guven değerleri OTOMASYON-PROMPT.md Bölüm 1 sözlüğüyle aynıdır.
const KAYNAKLAR = [
  // Siyaset / Türkiye gündemi
  { id: "bbcturkce", kategori: "siyaset", tur: "hizli-haber", dil: "tr", guven: "bagimsiz", akis: "https://feeds.bbci.co.uk/turkce/rss.xml" },
  { id: "dwtr", kategori: "siyaset", tur: "hizli-haber", dil: "tr", guven: "bagimsiz", akis: "https://rss.dw.com/rdf/rss-tur-all" },
  { id: "bianet", kategori: "siyaset", tur: "hizli-haber", dil: "tr", guven: "bagimsiz", akis: "https://bianet.org/rss/bianet" },
  { id: "birgun", kategori: "siyaset", tur: "hizli-haber", dil: "tr", guven: "bagimsiz", akis: "https://www.birgun.net/rss/home" },
  { id: "diken", kategori: "siyaset", tur: "magazin-kultur", dil: "tr", guven: "bagimsiz", akis: "https://www.diken.com.tr/feed/" },
  { id: "medyascope", kategori: "siyaset", tur: "hizli-haber", dil: "tr", guven: "bagimsiz", akis: "https://medyascope.tv/feed/" },
  { id: "gazeteduvar", kategori: "siyaset", tur: "hizli-haber", dil: "tr", guven: "bagimsiz", akis: "https://www.gazeteduvar.com.tr/rss" },
  { id: "artigercek", kategori: "siyaset", tur: "hizli-haber", dil: "tr", guven: "bagimsiz", akis: "https://artigercek.com/rss" },
  { id: "kisadalga", kategori: "siyaset", tur: "hizli-haber", dil: "tr", guven: "bagimsiz", akis: "https://kisadalga.net/feed" },
  { id: "gercekgundem", kategori: "siyaset", tur: "hizli-haber", dil: "tr", guven: "bagimsiz", akis: "https://www.gercekgundem.com/rss" },
  { id: "cumhuriyet", kategori: "siyaset", tur: "hizli-haber", dil: "tr", guven: "bagimsiz", akis: "https://www.cumhuriyet.com.tr/rss" },
  { id: "sozcu", kategori: "siyaset", tur: "hizli-haber", dil: "tr", guven: "bagimsiz", akis: "https://www.sozcu.com.tr/feeds-rss-category-gundem" },
  { id: "hurriyet", kategori: "siyaset", tur: "hizli-haber", dil: "tr", guven: "bagimsiz", akis: "https://www.hurriyet.com.tr/rss/anasayfa" },
  { id: "ntv", kategori: "siyaset", tur: "hizli-haber", dil: "tr", guven: "bagimsiz", akis: "https://www.ntv.com.tr/gundem.rss" },
  { id: "aa", kategori: "siyaset", tur: "resmi-kurum", dil: "tr", guven: "bagimsiz", akis: "https://www.aa.com.tr/tr/rss/default?cat=gundem" },

  // Teknoloji ve yapay zekâ
  { id: "techcrunch", kategori: "teknoloji", tur: "hizli-haber", dil: "en", guven: "bagimsiz", akis: "https://techcrunch.com/feed/" },
  { id: "verge", kategori: "teknoloji", tur: "hizli-haber", dil: "en", guven: "bagimsiz", akis: "https://www.theverge.com/rss/index.xml" },
  { id: "ars", kategori: "teknoloji", tur: "teknik-analiz", dil: "en", guven: "bagimsiz", akis: "https://feeds.arstechnica.com/arstechnica/index" },
  { id: "wired", kategori: "teknoloji", tur: "magazin-kultur", dil: "en", guven: "bagimsiz", akis: "https://www.wired.com/feed/rss" },
  { id: "mit-tr", kategori: "teknoloji", tur: "teknik-analiz", dil: "en", guven: "bagimsiz", akis: "https://www.technologyreview.com/feed/" },
  { id: "ieee", kategori: "teknoloji", tur: "teknik-analiz", dil: "en", guven: "bagimsiz", akis: "https://spectrum.ieee.org/feeds/feed.rss" },
  { id: "decoder", kategori: "teknoloji", tur: "hizli-haber", dil: "en", guven: "bagimsiz", akis: "https://the-decoder.com/feed/" },
  { id: "openai", kategori: "teknoloji", tur: "resmi-duyuru", dil: "en", guven: "uretici", akis: "https://openai.com/news/rss.xml" },
  { id: "deepmind", kategori: "teknoloji", tur: "arastirma", dil: "en", guven: "uretici", akis: "https://deepmind.google/blog/rss.xml" },
  { id: "huggingface", kategori: "teknoloji", tur: "arastirma", dil: "en", guven: "uretici", akis: "https://huggingface.co/blog/feed.xml" },

  // Spor (uluslararası + Türkiye)
  { id: "espn", kategori: "spor", tur: "hizli-haber", dil: "en", guven: "bagimsiz", akis: "https://www.espn.com/espn/rss/soccer/news" },
  { id: "bbc-sport", kategori: "spor", tur: "hizli-haber", dil: "en", guven: "bagimsiz", akis: "https://feeds.bbci.co.uk/sport/rss.xml" },
  { id: "sky-sports", kategori: "spor", tur: "hizli-haber", dil: "en", guven: "bagimsiz", akis: "https://www.skysports.com/rss/12040" },
  { id: "ntvspor", kategori: "spor", tur: "hizli-haber", dil: "tr", guven: "bagimsiz", akis: "https://www.ntvspor.net/rss/anasayfa" },
  { id: "hurriyet-spor", kategori: "spor", tur: "hizli-haber", dil: "tr", guven: "bagimsiz", akis: "https://www.hurriyet.com.tr/rss/spor" },
  { id: "sozcu-spor", kategori: "spor", tur: "hizli-haber", dil: "tr", guven: "bagimsiz", akis: "https://www.sozcu.com.tr/feeds-rss-category-spor" },
  { id: "milliyet-spor", kategori: "spor", tur: "hizli-haber", dil: "tr", guven: "bagimsiz", akis: "https://www.milliyet.com.tr/rss/rssNew/sporRss.xml" },
  { id: "aa-spor", kategori: "spor", tur: "resmi-kurum", dil: "tr", guven: "bagimsiz", akis: "https://www.aa.com.tr/tr/rss/default?cat=spor" },
];

const KATEGORILER = [
  { anahtar: "siyaset", baslik: "Siyaset", degisken: "MANSET_SIYASET", dosya: "siyaset.js" },
  { anahtar: "teknoloji", baslik: "Teknoloji", degisken: "MANSET_TEKNOLOJI", dosya: "teknoloji.js" },
  { anahtar: "spor", baslik: "Spor", degisken: "MANSET_SPOR", dosya: "spor.js" },
];

// ---------------------------------------------------------------- yardımcılar
function temizle(s) {
  if (!s) return "";
  let t = String(s)
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
  return t.replace(/\s+/g, " ").trim();
}

function kisalt(s, n) {
  const t = temizle(s);
  if (t.length <= n) return t;
  const kesik = t.slice(0, n - 1);
  const bosluk = kesik.lastIndexOf(" ");
  return (bosluk > n * 0.6 ? kesik.slice(0, bosluk) : kesik).trim() + "…";
}

function etiket(blok, ad) {
  const m = blok.match(new RegExp(`<${ad}[^>]*>([\\s\\S]*?)</${ad}>`, "i"));
  return m ? m[1] : "";
}

function baglanti(blok) {
  const duz = etiket(blok, "link");
  if (duz && /^https?:/i.test(temizle(duz))) return temizle(duz);
  const href = blok.match(/<link[^>]*href=["']([^"']+)["']/i);
  return href ? temizle(href[1]) : "";
}

// RSS 2.0 <item> ve Atom <entry> bloklarını birlikte okur.
function akisCoz(xml) {
  const bloklar = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) || xml.match(/<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  return bloklar.map((b) => {
    const tarihMetni = temizle(etiket(b, "pubDate") || etiket(b, "published") || etiket(b, "updated") || etiket(b, "dc:date"));
    const t = tarihMetni ? new Date(tarihMetni) : null;
    return {
      baslik: kisalt(etiket(b, "title"), 200),
      ozet: kisalt(etiket(b, "description") || etiket(b, "summary") || etiket(b, "content"), 240),
      url: baglanti(b),
      tarih: t && !isNaN(t) ? t : null,
    };
  });
}

async function akisOku(kaynak) {
  const kontrol = new AbortController();
  const zaman = setTimeout(() => kontrol.abort(), 20000);
  try {
    const yanit = await fetch(kaynak.akis, {
      signal: kontrol.signal,
      redirect: "follow",
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; haberler-otomasyon/1.0; +https://bmenderes.github.io/haberler/)",
        accept: "application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.5",
      },
    });
    if (!yanit.ok) return { kaynak, hata: `HTTP ${yanit.status}`, haberler: [] };
    const xml = await yanit.text();
    const haberler = akisCoz(xml);
    if (!haberler.length) return { kaynak, hata: "akis bos/cozulemedi", haberler: [] };
    return { kaynak, hata: null, haberler };
  } catch (e) {
    return { kaynak, hata: e.name === "AbortError" ? "zaman asimi" : e.message, haberler: [] };
  } finally {
    clearTimeout(zaman);
  }
}

async function havuzda(kaynaklar) {
  const sonuc = [];
  for (let i = 0; i < kaynaklar.length; i += 6) {
    const parca = kaynaklar.slice(i, i + 6);
    sonuc.push(...(await Promise.all(parca.map(akisOku))));
  }
  return sonuc;
}

function esik() {
  return Date.now() - SAAT * 3600 * 1000;
}

// Türkiye saatine göre bugünün tarihi (YYYY-AA-GG).
function bugun() {
  try {
    return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Istanbul" }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}

function kelimeler(s) {
  return new Set(
    temizle(s)
      .toLocaleLowerCase("tr")
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter((k) => k.length > 3)
  );
}

// İki başlık aynı olayı mı anlatıyor? (kelime örtüşmesi)
function benzer(a, b) {
  const A = kelimeler(a), B = kelimeler(b);
  if (!A.size || !B.size) return false;
  let ortak = 0;
  for (const k of A) if (B.has(k)) ortak++;
  return ortak / Math.min(A.size, B.size) >= 0.6;
}

// Kaynak başına en çok 3 aday; sonra tarihe göre sırala, toplamı sınırla.
function adaySec(haberler, toplam = 40) {
  const eski = esik();
  const gruplar = new Map();
  for (const h of haberler) {
    if (!h.baslik || !h.url || !/^https?:/i.test(h.url)) continue;
    if (h.tarih && h.tarih.getTime() < eski) continue;
    if (!gruplar.has(h.kaynak)) gruplar.set(h.kaynak, []);
    gruplar.get(h.kaynak).push(h);
  }
  const adaylar = [];
  const secilen = [];
  for (const liste of gruplar.values()) {
    liste.sort((a, b) => (b.tarih?.getTime() || 0) - (a.tarih?.getTime() || 0));
    adaylar.push(...liste.slice(0, 3));
  }
  adaylar.sort((a, b) => (b.tarih?.getTime() || 0) - (a.tarih?.getTime() || 0));
  const tekil = [];
  for (const h of adaylar) {
    if (secilen.some((s) => benzer(s, h.baslik))) continue; // aynı olay tek satır
    secilen.push(h.baslik);
    tekil.push(h);
    if (tekil.length >= toplam) break;
  }
  return tekil;
}

function gun(iso) {
  return iso ? iso.slice(0, 10) : bugun();
}

function guvenliUrl(u) {
  try {
    const p = new URL(u);
    return p.protocol === "http:" || p.protocol === "https:" ? p.toString() : "";
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------- model
const SISTEM = `Sen Türkçe bir haber editörüsün. Sana bir kategori için kaynak başlıkları verilir.
Yalnızca JSON döndür: {"haberler":[{"metin":"...","detay":"...","kaynak":"...","url":"...","tur":"...","guven":"...","dil":"...","yayin_tarihi":"YYYY-AA-GG"}]}
Kurallar:
- metin: tek cümle, en fazla 140 karakter, Türkçe, abartısız, tırnaksız.
- detay: 1-2 cümle, en fazla 220 karakter; sayı ve tarih varsa koru. Uydurma bilgi ekleme.
- kaynak: verilen kaynak kimliklerinden biri (aynen).
- url: verilen adreslerden biri (aynen).
- tur ve guven: verilen değerlerden biri (aynen).
- dil: kaynağın dili (tr/en).
- Aynı olayı iki kaynak yazıyorsa tek satır yaz.
- Reklam, bülten daveti, podcast/video tanıtımı, indirim haberi, bahis oranı ALMA.
- İddia kaynağa aitse "açıkladı/duyurdu" yaz; "kanıtladı" yazma.
- En önemli haber ilk satırda olsun.`;

function istem(kategori, adaylar) {
  const satirlar = adaylar.map((h, i) =>
    `${i + 1}. kaynak=${h.kaynak} | tur=${h.tur} | guven=${h.guven} | dil=${h.dil} | tarih=${gun(h.tarih?.toISOString())} | url=${h.url}\n   baslik: ${h.baslik}\n   ozet: ${h.ozet || "(yok)"}`
  );
  return `KATEGORI: ${kategori}\nEn fazla ${SINIR} satır yaz.\n\nADAYLAR:\n${satirlar.join("\n")}`;
}

async function modelCagir(govde) {
  const yanit = await fetch(MODEL_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${MODEL_TOKEN}`,
      "x-github-api-version": "2022-11-28",
    },
    body: JSON.stringify(govde),
  });
  const metin = await yanit.text();
  if (!yanit.ok) throw new Error(`model HTTP ${yanit.status}: ${metin.slice(0, 200)}`);
  return metin;
}

function jsonAyikla(metin) {
  // API zarfı: {choices:[{message:{content:"..."}}]} — asıl yanıt content içindedir.
  let icerik = metin;
  try {
    const zarf = JSON.parse(metin);
    const c = zarf?.choices?.[0]?.message?.content;
    if (typeof c === "string") icerik = c;
  } catch {}
  const m = icerik.match(/\{[\s\S]*\}/);
  if (!m) throw new Error(`model yanıtında JSON yok: ${String(icerik).slice(0, 200)}`);
  return JSON.parse(m[0]);
}

async function modelleUret(kategori, adaylar) {
  const temel = {
    model: MODEL,
    temperature: 0.2,
    max_tokens: 1400,
    messages: [
      { role: "system", content: SISTEM },
      { role: "user", content: istem(kategori, adaylar) },
    ],
  };
  let ham;
  try {
    ham = await modelCagir({ ...temel, response_format: { type: "json_object" } });
  } catch (e) {
    if (!/HTTP 4\d\d/.test(e.message)) throw e;
    ham = await modelCagir(temel); // bazı modeller response_format kabul etmez
  }
  const veri = jsonAyikla(ham);
  const liste = Array.isArray(veri.haberler) ? veri.haberler : [];
  const izinli = new Set(adaylar.map((a) => guvenliUrl(a.url))); // uydurma link gelmesin
  return liste.slice(0, SINIR).map((h) => ({
    metin: kisalt(h.metin, 160),
    detay: kisalt(h.detay, 240),
    kaynak: String(h.kaynak || "").trim(),
    url: guvenliUrl(h.url),
    tur: String(h.tur || "").trim(),
    guven: h.guven === "uretici" ? "uretici" : "bagimsiz",
    dil: h.dil === "en" ? "en" : "tr",
    yayin_tarihi: /^\d{4}-\d{2}-\d{2}$/.test(h.yayin_tarihi || "") ? h.yayin_tarihi : bugun(),
    dogrulama: "tek-kaynak",
  })).filter((h) => h.metin && h.url && izinli.has(h.url));
}

// Model yoksa/hata verirse: akış başlıklarını olduğu gibi yaz.
function yedekUret(adaylar) {
  return adaylar.slice(0, SINIR).map((h) => ({
    metin: kisalt(h.baslik, 140),
    detay: "",
    kaynak: h.kaynak,
    url: h.url,
    tur: h.tur,
    guven: h.guven,
    dil: h.dil,
    yayin_tarihi: gun(h.tarih?.toISOString()),
    dogrulama: "tek-kaynak",
  }));
}

// ---------------------------------------------------------------- yazma
function jsSatir(h) {
  const alanlar = [
    `metin: ${JSON.stringify(h.metin)}`,
    h.detay ? `detay: ${JSON.stringify(h.detay)}` : null,
    `kaynak: ${JSON.stringify(h.kaynak)}`,
    `url: ${JSON.stringify(h.url)}`,
    `tur: ${JSON.stringify(h.tur)}`,
    `guven: ${JSON.stringify(h.guven)}`,
    `dil: ${JSON.stringify(h.dil)}`,
    `yayin_tarihi: ${JSON.stringify(h.yayin_tarihi)}`,
    `dogrulama: ${JSON.stringify(h.dogrulama)}`,
  ].filter(Boolean);
  return `    { ${alanlar.join(", ")} }`;
}

function mansetYaz(kategori, haberler, tarih) {
  const govde = haberler.length ? haberler.map(jsSatir).join(",\n") : "";
  return `/* ${kategori.baslik} manşetleri. Bu dosyayı otomasyon yazar; sayfa bunu okur. */
window.${kategori.degisken} = {
  tarih: ${JSON.stringify(tarih)},
  baslik: ${JSON.stringify(kategori.baslik)},
  mansetler: [
${govde}
  ]
};
`;
}

function ozetYaz(kategoriler, tarih) {
  const satirlar = [];
  for (const k of kategoriler) {
    for (const h of k.haberler) satirlar.push({ kategori: k.baslik, ...h });
  }
  const govde = satirlar.map(jsSatir).join(",\n");
  return `/* Günlük özet. Bu dosyayı otomasyon yazar; sayfa bunu okur. */
window.OZET = {
  tarih: ${JSON.stringify(tarih)},
  haberler: [
${govde}
  ]
};
`;
}

// ---------------------------------------------------------------- akış
async function main() {
  const basla = Date.now();
  console.log(`kaynak sayısı: ${KAYNAKLAR.length} | pencere: ${SAAT} sa | satır sınırı: ${SINIR}`);
  const okumalar = await havuzda(KAYNAKLAR);

  const okunan = okumalar.filter((o) => !o.hata);
  const hatali = okumalar.filter((o) => o.hata);
  console.log(`okunan akış: ${okunan.length} | okunamayan: ${hatali.length}`);
  for (const h of hatali) console.log(`  atlandı: ${h.kaynak.id} — ${h.hata}`);

  if (KONTROL) return;

  const sonuclar = [];
  for (const kategori of KATEGORILER) {
    const havuz = [];
    for (const o of okunan) {
      if (o.kaynak.kategori !== kategori.anahtar) continue;
      for (const h of o.haberler) havuz.push({ ...h, kaynak: o.kaynak.id, tur: o.kaynak.tur, guven: o.kaynak.guven, dil: o.kaynak.dil });
    }
    const adaylar = adaySec(havuz);
    let haberler = [];
    let yol = "yedek";
    if (adaylar.length && MODEL_TOKEN) {
      try {
        haberler = await modelleUret(kategori.baslik, adaylar);
        yol = `model(${MODEL})`;
      } catch (e) {
        console.log(`  ${kategori.anahtar}: model hatası — ${e.message}`);
      }
    }
    if (!haberler.length) haberler = yedekUret(adaylar);
    console.log(`  ${kategori.anahtar}: ${adaylar.length} aday → ${haberler.length} satır [${yol}]`);
    sonuclar.push({ ...kategori, haberler });
  }

  const tarih = bugun();
  const toplam = sonuclar.reduce((n, k) => n + k.haberler.length, 0);
  if (KURU) {
    console.log(`kuru çalışma: ${toplam} satır üretilirdi, dosya yazılmadı (${((Date.now() - basla) / 1000).toFixed(1)} sn)`);
    return;
  }
  if (!toplam) {
    console.log("hiç haber toplanamadı; mevcut dosyalar korunuyor");
    return;
  }

  if (!existsSync(CIKTI)) mkdirSync(CIKTI, { recursive: true });
  for (const k of sonuclar) writeFileSync(join(CIKTI, k.dosya), mansetYaz(k, k.haberler, tarih), "utf8");
  writeFileSync(join(CIKTI, "ozet.js"), ozetYaz(sonuclar, tarih), "utf8");
  console.log(`yazıldı: ${toplam} satır → haberler/{siyaset,teknoloji,spor,ozet}.js (${((Date.now() - basla) / 1000).toFixed(1)} sn)`);
}

main().catch((e) => {
  console.error("hata:", e);
  process.exit(1);
});
