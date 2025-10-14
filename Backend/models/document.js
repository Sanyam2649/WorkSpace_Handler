const mongoose = require("mongoose");

const versionSchema = new mongoose.Schema(
  {
    content: { type: String, default: "" },
    title: { type: String, default: "Untitled" },
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { _id: false }
);

const permissionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["Admin", "Editor", "Viewer"], default: "Viewer" }
  },
  { _id: false }
);


const documentSchema = new mongoose.Schema(
  {
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: "Workspace", required: true },
    permissions: { type: [permissionSchema], default: [] },
    files: [
      {
        url: String,
        originalName: String,
        mimetype: String,
        publicId: String,
        resourceType: String
      },
    ],

    sharedWith: {
      users: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    },

    title: { type: String, default: "Untitled" },
    content: { type: String, default: "" }, // markdown or rich-text JSON string
    versions: { type: [versionSchema], default: [] },
    chatPolicy: {
      type: String,
      enum: ["admin-only", "admin-editor", "all"],
      default: "admin-editor",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Document", documentSchema);


