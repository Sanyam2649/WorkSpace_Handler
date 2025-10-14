const Document = require("../models/document")

const requireDocumentRole = (requiredRoles = []) => async (req, res, next) => {
  const doc = await Document.findById(req.params.documentId);
  if (!doc) return res.status(404).json({ message: "Document not found" });

  const permission = doc.permissions.find(p => String(p.user) === req.user.id);
  if (!permission || !requiredRoles.includes(permission.role)) {
    return res.status(403).json({ message: "Insufficient document permissions" });
  }

  req.document = doc;
  next();
};

module.exports = requireDocumentRole;