/* prayer-guide.js — Manevi Rehber sayfa mantığı */

const RELIGIONS = [
  { id: "islam",        label: "İslam",        emoji: "🕌" },
  { id: "hristiyanlik", label: "Hristiyanlık",  emoji: "✝️" },
  { id: "yahudilik",    label: "Yahudilik",     emoji: "✡️" },
  { id: "kabala",       label: "Kabalacılık",   emoji: "🌟" },
  { id: "hinduizm",     label: "Hinduluk",      emoji: "🕉️" },
  { id: "budizm",       label: "Budizm",        emoji: "☸️" },
  { id: "eklektik",     label: "Eklektik",      emoji: "🌀" }
];

const params = new URLSearchParams(window.location.search);
const hourData = {
  planet:   params.get("planet")   || "",
  planetTr: params.get("planetTr") || "",
  start:    params.get("start")    || "",
  end:      params.get("end")      || "",
  purpose:  params.get("purpose")  || "",
  segment:  params.get("segment")  || "",
  date:     params.get("date")     || ""
};

let selectedReligion = null;

/* ─── Init ─────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {
  if (typeof marked !== "undefined") {
    marked.setOptions({ breaks: true, gfm: true });
  }
  renderHourInfo();
  renderReligionGrid();
});

function goHome() {
  if (window.opener && !window.opener.closed) {
    window.close();
  } else {
    window.location.href = "/";
  }
}

/* ─── Hour Info Panel ───────────────────────────────────── */
function renderHourInfo() {
  const grid = document.getElementById("hourInfoGrid");
  const segLabel = hourData.segment === "day" ? "☀️ Gündüz" : "🌙 Gece";
  const items = [
    { label: "Tarih",       value: hourData.date,     full: true },
    { label: "Saat Aralığı", value: `${hourData.start} – ${hourData.end}` },
    { label: "Gezegen",     value: `${hourData.planetTr} (${hourData.planet})` },
    { label: "Dilim",       value: segLabel },
    { label: "Dua Amacı",   value: hourData.purpose,  full: true }
  ];

  grid.innerHTML = items.map(it => `
    <div class="hour-info-item${it.full ? " full" : ""}">
      <span class="hour-info-label">${it.label}</span>
      <span class="hour-info-value">${it.value || "—"}</span>
    </div>
  `).join("");
}

/* ─── Religion Grid ─────────────────────────────────────── */
function renderReligionGrid() {
  const grid = document.getElementById("religionGrid");
  grid.innerHTML = RELIGIONS.map(r => `
    <div class="religion-card" data-id="${r.id}" onclick="selectReligion('${r.id}','${r.label}')">
      <div class="religion-emoji">${r.emoji}</div>
      <div class="religion-label">${r.label}</div>
    </div>
  `).join("");
}

function selectReligion(id, label) {
  selectedReligion = { id, label };
  document.querySelectorAll(".religion-card").forEach(el => {
    el.classList.toggle("selected", el.dataset.id === id);
  });
  document.getElementById("selectedReligionLabel").textContent = label;
  const panel = document.getElementById("actionPanel");
  panel.style.display = "block";
  panel.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ─── Get Advice ────────────────────────────────────────── */
async function getPrayerAdvice() {
  if (!selectedReligion) return;

  const resultsPanel = document.getElementById("resultsPanel");
  const btn          = document.getElementById("getAdviceBtn");

  btn.disabled    = true;
  btn.textContent = "⏳ Manevi Danışman hazırlıyor…";

  resultsPanel.style.display = "block";
  resultsPanel.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <div class="loading-dots">
        <span>✨</span><span>🌿</span><span>🌟</span>
      </div>
      <p style="font-size:17px;font-weight:600;">Manevi Danışman cevabınızı hazırlıyor…</p>
      <small style="color:var(--text-muted)">
        ${hourData.planetTr} gezegeninin ${hourData.start}–${hourData.end} saatleri için
        ${selectedReligion.label} inanç çerçevesinde dua ve ritüeller derleniyor.
        Bu birkaç saniye sürebilir.
      </small>
    </div>`;
  resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });

  try {
    const response = await fetch("/.netlify/functions/prayer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planet:   hourData.planet,
        planetTr: hourData.planetTr,
        start:    hourData.start,
        end:      hourData.end,
        purpose:  hourData.purpose,
        segment:  hourData.segment,
        date:     hourData.date,
        religion: selectedReligion.label
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
      throw new Error(err.error || `Sunucu hatası: ${response.status}`);
    }

    const data = await response.json();
    if (data.error) throw new Error(data.error);

    /* ── Render results ── */
    resultsPanel.innerHTML = `
      <div class="results-header">
        <h3>✨ Manevi Danışman Önerileri</h3>
        <div class="results-meta">
          <span class="pill">${hourData.planetTr} (${hourData.planet})</span>
          <span class="pill">${hourData.start} – ${hourData.end}</span>
          <span class="pill">${selectedReligion.label}</span>
          <span class="pill">${hourData.date}</span>
        </div>
      </div>
      <div class="results-content" id="resultsContent"></div>`;

    const contentEl = document.getElementById("resultsContent");
    const fullText = data.text || "";

    // Final render
    if (fullText) {
      contentEl.innerHTML = (typeof marked !== "undefined")
        ? marked.parse(fullText)
        : fullText.replace(/\n/g, "<br>");
    } else {
      contentEl.innerHTML = "<p>Yanıt alınamadı. Lütfen tekrar deneyin.</p>";
    }

    // Add bottom action buttons
    resultsPanel.insertAdjacentHTML("beforeend", `
      <div style="margin-top:32px;display:flex;gap:12px;flex-wrap:wrap;border-top:1px solid rgba(16,185,129,0.2);padding-top:24px;">
        <button onclick="window.print()" style="flex:1;min-width:140px;">🖨️ Yazdır / PDF</button>
        <button onclick="resetForm()" style="flex:1;min-width:140px;background:rgba(255,255,255,0.1);border:1px solid rgba(16,185,129,0.3);">🔄 Yeni Din Seç</button>
        <button onclick="goHome()" style="flex:1;min-width:140px;background:rgba(255,255,255,0.1);border:1px solid rgba(249,115,22,0.3);">← Ana Sayfaya Dön</button>
      </div>`);

  } catch (err) {
    resultsPanel.innerHTML = `
      <div class="error-state">
        <h3>❌ Hata Oluştu</h3>
        <p>${err.message}</p>
        <small>Lütfen sunucunun çalıştığından ve .env dosyasında OPENAI_API_KEY'in ayarlı olduğundan emin olun.</small>
        <div style="margin-top:20px;">
          <button onclick="getPrayerAdvice()">🔄 Tekrar Dene</button>
        </div>
      </div>`;
  } finally {
    btn.disabled    = false;
    btn.textContent = "✨ Bu Saat Dilimi İçin Dua ve Ritüel Önerileri Al";
  }
}

function resetForm() {
  selectedReligion = null;
  document.querySelectorAll(".religion-card").forEach(el => el.classList.remove("selected"));
  document.getElementById("actionPanel").style.display   = "none";
  document.getElementById("resultsPanel").style.display  = "none";
  document.getElementById("religionGrid").scrollIntoView({ behavior: "smooth", block: "center" });
}
