const User = require("../models/user.js");
const { normalizeListings } = require("../utils/provenImages.js");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  try {
    let { username, password, email } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        req.flash("error", "Account created, but automatic login failed. Please log in.");
        return res.redirect("/login");
      }
      req.flash("success", "Welcome to WanderLust!");
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("error", err.message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to WanderLust!");
  let redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged out successfully!");
    res.redirect("/listings");
  });
};

module.exports.renderFavorites = async (req, res) => {
  const user = await User.findById(req.user._id).populate("favorites");
  res.render("users/favorites.ejs", {
    listings: normalizeListings(user.favorites || []),
    pageClass: "page-listings",
    fullWidth: true,
  });
};
