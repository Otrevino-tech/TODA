(function () {
  async function req(method, url, body) {
    const res = await fetch(url, {
      method,
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (res.status === 401) { window.location.href = "/login.html"; return null; }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  window.api = {
    me: () => req("GET", "/api/auth/me"),
    logout: () => req("POST", "/api/auth/logout"),

    getChores: () => req("GET", "/api/chores"),
    addChore: (c) => req("POST", "/api/chores", c),
    updateChore: (id, p) => req("PATCH", `/api/chores/${id}`, p),
    toggleChore: (id) => req("PATCH", `/api/chores/${id}/toggle`),
    deleteChore: (id) => req("DELETE", `/api/chores/${id}`),

    getEvents: () => req("GET", "/api/events"),
    addEvent: (e) => req("POST", "/api/events", e),
    deleteEvent: (id) => req("DELETE", `/api/events/${id}`),

    getAlerts: () => req("GET", "/api/alerts"),
    addAlert: (a) => req("POST", "/api/alerts", a),
    deleteAlert: (id) => req("DELETE", `/api/alerts/${id}`),

    getStaff: () => req("GET", "/api/staff"),
    addStaff: (s) => req("POST", "/api/staff", s),
    deleteStaff: (id) => req("DELETE", `/api/staff/${id}`),

    getFiles: () => req("GET", "/api/files"),
    addFolder: (f) => req("POST", "/api/files/folders", f),
    deleteFolder: (id) => req("DELETE", `/api/files/folders/${id}`),
    addFile: (fid, f) => req("POST", `/api/files/folders/${fid}/files`, f),
    deleteFile: (id) => req("DELETE", `/api/files/files/${id}`),

    getForum: () => req("GET", "/api/forum"),
    addPost: (p) => req("POST", "/api/forum", p),
    flagPost: (id, flag) => req("PATCH", `/api/forum/${id}/flag`, { flagged: flag }),
    deletePost: (id) => req("DELETE", `/api/forum/${id}`),

    getCheckins: () => req("GET", "/api/checkins"),
    addCheckin: (c) => req("POST", "/api/checkins", c),
    deleteCheckin: (id) => req("DELETE", `/api/checkins/${id}`),
  };
})();