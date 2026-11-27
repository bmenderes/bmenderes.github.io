/* Ürün vitrini istemci betiği — TR/EN dil seçimi, tema, filtreleme ve güvenli DOM çizimi. */
(function () {
  "use strict";

  const I18N = {
    tr: {
      navProducts: "Ürünler",
      navNews: "Günlük Haberler",
      heroBadge: "Otomatik Güncellenen Ürün Vitrini",
      heroTitle: "Üretilen Uygulamalar ve İndirilebilir Sürümler",
      heroLead:
        "Android, masaüstü ve web araçlarının güncel paketlerini doğrudan buradan indirin. Yeni bir sürüm yayımlandığında bu sayfa GitHub Actions ile kendiliğinden güncellenir.",
      heroBtnProducts: "Uygulamaları İncele",
      heroBtnNews: "Günlük Haberler",
      statProducts: "Listelenen Ürün",
      statDownloads: "İndirilebilir Paket",
      statUpdated: "Son Otomatik Kontrol",
      filterAll: "Tümü",
      filterAndroid: "Android",
      filterDesktop: "Masaüstü & Araçlar",
      filterWeb: "Web",
      searchPlaceholder: "Ürün veya özellik ara...",
      featuredBadge: "Öne Çıkan",
      emptyState: "Filtreye uyan ürün bulunamadı.",
      versionPrefix: "Sürüm",
      updatedPrefix: "Güncelleme",
      downloadBtn: "İndir",
      downloadCountSuffix: "indirme",
      noReleaseYet: "İlk sürüm paketi yakında GitHub Releases üzerinden eklenecek.",
      liveSiteBtn: "Canlı Site",
      releaseNotesBtn: "Sürüm Sayfası",
      sourceBtn: "Kaynak Kod",
      installGuideTitle: "Android Kurulum Adımları",
      releaseNotesTitle: "Sürüm Notları",
      autoSyncTitle: "Kendi Kendini Güncelleyen Mimari",
      autoSyncDesc:
        "Her yeni ürün yayımlandığında veya mevcut depolara yeni bir Release eklendiğinde otomasyon betiği ürün kataloğunu otomatik tarar ve indirme bağlantılarını günceller.",
      footerRight: "GitHub Pages üzerinde otomatik yayınlanır",
      platformLabels: {
        android: "Android APK",
        windows: "Windows",
        macos: "macOS",
        linux: "Linux",
        archive: "Paket",
        file: "Dosya"
      },
      categoryLabels: {
        android: "Android",
        desktop: "Masaüstü / Araç",
        web: "Web"
      }
    },
    en: {
      navProducts: "Products",
      navNews: "Daily News",
      heroBadge: "Self-Updating Product Portal",
      heroTitle: "Apps, Tools & Direct Downloads",
      heroLead:
        "Download the latest Android, desktop, and web releases directly from this portal. Whenever a new release is published, GitHub Actions updates this catalog automatically.",
      heroBtnProducts: "Browse Products",
      heroBtnNews: "Daily News",
      statProducts: "Listed Products",
      statDownloads: "Downloadable Assets",
      statUpdated: "Last Auto-Sync",
      filterAll: "All",
      filterAndroid: "Android",
      filterDesktop: "Desktop & Tools",
      filterWeb: "Web",
      searchPlaceholder: "Search products or features...",
      featuredBadge: "Featured",
      emptyState: "No products match the current filter.",
      versionPrefix: "Version",
      updatedPrefix: "Updated",
      downloadBtn: "Download",
      downloadCountSuffix: "downloads",
      noReleaseYet: "First downloadable release package will appear here automatically once published.",
      liveSiteBtn: "Live Site",
      releaseNotesBtn: "Release Page",
      sourceBtn: "Source Code",
      installGuideTitle: "Android Installation Steps",
      releaseNotesTitle: "Release Notes",
      autoSyncTitle: "Self-Updating Architecture",
      autoSyncDesc:
        "Whenever a new product or GitHub Release is published, the scheduled automation workflow scans releases and repositories and refreshes every download link automatically.",
      footerRight: "Published automatically on GitHub Pages",
      platformLabels: {
        android: "Android APK",
        windows: "Windows",
        macos: "macOS",
        linux: "Linux",
        archive: "Bundle",
        file: "File"
      },
      categoryLabels: {
        android: "Android",
        desktop: "Desktop / Tool",
        web: "Web"
      }
    }
  };

  let activeLang = "tr";
  let activeCategory = "all";
  let searchQuery = "";

  try {
    const savedLang = localStorage.getItem("siteLang");
    if (savedLang === "en" || savedLang === "tr") {
      activeLang = savedLang;
    }
  } catch (e) {
    activeLang = "tr";
  }

  function safeUrl(raw, allowRelative) {
    const str = String(raw || "").trim();
    if (!str) return "";
    if (allowRelative && !str.includes(":") && !str.startsWith("//")) {
      return str;
    }
    try {
      const parsed = new URL(str, window.location.href);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        return parsed.href;
      }
    } catch (e) {
      return "";
    }
    return "";
  }

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof text === "string") node.textContent = text;
    return node;
  }

  function pickText(obj, fallback) {
    if (!obj) return fallback || "";
    if (typeof obj === "string") return obj;
    return obj[activeLang] || obj.tr || obj.en || fallback || "";
  }

  function pickList(obj) {
    if (!obj) return [];
    const arr = obj[activeLang] || obj.tr || obj.en || [];
    return Array.isArray(arr) ? arr : [];
  }

  function formatDate(iso) {
    if (!iso) return "";
    const parsed = new Date(iso);
    if (Number.isNaN(parsed.getTime())) return "";
    return parsed.toLocaleDateString(activeLang === "tr" ? "tr-TR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function createIconNode(item, title) {
    const safeIcon = safeUrl(item.icon, true);
    if (safeIcon) {
      const wrap = el("div", "card-icon-wrap");
      const img = document.createElement("img");
      img.src = safeIcon;
      img.alt = title;
      img.className = "card-icon-img";
      img.loading = "lazy";
      wrap.appendChild(img);
      return wrap;
    }
    const letter = (title || item.slug || "P").trim().charAt(0).toUpperCase();
    return el("div", "card-icon-fallback", letter);
  }

  function buildDownloadButton(asset, t) {
    const href = safeUrl(asset.url, false);
    if (!href) return null;

    const btn = document.createElement("a");
    btn.className = "download-btn";
    btn.href = href;
    btn.setAttribute("rel", "noopener noreferrer");

    const platformName = t.platformLabels[asset.platform] || asset.platform || "File";
    const left = el("span", "download-btn-main", `${t.downloadBtn} • ${platformName}`);
    const metaParts = [];
    if (asset.sizeLabel) metaParts.push(asset.sizeLabel);
    if (asset.downloadCount > 0) metaParts.push(`${asset.downloadCount} ${t.downloadCountSuffix}`);
    if (asset.name) metaParts.push(asset.name);

    btn.appendChild(left);
    if (metaParts.length > 0) {
      btn.appendChild(el("span", "download-btn-meta", metaParts.join(" · ")));
    }
    return btn;
  }

  function buildProductCard(item, t) {
    const card = el("article", item.featured ? "product-card featured" : "product-card");
    const title = pickText(item.title, item.slug);
    const tagline = pickText(item.tagline, "");
    const description = pickText(item.description, "");
    const highlights = pickList(item.highlights);
    const installNote = pickList(item.installNote);

    const header = el("div", "card-head");
    header.appendChild(createIconNode(item, title));

    const headText = el("div", "card-head-text");
    const badgeRow = el("div", "badge-row");
    if (item.featured) {
      badgeRow.appendChild(el("span", "badge badge-featured", t.featuredBadge));
    }
    if (item.version) {
      badgeRow.appendChild(el("span", "badge badge-version", `${t.versionPrefix} ${item.version}`));
    }
    for (const cat of item.categories || []) {
      const catLabel = t.categoryLabels[cat] || cat;
      badgeRow.appendChild(el("span", "badge badge-cat", catLabel));
    }
    if (badgeRow.childNodes.length > 0) {
      headText.appendChild(badgeRow);
    }

    headText.appendChild(el("h3", "card-title", title));
    if (tagline) {
      headText.appendChild(el("p", "card-tagline", tagline));
    }
    header.appendChild(headText);
    card.appendChild(header);

    if (description) {
      card.appendChild(el("p", "card-desc", description));
    }

    if (highlights.length > 0) {
      const ul = el("ul", "card-highlights");
      for (const point of highlights) {
        ul.appendChild(el("li", "", point));
      }
      card.appendChild(ul);
    }

    const downloadWrap = el("div", "download-zone");
    const assets = Array.isArray(item.assets) ? item.assets : [];
    if (assets.length > 0) {
      for (const asset of assets) {
        const btn = buildDownloadButton(asset, t);
        if (btn) downloadWrap.appendChild(btn);
      }
    } else if (item.alwaysShow) {
      downloadWrap.appendChild(el("p", "pending-note", t.noReleaseYet));
    }
    if (downloadWrap.childNodes.length > 0) {
      card.appendChild(downloadWrap);
    }

    if (installNote.length > 0) {
      const details = el("details", "card-details");
      details.appendChild(el("summary", "", t.installGuideTitle));
      const ol = el("ol", "install-steps");
      for (const step of installNote) {
        ol.appendChild(el("li", "", step));
      }
      details.appendChild(ol);
      card.appendChild(details);
    }

    if (item.releaseNotes) {
      const notes = el("details", "card-details");
      notes.appendChild(el("summary", "", t.releaseNotesTitle));
      notes.appendChild(el("pre", "release-notes-pre", item.releaseNotes));
      card.appendChild(notes);
    }

    const footer = el("div", "card-footer");
    const metaInfo = [];
    const dateLabel = formatDate(item.updatedAt);
    if (dateLabel) metaInfo.push(`${t.updatedPrefix}: ${dateLabel}`);
    if (item.language) metaInfo.push(item.language);
    footer.appendChild(el("span", "card-meta-text", metaInfo.join(" · ")));

    const links = el("div", "card-links");
    const homeHref = safeUrl(item.homepageUrl, false);
    if (homeHref) {
      const aHome = el("a", "secondary-link", t.liveSiteBtn);
      aHome.href = homeHref;
      aHome.target = "_blank";
      aHome.rel = "noopener noreferrer";
      links.appendChild(aHome);
    }
    const relHref = safeUrl(item.releaseUrl, false);
    if (relHref) {
      const aRel = el("a", "secondary-link", t.releaseNotesBtn);
      aRel.href = relHref;
      aRel.target = "_blank";
      aRel.rel = "noopener noreferrer";
      links.appendChild(aRel);
    }
    const srcHref = safeUrl(item.sourceUrl, false);
    if (srcHref) {
      const aSrc = el("a", "secondary-link", t.sourceBtn);
      aSrc.href = srcHref;
      aSrc.target = "_blank";
      aSrc.rel = "noopener noreferrer";
      links.appendChild(aSrc);
    }
    footer.appendChild(links);
    card.appendChild(footer);

    return card;
  }

  function applyStaticTranslations(t, data) {
    document.documentElement.lang = activeLang;
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      const key = node.getAttribute("data-i18n");
      if (key && typeof t[key] === "string") {
        node.textContent = t[key];
      }
    });

    const searchInput = document.getElementById("product-search");
    if (searchInput) {
      searchInput.placeholder = t.searchPlaceholder;
    }

    document.querySelectorAll(".lang-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-set-lang") === activeLang);
    });

    const items = Array.isArray(data?.items) ? data.items : [];
    const assetCount = items.reduce(
      (sum, item) => sum + (Array.isArray(item.assets) ? item.assets.length : 0),
      0
    );

    const elCount = document.getElementById("stat-products-count");
    if (elCount) elCount.textContent = String(items.length);

    const elAssets = document.getElementById("stat-assets-count");
    if (elAssets) elAssets.textContent = String(assetCount);

    const elSync = document.getElementById("stat-sync-date");
    if (elSync) {
      elSync.textContent = formatDate(data?.generatedAt) || "—";
    }
  }

  function render() {
    const data = window.URUNLER_DATA || { items: [] };
    const t = I18N[activeLang] || I18N.tr;
    applyStaticTranslations(t, data);

    const grid = document.getElementById("products-grid");
    if (!grid) return;

    while (grid.firstChild) {
      grid.removeChild(grid.firstChild);
    }

    const q = searchQuery.trim().toLowerCase();
    const filtered = (data.items || []).filter((item) => {
      if (activeCategory !== "all" && !(item.categories || []).includes(activeCategory)) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        item.slug,
        pickText(item.title, ""),
        pickText(item.tagline, ""),
        pickText(item.description, ""),
        item.language || "",
        (item.categories || []).join(" ")
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });

    if (filtered.length === 0) {
      grid.appendChild(el("div", "empty-state", t.emptyState));
      return;
    }

    for (const item of filtered) {
      grid.appendChild(buildProductCard(item, t));
    }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("siteTheme", theme);
    } catch (e) {}
    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.textContent = theme === "dark" ? "☀" : "☾";
    }
  }

  function init() {
    let savedTheme = "light";
    try {
      if (localStorage.getItem("siteTheme") === "dark") {
        savedTheme = "dark";
      }
    } catch (e) {}
    setTheme(savedTheme);

    document.querySelectorAll("[data-set-lang]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const next = btn.getAttribute("data-set-lang");
        if (next === "tr" || next === "en") {
          activeLang = next;
          try {
            localStorage.setItem("siteLang", next);
          } catch (e) {}
          render();
        }
      });
    });

    document.querySelectorAll("[data-filter]").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeCategory = btn.getAttribute("data-filter") || "all";
        document.querySelectorAll("[data-filter]").forEach((other) => {
          other.classList.toggle("active", other === btn);
        });
        render();
      });
    });

    const searchInput = document.getElementById("product-search");
    if (searchInput) {
      searchInput.addEventListener("input", (event) => {
        searchQuery = event.target.value || "";
        render();
      });
    }

    const themeBtn = document.getElementById("theme-toggle");
    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
        setTheme(current === "dark" ? "light" : "dark");
      });
    }

    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
