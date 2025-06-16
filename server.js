const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 3000;

// In-memory user storage (for demo only!)
// Structure: { [email]: { username, email, password (hashed) } }
const users = {};

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

function requireLogin(req, res, next) {
  if (req.session.user) return next();
  res.redirect("/login.html");
}

// API to get current user info for dashboard
app.get("/api/user", (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ error: "Not logged in" });
  }
});

// Serve dashboard if logged in
app.get("/dashboard", requireLogin, (req, res) => {
  res.sendFile(__dirname + "/public/dashboard.html");
});

// Signup logic
app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res.status(400).json({ error: "Username, email and password required" });

  // Prevent duplicate email or username
  if (users[email] || Object.values(users).some(u => u.username === username))
    return res.status(400).json({ error: "User already exists" });

  const hashed = await bcrypt.hash(password, 10);
  users[email] = { username, email, password: hashed };
  req.session.user = { username, email };
  res.json({ success: true });
});

// Login logic (by username OR email)
app.post("/api/login", async (req, res) => {
  const { userOrEmail, password } = req.body;
  let user = null;

  // Try by email
  if (users[userOrEmail]) {
    user = users[userOrEmail];
  } else {
    // Try by username
    user = Object.values(users).find(u => u.username === userOrEmail);
  }

  if (!user) return res.status(400).json({ error: "Invalid credentials" });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ error: "Invalid credentials" });

  req.session.user = { username: user.username, email: user.email };
  res.json({ success: true });
});

// Logout logic
app.post("/api/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true });
  });
});

// Default route
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
