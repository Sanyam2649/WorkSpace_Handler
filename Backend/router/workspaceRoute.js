const express = require("express");
const Workspace = require("../models/workspace");
const User = require("../models/user");
const Document = require("../models/document");
const authMiddleware = require("../middleware/userAuth");
const slugify = require("slugify");
const cloudinary = require("../config/cloudClient");
const router = express.Router();

router.use(authMiddleware);

// ---------------------- Middleware ----------------------
const requireAdmin = async (req, res, next) => {
  try {
    const workspaceId = req.params.id || req.body.workspaceId;
    if (!workspaceId) {
      return res.status(400).json({ message: "workspaceId required" });
    }
    const ws = await Workspace.findById(workspaceId);
    if (!ws) return res.status(404).json({ message: "Workspace not found" });
    const member = ws.members.find(
      (m) => String(m.user) === String(req.user.id)
    );
    if (!member || !member.roles.includes("Admin")) {
      return res.status(403).json({ message: "Admin access required" });
    }
    req.workspace = ws;
    next();
  } catch (err) {
    console.error("❌ requireAdmin error:", err);
    res.status(500).json({ message: err.message });
  }
};

async function generateUniqueSlug(baseSlug, count = 0) {
  const slugToCheck = count === 0 ? baseSlug : `${baseSlug}-${count}`;
  const existing = await Workspace.findOne({ slug: slugToCheck });
  if (!existing) return slugToCheck;
  return generateUniqueSlug(baseSlug, count + 1);
}

router.post("/create", async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    const baseSlug = slugify(name, { lower: true, strict: true });
    const uniqueSlug = await generateUniqueSlug(baseSlug);

    const ws = await Workspace.create({
      name,
      slug: uniqueSlug,
      description,
      createdBy: req.user.id,
      members: [{ user: req.user.id, roles: ["Admin"] }],
    });
    res.status(201).json(ws);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all workspaces for user
router.get("/all-workspace", async (req, res) => {
  try {
    const userId = req.user.id;
    const workspaces = await Workspace.find({
      $or: [{ createdBy: userId }, { "members.user": userId }]
    }).sort({ createdAt: -1 });

    res.json(workspaces);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch workspaces", error: err.message });
  }
});

// Get workspace by id
router.get("/:id", async (req, res) => {
  try {
    const ws = await Workspace.findById(req.params.id)
      .populate("members.user", "firstName lastName email username");
    if (!ws) return res.status(404).json({ message: "Workspace not found" });
    res.json(ws);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// UPDATE workspace by id
router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const ws = req.workspace;
    const { name, description } = req.body;

    if (name) ws.name = name;
    if (description !== undefined) ws.description = description;

    await ws.save();
    res.json({ message: "Workspace updated", workspace: ws });
  } catch (err) {
    res.status(500).json({ message: "Failed to update workspace", error: err.message });
  }
});

// Delete workspace by id
router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const ws = req.workspace;
    const documents = await Document.find({ workspace: ws._id });

    for (const doc of documents) {
      if (doc.files && doc.files.length > 0) {
        for (const file of doc.files) {
          try {
            await cloudinary.uploader.destroy(file.publicId, {
              resource_type: file.resourceType || "raw",
            });
          } catch (err) {
            console.warn(`Failed to remove file ${file.originalName}: ${err.message}`);
          }
        }
      }
      await doc.deleteOne();
    }
    await ws.deleteOne();

    res.json({ message: "Workspace and all linked documents deleted successfully" });
  } catch (err) {
    console.error("❌ Workspace deletion error:", err);
    res.status(500).json({ message: "Failed to delete workspace", error: err.message });
  }
});

// Add member to workspace by id
router.post("/:id/add-member", requireAdmin, async (req, res) => {
  try {
    const { userId, roles, documentId, documentRole } = req.body;
    const ws = req.workspace;

    let member = ws.members.find(m => String(m.user) === userId);
    if (!member) {
      ws.members.push({ user: userId, roles: roles || ["Viewer"] });
      await ws.save();
      member = ws.members.find(m => String(m.user) === userId);
    }

    if (documentId && documentRole) {
      const doc = await Document.findById(documentId);
      if (!doc) return res.status(404).json({ message: "Document not found" });
      let perm = doc.permissions.find(p => String(p.user) === userId);
      if (perm) perm.role = documentRole;
      else doc.permissions.push({ user: userId, role: documentRole });
      await doc.save();
      return res.json({ message: "Member added/updated in workspace and document", workspace: ws, document: doc });
    }

    res.json(ws);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove member from workspace by id
router.delete("/:id/members/:memberId", requireAdmin, async (req, res) => {
  try {
    const ws = req.workspace;
    const memberId = req.params.memberId;

    ws.members = ws.members.filter(m => String(m.user) !== memberId);
    await ws.save();

    const documents = await Document.find({ workspace: ws._id });
    for (const doc of documents) {
      doc.permissions = doc.permissions.filter(p => String(p.user) !== memberId);
      await doc.save();
    }

    res.json({ message: "Member removed from workspace and all documents", workspace: ws });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update member roles by workspace id
router.put("/:id/members/:memberId/role", requireAdmin, async (req, res) => {
  try {
    const ws = req.workspace;
    const { roles } = req.body;

    const member = ws.members.find(m => String(m.user) === req.params.memberId);
    if (!member) return res.status(404).json({ message: "Member not found" });

    member.roles = roles;
    await ws.save();
    res.json({ message: "Role updated", workspace: ws });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user documents for a workspace by id
router.get("/:id/user-documents", async (req, res) => {
  try {
    const ws = await Workspace.findById(req.params.id);
    if (!ws) return res.status(404).json({ message: "Workspace not found" });

    const member = ws.members.find(m => String(m.user) === req.user.id);
    if (!member) return res.status(403).json({ message: "Not a workspace member" });

    const docs = await Document.find({
      _id: { $in: ws.documents },
      $or: [
        { "permissions.user": req.user.id },  
      ]
    }).select("title content versions permissions files sharedWith");

    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update document role for a user by id
router.put("/:id/documents/:documentId/role/:userId", requireAdmin, async (req, res) => {
  try {
    const { documentId, userId } = req.params;
    const { role } = req.body;

    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ message: "Document not found" });

    const ws = req.workspace; // already fetched by id & checked admin role

    const isAdmin = ws.members.some(m => String(m.user) === req.user.id && m.roles.includes("Admin"));
    const isCreator = String(doc.createdBy) === req.user.id;
    if (!isAdmin && !isCreator) return res.status(403).json({ message: "Only admin or creator can update document roles" });

    let perm = doc.permissions.find(p => String(p.user) === userId);
    if (perm) perm.role = role;
    else doc.permissions.push({ user: userId, role });

    await doc.save();
    res.json({ message: "Document role updated", document: doc });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Search members in workspace by id
router.get("/:id/search-members", async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: "Query required" });

    const ws = await Workspace.findById(req.params.id);
    const regex = new RegExp(q, "i");
    const memberIds = ws.members.map(m => m.user);

    const users = await User.find({
      _id: { $in: memberIds },
      $or: [{ email: regex }, { username: regex }, { phone: regex }]
    }).select("username avatar");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
