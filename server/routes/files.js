const express = require("express");
const router = express.Router();
const db = require("../db");
const { requireAuth, requireRole } = require("../middleware/auth");
router.use(requireAuth);

router.get("/", (req, res) => {
  const folders = db.prepare("SELECT * FROM folders WHERE dorm_id = ? ORDER BY created_at").all(req.session.user.dormId);
  const getFiles = db.prepare("SELECT * FROM files WHERE folder_id = ?");
  res.json(folders.map(f => ({ ...f, files: getFiles.all(f.id) })));
});

router.post("/folders", requireRole("ra", "admin"), (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });
  const info = db.prepare("INSERT INTO folders (dorm_id, name) VALUES (?,?)").run(req.session.user.dormId, name);
  res.status(201).json(db.prepare("SELECT * FROM folders WHERE id = ?").get(info.lastInsertRowid));
});

router.delete("/folders/:id", requireRole("ra", "admin"), (req, res) => {
  db.prepare("DELETE FROM folders WHERE id = ? AND dorm_id = ?").run(req.params.id, req.session.user.dormId);
  res.json({ ok: true });
});

router.post("/folders/:id/files", requireRole("ra", "admin"), (req, res) => {
  const { name, size, url } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });
  const folder = db.prepare("SELECT * FROM folders WHERE id = ? AND dorm_id = ?").get(req.params.id, req.session.user.dormId);
  if (!folder) return res.status(404).json({ error: "Folder not found" });
  const info = db.prepare("INSERT INTO files (folder_id, name, size, url) VALUES (?,?,?,?)")
    .run(folder.id, name, size || "", url || "");
  res.status(201).json(db.prepare("SELECT * FROM files WHERE id = ?").get(info.lastInsertRowid));
});

router.delete("/files/:id", requireRole("ra", "admin"), (req, res) => {
  db.prepare("DELETE FROM files WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;