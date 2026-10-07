(async function () {
  const { user } = await api.me();
  if (!user) { window.location.href = "/login.html"; return; }
  if (user.role !== "admin") { window.location.href = "/"; return; }

  document.getElementById("userBadge").textContent =
    user.name.slice(0, 2).toUpperCase();

  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await api.logout();
    window.location.href = "/login.html";
  });

  /* ---------- OVERVIEW ---------- */
  async function renderStats() {
    const stats = await fetch("/api/admin/stats", { credentials: "include" }).then(r => r.json());
    const grid = document.getElementById("statsGrid");
    const labels = {
      users: "Users", chores: "Chores", openChores: "Open Chores",
      events: "Events", alerts: "Alerts", staff: "Staff",
      forum: "Forum Posts", flagged: "Flagged", checkins: "Check-ins",
    };
    grid.innerHTML = Object.entries(stats).map(([k, v]) =>
      `<div class="stat-card"><div class="num">${v}</div><div class="label">${labels[k] || k}</div></div>`
    ).join("");
  }

  /* ---------- CHORES ---------- */
  async function renderChores() {
    const items = await api.getChores();
    const el = document.getElementById("choreAdminList");
    el.innerHTML = "";
    items.forEach(c => {
      const row = document.createElement("div");
      row.className = "admin-row";
      row.innerHTML = `
        <div class="info"><strong>${c.task}</strong><small>Rm ${c.room || "-"} · ${c.assignee || "unassigned"} · Due ${c.due || "-"} · ${c.done ? "✅ Done" : "⏳ Open"}</small></div>
        <div class="actions"><button class="btn-small" data-del>Delete</button></div>
      `;
      row.querySelector("[data-del]").addEventListener("click", async () => {
        await api.deleteChore(c.id);
        renderChores(); renderStats();
      });
      el.appendChild(row);
    });
  }

  document.getElementById("choreForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await api.addChore({
      task: fd.get("task"), room: fd.get("room"),
      assignee: fd.get("assignee"), due: fd.get("due"), done: 0,
    });
    e.target.reset();
    renderChores(); renderStats();
  });

  /* ---------- EVENTS ---------- */
  async function renderEvents() {
    const items = await api.getEvents();
    const el = document.getElementById("eventAdminList");
    el.innerHTML = "";
    items.forEach(ev => {
      const row = document.createElement("div");
      row.className = "admin-row";
      row.innerHTML = `
        <div class="info"><strong>${ev.title}</strong><small>${ev.date || ""} · ${ev.location || ""} · ${ev.description || ""}</small></div>
        <div class="actions"><button class="btn-small" data-del>Delete</button></div>
      `;
      row.querySelector("[data-del]").addEventListener("click", async () => {
        await api.deleteEvent(ev.id);
        renderEvents(); renderStats();
      });
      el.appendChild(row);
    });
  }

  document.getElementById("eventForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await api.addEvent({
      title: fd.get("title"), date: fd.get("date"),
      location: fd.get("location"), description: fd.get("description"),
    });
    e.target.reset();
    renderEvents(); renderStats();
  });

  /* ---------- ALERTS ---------- */
  async function renderAlerts() {
    const items = await api.getAlerts();
    const el = document.getElementById("alertAdminList");
    el.innerHTML = "";
    items.forEach(a => {
      const row = document.createElement("div");
      row.className = "admin-row";
      row.innerHTML = `
        <div class="info"><strong>${a.level.toUpperCase()}:</strong> ${a.message}<small>${a.author || ""}</small></div>
        <div class="actions"><button class="btn-small" data-del>Delete</button></div>
      `;
      row.querySelector("[data-del]").addEventListener("click", async () => {
        await api.deleteAlert(a.id);
        renderAlerts(); renderStats();
      });
      el.appendChild(row);
    });
  }

  document.getElementById("alertForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await api.addAlert({
      level: fd.get("level"), message: fd.get("message"), author: fd.get("author"),
    });
    e.target.reset();
    renderAlerts(); renderStats();
  });

  /* ---------- STAFF ---------- */
  async function renderStaff() {
    const items = await api.getStaff();
    const el = document.getElementById("staffAdminList");
    el.innerHTML = "";
    items.forEach(s => {
      const row = document.createElement("div");
      row.className = "admin-row";
      row.innerHTML = `
        <div class="info"><strong>${s.name}</strong><small>${s.role || ""} · ${s.phone || ""} · ${s.email || ""}</small></div>
        <div class="actions"><button class="btn-small" data-del>Delete</button></div>
      `;
      row.querySelector("[data-del]").addEventListener("click", async () => {
        await api.deleteStaff(s.id);
        renderStaff(); renderStats();
      });
      el.appendChild(row);
    });
  }

  document.getElementById("staffForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await api.addStaff({
      name: fd.get("name"), role: fd.get("role"),
      phone: fd.get("phone"), email: fd.get("email"),
    });
    e.target.reset();
    renderStaff(); renderStats();
  });

  /* ---------- FILES ---------- */
  async function renderFiles() {
    const folders = await api.getFiles();
    const el = document.getElementById("folderAdminList");
    el.innerHTML = "";
    for (const f of folders) {
      const row = document.createElement("div");
      row.className = "admin-row";
      const fileList = f.files.map(x =>
        `<div style="display:flex;justify-content:space-between;font-size:.85rem;padding:.2rem 0;border-bottom:1px dashed #333">
          <span>📄 ${x.name} (${x.size || "—"})</span>
          <button class="btn-small" data-delfile="${x.id}">✕</button>
        </div>`).join("");
      row.innerHTML = `
        <div class="info">
          <strong>📁 ${f.name}</strong>
          <div style="margin-top:.4rem">${fileList || "<em>empty</em>"}</div>
          <form data-addfile style="display:flex;gap:.4rem;margin-top:.5rem">
            <input name="name" placeholder="File name" required style="flex:1;padding:.4rem;background:var(--black);color:white;border:1px solid var(--purple-light);border-radius:6px"/>
            <input name="size" placeholder="Size" style="width:80px;padding:.4rem;background:var(--black);color:white;border:1px solid var(--purple-light);border-radius:6px"/>
            <button class="btn-small">Add</button>
          </form>
        </div>
        <div class="actions"><button class="btn-small" data-delfolder>Delete Folder</button></div>
      `;
      row.querySelectorAll("[data-delfile]").forEach(btn =>
        btn.addEventListener("click", async () => {
          await api.deleteFile(btn.dataset.delfile);
          renderFiles(); renderStats();
        }));
      row.querySelector("[data-delfolder]").addEventListener("click", async () => {
        if (confirm(`Delete folder "${f.name}"?`)) {
          await api.deleteFolder(f.id);
          renderFiles(); renderStats();
        }
      });
      row.querySelector("[data-addfile]").addEventListener("submit", async (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        await api.addFile(f.id, { name: fd.get("name"), size: fd.get("size") });
        renderFiles(); renderStats();
      });
      el.appendChild(row);
    }
  }

  document.getElementById("folderForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await api.addFolder({ name: fd.get("name") });
    e.target.reset();
    renderFiles(); renderStats();
  });

  /* ---------- MODERATION ---------- */
  async function renderModeration() {
    const flagged = await fetch("/api/admin/moderation", { credentials: "include" }).then(r => r.json());
    const el = document.getElementById("moderationList");
    el.innerHTML = "";
    if (!flagged.length) {
      el.innerHTML = `<p style="color:#aaa;">No flagged posts. ✅</p>`;
      return;
    }
    flagged.forEach(p => {
      const row = document.createElement("div");
      row.className = "admin-row";
      row.innerHTML = `
        <div class="info"><strong>${p.name}</strong><small>${new Date(p.created_at).toLocaleString()}</small><p style="margin-top:.4rem">${p.message}</p></div>
        <div class="actions">
          <button class="btn-small" data-unflag>Unflag</button>
          <button class="btn-small" data-del>Delete</button>
        </div>
      `;
      row.querySelector("[data-unflag]").addEventListener("click", async () => {
        await api.flagPost(p.id, false);
        renderModeration(); renderStats();
      });
      row.querySelector("[data-del]").addEventListener("click", async () => {
        await api.deletePost(p.id);
        renderModeration(); renderStats();
      });
      el.appendChild(row);
    });
  }

  /* ---------- USERS ---------- */
  async function renderUsers() {
    const users = await fetch("/api/admin/users", { credentials: "include" }).then(r => r.json());
    const el = document.getElementById("userList");
    el.innerHTML = "";
    users.forEach(u => {
      const row = document.createElement("div");
      row.className = "admin-row";
      row.innerHTML = `
        <div class="info"><strong>${u.display_name}</strong><small>Role: ${u.role} · Joined ${new Date(u.created_at).toLocaleDateString()}</small></div>
        <div class="actions">
          <select data-role style="background:var(--black);color:white;border:1px solid var(--gold);border-radius:6px;padding:.3rem">
            <option value="resident" ${u.role==="resident"?"selected":""}>Resident</option>
            <option value="ra" ${u.role==="ra"?"selected":""}>RA</option>
            <option value="admin" ${u.role==="admin"?"selected":""}>Admin</option>
          </select>
          <button class="btn-small" data-del>Delete</button>
        </div>
      `;
      row.querySelector("[data-role]").addEventListener("change", async (e) => {
        await fetch(`/api/admin/users/${u.id}/role`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ role: e.target.value }),
        });
        renderUsers();
      });
      row.querySelector("[data-del]").addEventListener("click", async () => {
        if (confirm(`Delete user "${u.display_name}"?`)) {
          await fetch(`/api/admin/users/${u.id}`, { method: "DELETE", credentials: "include" });
          renderUsers(); renderStats();
        }
      });
      el.appendChild(row);
    });
  }

  /* ---------- DANGER ---------- */
  document.getElementById("resetBtn").addEventListener("click", async () => {
    if (!confirm("Reset ALL dorm data? This cannot be undone.")) return;
    await fetch("/api/admin/reset", { method: "POST", credentials: "include" });
    alert("Dorm data reset.");
    renderStats(); renderChores(); renderEvents(); renderAlerts();
    renderStaff(); renderFiles(); renderModeration();
  });

  /* ---------- INITIAL ---------- */
  await Promise.all([
    renderStats(), renderChores(), renderEvents(), renderAlerts(),
    renderStaff(), renderFiles(), renderModeration(), renderUsers(),
  ]);
})();