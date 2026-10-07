(function () {
  async function renderTree() {
    const tree = document.getElementById("fileTree");
    if (!tree) return;
    const folders = await api.getFiles();
    if (!folders) return;
    tree.innerHTML = "";
    if (!folders.length) {
      tree.innerHTML = `<p style="color:#aaa;">No folders yet.</p>`;
      return;
    }
    folders.forEach((folder, i) => {
      const wrapper = document.createElement("div");
      wrapper.className = "file-folder";

      const title = document.createElement("div");
      title.className = "folder-title";
      title.innerHTML = `<span>📁 ${folder.name}</span><span>▾</span>`;

      const contents = document.createElement("div");
      contents.className = "folder-contents";
      if (i === 0) contents.classList.add("open");

      folder.files.forEach(file => {
        const a = document.createElement("a");
        a.className = "file-item";
        a.href = file.url || "#";
        a.innerHTML = `<span>📄 ${file.name}</span><span>${file.size || ""}</span>`;
        if (!file.url) {
          a.addEventListener("click", (e) => {
            e.preventDefault();
            alert(`Downloading: ${file.name} (demo)`);
          });
        }
        contents.appendChild(a);
      });

      title.addEventListener("click", () => contents.classList.toggle("open"));
      wrapper.appendChild(title);
      wrapper.appendChild(contents);
      tree.appendChild(wrapper);
    });
  }

  document.addEventListener("DOMContentLoaded", renderTree);
  window.renderDirectory = renderTree;
})();