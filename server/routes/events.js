const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
router.use(requireAuth);

router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM events WHERE dorm_id = ? ORDER BY created_at DESC").all(req.session.user.dormId));
});

router.post("/", requireRole("ra", "admin"), (req, res) => {
  const { title, date, location, description } = req.body;
  if (!title) return res.status(400).json({ error: "title required" });
  const info = db.prepare(
    "INSERT INTO events (dorm_id, title, date, location, description) VALUES (?,?,?,?,?)"
  ).run(req.session.user.dormId, title, date || "", location || "", description || "");
  res.status(201).json(db.prepare("SELECT * FROM events WHERE id = ?").get(info.lastInsertRowid));
});

router.patch("/:id", requireRole("ra", "admin"), (req, res) => {
  const allowed = ["title", "date", "location", "description"];
  const fields = Object.keys(req.body).filter(k => allowed.includes(k));
  if (!fields.length) return res.status(400).json({ error: "No valid fields" });
  const set = fields.map(f => `${f} = ?`).join(", ");
  db.prepare(`UPDATE events SET ${set} WHERE id = ? AND dorm_id = ?`)
    .run(...fields.map(f => req.body[f]), req.params.id, req.session.user.dormId);
  res.json(db.prepare("SELECT * FROM events WHERE id = ?").get(req.params.id));
});

router.delete("/:id", requireRole("ra", "admin"), (req, res) => {
  db.prepare("DELETE FROM events WHERE id = ? AND dorm_id = ?").run(req.params.id, req.session.user.dormId);
  res.json({ ok: true });
});

module.exports = router;