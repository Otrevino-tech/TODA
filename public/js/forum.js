(function () {
  const form = document.getElementById("forumForm");
  const msgInput = document.getElementById("forumMessage");
  const postsEl = document.getElementById("forumPosts");

  function esc(str) {
    const d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }

  async function renderPosts() {
    const posts = await api.getForum();
    if (!posts) return;
    postsEl.innerHTML = "";
    if (!posts.length) {
      postsEl.innerHTML = `<p style="color:#aaa;">No posts yet. Start the conversation!</p>`;
      return;
    }
    posts.forEach(p => {
      const div = document.createElement("div");
      div.className = "forum-post" + (p.flagged ? " flagged" : "");
      div.innerHTML = `
        <div class="meta">
          <span>${esc(p.name)}</span>
          <span>${new Date(p.created_at).toLocaleString()}</span>
        </div>
        <div class="body">${esc(p.message)}</div>
        ${p.flagged ? `<div class="flag-tag"> Flagged for review</div>` : ""}
      `;
      postsEl.appendChild(div);
    });
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const message = msgInput.value.trim();
    if (!message) return;
    await api.addPost({ message });
    form.reset();
    renderPosts();
  });

  document.addEventListener("DOMContentLoaded", renderPosts);
  window.renderForum = renderPosts;
})();