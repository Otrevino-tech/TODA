// Bootstraps: chores, events, staff, check-in
(function () {
  const { chores, events, staff } = window.APP_DATA;

  /* ---------- CHORES ---------- */
  const choreList = document.getElementById("choreList");
  if (choreList) {
    chores.forEach((c) => {
      const li = document.createElement("li");
      if (c.done) li.classList.add("done");
      li.innerHTML = `<span>${c.task}</span><span>Room ${c.room}</span>`;
      li.addEventListener("click", () => li.classList.toggle("done"));
      choreList.appendChild(li);
    });
  }

  /* ---------- EVENTS ---------- */
  const eventGrid = document.getElementById("eventGrid");
  if (eventGrid) {
    events.forEach((ev) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${ev.title}</h3>
        <p><strong>${ev.date}</strong> — ${ev.location}</p>
        <p>${ev.desc}</p>
      `;
      eventGrid.appendChild(card);
    });
  }

  /* ---------- STAFF ---------- */
  const staffGrid = document.getElementById("staffGrid");
  if (staffGrid) {
    staff.forEach((s) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${s.name}</h3>
        <p><em>${s.role}</em></p>
        <p>📞 <a href="tel:${s.phone}" style="color:#f5d76e;">${s.phone}</a></p>
        <p>✉️ <a href="mailto:${s.email}" style="color:#f5d76e;">${s.email}</a></p>
      `;
      staffGrid.appendChild(card);
    });
  }

  /* ---------- CHECK-IN/OUT ---------- */
  const checkForm = document.getElementById("checkForm");
  const checkLog = document.getElementById("checkLog");
  const CHECK_KEY = "royalhall_checkins";

  function renderCheckLog() {
    const logs = JSON.parse(localStorage.getItem(CHECK_KEY) || "[]");
    checkLog.innerHTML = "";
    logs
      .slice()
      .reverse()
      .forEach((log) => {
        const div = document.createElement("div");
        div.className = "log-item";
        div.textContent = `${log.action === "in" ? "✅ Checked IN" : "🚪 Checked OUT"} — ${log.name} (Room ${log.room}) • ${log.time}${log.notes ? " • " + log.notes : ""}`;
        checkLog.appendChild(div);
      });
  }

  checkForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(checkForm);
    const logs = JSON.parse(localStorage.getItem(CHECK_KEY) || "[]");
    logs.push({
      name: data.get("name"),
      room: data.get("room"),
      action: data.get("action"),
      notes: data.get("notes"),
      time: new Date().toLocaleString(),
    });
    localStorage.setItem(CHECK_KEY, JSON.stringify(logs));
    checkForm.reset();
    renderCheckLog();
  });

  renderCheckLog();
})();