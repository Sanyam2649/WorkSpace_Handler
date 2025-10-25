const express = require("express");
const authMiddleware = require("../middleware/userAuth");
const Document = require("../models/document")
const User = require("../models/user");
const Workspace = require("../models/workspace");
const logger = require("../config/logger"); // Add this line

const router = express.Router();
router.use(authMiddleware);

router.get("/document", async (req, res) => {
  try {
    const { q, workspaceId } = req.query;
    
    if (!q) {
      logger.debug("Document search - empty query", { userId: req.user.id });
      return res.json([]);
    }
    
    const docs = await Document.find({
      workspace: workspaceId,
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
      ]
    }).select("title updatedAt").limit(20);

    logger.info("Document search completed", { 
      userId: req.user.id, 
      query: q, 
      workspaceId, 
      resultCount: docs.length 
    });
    
    res.json(docs);
  } catch (error) {
    logger.error("Document search error", { 
      error: error.message, 
      stack: error.stack, 
      userId: req.user.id, 
      query: req.query.q 
    });
    res.status(500).json({ message: "Search failed" });
  }
});

router.get("/member", async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      logger.debug("Member search - empty query", { userId: req.user.id });
      return res.json([]);
    }
    
    const members = await User.find({
      $or: [
        { username: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ]
    });

    logger.info("Member search completed", { 
      userId: req.user.id, 
      query: q, 
      resultCount: members.length 
    });
    
    res.json(members);
  } catch (error) {
    logger.error("Member search error", { 
      error: error.message, 
      stack: error.stack, 
      userId: req.user.id, 
      query: req.query.q 
    });
    res.status(500).json({ message: "Search failed" });
  }
});

router.get("/workspace", async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      logger.debug("Workspace search - empty query", { userId: req.user.id });
      return res.json([]);
    }
    
    const workspaces = await Workspace.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { slug: { $regex: q, $options: "i" } }
      ]
    }).select("name slug").limit(20);

    logger.info("Workspace search completed", { 
      userId: req.user.id, 
      query: q, 
      resultCount: workspaces.length 
    });
    
    res.json(workspaces);
  } catch (error) {
    logger.error("Workspace search error", { 
      error: error.message, 
      stack: error.stack, 
      userId: req.user.id, 
      query: req.query.q 
    });
    res.status(500).json({ message: "Search failed" });
  }
});

module.exports = router;