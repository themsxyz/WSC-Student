const Portal = (() => {
  const C = window.PORTAL_CONFIG;

  const qs = (s, r = document) => r.querySelector(s);
  const qsa = (s, r = document) => Array.from(r.querySelectorAll(s));

  function esc(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initTheme() {
    document.documentElement.setAttribute("data-theme", localStorage.getItem("wsc_theme") || "light");
  }

  function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme") || "light";
    const next = current === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("wsc_theme", next);
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(C.STORAGE.session) || "null");
    } catch {
      return null;
    }
  }

  function setSession(data) {
    localStorage.setItem(C.STORAGE.session, JSON.stringify(data));
  }

  function clearSession() {
    localStorage.removeItem(C.STORAGE.session);
    localStorage.removeItem(C.STORAGE.dashboard);
  }

  function getCache() {
    try {
      return JSON.parse(localStorage.getItem(C.STORAGE.dashboard) || "null");
    } catch {
      return null;
    }
  }

  function setCache(data) {
    localStorage.setItem(C.STORAGE.dashboard, JSON.stringify(data));
  }

  function getQueryParam(name) {
    try {
      return new URLSearchParams(window.location.search).get(name) || "";
    } catch {
      return "";
    }
  }

  function requireLogin() {
    const s = getSession();

    if (!s || !s.studentId) {
      const currentPage = window.location.pathname.split("/").pop() || C.ROUTES.home;
      const redirectTarget = currentPage && currentPage !== C.ROUTES.home
        ? `${C.ROUTES.home}?redirect=${encodeURIComponent(currentPage)}`
        : C.ROUTES.home;

      location.href = redirectTarget;
      return null;
    }

    return s;
  }

  function requestJson(url, options = {}, timeoutMs = 12000) {
    return new Promise((resolve, reject) => {
      const controller = new AbortController();
      const timer = setTimeout(() => {
        controller.abort();
        reject(new Error("Request timeout. Backend/App URL check করুন।"));
      }, timeoutMs);

      fetch(url, {
        ...options,
        cache: "no-store",
        signal: controller.signal
      })
        .then(response => response.text())
        .then(text => {
          clearTimeout(timer);

          try {
            resolve(JSON.parse(text));
          } catch {
            reject(new Error("Backend JSON response পাওয়া যায়নি। App URL/deploy response check করুন।"));
          }
        })
        .catch(err => {
          clearTimeout(timer);
          reject(new Error(err.message || "Backend connection failed."));
        });
    });
  }

  function jsonp(params, timeoutMs = 6000) {
    return new Promise((resolve, reject) => {
      const callbackName = "wsc_jsonp_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
      const finalParams = { ...params, callback: callbackName, _: Date.now() };

      const query = new URLSearchParams(finalParams).toString();
      const separator = C.API_URL.includes("?") ? "&" : "?";
      const script = document.createElement("script");

      const timer = setTimeout(() => {
        cleanup();
        reject(new Error("JSONP timeout."));
      }, timeoutMs);

      window[callbackName] = data => {
        cleanup();
        resolve(data);
      };

      script.onerror = () => {
        cleanup();
        reject(new Error("JSONP connection failed."));
      };

      function cleanup() {
        clearTimeout(timer);
        delete window[callbackName];
        script.remove();
      }

      script.src = C.API_URL + separator + query;
      document.body.appendChild(script);
    });
  }

  async function apiGet(params) {
    /*
      This backend returns normal JSON in browser.
      So direct GET fetch must run first.
      JSONP is only fallback if backend later supports callback.
    */
    const query = new URLSearchParams({ ...params, _: Date.now() }).toString();
    const separator = C.API_URL.includes("?") ? "&" : "?";
    const url = C.API_URL + separator + query;

    try {
      return await requestJson(url, {
        method: "GET",
        redirect: "follow"
      }, 20000);
    } catch (fetchError) {
      try {
        return await jsonp(params, 5000);
      } catch (jsonpError) {
        throw new Error(
          fetchError.message ||
          jsonpError.message ||
          "Data load failed. Backend/CORS check needed."
        );
      }
    }
  }
  async function apiPost(payload) {
    return await requestJson(C.API_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    }, 30000);
  }

  async function loadDashboard(force = false) {
    const session = getSession();

    if (!session) return null;

    if (!force) {
      const cached = getCache();

      if (cached && cached.success && cached.profile) {
        return cached;
      }
    }

    try {
      const data = await apiGet({
        action: C.API_ACTIONS.dashboard,
        studentId: session.studentId,
        token: session.token || "",
        mobile: session.mobile || ""
      });

      if (!data.success) {
        throw new Error(data.error || "Dashboard data load হয়নি।");
      }

      setCache(data);
      return data;
    } catch (err) {
      const cached = getCache();

      if (cached && cached.success && cached.profile) {
        cached._offlineWarning = "";
        return cached;
      }

      if (session.profile) {
        return {
          success: true,
          profile: session.profile,
          fees: [],
          results: [],
          uploads: {},
          feeSummary: {},
          _offlineWarning: ""
        };
      }

      throw err;
    }
  }

  function money(value) {
    const n = parseFloat(String(value || "0").replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n.toLocaleString("en-BD", { maximumFractionDigits: 2 }) : "0";
  }

  function num(value) {
    const n = parseFloat(String(value || "0").replace(/[^\d.-]/g, ""));
    return Number.isFinite(n) ? n : 0;
  }

  function clean(value) {
    return String(value || "").trim().toLowerCase().replace(/\s+/g, " ");
  }

  function formatDate(value) {
    if (!value || value === "-") return "-";

    const d = new Date(value);

    if (isNaN(d.getTime())) {
      return String(value);
    }

    return d.toLocaleString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function driveId(url) {
    const s = String(url || "").trim();

    if (!s) return "";

    const m =
      s.match(/\/file\/d\/([^/]+)/) ||
      s.match(/[?&]id=([^&]+)/) ||
      s.match(/\/d\/([^/]+)/);

    if (m && m[1]) return m[1];

    if (/^[a-zA-Z0-9_-]{20,}$/.test(s)) return s;

    return "";
  }

  function fixImg(url) {
    const s = String(url || "").trim();

    if (!s) return "";

    const id = driveId(s);

    return id ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1000` : s;
  }

  function photoFromProfile(profile) {
    return fixImg(profile?.["Photo URL"] || profile?.["Photo"] || profile?.["Photo Original"] || "");
  }

  function info(label, value, icon = "fa-circle-info") {
    return `
      <div class="info-row">
        <small><i class="fa-solid ${icon}"></i> ${esc(label)}</small>
        <strong>${esc(value || "-")}</strong>
      </div>
    `;
  }

  function chip(text, type = "", icon = "") {
    return `<span class="chip ${type}">${icon ? `<i class="fa-solid ${icon}"></i>` : ""}${esc(text || "-")}</span>`;
  }

  function sum(label, value, color = "blue", icon = "fa-circle-info") {
    return `
      <div class="summary-card ${color}">
        <small><i class="fa-solid ${icon}"></i> ${esc(label)}</small>
        <strong>${esc(value || "-")}</strong>
      </div>
    `;
  }

  function status(value) {
    const text = String(value || "-");
    const l = clean(text);
    let cls = "";

    if (l.includes("pass") || l.includes("paid") || l.includes("active") || l.includes("ভালো")) {
      cls = "good";
    }

    if (l.includes("fail") || l.includes("due") || l.includes("unpaid") || l.includes("bad")) {
      cls = "bad";
    }

    return `<span class="status-pill ${cls}">${esc(text)}</span>`;
  }

  function subjectList(row) {
    return Object.keys(row || {})
      .filter(k => k.endsWith(" Total"))
      .map(k => {
        const subject = k.replace(" Total", "").trim();

        return {
          subject,
          total: row[subject + " Total"],
          obtain: row[subject + " Obtain"],
          grade: row[subject + " Grade"],
          status: row[subject + " Status"]
        };
      });
  }

  function feeItems(row) {
    const fields = [
      ["tuition_fee", "টিউশন ফি"],
      ["admission_fee", "ভর্তি ফি"],
      ["re_admission_fee", "পুনঃভর্তি ফি"],
      ["exam_fee", "পরীক্ষার ফি"],
      ["computer_fee", "কম্পিউটার ফি"],
      ["sports_fee", "খেলাধুলা ফি"],
      ["tc_fee", "টিসি ফি"],
      ["misc_fee", "বিবিধ ফি"]
    ];

    return fields
      .map(([key, label]) => ({ key, label, amount: num(row?.[key]) }))
      .filter(item => item.amount > 0);
  }

  function profileCard(profile) {
    const name = profile?.["Name"] || "শিক্ষার্থী";
    const photo = photoFromProfile(profile);
    const first = name.trim().charAt(0) || "S";

    return `
      <section class="card">
        <div class="card-body">
          ${photo
            ? `<img class="student-photo" src="${esc(photo)}" alt="${esc(name)}" referrerpolicy="no-referrer" onerror="this.style.display='none';this.nextElementSibling.style.display='grid';">`
            : ""
          }
          <div class="student-avatar" style="display:${photo ? "none" : "grid"}">${esc(first)}</div>

          <h2 class="student-name">${esc(name)}</h2>

          <div class="student-sub">
            ${chip("ID: " + (profile?.["Students ID"] || "-"), "primary", "fa-id-card")}
            ${chip("Roll: " + (profile?.["Roll"] || "-"), "primary", "fa-list-ol")}
            ${chip("Class: " + (profile?.["Class"] || "-"), "primary", "fa-school")}
          </div>
        </div>
      </section>
    `;
  }

  function fullProfileDetails(profile) {
    return `
      <div class="grid-2">
        ${info("মোবাইল নম্বর", profile["Number"], "fa-phone")}
        ${info("লিঙ্গ", profile["Gender"], "fa-venus-mars")}
        ${info("পিতার নাম", profile["Fathers name"], "fa-person")}
        ${info("মাতার নাম", profile["Mothers name"], "fa-person-dress")}
        ${info("জন্ম তারিখ", formatDate(profile["Birthday"]), "fa-cake-candles")}
        ${info("জন্ম নিবন্ধন নম্বর", profile["Birth certificate number"], "fa-id-card")}
        ${info("রক্তের গ্রুপ", profile["Blood group"], "fa-droplet")}
        ${info("ঠিকানা", profile["Address"], "fa-location-dot")}
      </div>
    `;
  }

  function getNoticeSeenIds() {
    try {
      return JSON.parse(localStorage.getItem(C.STORAGE.noticeSeen) || "[]");
    } catch {
      return [];
    }
  }

  function markNoticeSeen(notices) {
    const ids = (notices || []).map(n => n.noticeId).filter(Boolean);
    localStorage.setItem(C.STORAGE.noticeSeen, JSON.stringify(ids));
    localStorage.setItem(C.STORAGE.noticeDot, "0");
    updateDots();
  }

  function updateDots() {
    const noticeDot = localStorage.getItem(C.STORAGE.noticeDot) === "1";
    const messageDot = localStorage.getItem(C.STORAGE.messageDot) === "1";

    qsa('[data-menu-dot="notice"]').forEach(el => {
      el.style.display = noticeDot ? "inline-block" : "none";
    });

    qsa('[data-menu-dot="message"]').forEach(el => {
      el.style.display = messageDot ? "inline-block" : "none";
    });
  }

  async function checkNoticeNotification() {
    const session = getSession();

    if (!session) return;

    try {
      const res = await apiGet({ action: C.API_ACTIONS.getNotices });

      if (!res.success) return;

      const notices = res.notices || [];
      const seen = getNoticeSeenIds();
      const hasNew = notices.some(n => n.noticeId && !seen.includes(n.noticeId));

      if (hasNew && notices.length) {
        localStorage.setItem(C.STORAGE.noticeDot, "1");
        updateDots();

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification(C.NOTICE.notificationTitle, {
            body: notices[0].notice || C.NOTICE.notificationBody,
            icon: C.APP.localIcon
          });
        }
      }
    } catch {
      // silent
    }
  }

  function renderShell(active, title, subtitle = "") {
    const app = qs("#app");

    app.innerHTML = `
      <div class="app-shell">
        <aside class="desktop-sidebar">
          ${sidebarHtml(active)}
        </aside>

        <section class="content-shell">
          ${topbarHtml(active, title, subtitle)}
          <main id="page" class="page"></main>
        </section>
      </div>

      <div id="drawerBackdrop" class="mobile-drawer-backdrop"></div>
      <aside id="mobileDrawer" class="mobile-drawer" aria-hidden="true">
        <div class="mobile-drawer-head">
          <img src="${esc(C.APP.localIcon)}" alt="Logo">
          <div>
            <h2>${esc(C.APP.nameBn)}</h2>
            <p>${esc(C.APP.nameEn)}</p>
          </div>
        </div>
        <nav class="mobile-menu">
          ${menuHtml(active)}
        </nav>
        <div style="height:12px"></div>
        ${helplineHtml()}
      </aside>
    `;

    bindShell();
    updateDots();
  }

  function sidebarHtml(active) {
    return `
      <div class="sidebar-brand">
        <img class="sidebar-logo" src="${esc(C.APP.localIcon)}" alt="Logo">
        <div>
          <h2>${esc(C.APP.nameBn)}</h2>
          <p>${esc(C.APP.nameEn)}</p>
        </div>
      </div>

      <nav class="sidebar-menu">
        ${menuHtml(active)}
      </nav>

      ${helplineHtml()}
    `;
  }

  function menuHtml(active) {
    return C.MENU.map(item => `
      <a class="menu-link ${active === item.key ? "active" : ""}" href="${esc(item.route)}">
        <i class="fa-solid ${esc(item.icon)}"></i>
        <span>${esc(item.labelBn)}</span>
        ${item.dot ? `<span class="menu-dot" data-menu-dot="${esc(item.dot)}" style="display:none"></span>` : ""}
      </a>
    `).join("");
  }

  function topbarHtml(active, title, subtitle) {
    return `
      <header class="topbar">
        <div class="topbar-brand">
          <img class="topbar-logo" src="${esc(C.APP.localIcon)}" alt="Logo">
          <div class="topbar-title">
            <h1>${esc(title)}</h1>
            <p>${esc(subtitle)}</p>
          </div>
        </div>

        <div class="topbar-actions">
          <button class="icon-btn hide-mobile" id="clearCacheBtn" title="Clear Cache">
            <i class="fa-solid fa-broom"></i>
          </button>
          <button class="icon-btn hide-mobile" id="installBtn" title="Install App">
            <i class="fa-solid fa-download"></i>
          </button>
          <button class="icon-btn hide-mobile" id="themeBtn" title="Theme">
            <i class="fa-solid fa-circle-half-stroke"></i>
          </button>
          <button class="icon-btn hide-mobile" id="logoutBtn" title="Logout">
            <i class="fa-solid fa-right-from-bracket"></i>
          </button>
          <button class="hamburger" id="menuBtn" aria-label="Menu" aria-expanded="false">
            <span></span><span></span>
          </button>
        </div>
      </header>
    `;
  }

  function helplineHtml() {
    return `
      <div class="sidebar-help">
        <h3><i class="fa-solid fa-headset"></i> ${esc(C.CONTACT.helplineTitleBn)}</h3>
        ${C.CONTACT.numbers.map(n => `
          <a href="tel:${esc(n.number)}"><i class="fa-solid fa-phone"></i> ${esc(n.number)}</a>
        `).join("")}
      </div>
    `;
  }

  function bindShell() {
    const menuBtn = qs("#menuBtn");
    const drawer = qs("#mobileDrawer");
    const backdrop = qs("#drawerBackdrop");

    function toggleDrawer(force) {
      const open = typeof force === "boolean" ? force : !drawer.classList.contains("open");
      drawer.classList.toggle("open", open);
      backdrop.classList.toggle("open", open);
      menuBtn.classList.toggle("open", open);
      menuBtn.setAttribute("aria-expanded", String(open));
      drawer.setAttribute("aria-hidden", String(!open));
      document.body.style.overflow = open ? "hidden" : "";
    }

    menuBtn?.addEventListener("click", () => toggleDrawer());
    backdrop?.addEventListener("click", () => toggleDrawer(false));

    qsa(".mobile-menu .menu-link").forEach(link => {
      link.addEventListener("click", () => toggleDrawer(false));
    });

    document.addEventListener("keydown", event => {
      if (event.key === "Escape") toggleDrawer(false);
    });

    qs("#themeBtn")?.addEventListener("click", toggleTheme);

    qs("#logoutBtn")?.addEventListener("click", () => {
      clearSession();
      location.href = C.ROUTES.home;
    });

    qs("#clearCacheBtn")?.addEventListener("click", clearAllCacheAndReload);

    qs("#installBtn")?.addEventListener("click", installApp);
  }

  async function clearAllCacheAndReload() {
    localStorage.removeItem(C.STORAGE.dashboard);

    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }

    if ("serviceWorker" in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.update().catch(() => {})));
    }

    alert("Cache clear হয়েছে। এখন reload হবে।");
    location.reload();
  }

  function setPageLoader(text = "লোড হচ্ছে...") {
    qs("#page").innerHTML = `
      <div class="splash-card" style="margin:60px auto">
        <div class="loader-line"><span></span></div>
        <p style="color:var(--muted);font-weight:800">${esc(text)}</p>
      </div>
    `;
  }

  function renderSplash() {
    qs("#app").innerHTML = `
      <div class="splash">
        <div class="splash-card">
          <img class="splash-logo" src="${esc(C.APP.localIcon)}" alt="Logo">
          <h1 class="splash-title">${esc(C.APP.shortName)}</h1>
          <p class="splash-subtitle">${esc(C.APP.nameEn)}</p>
          <div class="loader-line"><span></span></div>
        </div>
      </div>
    `;
  }

  async function requestAppPermissions() {
    try {
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }
    } catch {}
  }

  let deferredInstallPrompt = null;

  function setupPwa() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    }

    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault();
      deferredInstallPrompt = event;
    });
  }

  async function installApp() {
    if (!deferredInstallPrompt) {
      alert("Browser menu থেকে Add to Home Screen / Install App ব্যবহার করুন।");
      return;
    }

    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  initTheme();
  setupPwa();

  return {
    C,
    qs,
    qsa,
    esc,
    apiGet,
    apiPost,
    loadDashboard,
    getSession,
    setSession,
    clearSession,
    requireLogin,
    setCache,
    getCache,
    renderShell,
    renderSplash,
    setPageLoader,
    requestAppPermissions,
    checkNoticeNotification,
    markNoticeSeen,
    updateDots,
    installApp,
    money,
    num,
    clean,
    formatDate,
    fixImg,
    photoFromProfile,
    info,
    chip,
    sum,
    status,
    subjectList,
    feeItems,
    profileCard,
    fullProfileDetails,
    fileToBase64,
    getQueryParam,
    clearAllCacheAndReload
  };
})();
