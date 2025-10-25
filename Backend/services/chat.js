const ChatRoom = require("../models/chatModel");
const Workspace = require("../models/workspace");
const Document = require("../models/document");
const User = require("../models/user"); // Make sure to import User model
const { isBlocked, onlyAdminChatInWorkspace, onlyAdminorEditorChatInWorkspace, onlyAdminChatInDocs, onlyAdminorEditorChatInInDocument } = require("../config/chatAcess");
const logger = require("../config/logger"); 

module.exports = (io) => {
  io.on("connection", (socket) => {
    logger.info("Socket connected", { socketId: socket.id, clientId: socket.handshake.auth?.userId });

    // Join a chat room
    socket.on("chat:join", ({ type, roomId, userId }) => {
      const roomName = `${type}_${roomId}`;
      socket.join(roomName);
      logger.info("User joined chat room", { 
        socketId: socket.id, 
        userId, 
        roomName, 
        type, 
        roomId 
      });
    });

    // Leave a chat room
    socket.on("chat:leave", ({ type, roomId, userId }) => {
      const roomName = `${type}_${roomId}`;
      socket.leave(roomName);
      logger.info("User left chat room", { 
        socketId: socket.id, 
        userId, 
        roomName, 
        type, 
        roomId 
      });
    });

    // Handle sending messages
    socket.on("chat:message", async ({ type, roomId, from, to, message }) => {
      try {
        logger.info("Received chat message", { 
          socketId: socket.id, 
          type, 
          roomId, 
          from, 
          to, 
          messageLength: message?.length 
        });

        if (!message?.trim()) {
          logger.warn("Empty message rejected", { socketId: socket.id, from });
          socket.emit("chat:error", { msg: "❌ Message cannot be empty" });
          return;
        }

        let allowed = true;
        const chatType = type === "user" ? "direct" : type;

        // Access control checks
        if (chatType === "direct") {
          if (!to) {
            logger.warn("Direct message missing recipient", { socketId: socket.id, from });
            socket.emit("chat:error", { msg: "❌ Recipient ID required" });
            return;
          }
          allowed = !(await isBlocked(from, to));
          
          if (!allowed) {
            logger.warn("Message blocked - user is blocked", { from, to, socketId: socket.id });
          }
        } else if (chatType === "workspace") {
          const ws = await Workspace.findById(roomId);
          if (!ws) {
            logger.warn("Workspace not found for chat", { socketId: socket.id, from, roomId });
            socket.emit("chat:error", { msg: "❌ Workspace not found" });
            return;
          }
          const policy = ws.chatPolicy || "admin-editor";
          logger.debug("Workspace chat policy check", { roomId, policy, from });
          
          if (policy === "admin-only") allowed = await onlyAdminChatInWorkspace(from, roomId);
          else if (policy === "admin-editor") allowed = await onlyAdminorEditorChatInWorkspace(from, roomId);
        } else if (chatType === "document") {
          const doc = await Document.findById(roomId);
          if (!doc) {
            logger.warn("Document not found for chat", { socketId: socket.id, from, roomId });
            socket.emit("chat:error", { msg: "❌ Document not found" });
            return;
          }
          const policy = doc.chatPolicy || "admin-editor";
          logger.debug("Document chat policy check", { roomId, policy, from });
          
          if (policy === "admin-only") allowed = await onlyAdminChatInDocs(from, roomId);
          else if (policy === "admin-editor") allowed = await onlyAdminorEditorChatInInDocument(from, roomId);
        }

        if (!allowed) {
          logger.warn("Chat permission denied", { 
            socketId: socket.id, 
            from, 
            chatType, 
            roomId 
          });
          socket.emit("chat:error", { msg: "❌ You are not allowed to chat here" });
          return;
        }

        let chatRoom = null;
        
        // Find or create chat room
        if (chatType === "direct") {
          chatRoom = await ChatRoom.findOne({
            type: chatType,
            toModel: "User",
            participants: { $all: [from, to] }
          }).populate('messages.user', 'firstName lastName username avatar');
          
          logger.debug("Direct chat room lookup", { from, to, found: !!chatRoom });
        } else {
          chatRoom = await ChatRoom.findOne({
            type: chatType,
            to: roomId,
            toModel: chatType === "workspace" ? "Workspace" : "Document",
          }).populate('messages.user', 'firstName lastName username avatar');
          
          logger.debug(`${chatType} chat room lookup`, { roomId, found: !!chatRoom });
        }

        if (!chatRoom) {
          logger.info("Creating new chat room", { chatType, roomId, from, to });
          chatRoom = new ChatRoom({
            type: chatType,
            to: chatType === "direct" ? to : roomId,
            toModel: chatType === "direct" ? "User" : chatType === "workspace" ? "Workspace" : "Document",
            messages: [],
            participants: chatType === "direct" ? [from, to] : []
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

        // Populate the newly added message
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
          roomId: roomId,
          isSeen: savedMessage.isSeen,
          createdAt: savedMessage.createdAt,
        };

        logger.debug("Emitting message to room", { 
          roomName: `${type}_${roomId}`,
          messageId: savedMessage._id,
          chatRoomId: chatRoom._id
        });

        // Emit to room (includes all participants)
        const roomName = `${type}_${roomId}`;
        io.to(roomName).emit("chat:message", emitPayload);

        logger.info("Message sent successfully", { 
          socketId: socket.id, 
          from, 
          chatType, 
          roomId, 
          messageId: savedMessage._id,
          recipientCount: io.sockets.adapter.rooms.get(roomName)?.size || 0
        });

      } catch (err) {
        logger.error("Chat message error", { 
          error: err.message, 
          stack: err.stack, 
          socketId: socket.id, 
          from, 
          type, 
          roomId 
        });
        socket.emit("chat:error", { msg: "Failed to send message" });
      }
    });

    // Typing indicators
    socket.on("chat:typing", ({ type, roomId, userId, isTyping }) => {
      const roomName = `${type}_${roomId}`;
      
      logger.debug("Typing indicator", { 
        socketId: socket.id, 
        userId, 
        roomName, 
        isTyping 
      });
      
      socket.to(roomName).emit("chat:typing", {
        userId,
        userName: userId, // You might want to populate this with actual user name
        isTyping,
      });
    });

    // Message seen indicator
    socket.on("chat:messageSeen", async ({ messageId, roomId, type, userId }) => {
      try {
        logger.debug("Message seen event", { 
          socketId: socket.id, 
          messageId, 
          roomId, 
          type, 
          userId 
        });

        const chatRoom = await ChatRoom.findOne({
          "messages._id": messageId
        });

        if (chatRoom) {
          const message = chatRoom.messages.id(messageId);
          if (message && !message.isSeen) {
            message.isSeen = true;
            message.seenAt = new Date();
            await chatRoom.save();

            logger.info("Message marked as seen", { 
              messageId, 
              userId, 
              seenAt: message.seenAt 
            });

            // Notify other users in the room
            const roomName = `${type}_${roomId}`;
            socket.to(roomName).emit("chat:messageSeen", {
              messageId,
              seenBy: userId,
              seenAt: message.seenAt
            });
          }
        }
      } catch (err) {
        logger.error("Error marking message as seen", { 
          error: err.message, 
          stack: err.stack, 
          socketId: socket.id, 
          messageId, 
          userId 
        });
      }
    });

    socket.on("disconnect", (reason) => {
      logger.info("Socket disconnected", { 
        socketId: socket.id, 
        reason,
        clientId: socket.handshake.auth?.userId 
      });
    });

    // Handle connection errors
    socket.on("error", (error) => {
      logger.error("Socket error", { 
        socketId: socket.id, 
        error: error.message,
        stack: error.stack 
      });
    });

    // Handle authentication (if you have auth)
    socket.on("authenticate", (userData) => {
      logger.info("Socket authentication", { 
        socketId: socket.id, 
        userId: userData.userId 
      });
      // You can store user data in socket for later use
      socket.userId = userData.userId;
    });
  });

  // Optional: Log server-level events
  io.engine.on("connection_error", (err) => {
    logger.error("Socket.io connection error", { 
      error: err.message,
      code: err.code,
      context: err.context 
    });
  });
};