const express = require("express");
const router = express.Router();
const db = require("../db");

/**
 * Portal login: user picks a dorm + enters a display name.
 * If they also enter the ADMIN_DORM_CODE, they get 'ra' role.
 */
router.post("/login", (req, res) => {
  const { dormId, displayName, adminCode } = req.body || {};

  if (!dormId || !displayName?.trim()) {
    return res.status(400).json({ error: "Dorm and display name are required." });
  }

  const dorm = db.prepare("SELECT * FROM dorms WHERE id = ?").get(dormId);
  if (!dorm) return res.status(404).json({ error: "Dorm not found" });

  let role = "resident";
  if (adminCode && adminCode === process.env.ADMIN_DORM_CODE) role = "admin";

  // Reuse existing user with same name in that dorm, else create
  let user = db
    .prepare("SELECT * FROM users WHERE dorm_id = ? AND display_name = ?")
    .get(dormId, displayName.trim());

  if (!user) {
    const info = db
      .prepare("INSERT INTO users (dorm_id, display_name, role) VALUES (?,?,?)")
      .run(dormId, displayName.trim(), role);
    user = db.prepare("SELECT * FROM users WHERE id = ?").get(info.lastInsertRowid);
  } else if (role === "admin" && user.role !== "admin") {
    db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(user.id);
    user.role = "admin";
  }

  req.session.user = {
    id: user.id,
    name: user.display_name,
    role: user.role,
    dormId: user.dorm_id,
    dormName: dorm.name,
  };

  res.json({ user: req.session.user });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.get("/me", (req, res) => {
  res.json({ user: req.session.user || null });
});

router.get("/dorms", (req, res) => {
  const dorms = db.prepare("SELECT id, name, description FROM dorms ORDER BY name").all();
  res.json({ dorms });
});

module.exports = router;