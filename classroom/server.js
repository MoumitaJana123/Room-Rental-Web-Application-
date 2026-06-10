const express = require("express");
const app = express();
const session = require("express-session");
const MongoStore = require("connect-mongo"); // Production session storage
const flash = require("connect-flash");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// Import Models
const User = require("./models/user.js");

// Import Routers
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

// ============================================================
// 🌱 DATABASE CONNECTION
// ============================================================
const dbUrl = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/majorproject";

mongoose.connect(dbUrl)
  .then(() => {
    console.log("Connected to MongoDB Atlas successfully! 🌱");
  })
  .catch((err) => {
    console.error("Database Connection Error: ❌", err.message);
  });

// ============================================================
// ⚙️ EXPRESS CONFIGURATION, VIEWS & ASSETS
// ============================================================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
// Serves static assets from public (CSS, JS, Images)
app.use(express.static(path.join(__dirname, "public"))); 

// Production session store using Mongo instead of volatile memory
const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SESSION_SECRET || "mysupersecretstring"
    },
    touchAfter: 24 * 3600, // 24 hours
});

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET || "mysupersecretstring",
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week expiration
    httpOnly: true,
  }
};

app.use(session(sessionOptions));
app.use(flash());

// ============================================================
// 🔐 PASSPORT AUTHENTICATION MIDDLEWARE
// ============================================================
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ============================================================
// 🔔 GLOBAL RES.LOCALS MIDDLEWARE
// ============================================================
app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.currUser = req.user; // Exposes user session data cleanly to EJS templates
  next();
});

// ============================================================
// 🛣️ ROUTE REGISTRATION (Mounting MVC Architecture)
// ============================================================
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// ============================================================
// 🚀 DYNAMIC PORT FOR RENDER DEPLOYMENT
// ============================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server successfully listening on port ${PORT}`);
});
