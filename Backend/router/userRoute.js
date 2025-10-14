const { v4: uuidv4 } = require("uuid");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const multer = require("multer");

const User = require("../models/user");
const BlacklistedToken = require("../models/blacklistToken");
const Document = require("../models/document");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudClient");
const authMiddleware = require("../middleware/userAuth");
const { setupPassport } = require("../services/passport");
const workspace = require("../models/workspace");
const ChatRoom = require("../models/chatModel");

setupPassport();
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ---------------------- Utility ----------------------
function generateTokens(user) {
  return user.generateAuthToken();
}

// ---------------------- Refresh Token ----------------------
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Missing refresh token" });

    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ message: "Invalid token" });

    const tokens = generateTokens(user);
    res.json(tokens);
  } catch (e) {
    res.status(401).json({ message: "Invalid/expired refresh token" });
  }
});

// ---------------------- Signup ----------------------
router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, username, email, phone, password } = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { phone }],
    });
    if (existingUser)
      return res.status(400).json({ message: "User with provided email, username, or phone already exists" });

    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      phone,
      password,
      providers: [{ provider: "local", providerId: uuidv4() }],
    });

    await newUser.save();
    const tokens = generateTokens(newUser);
    res.status(201).json({ message: "User created successfully", user: newUser, ...tokens });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------------------- Local Login ----------------------
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ message: "Please provide identifier and password" });

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier }, { phone: identifier }],
    });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Cancel scheduled deletion if exists
    if (user.scheduledDeletion) {
      user.scheduledDeletion = null;
      await user.save();
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const tokens = generateTokens(user);
    res.status(200).json({ message: "Login successful", user, ...tokens });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ---------------------- Profile Update ----------------------
router.patch("/profile", upload.single("avatar"), authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    const updatable = ["firstName", "lastName", "phone", "gender"];
    for (const field of updatable) {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    }

    // --- Update preferences ---
    if (req.body.preferences) {
      try {
        const prefs = JSON.parse(req.body.preferences);
        user.preferences = { ...user.preferences, ...prefs };
      } catch {
        if (typeof req.body["preferences.language"] === "string")
          user.preferences.language = req.body["preferences.language"];
        if (typeof req.body["preferences.theme"] === "string")
          user.preferences.theme = req.body["preferences.theme"];
        if (typeof req.body["preferences.notifications.email"] !== "undefined")
          user.preferences.notifications.email = req.body["preferences.notifications.email"] === "true";
        if (typeof req.body["preferences.notifications.sms"] !== "undefined")
          user.preferences.notifications.sms = req.body["preferences.notifications.sms"] === "true";
        if (typeof req.body["preferences.notifications.whatsapp"] !== "undefined")
          user.preferences.notifications.whatsapp = req.body["preferences.notifications.whatsapp"] === "true";
      }
    }

    // --- Handle avatar upload ---
    if (req.file) {
      if (user.avatar?.publicId) {
        try {
          resourceType = user.avatar.resourceType
          await cloudinary.uploader.destroy(user.avatar.publicId, { resource_type: resourceType });
        } catch (err) {
          console.warn(`Failed to delete old avatar: ${err.message}`);
        }
      }

      // Upload new avatar
      const uploadFromBuffer = (fileBuffer) =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "avatars", resource_type: "image" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            }
          );
          streamifier.createReadStream(fileBuffer).pipe(stream);
        });

      const result = await uploadFromBuffer(req.file.buffer);

      user.avatar = {
        url: result.secure_url,
        originalName: req.file.originalname,
        mimetype: req.file.mimetype,
        publicId: result.public_id,
        resourceType: "image",
      };

      // Update avatar in local provider if exists
      const providerLocal = user.providers.find((p) => p.provider === "local");
      if (providerLocal) providerLocal.avatar = user.avatar.url;
    }

    await user.save();
    res.json({ message: "Profile updated successfully", user });
  } catch (e) {
    let message = e.message;
    if (e.code === 11000) message = "Email, username, or phone already exists";
    res.status(500).json({ message: "Profile update failed", error: message });
  }
});

router.get("/get-user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // exclude password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ---------------------- Logout ----------------------
router.post("/logout", authMiddleware, async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];
    const refreshToken = req.cookies?.refreshToken || req.headers["x-refresh-token"];

    if (accessToken)
      await BlacklistedToken.create({ token: accessToken, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) });
    if (refreshToken)
      await BlacklistedToken.create({ token: refreshToken, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });

    res.clearCookie("refreshToken");
    res.json({ message: "Logout successful" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// ---------------------- Google OAuth ----------------------
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/oauth-failed" }),
  async (req, res) => {
    try {
      if (req.user.scheduledDeletion) {
        req.user.scheduledDeletion = null;
        await req.user.save();
      }

      const tokens = generateTokens(req.user);

      const { password, providers, scheduledDeletion, ...userData } = req.user.toObject();

      const redirectTo = `${process.env.FRONTEND_URL}/login?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}&user=${encodeURIComponent(
        JSON.stringify(userData)
      )}`;

      res.redirect(redirectTo); 
    } catch (err) {
      console.error("Google OAuth callback error:", err);
      res.redirect("/oauth-failed");
    }
  }
);

// ---------------------- GitHub OAuth ----------------------
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/oauth-failed" }),
  async (req, res) => {
    try {
      if (req.user.scheduledDeletion) {
        req.user.scheduledDeletion = null;
        await req.user.save();
      }
      const tokens = generateTokens(req.user);

      const { password, providers, scheduledDeletion, ...userData } = req.user.toObject();

      const redirectTo = `${process.env.FRONTEND_URL}/login?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}&user=${encodeURIComponent(
        JSON.stringify(userData)
      )}`;

      res.redirect(redirectTo);
    } catch (err) {
      console.error("GitHub callback error:", err);
      res.redirect("/oauth-failed");
    }
  }
);



router.post("/delete", authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });
    const deletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    user.scheduledDeletion = deletionDate;
    await user.save();

    res.json({
      message: "Account deletion scheduled in 30 days.",
      deletionDate,
    });
  } catch (err) {
    console.error("Error scheduling deletion:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/invite-friend/:friendId", authMiddleware, async (req, res) => {
  try {
    const { friendId } = req.params;

    if (!friendId) {
      return res.status(400).json({ message: "Friend ID is required." });
    }

    if (friendId === req.user.id) {
      return res.status(400).json({ message: "You cannot invite yourself." });
    }

    const [user, userInvited] = await Promise.all([
      User.findById(req.user.id),
      User.findById(friendId),
    ]);

    if (!userInvited) {
      return res.status(404).json({ message: "User to invite not found." });
    }

    // Check if already friends
    const alreadyConnected = user.friendList.some(
      (f) =>
        f.friendId.toString() === friendId &&
        f.isConnected === true
    );
    if (alreadyConnected) {
      return res.status(400).json({ message: "You are already friends with this user." });
    }

    // Check if there's a pending invite in any direction
    const pendingInvite =
      user.friendList.some(
        (f) =>
          f.friendId.toString() === friendId &&
          (f.isInvited === true || f.getInvite === true)
      ) ||
      userInvited.friendList.some(
        (f) =>
          f.friendId.toString() === req.user.id &&
          (f.isInvited === true || f.getInvite === true)
      );

    if (pendingInvite) {
      return res.status(400).json({ message: "A pending invite already exists." });
    }

    // Remove previous rejected entries (so we can re-invite cleanly)
    user.friendList = user.friendList.filter(
      (f) => f.friendId.toString() !== friendId
    );
    userInvited.friendList = userInvited.friendList.filter(
      (f) => f.friendId.toString() !== req.user.id
    );

    // Add new invite entries
    user.friendList.push({
      friendId: userInvited._id,
      isInvited: true,
      rejectInvite: false,
      isConnected: false,
    });

    userInvited.friendList.push({
      friendId: user._id,
      getInvite: true,
      rejectInvite: false,
      isConnected: false,
    });

    await Promise.all([user.save(), userInvited.save()]);

    res.status(200).json({
      message: "✅ Friend invite sent successfully!",
      invitedUser: userInvited._id,
    });
  } catch (error) {
    console.error("❌ Error sending friend invite:", error);
    res.status(500).json({ message: "Internal server error." });
  }
});

router.get("/friendList", authMiddleware, async (req, res) => {
  try {
    // Fetch current user with populated friend list
    const user = await User.findById(req.user.id)
      .populate("friendList.friendId", "firstName lastName email username avatar")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // ✅ Prepare friend list with proper fields from your schema
    const friendList = user.friendList.map((friend) => ({
      friendId: friend.friendId?._id,
      name: friend.friendId
        ? `${friend.friendId.firstName} ${friend.friendId.lastName}`.trim()
        : "Unknown User",
      email: friend.friendId?.email || "",
      username: friend.friendId?.username || "",
      avatar: friend.friendId?.avatar || {},
      isInvited: friend.isInvited,
      getInvite: friend.getInvite,
      rejectInvite: friend.rejectInvite,
      isConnected: friend.isConnected,
    }));

    // ✅ Find workspaces where the user is a member
    const workspaces = await workspace.find({ "members.user": req.user.id })
      .populate("members.user", "firstName lastName email username avatar")
      .lean();

    const workspaceList = workspaces.map((ws) => ({
      workspaceId: ws._id,
      name: ws.name,
      description: ws.description,
      members: ws.members.map((m) => ({
        userId: m.user?._id,
        name: `${m.user?.firstName || ""} ${m.user?.lastName || ""}`.trim(),
        email: m.user?.email,
        username: m.user?.username,
        roles: m.roles,
        avatar: m.user?.avatar,
      })),
    }));

    // ✅ Find documents created by the user
    const documents = await Document.find({ createdBy: req.user.id })
      .populate("permissions.user", "firstName lastName email username avatar")
      .lean();

    const documentList = documents.map((doc) => ({
      documentId: doc._id,
      title: doc.title,
      workspace: doc.workspace,
      permissions: doc.permissions.map((p) => ({
        userId: p.user?._id,
        name: `${p.user?.firstName || ""} ${p.user?.lastName || ""}`.trim(),
        email: p.user?.email,
        username: p.user?.username,
        role: p.role,
        avatar: p.user?.avatar,
      })),
    }));

    // ✅ Return combined data
    return res.status(200).json({
      friendList,
      workspaceList,
      documentList,
    });
  } catch (error) {
    console.error("❌ Error fetching friend list and related entities:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/accept-invite/:id", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const friendId = req.params.id;

    // Find both users
    const [user, friendUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(friendId),
    ]);

    if (!user || !friendUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find invite in current user's list
    const friendEntry = user.friendList.find(
      f => f.friendId.toString() === friendId && f.getInvite === true
    );

    if (!friendEntry) {
      return res.status(400).json({ message: "No pending invite found." });
    }

    // Update connection flags
    friendEntry.isConnected = true;
    friendEntry.getInvite = false;

    // Also update the friend’s record to mark connection
    const friendSide = friendUser.friendList.find(
      f => f.friendId.toString() === currentUserId && f.isInvited === true
    );

    if (friendSide) {
      friendSide.isConnected = true;
      friendSide.isInvited = false;
    } else {
      // In case the record doesn’t exist, add it
      friendUser.friendList.push({
        friendId: currentUserId,
        isConnected: true,
      });
    }

    await Promise.all([user.save(), friendUser.save()]);

    return res.status(200).json({
      message: "✅ Friend invite accepted successfully.",
    });
  } catch (error) {
    console.error("❌ Error accepting invite:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

router.post("/reject-invite/:id", authMiddleware, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const friendId = req.params.id;

    // Find both users
    const [user, friendUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(friendId),
    ]);

    if (!user || !friendUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find invite in current user's friend list (the one who received the invite)
    const friendEntry = user.friendList.find(
      f => f.friendId.toString() === friendId && f.getInvite === true
    );

    if (!friendEntry) {
      return res.status(400).json({ message: "No pending invite found to reject." });
    }

    // Update flags for current user
    friendEntry.getInvite = false;
    friendEntry.rejectInvite = true;

    // Also update the friend’s record (the one who sent the invite)
    const friendSide = friendUser.friendList.find(
      f => f.friendId.toString() === currentUserId && f.isInvited === true
    );

    if (friendSide) {
      friendSide.isInvited = false;
      friendSide.rejectInvite = true;
    }

    await Promise.all([user.save(), friendUser.save()]);

    return res.status(200).json({
      message: "🚫 Friend invite rejected successfully.",
    });
  } catch (error) {
    console.error("❌ Error rejecting invite:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

router.post('/chat/history', authMiddleware, async (req, res) => {
  try {
    const { type, roomId, userId } = req.body;
    const currentUserId = req.user.id;

    console.log("📥 Chat history request:", { type, roomId, userId });

    if (!type || !roomId || roomId === "undefined") {
      return res.status(400).json({ message: "Missing required parameters" });
    }

    // Map frontend types to backend types
    const backendType = type === 'user' ? 'direct' : type;
    
    let query = {
      type: backendType,
    };

    if (backendType === 'direct') {
      // For direct messages between two users
      query.toModel = 'User';
           query.participants = { $all: [currentUserId, userId] };
    } else {
      // For workspace/document chats
      query.to = roomId;
      query.toModel = backendType === 'workspace' ? 'Workspace' : 'Document';
    }

    console.log("🔍 Chat room query:", query);

    const chatRoom = await ChatRoom.findOne(query)
      .populate('messages.user', 'firstName lastName username avatar')
      .lean();

    if (!chatRoom) {
      console.log("📭 No chat room found");
      return res.json({ messages: [] });
    }

    // Sort messages by createdAt ascending
    const messages = (chatRoom.messages || []).sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    console.log(`📨 Found ${messages.length} messages`);

    // Format messages for frontend
    const formattedMessages = messages.map(msg => ({
      _id: msg._id,
      from: msg.user._id,
      user: msg.user,
      message: msg.message,
      isSeen: msg.isSeen,
      createdAt: msg.createdAt,
    }));

    return res.status(200).json({ messages: formattedMessages });

  } catch (err) {
    console.error("❌ Error getting chat history:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
