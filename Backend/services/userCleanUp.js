const workspace = require("../models/workspace");
const Document = require("../models/document");
const cloudinary = require("../config/cloudClient");
const logger = require("../config/logger"); // Add this line

const performUserDeletion = async (user) => {
  const userId = user._id;
  const userEmail = user.email;
  
  logger.info("Starting user deletion process", { 
    userId, 
    userEmail,
    scheduledDeletion: user.scheduledDeletion 
  });

  try {
    if (user.avatar?.publicId) {
      try {
        logger.debug("Deleting user avatar from Cloudinary", { 
          userId, 
          publicId: user.avatar.publicId 
        });
        
        await cloudinary.uploader.destroy(user.avatar.publicId, {
          resource_type: user.avatar.resourceType || "image",
        });
        
        logger.info("User avatar deleted from Cloudinary", { userId });
      } catch (err) {
        logger.warn("Failed to remove avatar from Cloudinary", { 
          error: err.message, 
          userId, 
          publicId: user.avatar.publicId 
        });
      }
    }

    const workspaces = await workspace.find({ createdBy: user._id });
    logger.info("Found user's workspaces for deletion", { 
      userId, 
      workspaceCount: workspaces.length 
    });

    for (const ws of workspaces) {
      logger.debug("Processing workspace for deletion", { 
        userId, 
        workspaceId: ws._id, 
        workspaceName: ws.name 
      });
      
      const docs = await Document.find({ workspace: ws._id });
      logger.debug("Found documents in workspace", { 
        workspaceId: ws._id, 
        documentCount: docs.length 
      });

      for (const doc of docs) {
        if (doc.files && doc.files.length > 0) {
          let deletedFilesCount = 0;
          let failedFilesCount = 0;
          
          logger.debug("Deleting document files from Cloudinary", { 
            documentId: doc._id, 
            fileCount: doc.files.length 
          });
          
          for (const file of doc.files) {
            if (file.publicId) {
              try {
                await cloudinary.uploader.destroy(file.publicId, {
                  resource_type: file.resourceType || "auto",
                });
                deletedFilesCount++;
              } catch (err) {
                logger.warn("Failed to remove file from Cloudinary", { 
                  error: err.message, 
                  documentId: doc._id, 
                  fileName: file.originalName,
                  publicId: file.publicId 
                });
                failedFilesCount++;
              }
            }
          }
          
          if (deletedFilesCount > 0) {
            logger.info("Document files deleted from Cloudinary", { 
              documentId: doc._id, 
              deletedFilesCount,
              failedFilesCount 
            });
          }
        }
        
        await doc.deleteOne();
        logger.debug("Document deleted from database", { documentId: doc._id });
      }
      
      await ws.deleteOne();
      logger.info("Workspace deleted successfully", { 
        workspaceId: ws._id, 
        deletedDocuments: docs.length 
      });
    }

    // Remove user from workspace memberships
    logger.debug("Removing user from workspace memberships");
    const workspaceUpdateResult = await workspace.updateMany(
      { "members.user": user._id },
      { $pull: { members: { user: user._id } } }
    );
    
    logger.info("User removed from workspace memberships", { 
      userId, 
      modifiedWorkspaces: workspaceUpdateResult.modifiedCount 
    });

    // Remove user from document permissions
    logger.debug("Removing user from document permissions");
    const documentUpdateResult = await Document.updateMany(
      { "permissions.user": user._id },
      { $pull: { permissions: { user: user._id } } }
    );
    
    logger.info("User removed from document permissions", { 
      userId, 
      modifiedDocuments: documentUpdateResult.modifiedCount 
    });

    // Remove user from document version history
    logger.debug("Removing user from document version history");
    const docsWithVersions = await Document.find({ "versions.createdBy": user._id });
    let updatedVersionCount = 0;
    
    for (const doc of docsWithVersions) {
      const originalVersionCount = doc.versions.length;
      doc.versions = doc.versions.filter(
        (v) => String(v.createdBy) !== String(user._id)
      );
      const removedCount = originalVersionCount - doc.versions.length;
      
      if (removedCount > 0) {
        await doc.save();
        updatedVersionCount += removedCount;
        logger.debug("User versions removed from document", { 
          documentId: doc._id, 
          removedVersions: removedCount 
        });
      }
    }
    
    if (updatedVersionCount > 0) {
      logger.info("User versions removed from documents", { 
        userId, 
        totalVersionsRemoved: updatedVersionCount,
        documentsAffected: docsWithVersions.length 
      });
    }

    // Finally delete the user
    await user.deleteOne();
    
    logger.info("User fully deleted from system", { 
      userId, 
      userEmail,
      workspacesDeleted: workspaces.length,
      workspacesModified: workspaceUpdateResult.modifiedCount,
      documentsModified: documentUpdateResult.modifiedCount,
      versionsCleaned: updatedVersionCount 
    });

  } catch (err) {
    logger.error("Failed to delete user", { 
      error: err.message, 
      stack: err.stack, 
      userId, 
      userEmail 
    });
    throw err;
  }
};

module.exports = performUserDeletion;