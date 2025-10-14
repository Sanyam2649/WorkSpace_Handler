const jwt = require("jsonwebtoken");

function getTokenFromHeader(req) {
  const auth = req.headers.authorization || "";
  if (auth.startsWith("Bearer ")) return auth.slice(7);
  return null;
}

exports.authenticate = (req, res, next) => {
  try {
    const token = getTokenFromHeader(req) || req.cookies?.accessToken;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.userId, roles: payload.roles || ["Viewer"] };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
};

exports.requireRoles = (...allowed) => (req, res, next) => {
  const roles = req.user?.roles || [];
  const ok = roles.some((r) => allowed.includes(r));
  if (!ok) return res.status(403).json({ message: "Forbidden" });
  next();
};


