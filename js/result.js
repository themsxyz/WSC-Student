(async () => {
  const P = Portal;
  const session = P.requireLogin();

  if (!session) return;

  P.renderShell("result", "রেজাল্ট", "Exam Result");
  P.setPageLoader("রেজাল্ট লোড হচ্ছে...");

  let data = null;
  let activeExam = "";

  try {
    data = await P.loadDashboard(true);
    const results = data.results || [];
    activeExam = results[0]?.["Exam Name"] || "1st Term";
    render();
    P.checkNoticeNotification();
  } catch (err) {
    document.querySelector("#page").innerHTML = `<div class="msg error">${P.esc(err.message)}</div>`;
  }

  function render() {
    const profile = data.profile || {};
    const results = data.results || [];
    const exams = [...new Set(results.map(r => r["Exam Name"]).filter(Boolean))];

    const selected =
      results.find(row => P.clean(row["Exam Name"]) === P.clean(activeExam)) ||
      results[0];

    const subjects = selected ? P.subjectList(selected) : [];

    document.querySelector("#page").innerHTML = `
      ${data._offlineWarning ? `<div class="msg error">লাইভ ডাটা লোড হয়নি, cached/session data দেখানো হচ্ছে। ${P.esc(data._offlineWarning)}</div>` : ""}

      <div class="dashboard-grid">
        <aside class="profile-side">
          ${P.profileCard(profile)}
        </aside>

        <main class="stack">
          <section class="card">
            <div class="card-head">
              <h2 class="card-title"><i class="fa-solid fa-chart-simple"></i> পরীক্ষার ফলাফল</h2>
              <div class="exam-tabs">
                ${(exams.length ? exams : ["1st Term", "2nd Term", "Annual"]).map(exam => `
                  <button class="exam-tab ${P.clean(exam) === P.clean(activeExam) ? "active" : ""}" data-exam="${P.esc(exam)}">
                    ${P.esc(exam)}
                  </button>
                `).join("")}
              </div>
            </div>

            <div class="card-body">
              ${selected ? resultBody(selected, subjects) : emptyResult()}
            </div>
          </section>
        </main>
      </div>
    `;

    document.querySelectorAll(".exam-tab").forEach(btn => {
      btn.onclick = () => {
        activeExam = btn.dataset.exam;
        render();
      };
    });
  }

  function resultBody(selected, subjects) {
    return `
      <div class="grid-4">
        ${P.sum("Exam", selected["Exam Name"] || "-", "blue", "fa-file-lines")}
        ${P.sum("Overall Grade", selected["Overall Grade"] || "-", "purple", "fa-award")}
        ${P.sum("Status", selected["Overall Status"] || "-", "green", "fa-circle-check")}
        ${P.sum("Pass Rate", selected["Pass Rate"] || "-", "gold", "fa-percent")}
      </div>

      <div style="height:16px"></div>

      ${subjects.length ? `
        <div class="grid-2">
          ${subjects.map(subjectCard).join("")}
        </div>
      ` : `
        <div class="empty-state">
          <i class="fa-solid fa-book"></i>
          Subject wise result পাওয়া যায়নি।
        </div>
      `}
    `;
  }

  function subjectCard(subject) {
    return `
      <article class="subject-card">
        <h3><i class="fa-solid fa-book-open"></i> ${P.esc(subject.subject)}</h3>

        <div class="marks-grid">
          <div class="mark-box">
            <small>Total</small>
            <strong>${P.esc(subject.total || "-")}</strong>
          </div>
          <div class="mark-box">
            <small>Obtain</small>
            <strong>${P.esc(subject.obtain || "-")}</strong>
          </div>
          <div class="mark-box">
            <small>Grade</small>
            <strong>${P.esc(subject.grade || "-")}</strong>
          </div>
        </div>

        ${P.status(subject.status || subject.grade || "-")}
      </article>
    `;
  }

  function emptyResult() {
    return `
      <div class="empty-state">
        <i class="fa-solid fa-chart-simple"></i>
        কোনো রেজাল্ট পাওয়া যায়নি।
      </div>
    `;
  }
})();