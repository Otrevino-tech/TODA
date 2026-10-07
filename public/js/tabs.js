(function () {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");
  const hamburger = document.getElementById("hamburgerBtn");
  const closeBtn = document.getElementById("closeSidebar");
  const navLinks = document.querySelectorAll("#sidebarNav a[data-tab]");
  const panels = document.querySelectorAll(".tab-panel");

  function openSidebar() {
    sidebar.classList.add("open");
    overlay.classList.add("show");
  }
  function closeSidebar() {
    sidebar.classList.remove("open");
    overlay.classList.remove("show");
  }
  function switchTab(tabId) {
    panels.forEach(p => p.classList.toggle("active", p.id === tabId));
    navLinks.forEach(l => l.classList.toggle("active", l.dataset.tab === tabId));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  hamburger?.addEventListener("click", openSidebar);
  closeBtn?.addEventListener("click", closeSidebar);
  overlay?.addEventListener("click", closeSidebar);

  navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      switchTab(link.dataset.tab);
      if (window.innerWidth < 768) closeSidebar();
    });
  });

  window.switchTab = switchTab;
})();