const db = require("./db");

function seed() {
  const dormCount = db.prepare("SELECT COUNT(*) AS c FROM dorms").get().c;
  if (dormCount > 0) {
    console.log("Database already seeded.");
    return;
  }

  const insertDorm = db.prepare("INSERT INTO dorms (name, description) VALUES (?, ?)");
  const royalId = insertDorm.run("Royal Hall", "Main residence hall").lastInsertRowid;
  const eastId  = insertDorm.run("East Wing", "East wing residence").lastInsertRowid;
  const westId  = insertDorm.run("West Wing", "West wing residence").lastInsertRowid;

  const seedChores = db.prepare("INSERT INTO chores (dorm_id, task, room, assignee, due, done) VALUES (?,?,?,?,?,?)");
  [
    ["Take out trash", "204", "Alex", "Mon", 0],
    ["Vacuum hallway", "312", "Jamie", "Tue", 1],
    ["Clean kitchen", "118", "Riley", "Wed", 0],
    ["Wipe common tables", "205", "Sam", "Thu", 0],
  ].forEach(c => seedChores.run(royalId, ...c));

  const seedEvents = db.prepare("INSERT INTO events (dorm_id, title, date, location, description) VALUES (?,?,?,?,?)");
  [
    ["Movie Night", "Fri, 8:00 PM", "Common Room", "Bring snacks!"],
    ["Hall Meeting", "Sun, 7:00 PM", "Lounge", "Mandatory for all residents."],
    ["Game Tournament", "Sat, 6:00 PM", "Rec Room", "Smash Bros & cards."],
  ].forEach(e => seedEvents.run(royalId, ...e));

  const seedAlerts = db.prepare("INSERT INTO alerts (dorm_id, level, message, author) VALUES (?,?,?,?)");
  seedAlerts.run(royalId, "critical", "Fire drill Tuesday 9AM", "RD Rivera");
  seedAlerts.run(royalId, "info", "Water shutoff Thursday 2–4PM", "Maintenance");

  const seedStaff = db.prepare("INSERT INTO staff (dorm_id, name, role, phone, email) VALUES (?,?,?,?,?)");
  [
    ["Ms. Rivera", "Resident Life Coordinator", "555-0101", "rivera@royalhall.edu"],
    ["James Okafor", "RA - Floor 1", "555-0102", "jokafor@royalhall.edu"],
    ["Tina Chen", "RA - Floor 2", "555-0103", "tchen@royalhall.edu"],
    ["Front Desk", "24/7 Desk", "555-0100", "desk@royalhall.edu"],
  ].forEach(s => seedStaff.run(royalId, ...s));

  const folder1 = db.prepare("INSERT INTO folders (dorm_id, name) VALUES (?,?)").run(royalId, "Forms").lastInsertRowid;
  const folder2 = db.prepare("INSERT INTO folders (dorm_id, name) VALUES (?,?)").run(royalId, "Guides").lastInsertRowid;
  const seedFile = db.prepare("INSERT INTO files (folder_id, name, size) VALUES (?,?,?)");
  seedFile.run(folder1, "Maintenance Request.pdf", "120 KB");
  seedFile.run(folder1, "Room Change Form.pdf", "98 KB");
  seedFile.run(folder2, "Resident Handbook.pdf", "1.2 MB");
  seedFile.run(folder2, "Wi-Fi Setup.pdf", "340 KB");

  const seedPost = db.prepare("INSERT INTO forum_posts (dorm_id, name, message) VALUES (?,?,?)");
  seedPost.run(royalId, "Alex", "Anyone up for a study group tonight?");

  console.log("Seeded dorms, chores, events, alerts, staff, files, forum.");
}

seed();