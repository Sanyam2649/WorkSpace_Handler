const mongoose = require("mongoose");

const messageChunkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    isSeen: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const chatRoomSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "workspace", "document"],
      required: true,
    },

    to: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: "toModel" },
    toModel: {
      type: String,
      enum: ["User", "Workspace", "Document"],
      required: true
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: { type: [messageChunkSchema], default: [] },
  },
  { timestamps: true }
);

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);
module.exports = ChatRoom;
