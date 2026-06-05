(async () => {
  const P = Portal;
  const session = P.requireLogin();

  if (!session) return;

  P.renderShell("notice", "নোটিশ", "Notice Board");
  P.setPageLoader("নোটিশ লোড হচ্ছে...");

  await loadNotices();
  setInterval(loadNotices, P.C.NOTICE.autoRefreshSeconds * 1000);

  async function loadNotices() {
    try {
      const res = await P.apiGet({
        action: P.C.API_ACTIONS.getNotices,
        studentId: session.studentId || "",
        token: session.token || "",
        mobile: session.mobile || ""
      });

      console.log("Notice API response:", res);

      if (!res || res.success === false) {
        throw new Error((res && res.error) ? res.error : "নোটিশ লোড হয়নি। Backend response check করুন।");
      }

      const notices =
        res.notices ||
        res.notice ||
        res.data ||
        res.rows ||
        res.activeNotices ||
        [];

      const cleanNotices = Array.isArray(notices) ? notices : [];

      P.markNoticeSeen(cleanNotices);
      render(cleanNotices);
    } catch (err) {
      document.querySelector("#page").innerHTML = `
        <div class="msg error">
          ${P.esc(err.message)}<br><br>
          <strong>Check:</strong><br>
          1. config.js API_URL ঠিক আছে কিনা<br>
          2. Apps Script doGet এ getNotices action আছে কিনা<br>
          3. Apps Script deployment access Anyone করা আছে কিনা<br>
          4. Browser old service worker cache clear করা হয়েছে কিনা
        </div>
      `;
    }
  }

  function render(notices) {
    document.querySelector("#page").innerHTML = `
      ${notices.length ? ticker(notices) : ""}

      <section class="card">
        <div class="card-head">
          <h2 class="card-title"><i class="fa-solid fa-bullhorn"></i> সক্রিয় নোটিশ</h2>
          <button class="btn-soft" id="refreshNotice">
            <i class="fa-solid fa-rotate"></i> Refresh
          </button>
        </div>
        <div class="card-body">
          ${notices.length ? `
            <div class="stack">
              ${notices.map(card).join("")}
            </div>
          ` : empty()}
        </div>
      </section>
    `;

    document.querySelector("#refreshNotice").onclick = loadNotices;
  }

  function getNoticeText(item) {
    return item.notice || item.message || item.title || item.Notice || item.Message || item["Notice"] || "";
  }

  function getNoticeDate(item) {
    return item.date || item.createdAt || item.timestamp || item.Date || item.Timestamp || "";
  }

  function ticker(notices) {
    const list = notices.concat(notices);
    return `
      <div class="notice-ticker">
        <div class="notice-ticker-track">
          ${list.map(n => `<span>📢 ${P.esc(getNoticeText(n))}</span>`).join("")}
        </div>
      </div>
    `;
  }

  function card(item) {
    const noticeText = getNoticeText(item);
    const noticeDate = getNoticeDate(item);

    return `
      <article class="notice-card">
        <h3><i class="fa-solid fa-bell"></i> নোটিশ</h3>
        <p class="notice-message">${P.esc(noticeText)}</p>
        <div class="notice-meta">
          ${P.chip("প্রকাশ: " + P.formatDate(noticeDate), "primary", "fa-calendar")}
          ${P.chip("সময়: " + (item.noticeAppearDuration || item.duration || "নির্দিষ্ট নয়"), "", "fa-clock")}
          ${P.chip("শেষ: " + (item.expireAt ? P.formatDate(item.expireAt) : "স্থায়ী"), "", "fa-hourglass-end")}
        </div>
      </article>
    `;
  }

  function empty() {
    return `
      <div class="empty-state">
        <i class="fa-solid fa-bell-slash"></i>
        এই মুহূর্তে কোনো সক্রিয় নোটিশ নেই।
      </div>
    `;
  }
})();
