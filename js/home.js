(async () => {
  const P = Portal;

  P.renderSplash();

  setTimeout(async () => {
    const session = P.getSession();

    if (!session) {
      renderLogin();
      return;
    }

    renderDashboard();
  }, 350);

  function renderLogin() {
    const C = P.C;
    const redirect = new URLSearchParams(location.search).get("redirect");
    const redirectNote = redirect ? `<div class="msg info">এই পৃষ্ঠাটি দেখতে লগইন করুন।</div>` : "";

    document.querySelector("#app").innerHTML = `
      <div class="login-screen">
        <section class="login-card">
          <img class="login-logo" src="${P.esc(C.APP.localIcon)}" alt="Logo">
          <h1>শিক্ষার্থী লগইন</h1>
          <p class="sub">
            <span class="en">Student ID</span> এবং registered mobile number দিয়ে লগইন করুন।
          </p>

          <form id="loginForm">
            <div class="field">
              <label><i class="fa-solid fa-id-card"></i> Student ID</label>
              <input id="studentId" type="text" inputmode="numeric" placeholder="যেমন: 100111" required>
            </div>

            <div class="field">
              <label><i class="fa-solid fa-phone"></i> মোবাইল নম্বর</label>
              <input id="mobile" type="tel" inputmode="tel" placeholder="017xxxxxxxx" required>
            </div>

            <button id="loginBtn" class="btn-main">
              <i class="fa-solid fa-right-to-bracket"></i> লগইন করুন
            </button>
          </form>

          <div id="loginMsg"></div>
          ${redirectNote}

          <div class="install-note">
            <i class="fa-solid fa-mobile-screen-button"></i>
            মোবাইলে browser menu থেকে <span class="en">Add to Home Screen</span> করলে app-এর মতো ব্যবহার করতে পারবেন।
          </div>
        </section>
      </div>
    `;

    document.querySelector("#studentId").addEventListener("input", event => {
      event.target.value = event.target.value.replace(/\D/g, "");
    });

    document.querySelector("#loginForm").addEventListener("submit", login);
  }

  async function login(event) {
    event.preventDefault();

    const C = P.C;
    const studentId = document.querySelector("#studentId").value.trim();
    const mobile = document.querySelector("#mobile").value.trim();
    const msg = document.querySelector("#loginMsg");
    const btn = document.querySelector("#loginBtn");

    msg.innerHTML = "";

    if (!studentId) {
      msg.innerHTML = `<div class="msg error">Student ID লিখুন।</div>`;
      return;
    }

    if (!mobile) {
      msg.innerHTML = `<div class="msg error">মোবাইল নম্বর লিখুন।</div>`;
      return;
    }

    try {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> যাচাই হচ্ছে...`;

      const res = await P.apiGet({
        action: C.API_ACTIONS.login,
        studentId,
        mobile
      });

      if (!res.success) {
        throw new Error(res.error || "লগইন তথ্য সঠিক নয়।");
      }

      P.setSession({
        studentId,
        mobile,
        token: res.token || "",
        profile: res.profile || {},
        loginAt: new Date().toISOString()
      });

      try {
        await P.requestAppPermissions();
      } catch {}

      try {
        const dash = await P.apiGet({
          action: C.API_ACTIONS.dashboard,
          studentId,
          token: res.token || "",
          mobile
        });

        if (dash.success) {
          P.setCache(dash);
        }
      } catch {}

      const redirect = new URLSearchParams(location.search).get("redirect");
      location.href = redirect ? redirect : C.ROUTES.home;
    } catch (err) {
      msg.innerHTML = `<div class="msg error">${P.esc(err.message)}</div>`;
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-right-to-bracket"></i> লগইন করুন`;
    }
  }

  async function renderDashboard() {
    P.renderShell("home", "ড্যাশবোর্ড", "Profile Overview");
    P.setPageLoader("ড্যাশবোর্ড লোড হচ্ছে...");

    try {
      const data = await P.loadDashboard(true);
      const profile = data.profile || {};
      const fees = data.fees || [];
      const results = data.results || [];
      const summary = data.feeSummary || {};
      const page = document.querySelector("#page");

      page.innerHTML = `
        ${data._offlineWarning ? `<div class="msg error">লাইভ ডাটা লোড হয়নি, cached/session data দেখানো হচ্ছে। ${P.esc(data._offlineWarning)}</div>` : ""}

        <div class="dashboard-grid">
          <aside class="profile-side">
            ${P.profileCard(profile)}
          </aside>

          <main class="stack">
            <section class="home-hero">
              <h2>স্বাগতম, ${P.esc(profile["Name"] || "শিক্ষার্থী")}</h2>
              <p>এখানে আপনার ব্যক্তিগত তথ্য, ফি, রেজাল্ট, নোটিশ, মেসেজ এবং একাউন্ট সেটিংস সহজভাবে দেখা যাবে।</p>
            </section>

            <section class="card">
              <div class="card-head">
                <h2 class="card-title"><i class="fa-solid fa-chart-pie"></i> দ্রুত সারাংশ</h2>
              </div>
              <div class="card-body">
                <div class="grid-4">
                  ${P.sum("Student ID", profile["Students ID"] || "-", "blue", "fa-id-card")}
                  ${P.sum("Total Paid", "৳ " + P.money(summary.totalPaid || 0), "green", "fa-sack-dollar")}
                  ${P.sum("Fee Records", fees.length, "gold", "fa-receipt")}
                  ${P.sum("Results", results.length, "purple", "fa-chart-simple")}
                </div>
              </div>
            </section>

            <section class="card details-card">
              <div class="card-head">
                <h2 class="card-title"><i class="fa-solid fa-address-card"></i> অন্যান্য তথ্য</h2>
              </div>
              <div class="card-body">
                ${P.fullProfileDetails(profile)}
              </div>
            </section>
          </main>
        </div>
      `;

      P.checkNoticeNotification();
    } catch (err) {
      document.querySelector("#page").innerHTML = `
        <div class="msg error">
          ${P.esc(err.message)}<br>
          সমাধান: config.js API_URL, Apps Script deploy access “Anyone”, এবং browser cache/service worker check করুন।
        </div>
      `;
    }
  }
})();