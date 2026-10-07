(async function () {
  const form = document.getElementById("loginForm");
  const dormSelect = document.getElementById("dormSelect");
  const advToggle = document.getElementById("advToggle");
  const adminWrap = document.getElementById("adminWrap");
  const errorEl = document.getElementById("loginError");

  try {
    const res = await fetch("/api/auth/dorms");
    const { dorms } = await res.json();
    dormSelect.innerHTML = `<option value="">— Select your dorm —</option>` +
      dorms.map(d => `<option value="${d.id}">${d.name} — ${d.description||""}</option>`).join("");
  } catch { errorEl.textContent = "Could not load dorms."; }

  advToggle.addEventListener("click", () => {
    adminWrap.classList.toggle("show");
    if (!adminWrap.classList.contains("show")) document.getElementById("adminCode").value = "";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorEl.textContent = "";
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dormId: Number(dormSelect.value),
        displayName: document.getElementById("displayName").value,
        adminCode: document.getElementById("adminCode").value || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) { errorEl.textContent = data.error || "Login failed."; return; }
    window.location.href = data.user.role === "admin" ? "/admin" : "/";
  });
})();