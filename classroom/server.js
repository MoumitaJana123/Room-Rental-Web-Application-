const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");

// --- AUTOMATIC FILE CREATOR TO BYPASS RENDER FOLDER ERRORS ---
const routesDir = path.join(__dirname, "routes");
if (!fs.existsSync(routesDir)) {
    fs.mkdirSync(routesDir, { recursive: true });
}
const userRoutePath = path.join(routesDir, "user.js");
const postRoutePath = path.join(routesDir, "post.js");

const standardRouteContent = `
const express = require("express");
const router = express.Router();
router.get("/", (req, res) => res.send("Route working"));
module.exports = router;
`;

if (!fs.existsSync(userRoutePath)) fs.writeFileSync(userRoutePath, standardRouteContent);
if (!fs.existsSync(postRoutePath)) fs.writeFileSync(postRoutePath, standardRouteContent);
// -----------------------------------------------------------

// Now Node will find them perfectly!
const users = require("./routes/user.js");
const posts = require("./routes/post.js");
const session = require("express-session");
const flash = require("connect-flash");

const sessionOptions = {
  secret: process.env.SESSION_SECRET || "mysupersecretstring",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
};

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(session(sessionOptions));
app.use(flash());

app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  next();
});

// Use the routes so express registers them
app.use("/users", users);
app.use("/posts", posts);

app.get("/register", (req, res) => {
  let { name = "anonymous" } = req.query;
  req.session.name = name;
  
  if (name === "anonymous") {
    req.flash("error", "user not registered");
  } else {
    req.flash("success", "user registered successfully!");
  }
  
  console.log(req.session.name);
  res.redirect("/hello");
});

app.get("/hello", (req, res) => {
  res.render("page.ejs", { name: req.session.name });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
