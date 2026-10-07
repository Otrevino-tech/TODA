const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
router.use(requireAuth);

router.get("/", (req, res) => {
  res.json(db.prepare("SELECT * FROM staff WHERE dorm_id = ? ORDER BY created_at").all(req.session.user.dormId));
});

router.post("/", requireRole("ra", "admin"), (req, res) => {
  const { name, role, phone, email } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });
  const info = db.prepare(
    "INSERT INTO staff (dorm_id, name, role, phone, email) VALUES (?,?,?,?,?)"
  ).run(req.session.user.dormId, name, role || "", phone || "", email || "");
  res.status(201).json(db.prepare("SELECT * FROM staff WHERE id = ?").get(info.lastInsertRowid));
});

router.delete("/:id", requireRole("ra", "admin"), (req, res) => {
  db.prepare("DELETE FROM staff WHERE id = ? AND dorm_id = ?").run(req.params.id, req.session.user.dormId);
  res.json({ ok: true });
});

module.exports = router;