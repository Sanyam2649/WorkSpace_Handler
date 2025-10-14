const express = require("express");
const multer = require("multer");
const Document = require("../models/document");
const Workspace = require("../models/workspace");
const authMiddleware = require("../middleware/userAuth");
const cloudinary = require("../config/cloudClient");
const streamifier = require("streamifier");
const requireDocumentRole = require("../middleware/documentRole");
const User = require("../models/user");

const router = express.Router();
router.use(authMiddleware);

const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post("/create", upload.array("files"), async (req, res) => {
  try {
    const {
      workspaceId,
      title,
      content,
      sharedWithType,
      sharedUsers,
      sharedRoles,
    } = req.body;

    if (!workspaceId) {
      return res.status(400).json({ message: "workspaceId is required" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    const workspaceSlug = workspace.slug;

    // --- Cloudinary upload for multiple files ---
    let uploadedFiles = [];

    if (req.files && req.files.length > 0) {
      const uploadFromBuffer = (fileBuffer) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: `workspaces/${workspaceSlug}`,
              resource_type: "auto",
            },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(stream);
        });

      for (const file of req.files) {
        const result = await uploadFromBuffer(file.buffer);
        uploadedFiles.push({
          url: result.secure_url,
          originalName: file.originalname,
          mimetype: file.mimetype,
          publicId: result.public_id,
          resourceType : result.resource_type,
        });
      }
    }

    // --- Permissions ---
    const permissions = [
      {
        user: req.user.id,
        role: "Admin",
      },
    ];

    // --- Shared With ---
    const sharedWith = {
      type: sharedWithType || "everyone",
      users: sharedUsers ? JSON.parse(sharedUsers) : [],
      roles: sharedRoles ? JSON.parse(sharedRoles) : [],
    };

    const doc = await Document.create({
      workspace: workspaceId,
      title,
      content,
      createdBy: req.user.id,
      versions: [{ title, content, createdBy: req.user.id }],
      files: uploadedFiles, // ✅ array instead of single file
      permissions,
      sharedWith,
    });
    
    workspace.documents = workspace.documents || [];
    workspace.documents.push(doc._id);
    await workspace.save();

    res.status(201).json({
      message: "Document created successfully",
      document: doc,
    });
  } catch (err) {
    console.error("❌ Document creation error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.get("/:documentId", authMiddleware, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.documentId)
      .populate("permissions.user sharedWith.users createdBy versions.createdBy");

    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }

    const userId = req.user.id;
    const hasPermission = doc.permissions.some(
      (perm) => perm.user._id.toString() === userId
    );
    const isSharedUser = doc.sharedWith.users.some(
      (u) => u._id.toString() === userId
    );

    if (!hasPermission && !isSharedUser) {
      return res.status(403).json({ message: "You do not have access to this document" });
    }

    res.json(doc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});


router.put(
  "/update/:documentId",
  upload.array("files"),
  requireDocumentRole(["Admin", "Editor"]),
  async (req, res) => {
    try {
      const { title, content } = req.body;
      const doc = await Document.findById(req.params.documentId);

      if (!doc) {
        return res.status(404).json({
          message: "No Document Found",
          success: false,
        });
      }

      // --- Update title and content ---
      doc.title = title ?? doc.title;
      doc.content = content ?? doc.content;

      // --- File Upload Handling ---
      if (req.files && req.files.length > 0) {
        const workspace = await Workspace.findById(doc.workspace);
        if (!workspace)
          return res.status(404).json({ message: "Workspace not found" });

        const workspaceSlug = workspace.slug;

        const uploadFromBuffer = (fileBuffer) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                folder: `workspaces/${workspaceSlug}`,
                resource_type: "auto",
              },
              (error, result) => {
                if (result) resolve(result);
                else reject(error);
              }
            );
            streamifier.createReadStream(fileBuffer).pipe(stream);
          });

        // --- Upload each file (skip duplicates) ---
        for (const file of req.files) {
          const isDuplicate = doc.files.some(
            (f) => f.originalName === file.originalname
          );

          if (isDuplicate) {
            console.log(`⚠️ Skipping duplicate file: ${file.originalname}`);
            continue; // Skip upload and insertion
          }

          const result = await uploadFromBuffer(file.buffer);
          doc.files.push({
            url: result.secure_url,
            originalName: file.originalname,
            mimetype: file.mimetype,
            publicId: result.public_id,
            resourceType : result.resource_type
          });
        }
      }

      doc.versions.push({
        title: doc.title,
        content: doc.content,
        createdBy: req.user.id,
      });

      await doc.save();

      res.json({
        message: "✅ Document updated successfully",
        document: doc,
      });
    } catch (err) {
      console.error("❌ Document update error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

router.post("/:documentId/rollback", requireDocumentRole(["Admin"]), async (req, res) => {
  try {
    const { versionIndex } = req.body;
    const doc = req.document;

    const version = doc.versions[versionIndex];
    if (!version) return res.status(400).json({ message: "Invalid version index" });

    doc.title = version.title;
    doc.content = version.content;
    doc.versions.push({ title: version.title, content: version.content, createdBy: req.user.id });

    await doc.save();
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete(
  "/:documentId/delete",
  requireDocumentRole(["Admin"]),
  async (req, res) => {
    try {
      const doc = await Document.findById(req.params.documentId);
      if (!doc) {
        return res.status(404).json({ message: "Document not found" });
      }

      // --- Delete all files from Cloudinary ---
      if (doc.files && doc.files.length > 0) {
        for (const file of doc.files) {
          if (file.publicId) {
            try {
              const resourceType = file.resourceType || "raw"; 
              await cloudinary.uploader.destroy(file.publicId, { resource_type: resourceType});
              console.log(`Deleted file from Cloudinary: ${file.originalName}`);
            } catch (err) {
              console.warn(`Failed to remove file ${file.originalName}: ${err.message}`);
            }
          }
        }
      }
    await Workspace.findByIdAndUpdate(doc.workspace, {
        $pull: { documents: doc._id }
      });
      await Document.findByIdAndDelete(req.params.documentId);

      res.json({ message: "Document deleted successfully" });
    } catch (err) {
      console.error("❌ Document deletion error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

router.post( "/:documentId/share", requireDocumentRole(["Admin", "Editor"]),  async (req, res) => {
    try {
      const { documentId } = req.params;
      const { users } = req.body; // array of user IDs
      const doc = await Document.findById(documentId);

      if (!doc) {
        return res.status(404).json({ message: "Document not found" });
      }

      if (!users || !Array.isArray(users) || users.length === 0) {
        return res.status(400).json({ message: "Please provide user IDs to share with" });
      }

      // Validate users
      const validUsers = await User.find({ _id: { $in: users } });
      if (validUsers.length !== users.length) {
        return res.status(400).json({ message: "Some user IDs are invalid" });
      }

      doc.sharedWith.users = users;

      await doc.save();

      res.json({
        message: "Document shared successfully",
        sharedWith: doc.sharedWith.users,
      });
    } catch (err) {
      console.error("❌ Document sharing error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

router.post(
  "/add-member/:documentId/:memberId",
  requireDocumentRole(["Admin"]),
  async (req, res) => {
    try {
      const { documentId, memberId } = req.params;
      const { role } = req.body;
      const validRoles = ["Admin", "Editor", "Viewer"];
      if (role && !validRoles.includes(role)) {
        return res.status(400).json({ message: "Invalid role provided" });
      }
      const user = await User.findById(memberId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const doc = await Document.findById(documentId);
      if (!doc) {
        return res.status(404).json({ message: "Document not found" });
      }
      const existingMember = doc.permissions.find(
        (perm) => perm.user.toString() === memberId
      );
      if (existingMember) {
        return res
          .status(400)
          .json({ message: "User is already a member of this document" });
      }

      doc.permissions.push({
        user: memberId,
        role: role || "Viewer",
      });

      await doc.save();

      res.status(200).json({
        message: `User ${user.firstName} added as ${role || "Viewer"}`,
        document: doc,
      });
    } catch (err) {
      console.error("❌ Add member error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

router.delete(
  "/:documentId/files",
  requireDocumentRole(["Admin", "Editor"]),
  async (req, res) => {
    try {
      const { publicIds } = req.body; 
      if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
        return res.status(400).json({ message: "Please provide file publicIds to remove" });
      }

      const doc = await Document.findById(req.params.documentId);
      if (!doc) return res.status(404).json({ message: "Document not found" });
      const filesToRemove = doc.files.filter(f => publicIds.includes(f.publicId));
      if (filesToRemove.length === 0) {
        return res.status(400).json({ message: "No matching files found in document" });
      }
      for (const file of filesToRemove) {
        try {
          await cloudinary.uploader.destroy(file.publicId, { resource_type: file.resourceType || "raw" });
        } catch (err) {
          console.warn(`Failed to remove file ${file.originalName}: ${err.message}`);
        }
      }
      doc.files = doc.files.filter(f => !publicIds.includes(f.publicId));
      await doc.save();

      res.json({
        message: "Files removed successfully",
        files: doc.files,
      });
    } catch (err) {
      console.error("❌ File removal error:", err);
      res.status(500).json({ message: err.message });
    }
  }
);



module.exports = router;
