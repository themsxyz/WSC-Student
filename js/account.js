(async () => {
  const P = Portal;
  const session = P.requireLogin();

  if (!session) return;

  P.renderShell("account", "একাউন্ট সেটিংস", "Upload & Profile Update");
  P.setPageLoader("একাউন্ট তথ্য লোড হচ্ছে...");

  let data = null;

  try {
    data = await P.loadDashboard(true);
    render();
    P.checkNoticeNotification();
  } catch (err) {
    document.querySelector("#page").innerHTML = `<div class="msg error">${P.esc(err.message)}</div>`;
  }

  function render() {
    const profile = data.profile || {};
    const uploads = data.uploads || {};
    const pending = data.pendingUpdate;

    document.querySelector("#page").innerHTML = `
      ${data._offlineWarning ? `<div class="msg error">লাইভ ডাটা লোড হয়নি, cached/session data দেখানো হচ্ছে। ${P.esc(data._offlineWarning)}</div>` : ""}

      <div class="dashboard-grid">
        <aside class="profile-side">
          ${P.profileCard(profile)}
        </aside>

        <main class="stack">
          ${pending ? `
            <div class="msg success account-warning">
              <i class="fa-solid fa-circle-check"></i>
              <div>আপনার profile update request pending আছে। Request ID: ${P.esc(pending["Request ID"] || "-")}</div>
            </div>
          ` : ""}

          <section class="card">
            <div class="card-head">
              <h2 class="card-title"><i class="fa-solid fa-cloud-arrow-up"></i> ফাইল আপলোড</h2>
            </div>
            <div class="card-body">
              <div class="grid-2">
                ${uploadBox("student_picture", "শিক্ষার্থীর ছবি", "fa-image", "image/*", uploads, true)}
                ${uploadBox("fathers_nid", "পিতার NID", "fa-id-card", "image/*,.pdf", uploads, false)}
                ${uploadBox("mothers_nid", "মাতার NID", "fa-id-card", "image/*,.pdf", uploads, false)}
                ${uploadBox("birth_certificate", "জন্ম নিবন্ধন", "fa-file-lines", "image/*,.pdf", uploads, false)}
              </div>
              <div id="uploadMsg"></div>
            </div>
          </section>

          <section class="card">
            <div class="card-head">
              <h2 class="card-title"><i class="fa-solid fa-pen-to-square"></i> তথ্য সংশোধন ফর্ম</h2>
            </div>
            <div class="card-body">
              <form id="updateForm">
                <div class="grid-2">
                  ${field("name", "নতুন নাম", profile["Name"] || "")}
                  ${field("mobile", "নতুন মোবাইল", profile["Number"] || "", "tel")}
                  ${field("gender", "লিঙ্গ", profile["Gender"] || "")}
                  ${field("bloodGroup", "রক্তের গ্রুপ", profile["Blood group"] || "")}
                  ${field("fatherName", "পিতার নাম", profile["Fathers name"] || "")}
                  ${field("motherName", "মাতার নাম", profile["Mothers name"] || "")}
                  ${field("birthday", "জন্ম তারিখ", profile["Birthday"] || "", "date")}
                  ${field("birthCertificateNumber", "জন্ম নিবন্ধন নম্বর", profile["Birth certificate number"] || "")}
                  ${field("fatherNidNumber", "Father NID Number")}
                  ${field("motherNidNumber", "Mother NID Number")}
                  ${field("guardianMobile", "Guardian Mobile", "", "tel")}
                </div>

                <div class="field">
                  <label>ঠিকানা</label>
                  <textarea name="address">${P.esc(profile["Address"] || "")}</textarea>
                </div>

                <div class="field">
                  <label>নোট</label>
                  <textarea name="note" placeholder="প্রয়োজনে নোট লিখুন"></textarea>
                </div>

                <button class="btn-main" id="updateBtn">
                  <i class="fa-solid fa-paper-plane"></i> Update Request Submit করুন
                </button>
              </form>

              <div id="updateMsg"></div>
            </div>
          </section>
        </main>
      </div>

      <div id="cameraModal" class="modal-backdrop camera-modal"></div>
    `;

    document.querySelectorAll(".uploadInput").forEach(input => {
      input.onchange = uploadFromInput;
    });

    document.querySelectorAll(".cameraBtn").forEach(btn => {
      btn.onclick = () => openCamera(btn.dataset.type);
    });

    document.querySelector("#updateForm").onsubmit = updateProfile;
  }

  function uploadBox(type, title, icon, accept, uploads, camera) {
    const uploaded = uploads?.[type]?.[0];
    const url = uploaded?.["Direct View URL"] || uploaded?.["File URL"] || "";

    return `
      <article class="upload-card">
        <h3><i class="fa-solid ${icon}"></i> ${P.esc(title)}</h3>
        <p class="upload-note">
          ${uploaded
            ? `শেষ আপলোড: ${P.formatDate(uploaded["Timestamp"])}<br><a target="_blank" href="${P.esc(url)}">Uploaded file দেখুন</a>`
            : "এখনো কোনো ফাইল আপলোড করা হয়নি।"
          }
        </p>

        ${camera ? `
          <button class="btn-soft cameraBtn" data-type="${P.esc(type)}" type="button">
            <i class="fa-solid fa-camera"></i> Camera দিয়ে ছবি তুলুন
          </button>
          <div style="height:10px"></div>
        ` : ""}

        <div class="field">
          <label>ফাইল নির্বাচন করুন</label>
          <input class="uploadInput" data-type="${P.esc(type)}" type="file" accept="${P.esc(accept)}" ${camera ? "capture='user'" : ""}>
        </div>
      </article>
    `;
  }

  function field(name, label, value = "", type = "text") {
    return `
      <div class="field">
        <label>${P.esc(label)}</label>
        <input name="${P.esc(name)}" type="${P.esc(type)}" value="${P.esc(value)}">
      </div>
    `;
  }

  async function uploadFromInput(event) {
    const file = event.target.files[0];
    const type = event.target.dataset.type;

    if (!file) return;

    await uploadFile(file, type);
  }

  async function uploadFile(file, type) {
    const msg = document.querySelector("#uploadMsg");

    try {
      msg.innerHTML = `<div class="msg success"><i class="fa-solid fa-spinner fa-spin"></i> ${P.esc(file.name)} আপলোড হচ্ছে...</div>`;

      const base64Data = await P.fileToBase64(file);

      const res = await P.apiPost({
        action: P.C.API_ACTIONS.uploadFile,
        studentId: session.studentId,
        token: session.token || "",
        mobile: session.mobile || "",
        uploadType: type,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        base64Data
      });

      if (!res.success) {
        throw new Error(res.error || "Upload failed.");
      }

      localStorage.removeItem(P.C.STORAGE.dashboard);
      data = await P.loadDashboard(true);

      msg.innerHTML = `<div class="msg success">${P.esc(res.message || "সফলভাবে আপলোড হয়েছে।")}</div>`;
      render();
    } catch (err) {
      msg.innerHTML = `<div class="msg error">${P.esc(err.message)}</div>`;
    }
  }

  async function openCamera(type) {
    const modal = document.querySelector("#cameraModal");

    modal.classList.add("open");
    modal.innerHTML = `
      <div class="modal-card">
        <h2><i class="fa-solid fa-camera"></i> ছবি তুলুন</h2>
        <video id="cameraVideo" autoplay playsinline></video>
        <canvas id="cameraCanvas" style="display:none"></canvas>
        <div class="camera-actions">
          <button class="btn-main" id="captureBtn" type="button">Capture</button>
          <button class="btn-danger" id="closeCameraBtn" type="button">Close</button>
        </div>
        <div id="cameraMsg"></div>
      </div>
    `;

    let stream = null;

    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false
      });

      const video = document.querySelector("#cameraVideo");
      video.srcObject = stream;

      document.querySelector("#closeCameraBtn").onclick = close;
      document.querySelector("#captureBtn").onclick = async () => {
        const canvas = document.querySelector("#cameraCanvas");
        canvas.width = video.videoWidth || 900;
        canvas.height = video.videoHeight || 900;
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(async blob => {
          if (!blob) return;

          const file = new File([blob], "camera_photo_" + Date.now() + ".jpg", { type: "image/jpeg" });
          close();
          await uploadFile(file, type);
        }, "image/jpeg", 0.88);
      };
    } catch (err) {
      document.querySelector("#cameraMsg").innerHTML = `<div class="msg error">Camera permission পাওয়া যায়নি। File upload ব্যবহার করুন।</div>`;
      document.querySelector("#closeCameraBtn").onclick = close;
    }

    function close() {
      if (stream) stream.getTracks().forEach(track => track.stop());
      modal.classList.remove("open");
      modal.innerHTML = "";
    }
  }

  async function updateProfile(event) {
    event.preventDefault();

    const form = new FormData(event.target);
    const updateFields = {};

    form.forEach((value, key) => {
      updateFields[key] = String(value || "").trim();
    });

    const msg = document.querySelector("#updateMsg");
    const btn = document.querySelector("#updateBtn");

    try {
      btn.disabled = true;
      btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Submit হচ্ছে...`;

      const res = await P.apiPost({
        action: P.C.API_ACTIONS.submitProfileUpdate,
        studentId: session.studentId,
        token: session.token || "",
        mobile: session.mobile || "",
        updateFields
      });

      if (!res.success) {
        throw new Error(res.error || "Update request failed.");
      }

      localStorage.removeItem(P.C.STORAGE.dashboard);
      data = await P.loadDashboard(true);

      msg.innerHTML = `<div class="msg success">${P.esc(res.message || "সফলভাবে submit হয়েছে।")}</div>`;
      render();
    } catch (err) {
      msg.innerHTML = `<div class="msg error">${P.esc(err.message)}</div>`;
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Update Request Submit করুন`;
    }
  }
})();