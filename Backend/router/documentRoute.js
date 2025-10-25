const express = require("express");
const multer = require("multer");
const Document = require("../models/document");
const Workspace = require("../models/workspace");
const authMiddleware = require("../middleware/userAuth");
const cloudinary = require("../config/cloudClient");
const streamifier = require("streamifier");
const requireDocumentRole = require("../middleware/documentRole");
const User = require("../models/user");
const logger = require("../config/logger"); // Add this line

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
      logger.warn("Document creation - workspaceId missing", { userId: req.user.id });
      return res.status(400).json({ message: "workspaceId is required" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      logger.warn("Document creation - workspace not found", { userId: req.user.id, workspaceId });
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
      logger.info(`Files uploaded to Cloudinary`, { 
        userId: req.user.id, 
        workspaceId, 
        fileCount: req.files.length 
      });
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

    logger.info("Document created successfully", { 
      userId: req.user.id, 
      documentId: doc._id, 
      workspaceId,
      fileCount: uploadedFiles.length 
    });
    
    res.status(201).json({
      message: "Document created successfully",
      document: doc,
    });
  } catch (err) {
    logger.error("Document creation error", { 
      error: err.message, 
      stack: err.stack, 
      userId: req.user.id, 
      workspaceId: req.body.workspaceId 
    });
    res.status(500).json({ message: err.message });
  }
});

router.get("/:documentId", authMiddleware, async (req, res) => {
  try {
    const doc = await Document.findById(req.params.documentId)
      .populate("permissions.user sharedWith.users createdBy versions.createdBy");

    if (!doc) {
      logger.warn("Document not found", { 
        userId: req.user.id, 
        documentId: req.params.documentId 
      });
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
      logger.warn("Document access denied", { 
        userId: req.user.id, 
        documentId: req.params.documentId 
      });
      return res.status(403).json({ message: "You do not have access to this document" });
    }

    logger.info("Document retrieved successfully", { 
      userId: req.user.id, 
      documentId: doc._id 
    });
    
    res.json(doc);
  } catch (err) {
    logger.error("Document retrieval error", { 
      error: err.message, 
      stack: err.stack, 
      userId: req.user.id, 
      documentId: req.params.documentId 
    });
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
        logger.warn("Document update - document not found", { 
          userId: req.user.id, 
          documentId: req.params.documentId 
        });
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
        if (!workspace) {
          logger.warn("Document update - workspace not found", { 
            userId: req.user.id, 
            documentId: doc._id, 
            workspaceId: doc.workspace 
          });
          return res.status(404).json({ message: "Workspace not found" });
        }

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
        let uploadedCount = 0;
        for (const file of req.files) {
          const isDuplicate = doc.files.some(
            (f) => f.originalName === file.originalname
          );

          if (isDuplicate) {
            logger.warn(`Skipping duplicate file: ${file.originalname}`, { 
              userId: req.user.id, 
              documentId: doc._id 
            });
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
          uploadedCount++;
        }
        
        if (uploadedCount > 0) {
          logger.info(`Files uploaded during document update`, { 
            userId: req.user.id, 
            documentId: doc._id, 
            uploadedCount 
          });
        }
      }

      doc.versions.push({
        title: doc.title,
        content: doc.content,
        createdBy: req.user.id,
      });

      await doc.save();

      logger.info("Document updated successfully", { 
        userId: req.user.id, 
        documentId: doc._id 
      });
      
      res.json({
        message: "✅ Document updated successfully",
        document: doc,
      });
    } catch (err) {
      logger.error("Document update error", { 
        error: err.message, 
        stack: err.stack, 
        userId: req.user.id, 
        documentId: req.params.documentId 
      });
      res.status(500).json({ message: err.message });
    }
  }
);

router.post("/:documentId/rollback", requireDocumentRole(["Admin"]), async (req, res) => {
  try {
    const { versionIndex } = req.body;
    const doc = req.document;

    const version = doc.versions[versionIndex];
    if (!version) {
      logger.warn("Document rollback - invalid version index", { 
        userId: req.user.id, 
        documentId: doc._id, 
        versionIndex 
      });
      return res.status(400).json({ message: "Invalid version index" });
    }

    doc.title = version.title;
    doc.content = version.content;
    doc.versions.push({ title: version.title, content: version.content, createdBy: req.user.id });

    await doc.save();
    
    logger.info("Document rolled back successfully", { 
      userId: req.user.id, 
      documentId: doc._id, 
      versionIndex 
    });
    
    res.json(doc);
  } catch (err) {
    logger.error("Document rollback error", { 
      error: err.message, 
      stack: err.stack, 
      userId: req.user.id, 
      documentId: req.params.documentId 
    });
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
        logger.warn("Document deletion - document not found", { 
          userId: req.user.id, 
          documentId: req.params.documentId 
        });
        return res.status(404).json({ message: "Document not found" });
      }

      // --- Delete all files from Cloudinary ---
      if (doc.files && doc.files.length > 0) {
        let deletedCount = 0;
        for (const file of doc.files) {
          if (file.publicId) {
            try {
              const resourceType = file.resourceType || "raw"; 
              await cloudinary.uploader.destroy(file.publicId, { resource_type: resourceType});
              deletedCount++;
            } catch (err) {
              logger.warn(`Failed to remove file from Cloudinary`, { 
                error: err.message, 
                fileName: file.originalName, 
                publicId: file.publicId 
              });
            }
          }
        }
        logger.info(`Cloudinary files deleted`, { 
          userId: req.user.id, 
          documentId: doc._id, 
          deletedCount, 
          totalFiles: doc.files.length 
        });
      }
      
    await Workspace.findByIdAndUpdate(doc.workspace, {
        $pull: { documents: doc._id }
      });
      
      await Document.findByIdAndDelete(req.params.documentId);

      logger.info("Document deleted successfully", { 
        userId: req.user.id, 
        documentId: req.params.documentId 
      });
      
      res.json({ message: "Document deleted successfully" });
    } catch (err) {
      logger.error("Document deletion error", { 
        error: err.message, 
        stack: err.stack, 
        userId: req.user.id, 
        documentId: req.params.documentId 
      });
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
        logger.warn("Document share - document not found", { 
          userId: req.user.id, 
          documentId 
        });
        return res.status(404).json({ message: "Document not found" });
      }

      if (!users || !Array.isArray(users) || users.length === 0) {
        logger.warn("Document share - invalid users array", { 
          userId: req.user.id, 
          documentId 
        });
        return res.status(400).json({ message: "Please provide user IDs to share with" });
      }

      // Validate users
      const validUsers = await User.find({ _id: { $in: users } });
      if (validUsers.length !== users.length) {
        logger.warn("Document share - invalid user IDs", { 
          userId: req.user.id, 
          documentId, 
          providedUsers: users.length, 
          validUsers: validUsers.length 
        });
        return res.status(400).json({ message: "Some user IDs are invalid" });
      }

      doc.sharedWith.users = users;

      await doc.save();

      logger.info("Document shared successfully", { 
        userId: req.user.id, 
        documentId, 
        sharedWithCount: users.length 
      });
      
      res.json({
        message: "Document shared successfully",
        sharedWith: doc.sharedWith.users,
      });
    } catch (err) {
      logger.error("Document sharing error", { 
        error: err.message, 
        stack: err.stack, 
        userId: req.user.id, 
        documentId: req.params.documentId 
      });
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
        logger.warn("Add document member - invalid role", { 
          userId: req.user.id, 
          documentId, 
          memberId, 
          role 
        });
        return res.status(400).json({ message: "Invalid role provided" });
      }
      
      const user = await User.findById(memberId);
      if (!user) {
        logger.warn("Add document member - user not found", { 
          userId: req.user.id, 
          documentId, 
          memberId 
        });
        return res.status(404).json({ message: "User not found" });
      }
      
      const doc = await Document.findById(documentId);
      if (!doc) {
        logger.warn("Add document member - document not found", { 
          userId: req.user.id, 
          documentId 
        });
        return res.status(404).json({ message: "Document not found" });
      }
      
      const existingMember = doc.permissions.find(
        (perm) => perm.user.toString() === memberId
      );
      if (existingMember) {
        logger.warn("Add document member - user already member", { 
          userId: req.user.id, 
          documentId, 
          memberId 
        });
        return res
          .status(400)
          .json({ message: "User is already a member of this document" });
      }

      doc.permissions.push({
        user: memberId,
        role: role || "Viewer",
      });

      await doc.save();

      logger.info("User added to document", { 
        userId: req.user.id, 
        documentId, 
        memberId, 
        role: role || "Viewer" 
      });
      
      res.status(200).json({
        message: `User ${user.firstName} added as ${role || "Viewer"}`,
        document: doc,
      });
    } catch (err) {
      logger.error("Add member error", { 
        error: err.message, 
        stack: err.stack, 
        userId: req.user.id, 
        documentId: req.params.documentId, 
        memberId: req.params.memberId 
      });
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
        logger.warn("Remove document files - invalid publicIds", { 
          userId: req.user.id, 
          documentId: req.params.documentId 
        });
        return res.status(400).json({ message: "Please provide file publicIds to remove" });
      }

      const doc = await Document.findById(req.params.documentId);
      if (!doc) {
        logger.warn("Remove document files - document not found", { 
          userId: req.user.id, 
          documentId: req.params.documentId 
        });
        return res.status(404).json({ message: "Document not found" });
      }
      
      const filesToRemove = doc.files.filter(f => publicIds.includes(f.publicId));
      if (filesToRemove.length === 0) {
        logger.warn("Remove document files - no matching files found", { 
          userId: req.user.id, 
          documentId: req.params.documentId, 
          publicIds 
        });
        return res.status(400).json({ message: "No matching files found in document" });
      }
      
      let deletedCount = 0;
      for (const file of filesToRemove) {
        try {
          await cloudinary.uploader.destroy(file.publicId, { resource_type: file.resourceType || "raw" });
          deletedCount++;
        } catch (err) {
          logger.warn(`Failed to remove file from Cloudinary`, { 
            error: err.message, 
            fileName: file.originalName, 
            publicId: file.publicId 
          });
        }
      }
      
      doc.files = doc.files.filter(f => !publicIds.includes(f.publicId));
      await doc.save();

      logger.info("Document files removed", { 
        userId: req.user.id, 
        documentId: req.params.documentId, 
        deletedCount, 
        totalRequested: publicIds.length 
      });
      
      res.json({
        message: "Files removed successfully",
        files: doc.files,
      });
    } catch (err) {
      logger.error("File removal error", { 
        error: err.message, 
        stack: err.stack, 
        userId: req.user.id, 
        documentId: req.params.documentId 
      });
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;