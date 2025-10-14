const jwt = require("jsonwebtoken");
const User = require("../models/user");
module.exports = (req, _res, next) => next();
const BlacklistedToken = require("../models/blacklistToken");


const isTokenBlacklisted = async (token) => {
  if (!token) return false;
  return !!(await BlacklistedToken.findOne({ token }));
};

const authMiddleware = async (req, res, next) => {
  try {
    let accessToken;
    let refreshToken;

    // Get access token from header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      accessToken = authHeader.split(" ")[1];
    }

    // Get refresh token from cookie (or header)
    refreshToken = req.cookies?.refreshToken || req.headers["x-refresh-token"];

    if (!accessToken && !refreshToken) {
      return res.status(401).json({ message: "No tokens provided" });
    }

    // Verify access token
    if (accessToken) {
      
        if (await isTokenBlacklisted(accessToken)) {
    return res.status(401).json({ message: "Token has been revoked" });
           }
      try {
        const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) throw new Error("User not found");

        req.user = user;
        return next(); // valid access token, proceed
      } catch (err) {
        // If access token expired, continue to check refresh token
        if (err.name !== "TokenExpiredError") {
          return res.status(401).json({ message: "Invalid access token" });
        }
      }
    }

    // If access token expired or missing, verify refresh token
    if (refreshToken) {
        if (await isTokenBlacklisted(refreshToken)) {
    return res.status(401).json({ message: "Refresh token has been revoked" });
     }
      try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
        const user = await User.findById(decoded.userId).select("-password");
        if (!user) throw new Error("User not found");

        // Generate new access token
        const newAccessToken = jwt.sign(
          { userId: user._id, role: user.role },
          process.env.JWT_SECRET,
          { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
        );

        req.user = user;
        res.setHeader("x-access-token", newAccessToken);
        return next();
      } catch (err) {
        return res.status(401).json({ message: "Invalid or expired refresh token" });
      }
    }

    res.status(401).json({ message: "Unauthorized" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = authMiddleware;
