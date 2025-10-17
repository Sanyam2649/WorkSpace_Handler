const mongoose = require("mongoose");

const membershipSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roles: { type: [String], enum: ["Admin", "Editor", "Viewer"], default: ["Viewer"] },
    isRequested : {type : Boolean , default : false},
    isActive : {type : Boolean, default : false},
  },
  { _id: false }
);

const trackActivitySchema = new mongoose.Schema({
  activity : String,
  createdAt : {type : Date}
})

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    description: {type :String},
    members: { type: [membershipSchema], default: [] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    documents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Document" }],
    chatPolicy: {
      type: String,
      enum: ["admin-only", "admin-editor", "all"],
      default: "admin-editor",
    },
    trackActivity : [trackActivitySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workspace", workspaceSchema);


