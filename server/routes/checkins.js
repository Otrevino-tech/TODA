const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
router.use(requireAuth);

router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM checkins WHERE dorm_id = ? ORDER BY created_at DESC")
    .all(req.session.user.dormId));
});

router.post("/", (req, res) => {
  const vals = [req.body.name, req.body.room, req.body.action, req.body.notes];
  if (!vals[0]) return res.status(400).json({ error: "name required" });
  const info = db.prepare("INSERT INTO checkins (dorm_id, name, room, action, notes) VALUES (?, ?, ?, ?, ?)")
    .run(req.session.user.dormId, ...vals);
  res.status(201).json(db.prepare("SELECT * FROM checkins WHERE id = ?").get(info.lastInsertRowid));
});

router.delete("/:id", requireRole("ra", "admin"), (req, res) => {
  db.prepare("DELETE FROM checkins WHERE id = ? AND dorm_id = ?")
    .run(req.params.id, req.session.user.dormId);
  res.json({ ok: true });
});

module.exports = router;