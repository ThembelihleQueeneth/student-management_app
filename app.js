const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

// Database setup
const db = new sqlite3.Database("./database/students.db", (err) => {
  if (err) console.error(err.message);
  console.log("Connected to SQLite database.");
});

// Create students table if not exists
db.run(`CREATE TABLE IF NOT EXISTS students(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    age INTEGER,
    course TEXT
)`);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Routes

// Home - list students
app.get("/", (req, res) => {
  db.all("SELECT * FROM students", [], (err, rows) => {
    if (err) throw err;
    res.render("index", { students: rows });
  });
});

// Show add student form
app.get("/add", (req, res) => {
  res.render("add");
});

// Handle add student
app.post("/add", (req, res) => {
  const { name, age, course } = req.body;
  db.run("INSERT INTO students(name, age, course) VALUES(?, ?, ?)", [name, age, course], (err) => {
    if (err) throw err;
    res.redirect("/");
  });
});

// Show edit form
app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  db.get("SELECT * FROM students WHERE id = ?", [id], (err, row) => {
    if (err) throw err;
    res.render("edit", { student: row });
  });
});

// Handle edit student
app.post("/edit/:id", (req, res) => {
  const { name, age, course } = req.body;
  const id = req.params.id;
  db.run("UPDATE students SET name = ?, age = ?, course = ? WHERE id = ?", [name, age, course, id], (err) => {
    if (err) throw err;
    res.redirect("/");
  });
});

// Delete student
app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  db.run("DELETE FROM students WHERE id = ?", [id], (err) => {
    if (err) throw err;
    res.redirect("/");
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
