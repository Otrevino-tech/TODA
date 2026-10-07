const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
router.use(requireAuth, requireRole("admin"));

router.get("/stats", (req, res) => {
  const dormId = req.session.user.dormId;
  const c = (sql, ...a) => db.prepare(sql).get(dormId, ...a).c;
  res.json({
    users:      c("SELECT COUNT(*) AS c FROM users WHERE dorm_id = ?"),
    chores:     c("SELECT COUNT(*) AS c FROM chores WHERE dorm_id = ?"),
    openChores: c("SELECT COUNT(*) AS c FROM chores WHERE dorm_id = ? AND done = 0"),
    events:     c("SELECT COUNT(*) AS c FROM events WHERE dorm_id = ?"),
    alerts:     c("SELECT COUNT(*) AS c FROM alerts WHERE dorm_id = ?"),
    staff:      c("SELECT COUNT(*) AS c FROM staff WHERE dorm_id = ?"),
    forum:      c("SELECT COUNT(*) AS c FROM forum_posts WHERE dorm_id = ?"),
    flagged:    c("SELECT COUNT(*) AS c FROM forum_posts WHERE dorm_id = ? AND flagged = 1"),
    checkins:   c("SELECT COUNT(*) AS c FROM checkins WHERE dorm_id = ?"),
  });
});

router.get("/users", (req, res) =>
  res.json(db.prepare("SELECT id, display_name, role, created_at FROM users WHERE dorm_id = ? ORDER BY created_at").all(req.session.user.dormId)));

router.patch("/users/:id/role", (req, res) => {
  const { role } = req.body;
  if (!["resident","ra","admin"].includes(role))
    return res.status(400).json({ error: "Invalid role" });
  db.prepare("UPDATE users SET role = ? WHERE id = ? AND dorm_id = ?")
    .run(role, req.params.id, req.session.user.dormId);
  res.json({ ok: true });
});

router.delete("/users/:id", (req, res) => {
  db.prepare("DELETE FROM users WHERE id = ? AND dorm_id = ?")
    .run(req.params.id, req.session.user.dormId);
  res.json({ ok: true });
});

router.get("/moderation", (req, res) =>
  res.json(db.prepare("SELECT * FROM forum_posts WHERE dorm_id = ? AND flagged = 1 ORDER BY created_at DESC").all(req.session.user.dormId)));

router.post("/reset", (req, res) => {
  const dormId = req.session.user.dormId;
  db.transaction(() => {
    ["chores","events","alerts","staff","checkins","forum_posts","folders"].forEach(t =>
      db.prepare(`DELETE FROM ${t} WHERE dorm_id = ?`).run(dormId));
  })();
  res.json({ ok: true });
});

module.exports = router;