const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
router.use(requireAuth);

router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM alerts WHERE dorm_id = ? ORDER BY created_at DESC").all(req.session.user.dormId));
});

router.post("/", requireRole("ra", "admin"), (req, res) => {
  const { level, message, author } = req.body;
  if (!message) return res.status(400).json({ error: "message required" });
  const info = db.prepare(
    "INSERT INTO alerts (dorm_id, level, message, author) VALUES (?,?,?,?)"
  ).run(req.session.user.dormId, level || "info", message, author || req.session.user.name);
  res.status(201).json(db.prepare("SELECT * FROM alerts WHERE id = ?").get(info.lastInsertRowid));
});

router.delete("/:id", requireRole("ra", "admin"), (req, res) => {
  db.prepare("DELETE FROM alerts WHERE id = ? AND dorm_id = ?").run(req.params.id, req.session.user.dormId);
  res.json({ ok: true });
});

module.exports = router;