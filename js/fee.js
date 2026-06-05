(async () => {
  const P = Portal;
  const session = P.requireLogin();

  if (!session) return;

  P.renderShell("fees", "ফি তথ্য", "Fees & Payment Details");
  P.setPageLoader("ফি তথ্য লোড হচ্ছে...");

  try {
    const data = await P.loadDashboard(true);
    const profile = data.profile || {};
    const fees = data.fees || [];
    const summary = data.feeSummary || {};

    document.querySelector("#page").innerHTML = `
      ${data._offlineWarning ? `<div class="msg error">লাইভ ডাটা লোড হয়নি, cached/session data দেখানো হচ্ছে। ${P.esc(data._offlineWarning)}</div>` : ""}

      <div class="dashboard-grid">
        <aside class="profile-side">
          ${P.profileCard(profile)}
        </aside>

        <main class="stack">
          <section class="fee-explain">
            <strong>সহজ ভাষায় ফি তথ্য:</strong><br>
            এখানে আপনার যতগুলো ফি payment record আছে, সেগুলো মাস অনুযায়ী দেখানো হয়েছে।
            মোট কত টাকা পরিশোধ হয়েছে, কতটি রিসিট আছে, কোন কোন মাসের payment আছে—সব তথ্য নিচে সহজভাবে দেওয়া আছে।
          </section>

          <section class="card">
            <div class="card-head">
              <h2 class="card-title"><i class="fa-solid fa-wallet"></i> ফি সারাংশ</h2>
            </div>
            <div class="card-body">
              <div class="grid-4">
                ${P.sum("মোট পরিশোধ", "৳ " + P.money(summary.totalPaid || 0), "green", "fa-sack-dollar")}
                ${P.sum("রিসিট সংখ্যা", summary.totalReceipts || fees.length, "blue", "fa-receipt")}
                ${P.sum("পরিশোধিত মাস", summary.paidMonths || 0, "gold", "fa-calendar-check")}
                ${P.sum("শেষ পেমেন্ট", P.formatDate(summary.lastPaymentDate), "purple", "fa-clock")}
              </div>
            </div>
          </section>

          <section class="card">
            <div class="card-head">
              <h2 class="card-title"><i class="fa-solid fa-list-check"></i> পেমেন্ট রেকর্ড</h2>
            </div>
            <div class="card-body">
              ${fees.length ? `<div class="fee-list">${fees.map(recordCard).join("")}</div>` : emptyFee()}
            </div>
          </section>
        </main>
      </div>
    `;

    P.checkNoticeNotification();
  } catch (err) {
    document.querySelector("#page").innerHTML = `<div class="msg error">${P.esc(err.message)}</div>`;
  }

  function emptyFee() {
    return `
      <div class="empty-state">
        <i class="fa-solid fa-receipt"></i>
        কোনো ফি রেকর্ড পাওয়া যায়নি।
      </div>
    `;
  }

  function recordCard(record) {
    const items = P.feeItems(record);

    return `
      <article class="fee-record">
        <div class="fee-record-top">
          <div>
            <h3><i class="fa-solid fa-calendar-days"></i> ${P.esc(record.month || "মাস উল্লেখ নেই")}</h3>
            <p>
              রিসিট/মেমো: ${P.esc(record.receipt_id || "-")}<br>
              পেমেন্ট তারিখ: ${P.formatDate(record.payment_date)}
            </p>
          </div>
          <div class="fee-amount">৳ ${P.money(record.total)}</div>
        </div>

        <div class="chips">
          ${P.status(record.status || "Paid")}
          ${record.payment_method ? P.chip(record.payment_method, "primary", "fa-credit-card") : ""}
          ${record.pdf_link ? `<a class="chip primary" target="_blank" href="${P.esc(record.pdf_link)}"><i class="fa-solid fa-file-pdf"></i> PDF রিসিট</a>` : ""}
        </div>

        <div style="height:12px"></div>

        <div class="chips">
          ${items.length
            ? items.map(item => P.chip(`${item.label}: ৳${P.money(item.amount)}`)).join("")
            : P.chip("বিভাগভিত্তিক ফি তথ্য নেই")
          }
        </div>
      </article>
    `;
  }
})();