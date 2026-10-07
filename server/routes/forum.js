const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
router.use(requireAuth);

router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM forum_posts WHERE dorm_id = ? ORDER BY created_at DESC").all(req.session.user.dormId));
});

router.post("/", (req, res) => {
  const { message } = req.body;
  if (!message?.trim()) return res.status(400).json({ error: "message required" });
  const info = db.prepare(
    "INSERT INTO forum_posts (dorm_id, user_id, name, message) VALUES (?,?,?,?)"
  ).run(req.session.user.dormId, req.session.user.id, req.session.user.name, message.trim());
  res.status(201).json(db.prepare("SELECT * FROM forum_posts WHERE id = ?").get(info.lastInsertRowid));
});

router.patch("/:id/flag", requireRole("ra", "admin"), (req, res) => {
  db.prepare("UPDATE forum_posts SET flagged = ? WHERE id = ? AND dorm_id = ?")
    .run(req.body.flagged ? 1 : 0, req.params.id, req.session.user.dormId);
  res.json(db.prepare("SELECT * FROM forum_posts WHERE id = ?").get(req.params.id));
});

router.delete("/:id", requireRole("ra", "admin"), (req, res) => {
  db.prepare("DELETE FROM forum_posts WHERE id = ? AND dorm_id = ?").run(req.params.id, req.session.user.dormId);
  res.json({ ok: true });
});

module.exports = router;