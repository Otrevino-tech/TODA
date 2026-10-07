const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");

router.use(requireAuth);

// All residents of the dorm can read
router.get("/", (req, res) => {
  const rows = db.prepare("SELECT * FROM chores WHERE dorm_id = ? ORDER BY created_at DESC")
    .all(req.session.user.dormId);
  res.json(rows);
});

// Only RA/admin can create/update/delete
router.post("/", requireRole("ra", "admin"), (req, res) => {
  const { task, room, assignee, due } = req.body;
  if (!task) return res.status(400).json({ error: "task required" });
  const info = db.prepare(
    "INSERT INTO chores (dorm_id, task, room, assignee, due) VALUES (?,?,?,?,?)"
  ).run(req.session.user.dormId, task, room || "", assignee || "", due || "");
  res.status(201).json(db.prepare("SELECT * FROM chores WHERE id = ?").get(info.lastInsertRowid));
});

router.patch("/:id", requireRole("ra", "admin"), (req, res) => {
  const allowed = ["task", "room", "assignee", "due", "done"];
  const fields = Object.keys(req.body).filter(k => allowed.includes(k));
  if (!fields.length) return res.status(400).json({ error: "No valid fields" });
  const set = fields.map(f => `${f} = ?`).join(", ");
  const values = fields.map(f => req.body[f]);
  db.prepare(`UPDATE chores SET ${set} WHERE id = ? AND dorm_id = ?`)
    .run(...values, req.params.id, req.session.user.dormId);
  res.json(db.prepare("SELECT * FROM chores WHERE id = ?").get(req.params.id));
});

// Residents can toggle their own chore done status
router.patch("/:id/toggle", (req, res) => {
  const chore = db.prepare("SELECT * FROM chores WHERE id = ? AND dorm_id = ?")
    .get(req.params.id, req.session.user.dormId);
  if (!chore) return res.status(404).json({ error: "Not found" });
  db.prepare("UPDATE chores SET done = ? WHERE id = ?").run(chore.done ? 0 : 1, chore.id);
  res.json(db.prepare("SELECT * FROM chores WHERE id = ?").get(chore.id));
});

router.delete("/:id", requireRole("ra", "admin"), (req, res) => {
  db.prepare("DELETE FROM chores WHERE id = ? AND dorm_id = ?")
    .run(req.params.id, req.session.user.dormId);
  res.json({ ok: true });
});

module.exports = router;