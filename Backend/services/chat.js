const ChatRoom = require("../models/chatModel");
const Workspace = require("../models/workspace");
const Document = require("../models/document");
const { isBlocked, onlyAdminChatInWorkspace, onlyAdminorEditorChatInWorkspace, onlyAdminChatInDocs, onlyAdminorEditorChatInInDocument } = require("../config/chatAcess");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🔌 Socket connected:", socket.id);

    // Join a chat room
    socket.on("chat:join", ({ type, roomId, userId }) => {
      const roomName = `${type}_${roomId}`;
      socket.join(roomName);
      console.log(`✅ ${userId} joined ${roomName}`);
    });

    // Leave a chat room
    socket.on("chat:leave", ({ type, roomId, userId }) => {
      const roomName = `${type}_${roomId}`;
      socket.leave(roomName);
      console.log(`🚪 ${userId} left ${roomName}`);
    });

    // Handle sending messages
    socket.on("chat:message", async ({ type, roomId, from, to, message }) => {
      try {
        if (!message?.trim()) {
          socket.emit("chat:error", { msg: "❌ Message cannot be empty" });
          return;
        }

        let allowed = true;
        const chatType = type === "user" ? "direct" : type;

        // Access control checks
        if (chatType === "direct") {
          if (!to) {
            socket.emit("chat:error", { msg: "❌ Recipient ID required" });
            return;
          }
          allowed = !(await isBlocked(from, to));
        } else if (chatType === "workspace") {
          const ws = await Workspace.findById(roomId);
          if (!ws) {
            socket.emit("chat:error", { msg: "❌ Workspace not found" });
            return;
          }
          const policy = ws.chatPolicy || "admin-editor";
          if (policy === "admin-only") allowed = await onlyAdminChatInWorkspace(from, roomId);
          else if (policy === "admin-editor") allowed = await onlyAdminorEditorChatInWorkspace(from, roomId);
        } else if (chatType === "document") {
          const doc = await Document.findById(roomId);
          if (!doc) {
            socket.emit("chat:error", { msg: "❌ Document not found" });
            return;
          }
          const policy = doc.chatPolicy || "admin-editor";
          if (policy === "admin-only") allowed = await onlyAdminChatInDocs(from, roomId);
          else if (policy === "admin-editor") allowed = await onlyAdminorEditorChatInInDocument(from, roomId);
        }

        if (!allowed) {
          socket.emit("chat:error", { msg: "❌ You are not allowed to chat here" });
          return;
        }
        let chatRoom = null;
        if (chatType === "direct") {
          chatRoom = await ChatRoom.findOne({
            type: chatType,
            toModel: "User",
            participants: { $all: [from, to] }
          });
        }
        else {
          chatRoom = await ChatRoom.findOne({
            type: chatType,
            to: roomId,
            toModel: chatType === "workspace" ? "Workspace" : "Document",
          });
        }


          if (!chatRoom) {
            chatRoom = new ChatRoom({
              type: chatType,
              to: chatType === "direct" ? to : roomId,
              toModel: chatType === "direct" ? "User" : chatType === "workspace" ? "Workspace" : "Document",
              messages: [],
              participants: chatType === "direct" ? [from, to] : null
            });
          }

          // Create and save message
          const newMessage = {
            user: from,
            message: message.trim(),
            isSeen: false,
            createdAt: new Date(),
          };

          chatRoom.messages.push(newMessage);
          await chatRoom.save();

          // Populate user data
          await chatRoom.populate('messages.user', 'firstName lastName username avatar');

          const savedMessage = chatRoom.messages[chatRoom.messages.length - 1];

          // Prepare payload
          const emitPayload = {
            _id: savedMessage._id,
            chatRoomId: chatRoom._id,
            from: savedMessage.user,
            to: chatType === "direct" ? to : roomId,
            message: savedMessage.message,
            type: chatType,
            isSeen: savedMessage.isSeen,
            createdAt: savedMessage.createdAt,
          };

          // Emit to room (includes all participants)
          const roomName = `${type}_${roomId}`;
          io.to(roomName).emit("chat:message", emitPayload);


        } catch (err) {
          console.error("❌ Chat error:", err);
          socket.emit("chat:error", { msg: "Failed to send message" });
        }
      });

    // Typing indicators
    socket.on("chat:typing", ({ type, roomId, userId, isTyping }) => {
      const roomName = `${type}_${roomId}`;
      socket.to(roomName).emit("chat:typing", {
        userId,
        isTyping,
      });
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });
};