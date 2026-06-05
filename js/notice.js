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

      if (!res || res.success !== true) {
        throw new Error((res && res.error) ? res.error : "নোটিশ লোড হয়নি।");
      }

      const notices = Array.isArray(res.notices) ? res.notices : [];

      const activeNotices = notices.filter(item => {
        const status = String(item.status || "").toLowerCase().trim();
        return !status || status === "active";
      });

      P.markNoticeSeen(activeNotices);
      render(activeNotices);
    } catch (err) {
      document.querySelector("#page").innerHTML = `
        <section class="card">
          <div class="card-body">
            <div class="msg error">
              ${P.esc(err.message)}<br><br>
              Backend response ঠিক আছে কিনা console থেকে check করুন।
            </div>
            <button class="btn-soft" onclick="location.reload()">Reload</button>
          </div>
        </section>
      `;
    }
  }

  function render(notices) {
    document.querySelector("#page").innerHTML = `
      ${notices.length ? ticker(notices) : ""}

      <section class="card">
        <div class="card-head">
          <h2 class="card-title">
            <i class="fa-solid fa-bullhorn"></i> সক্রিয় নোটিশ
          </h2>
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
    return item.notice || item.message || item.title || item.Notice || item.Message || "";
  }

  function getNoticeDate(item) {
    return item.date || item.createdAt || item.timestamp || item.Date || item.Timestamp || "";
  }

  function getExpireDate(item) {
    return item.expireAt || item.expire_at || item.expiry || item.ExpireAt || "";
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
    const expireDate = getExpireDate(item);

    return `
      <article class="notice-card">
        <h3><i class="fa-solid fa-bell"></i> নোটিশ</h3>

        <p class="notice-message">${P.esc(noticeText)}</p>

        <div class="notice-meta">
          ${P.chip("প্রকাশ: " + (noticeDate || "-"), "primary", "fa-calendar")}
          ${P.chip("সময়: " + (item.noticeAppearDuration || "নির্দিষ্ট নয়"), "", "fa-clock")}
          ${P.chip("শেষ: " + (expireDate || "স্থায়ী"), "", "fa-hourglass-end")}
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
