const express = require("express");
const authMiddleware = require("../middleware/userAuth");
const Document = require("../models/document")
const User = require("../models/user");
const Workspace = require("../models/workspace");

const router = express.Router();
router.use(authMiddleware);

router.get("/document", async (req, res) => {
  const { q, workspaceId } = req.query;
  if (!q) return res.json([]);
  const docs = await Document.find({
    workspace: workspaceId,
    $or: [
      { title: { $regex: q, $options: "i" } },
      { content: { $regex: q, $options: "i" } },
    ]
  }).select("title updatedAt").limit(20); 
  res.json(docs);
});

router.get("/member", async (req, res) => {
  const { q} = req.query;
  if (!q) return res.json([]);
  const members = await User.find({
    $or: [
      { username: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
    ]
  });
  res.json(members);
});

router.get("/workspace", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json([]);
  const workspaces = await Workspace.find({
    $or: [
      { name: { $regex: q, $options: "i" } },
      { slug: { $regex: q, $options: "i" } }
    ]
  }).select("name slug").limit(20);
  res.json(workspaces);
});

module.exports = router;


