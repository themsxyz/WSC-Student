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
        action: P.C.API_ACTIONS.getNotices
      });

      if (!res.success) {
        throw new Error(res.error || "নোটিশ লোড হয়নি।");
      }

      const notices = res.notices || [];
      P.markNoticeSeen(notices);
      render(notices);
    } catch (err) {
      document.querySelector("#page").innerHTML = `<div class="msg error">${P.esc(err.message)}</div>`;
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

  function ticker(notices) {
    const list = notices.concat(notices);
    return `
      <div class="notice-ticker">
        <div class="notice-ticker-track">
          ${list.map(n => `<span>📢 ${P.esc(n.notice || "")}</span>`).join("")}
        </div>
      </div>
    `;
  }

  function card(item) {
    return `
      <article class="notice-card">
        <h3><i class="fa-solid fa-bell"></i> নোটিশ</h3>
        <p class="notice-message">${P.esc(item.notice || "")}</p>
        <div class="notice-meta">
          ${P.chip("প্রকাশ: " + P.formatDate(item.date), "primary", "fa-calendar")}
          ${P.chip("সময়: " + (item.noticeAppearDuration || "নির্দিষ্ট নয়"), "", "fa-clock")}
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