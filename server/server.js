require("dotenv").config();
const express = require("express");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const path = require("path");
const fs = require("fs");

require("./seed");

const app = express();
const PORT = process.env.PORT || 3000;

const sessDir = path.join(__dirname, "data");
if (!fs.existsSync(sessDir)) fs.mkdirSync(sessDir, { recursive: true });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  store: new SQLiteStore({ db: "sessions.db", dir: sessDir }),
  secret: process.env.SESSION_SECRET || "dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: "lax", maxAge: 1000 * 60 * 60 * 24 * 7 },
}));

app.use("/api/auth",     require("./routes/auth"));
app.use("/api/chores",   require("./routes/chores"));
app.use("/api/events",   require("./routes/events"));
app.use("/api/alerts",   require("./routes/alerts"));
app.use("/api/staff",    require("./routes/staff"));
app.use("/api/forum",    require("./routes/forum"));
app.use("/api/files",    require("./routes/files"));
app.use("/api/checkins", require("./routes/checkins"));
app.use("/api/admin",    require("./routes/admin"));

app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
  if (!req.session.user) return res.redirect("/login.html");
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});
app.get("/admin", (req, res) => {
  if (!req.session.user) return res.redirect("/login.html");
  if (req.session.user.role !== "admin") return res.redirect("/");
  res.sendFile(path.join(__dirname, "..", "public", "admin.html"));
});

app.use(require("./middleware/error"));
app.listen(PORT, () => console.log(`TODA running on http://localhost:${PORT}`));