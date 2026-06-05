(async () => {
  const P = Portal;
  const session = P.requireLogin();

  if (!session) return;

  P.renderShell("message", "মেসেজ", "Personal Message");
  P.setPageLoader("মেসেজ লোড হচ্ছে...");

  try {
    const res = await P.apiGet({
      action: P.C.API_ACTIONS.getStudentMessages,
      studentId: session.studentId,
      token: session.token || "",
      mobile: session.mobile || ""
    });

    if (!res.success) {
      renderBackendPending();
      return;
    }

    const messages = res.messages || [];
    render(messages);
  } catch {
    renderBackendPending();
  }

  function render(messages) {
    localStorage.setItem(P.C.STORAGE.messageDot, "0");
    P.updateDots();

    document.querySelector("#page").innerHTML = `
      <section class="card">
        <div class="card-head">
          <h2 class="card-title"><i class="fa-solid fa-envelope"></i> ব্যক্তিগত মেসেজ</h2>
        </div>
        <div class="card-body">
          ${messages.length ? `
            <div class="stack">
              ${messages.map(card).join("")}
            </div>
          ` : empty()}
        </div>
      </section>
    `;
  }

  function card(item) {
    return `
      <article class="message-card">
        <h3>${P.esc(item.title || "মেসেজ")}</h3>
        <p>${P.esc(item.message || "")}</p>
        <div class="message-meta">
          ${P.esc(item.date || item.createdAt || "")}
        </div>
      </article>
    `;
  }

  function empty() {
    return `
      <div class="empty-state">
        <i class="fa-solid fa-inbox"></i>
        আপনার জন্য কোনো ব্যক্তিগত মেসেজ নেই।
      </div>
    `;
  }

  function renderBackendPending() {
    document.querySelector("#page").innerHTML = `
      <section class="card">
        <div class="card-head">
          <h2 class="card-title"><i class="fa-solid fa-envelope"></i> ব্যক্তিগত মেসেজ</h2>
        </div>
        <div class="card-body">
          <div class="empty-state">
            <i class="fa-solid fa-screwdriver-wrench"></i>
            Message menu frontend ready আছে।<br>
            এই student-specific message দেখানোর backend system পরে যুক্ত করতে হবে।
          </div>
        </div>
      </section>
    `;
  }
})();