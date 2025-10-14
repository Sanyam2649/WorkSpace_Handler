const workspace = require("../models/workspace");
const Document = require("../models/document");
const cloudinary = require("../config/cloudClient");

const performUserDeletion = async (user) => {
  try {
    if (user.avatar?.publicId) {
      try {
        await cloudinary.uploader.destroy(user.avatar.publicId, {
          resource_type: user.avatar.resourceType || "image",
        });
      } catch (err) {
        console.warn(`Failed to remove avatar from Cloudinary: ${err.message}`);
      }
    }

    const workspaces = await workspace.find({ createdBy: user._id });
    for (const ws of workspaces) {
      const docs = await Document.find({ workspace: ws._id });
      for (const doc of docs) {
        if (doc.files && doc.files.length > 0) {
          for (const file of doc.files) {
            if (file.publicId) {
              try {
                await cloudinary.uploader.destroy(file.publicId, {
                  resource_type: file.resourceType || "auto",
                });
              } catch (err) {
                console.warn(`Failed to remove file ${file.originalName}: ${err.message}`);
              }
            }
          }
        }
        await doc.deleteOne();
      }
      await ws.deleteOne();
    }

    await workspace.updateMany(
      { "members.user": user._id },
      { $pull: { members: { user: user._id } } }
    );

    await Document.updateMany(
      { "permissions.user": user._id },
      { $pull: { permissions: { user: user._id } } }
    );

    const docsWithVersions = await Document.find({ "versions.createdBy": user._id });
    for (const doc of docsWithVersions) {
      doc.versions = doc.versions.filter(
        (v) => String(v.createdBy) !== String(user._id)
      );
      await doc.save();
    }

    await user.deleteOne();
    console.log(`✅ User ${user._id} fully deleted from system.`);
  } catch (err) {
    console.error(`❌ Failed to delete user ${user._id}: ${err.message}`);
  }
};

module.exports = performUserDeletion;
