const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "fallback_secret",
      );

      const User = require("../models/User");
      req.user = await User.findById(decoded.id).select("-password");

      return next(); // ✅ always return next
    } catch (error) {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // ✅ Ensure function ALWAYS returns response
  return res.status(401).json({ message: "Not authorized, no token" });
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next(); // ✅ good practice
  } else {
    return res.status(401).json({ message: "Not authorized as an admin" });
  }
};

module.exports = { protect, admin };