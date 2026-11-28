(function () {
  "use strict";

  const SESSION_URL_KEY = "hidude_admin_worker_url";
  const SESSION_SECRET_KEY = "hidude_admin_secret";
  const THEME_KEY = "hidude_admin_theme";

  const $ = (id) => document.getElementById(id);

  function isValidWorkerOrigin(rawUrl) {
    try {
      const parsed = new URL(rawUrl);
      if (parsed.protocol === "https:" && parsed.hostname.endsWith(".workers.dev")) {
        return true;
      }
      if (
        parsed.protocol === "http:" &&
        (parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost")
      ) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  function applyTheme(theme) {
    const clean = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", clean);
    try {
      localStorage.setItem(THEME_KEY, clean);
    } catch {
      // Ignore storage errors
    }
  }

  function initTheme() {
    let saved = "light";
    try {
      saved = localStorage.getItem(THEME_KEY) || "light";
    } catch {
      saved = "light";
    }
    applyTheme(saved);
    $("themeBtn").addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  function formatNumber(val) {
    return Number(val || 0).toLocaleString("tr-TR");
  }

  function formatTimestamp(ms) {
    if (!ms || Number(ms) <= 0) return "—";
    const d = new Date(Number(ms));
    return d.toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function showLoginError(message) {
    const el = $("loginError");
    el.textContent = message;
    el.classList.remove("hidden");
  }

  function clearLoginError() {
    const el = $("loginError");
    el.textContent = "";
    el.classList.add("hidden");
  }

  function setLoggedInView(loggedIn) {
    if (loggedIn) {
      $("loginSection").classList.add("hidden");
      $("dashboardSection").classList.remove("hidden");
      $("refreshBtn").classList.remove("hidden");
      $("logoutBtn").classList.remove("hidden");
    } else {
      $("loginSection").classList.remove("hidden");
      $("dashboardSection").classList.add("hidden");
      $("refreshBtn").classList.add("hidden");
      $("logoutBtn").classList.add("hidden");
      $("lastUpdatedLabel").textContent = "";
    }
  }

  async function loadDashboard(workerUrl, adminSecret) {
    const cleanUrl = workerUrl.trim().replace(/\/+$/, "");
    if (!isValidWorkerOrigin(cleanUrl)) {
      throw new Error(
        "Geçersiz Worker adresi. Güvenlik gereği yalnızca https://*.workers.dev veya localhost kabul edilir."
      );
    }

    const res = await fetch(`${cleanUrl}/admin/metrics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Secret": adminSecret,
      },
      body: "{}",
    });

    const data = await res.json().catch(() => null);
    if (res.status === 401) {
      throw new Error("Yönetici şifresi hatalı (401). Lütfen ADMIN_SECRET değerini kontrol edin.");
    }
    if (res.status === 503) {
      throw new Error(
        "Cloudflare Worker üzerinde ADMIN_SECRET henüz eklenmemiş veya eksik (503)."
      );
    }
    if (!res.ok || !data || !data.ok) {
      throw new Error((data && data.error) || `Sunucu hatası (HTTP ${res.status})`);
    }
    renderMetrics(data);
  }

  function renderMetrics(data) {
    const users = data.users || {};
    const today = data.today || {};
    const est = data.estimates || {};
    const lim = data.limits || {
      firestoreWrites: 20000,
      firestoreReads: 50000,
      firestoreDeletes: 20000,
      cloudflareReq: 100000,
    };

    $("lastUpdatedLabel").textContent = `Güncellendi: ${formatTimestamp(
      data.generatedAtUtcMillis || Date.now()
    )}`;

    const banner = $("capacityBanner");
    banner.classList.remove("amber", "red");
    const maxPct = Number(est.maxUtilizationPct || 0);
    $("bannerBadge").textContent = `Tepe Doluluk: %${maxPct}`;

    if (data.status === "red" || maxPct >= 80) {
      banner.classList.add("red");
      $("bannerTitle").textContent = "DUR EŞİĞİ (%80+) — Ücretsiz Kota Sınırına Çok Yaklaşıldı";
      $("bannerDesc").textContent =
        "Günlük ücretsiz kota dolmak üzere. Firebase Authentication üzerinden yeni kayıtları geçici olarak durdurun veya bütçe limitli Blaze plana geçin.";
    } else if (data.status === "amber" || maxPct >= 50) {
      banner.classList.add("amber");
      $("bannerTitle").textContent = "DİKKAT EŞİĞİ (%50–%80) — Trafik Yükseliyor";
      $("bannerDesc").textContent =
        "Ücretsiz Spark veya Cloudflare kotasının yarısı aşıldı. Yeni kullanıcı akışını yakından takip edin.";
    } else {
      $("bannerTitle").textContent = "DURUM RAHAT (< %50) — Ücretsiz Kapasite Güvenli";
      $("bannerDesc").textContent =
        "Günlük Firestore ve Cloudflare kullanımı ücretsiz sınırların oldukça altında. Yeni kullanıcı kabulüne güvenle devam edebilirsiniz.";
    }

    const totalUsers = Number(users.total || 0);
    const fcmActive = Number(users.fcmActive || 0);
    const fcmPct = totalUsers > 0 ? Math.round((fcmActive / totalUsers) * 100) : 0;

    $("kpiTotalUsers").textContent = formatNumber(totalUsers);
    $("kpiFcmSub").textContent = `${formatNumber(fcmActive)} cihaz FCM aktif (%${fcmPct})`;
    $("kpiActive24h").textContent = `${formatNumber(users.active24h)} (24s)`;
    $("kpiActive7d").textContent = `Son 7 gün aktif: ${formatNumber(users.active7d)}`;
    $("kpiTodayPush").textContent = formatNumber(today.totalPushes);
    $("kpiTodayBreak").textContent = `Mesaj: ${formatNumber(today.messages)} • Arama: ${formatNumber(
      today.calls
    )} (${formatNumber(today.videoCalls)} görüntülü) • Onay: ${formatNumber(today.approvals)}`;

    renderQuotaBars(est, lim);
    renderDailyChartAndTable(Array.isArray(data.daily) ? data.daily : []);
    renderLanguages(users.languages || {});
    renderRecentUsers(Array.isArray(users.recent) ? users.recent : []);
  }

  function renderQuotaBars(est, lim) {
    const container = $("quotaList");
    container.textContent = "";

    const rows = [
      {
        label: "Firestore Günlük Yazma (Spark Sınırı: 20.000)",
        value: Number(est.estWrites || 0),
        limit: Number(lim.firestoreWrites || 20000),
      },
      {
        label: "Firestore Günlük Okuma (Spark Sınırı: 50.000)",
        value: Number(est.estReads || 0),
        limit: Number(lim.firestoreReads || 50000),
      },
      {
        label: "Firestore Günlük Silme (Spark Sınırı: 20.000)",
        value: Number(est.estDeletes || 0),
        limit: Number(lim.firestoreDeletes || 20000),
      },
      {
        label: "Cloudflare Worker İsteği (Ücretsiz Sınır: 100.000)",
        value: Number(est.estWorkerReq || 0),
        limit: Number(lim.cloudflareReq || 100000),
      },
    ];

    rows.forEach((row) => {
      const pct = Math.min(100, Math.round((row.value / Math.max(1, row.limit)) * 1000) / 10);
      const wrap = document.createElement("div");
      wrap.className = "quota-item";

      const head = document.createElement("div");
      head.className = "quota-head";
      const titleSpan = document.createElement("span");
      titleSpan.textContent = row.label;
      const numSpan = document.createElement("span");
      numSpan.className = "mono";
      numSpan.textContent = `${formatNumber(row.value)} / ${formatNumber(row.limit)} (%${pct})`;
      head.append(titleSpan, numSpan);

      const bar = document.createElement("div");
      bar.className = "quota-bar";
      const fill = document.createElement("div");
      fill.className = "quota-fill" + (pct >= 80 ? " red" : pct >= 50 ? " amber" : "");
      fill.style.width = `${pct}%`;
      bar.appendChild(fill);

      wrap.append(head, bar);
      container.appendChild(wrap);
    });

    const fcmNote = document.createElement("div");
    fcmNote.className = "quota-item";
    const fcmHead = document.createElement("div");
    fcmHead.className = "quota-head";
    const fcmTitle = document.createElement("span");
    fcmTitle.textContent = "Google FCM Push Bildirimi";
    const fcmRight = document.createElement("span");
    fcmRight.className = "mono";
    fcmRight.textContent = "Sınırsız — Tamamen Ücretsiz";
    fcmHead.append(fcmTitle, fcmRight);
    fcmNote.appendChild(fcmHead);
    container.appendChild(fcmNote);
  }

  function renderDailyChartAndTable(dailyList) {
    const chartWrap = $("dailyChart");
    const tbody = $("dailyTableBody");
    chartWrap.textContent = "";
    tbody.textContent = "";

    const slice = dailyList.slice(-14);
    if (slice.length === 0) {
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent =
        "Henüz push trafiği kaydedilmedi. Uygulamadan mesaj veya arama gönderildikçe günlük grafik dolacaktır.";
      chartWrap.appendChild(p);
      return;
    }

    const svgNs = "http://www.w3.org/2000/svg";
    const width = Math.max(560, slice.length * 46);
    const height = 170;
    const padBottom = 28;
    const padTop = 14;
    const plotH = height - padBottom - padTop;
    const maxVal = Math.max(1, ...slice.map((d) => Number(d.totalPushes || 0)));

    const svg = document.createElementNS(svgNs, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", String(height));

    slice.forEach((d, idx) => {
      const msg = Number(d.messages || 0);
      const call = Number(d.calls || 0);
      const app = Number(d.approvals || 0);
      const x = 16 + idx * ((width - 24) / slice.length);
      const barW = 24;

      const msgH = (msg / maxVal) * plotH;
      const callH = (call / maxVal) * plotH;
      const appH = (app / maxVal) * plotH;

      let yCursor = height - padBottom;

      const addRect = (h, color) => {
        if (h <= 0) return;
        const clampedH = Math.max(2, h);
        yCursor -= clampedH;
        const rect = document.createElementNS(svgNs, "rect");
        rect.setAttribute("x", String(x));
        rect.setAttribute("y", String(Math.max(padTop, yCursor)));
        rect.setAttribute("width", String(barW));
        rect.setAttribute("height", String(clampedH));
        rect.setAttribute("rx", "3");
        rect.setAttribute("fill", color);
        svg.appendChild(rect);
      };

      addRect(msgH, "#F5C400");
      addRect(callH, "#2C2C2A");
      addRect(appH, "#8A6900");

      const txt = document.createElementNS(svgNs, "text");
      txt.setAttribute("x", String(x + barW / 2));
      txt.setAttribute("y", String(height - 8));
      txt.setAttribute("text-anchor", "middle");
      txt.setAttribute("font-size", "10");
      txt.setAttribute("fill", "currentColor");
      txt.textContent = (d.date || "").slice(5);
      svg.appendChild(txt);
    });
    chartWrap.appendChild(svg);

    [...slice].reverse().forEach((d) => {
      const tr = document.createElement("tr");
      const cells = [
        d.date || "",
        formatNumber(d.totalPushes),
        formatNumber(d.messages),
        `${formatNumber(d.calls)} (${formatNumber(d.videoCalls)})`,
        formatNumber(d.approvals),
      ];
      cells.forEach((val, idx) => {
        const td = document.createElement("td");
        if (idx === 0) td.className = "mono";
        td.textContent = val;
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  function renderLanguages(languages) {
    const container = $("languageChips");
    container.textContent = "";
    const entries = Object.entries(languages).sort((a, b) => b[1] - a[1]);
    if (entries.length === 0) {
      const span = document.createElement("span");
      span.className = "muted";
      span.textContent = "Dil verisi yok";
      container.appendChild(span);
      return;
    }
    entries.forEach(([lang, count]) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = `${lang.toUpperCase()}: ${formatNumber(count)}`;
      container.appendChild(chip);
    });
  }

  function renderRecentUsers(recent) {
    const tbody = $("recentUsersBody");
    tbody.textContent = "";
    if (recent.length === 0) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 5;
      td.className = "muted";
      td.textContent = "Henüz kayıtlı kullanıcı bulunamadı.";
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }
    recent.forEach((u) => {
      const tr = document.createElement("tr");
      const c1 = document.createElement("td");
      c1.className = "mono";
      c1.textContent = u.maskedUid || "***";

      const c2 = document.createElement("td");
      c2.textContent = u.displayName || "HiDude Kullanıcısı";

      const c3 = document.createElement("td");
      c3.textContent = (u.languageCode || "tr").toUpperCase();

      const c4 = document.createElement("td");
      c4.textContent = u.hasFcm ? "Aktif" : "Pasif";

      const c5 = document.createElement("td");
      c5.className = "mono";
      c5.textContent = formatTimestamp(u.updatedAtUtcMillis);

      tr.append(c1, c2, c3, c4, c5);
      tbody.appendChild(tr);
    });
  }

  function updateSimulator() {
    const activeUsers = Number($("simUsersRange").value || 250);
    const msgPerUser = Number($("simMsgRange").value || 25);
    const callsPerUser = Number($("simCallRange").value || 2);

    $("simUsersVal").textContent = formatNumber(activeUsers);
    $("simMsgVal").textContent = formatNumber(msgPerUser);
    $("simCallVal").textContent = formatNumber(callsPerUser);

    const pushSignalsPerUser = msgPerUser + callsPerUser;
    const firestoreDocsPerUser = msgPerUser + callsPerUser * 8;
    const totalPushes = activeUsers * pushSignalsPerUser;
    const totalDocs = activeUsers * firestoreDocsPerUser;
    const writes = totalDocs + activeUsers * 2;
    const reads = totalPushes * 2 + activeUsers * callsPerUser * 8 + activeUsers * 4;
    const deletes = totalDocs;
    const workerReq = totalPushes;

    const maxWritesUsers = Math.floor(20000 / Math.max(1, firestoreDocsPerUser + 2));
    const maxReadsUsers = Math.floor(
      50000 / Math.max(1, pushSignalsPerUser * 2 + callsPerUser * 8 + 4)
    );
    const maxWorkerUsers = Math.floor(100000 / Math.max(1, pushSignalsPerUser));
    const maxSafeUsers = Math.min(maxWritesUsers, maxReadsUsers, maxWorkerUsers);

    const bottleneck =
      maxWritesUsers <= maxReadsUsers && maxWritesUsers <= maxWorkerUsers
        ? "Firestore Yazma (20.000/gün)"
        : maxReadsUsers <= maxWorkerUsers
          ? "Firestore Okuma (50.000/gün)"
          : "Cloudflare İsteği (100.000/gün)";

    const summary = $("simSummary");
    summary.textContent = "";
    const line1 = document.createElement("div");
    const strong = document.createElement("strong");
    strong.textContent = `Ücretsiz Tavsiye Sınırı: ~${formatNumber(maxSafeUsers)} günlük aktif kullanıcı`;
    line1.appendChild(strong);

    const line2 = document.createElement("div");
    line2.style.marginTop = "4px";
    line2.textContent = `İlk dolacak kota: ${bottleneck}. Mevcut senaryoda tahmini günlük işlem — Yazma: ${formatNumber(
      writes
    )} / 20.000, Okuma: ${formatNumber(reads)} / 50.000, Silme: ${formatNumber(
      deletes
    )} / 20.000, Worker: ${formatNumber(workerReq)} / 100.000.`;

    summary.append(line1, line2);
  }

  function initSimulator() {
    ["simUsersRange", "simMsgRange", "simCallRange"].forEach((id) => {
      $(id).addEventListener("input", updateSimulator);
    });
    updateSimulator();
  }

  function initAuth() {
    const savedUrl = sessionStorage.getItem(SESSION_URL_KEY);
    const savedSecret = sessionStorage.getItem(SESSION_SECRET_KEY);
    if (savedUrl) {
      $("workerUrlInput").value = savedUrl;
    }

    $("loginForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      clearLoginError();
      const workerUrl = $("workerUrlInput").value.trim().replace(/\/+$/, "");
      const adminSecret = $("adminSecretInput").value;
      const btn = $("loginSubmitBtn");
      btn.disabled = true;
      btn.textContent = "Bağlanılıyor...";
      try {
        await loadDashboard(workerUrl, adminSecret);
        sessionStorage.setItem(SESSION_URL_KEY, workerUrl);
        sessionStorage.setItem(SESSION_SECRET_KEY, adminSecret);
        setLoggedInView(true);
      } catch (err) {
        showLoginError(err.message || "Bağlantı başarısız oldu.");
      } finally {
        btn.disabled = false;
        btn.textContent = "Panele Bağlan";
      }
    });

    $("refreshBtn").addEventListener("click", async () => {
      const url = sessionStorage.getItem(SESSION_URL_KEY) || "";
      const sec = sessionStorage.getItem(SESSION_SECRET_KEY) || "";
      if (!url || !sec) return;
      const btn = $("refreshBtn");
      btn.disabled = true;
      btn.textContent = "Yenileniyor...";
      try {
        await loadDashboard(url, sec);
      } catch (err) {
        alert(err.message || "Veri yenilenemedi.");
      } finally {
        btn.disabled = false;
        btn.textContent = "Yenile";
      }
    });

    $("logoutBtn").addEventListener("click", () => {
      sessionStorage.removeItem(SESSION_SECRET_KEY);
      $("adminSecretInput").value = "";
      setLoggedInView(false);
    });

    if (savedUrl && savedSecret) {
      setLoggedInView(true);
      loadDashboard(savedUrl, savedSecret).catch((err) => {
        setLoggedInView(false);
        showLoginError(err.message || "Oturum süresi doldu.");
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initSimulator();
    initAuth();
  });
})();
