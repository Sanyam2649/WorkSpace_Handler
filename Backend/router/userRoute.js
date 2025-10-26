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
const sendMail = require("../services/nodeMailer");
const logger = require("../config/logger"); 

setupPassport();
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// ---------------------- Utility ----------------------
function generateTokens(user) {
  return user.generateAuthToken();
}

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000);
}

async function generateUniqueOTP() {
  const otp = generateOTP();
  const existingUser = await User.findOne({ otp });
  if (existingUser) return generateUniqueOTP(); // regenerate if exists
  return otp;
}

// ---------------------- Refresh Token ----------------------
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      logger.warn("Refresh token missing in request");
      return res.status(400).json({ message: "Missing refresh token" });
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) {
      logger.warn("Invalid refresh token - user not found", { userId: payload.userId });
      return res.status(401).json({ message: "Invalid token" });
    }

    const tokens = generateTokens(user);
    logger.info("Refresh token successful", { userId: user._id });
    res.json(tokens);
  } catch (e) {
    logger.error("Refresh token error", { error: e.message, stack: e.stack });
    res.status(401).json({ message: "Invalid/expired refresh token" });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { firstName, lastName, username, email, phone} = req.body;
    
    logger.info("User signup attempt", { email, username });
    
    const existingUser = await User.findOne({
      $or: [{ email }, { username }, { phone }],
    });
    if (existingUser) {
      logger.warn("User signup failed - already exists", { email, username, phone });
      return res.status(400).json({
        message: "User with provided email, username, or phone already exists",
      });
    }

    const otp = await generateUniqueOTP();
    const newUser = new User({
      firstName,
      lastName,
      username,
      email,
      phone,
      otp,
      providers: [{ provider: "local", providerId: uuidv4() }],
    });

    await newUser.save();

    // ✅ Send OTP via email
    await sendMail(
      email,
      "Verify your Workspace Account",
      `Your verification code is ${otp}`,
      `<div style="font-family:sans-serif;line-height:1.6;">
         <h2>Welcome to WorkSpaceHandler, ${firstName}!</h2>
         <p>Use the following OTP to verify your email address:</p>
         <h3 style="color:#6C63FF;letter-spacing:3px;">${otp}</h3>
         <p>This code is valid for 10 minutes.</p>
       </div>`
    );

    logger.info("User created successfully", { userId: newUser._id, email });
    
    res.status(201).json({
      message: "User created successfully. OTP sent to email.",
      user: newUser,
    });
  } catch (err) {
    logger.error("Signup Error", { error: err.message, stack: err.stack, email: req.body.email });
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/unverify-signup", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      logger.warn("Unverify signup - email missing");
      return res.status(400).json({ error: "Email is required" });
    }
    
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Unverify signup - user not found", { email });
      return res.status(404).json({ error: "User not found" });
    }
    
    // Optionally check if user.isVerified === false to restrict deletion
    await User.deleteOne({ email });

    logger.info("Unverified user deleted", { email });
    
    return res.status(200).json({ message: "Unverified user deleted successfully" });
  } catch (error) {
    logger.error("Error deleting unverified user", { error: error.message, stack: error.stack, email: req.body.email });
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      logger.warn("OTP verification - missing fields", { email });
      return res.status(400).json({ message: "Email and OTP are required." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("OTP verification - user not found", { email });
      return res.status(404).json({ message: "User not found." });
    }
    
    if (user.otp !== Number(otp)) {
      logger.warn("OTP verification - invalid OTP", { email, providedOTP: otp, storedOTP: user.otp });
      return res.status(400).json({ 
        success : false,
        message: "Invalid OTP." });
    }
    
    user.isVerified = true;
    user.otp = null;
    await user.save();

    logger.info("OTP verified successfully", { userId: user._id, email });
    
    res.status(200).json({ 
      success : true,
      message: "✅ OTP verified successfully."
    });
  } catch (error) {
    logger.error("OTP Verification Error", { error: error.message, stack: error.stack, email: req.body.email });
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

router.post("/set-password", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      logger.warn("Set password - missing fields", { email });
      return res.status(400).json({ message: "Email and password are required." ,  success : false});
    }
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn("Set password - user not found", { email });
      return res.status(404).json({ message: "User not found.", success: false });
    }
    if (!user.isVerified) {
      logger.warn("Set password - user not verified", { email });
      return res.status(403).json({ message: "User not verified. Please verify your email first." , success : false });
    }
    
    user.password = password;
    await user.save();

    logger.info("Password set successfully", { userId: user._id, email });
    
    res.status(200).json({ message: "Password set successfully.", success : true });
  } catch (error) {
    logger.error("Set Password Error", { error: error.message, stack: error.stack, email: req.body.email });
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ---------------------- Local Login ----------------------
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      logger.warn("Login attempt - missing credentials", { identifier });
      return res.status(400).json({ message: "Please provide identifier and password" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier.toLowerCase() }, { username: identifier }, { phone: identifier }],
    });
    if (!user) {
      logger.warn("Login failed - user not found", { identifier });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Cancel scheduled deletion if exists
    if (user.scheduledDeletion) {
      user.scheduledDeletion = null;
      await user.save();
      logger.info("Scheduled deletion cancelled due to login", { userId: user._id });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn("Login failed - invalid password", { userId: user._id, identifier });
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const tokens = generateTokens(user);
    
    logger.info("User login successful", { userId: user._id, identifier });
    
    res.status(200).json({ message: "Login successful", user, ...tokens });
  } catch (err) {
    logger.error("Login error", { error: err.message, stack: err.stack, identifier: req.body.identifier });
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { identifier } = req.body;
  
    if (!identifier) {
      logger.warn("Forgot password - identifier missing");
      return res.status(400).json({ message: "Email or username is required" });
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    
    logger.info("Forgot password request", { identifier, userFound: !!user });

    if (!user) {
      logger.warn("Forgot password - user not found", { identifier });
      return res.status(404).json({ message: "User not found" });
    }

    // Generate OTP
    const otp = await generateUniqueOTP();

    // Save OTP to user
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // expires in 10 min
    
    // Send OTP via email
    await sendMail(
      user.email,
      "Password Reset OTP",
       `Your OTP for password reset is ${otp}. It will expire in 10 minutes.`,
       null
    );
    
    await user.save();
    
    logger.info("Password reset OTP sent", { userId: user._id, email: user.email });
  
    return res.status(200).json({ message: "OTP sent successfully to your email" });

  } catch (error) {
    logger.error("Error in forgot-password", { error: error.message, stack: error.stack, identifier: req.body.identifier });
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { identifier, newPassword } = req.body;

    if (!identifier || !newPassword) {
      logger.warn("Reset password - missing fields", { identifier });
      return res.status(400).json({ message: "Identifier and new password are required" });
    }
    
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      logger.warn("Reset password - user not found", { identifier });
      return res.status(404).json({ message: "User not found" });
    }

    user.password = newPassword;
    user.otp = undefined;

    await user.save();

    logger.info("Password reset successful", { userId: user._id, identifier });
    
    return res.status(200).json({ message: "Password reset successfully" });

  } catch (error) {
    logger.error("Error in reset-password", { error: error.message, stack: error.stack, identifier: req.body.identifier });
    return res.status(500).json({ message: "Internal server error" });
  }
});

// ---------------------- Profile Update ----------------------
router.patch("/profile", upload.single("avatar"), authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      logger.warn("Profile update - user not found", { userId: req.user.id });
      return res.status(404).json({ message: "User not found" });
    }
    
    const updatable = ["firstName", "lastName", "phone", "gender"];
    for (const field of updatable) {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    }

    // --- Update preferences ---
    if (req.body.preferences) {
      try {
        const prefs = req.body.preferences;
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
          logger.info("Old avatar deleted from Cloudinary", { userId: user._id, publicId: user.avatar.publicId });
        } catch (err) {
          logger.warn(`Failed to delete old avatar: ${err.message}`, { userId: user._id });
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
      
      logger.info("New avatar uploaded", { userId: user._id });
    }

    await user.save();
    
    logger.info("Profile updated successfully", { userId: user._id });
    
    res.json({ message: "Profile updated successfully", user });
  } catch (e) {
    let message = e.message;
    if (e.code === 11000) message = "Email, username, or phone already exists";
    
    logger.error("Profile update failed", { error: e.message, stack: e.stack, userId: req.user.id });
    
    res.status(500).json({ message: "Profile update failed", error: message });
  }
});

router.get("/get-user", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // exclude password
    if (!user) {
      logger.warn("Get user - user not found", { userId: req.user.id });
      return res.status(404).json({ message: "User not found" });
    }

    logger.info("User data retrieved", { userId: user._id });
    
    res.json({ user });
  } catch (error) {
    logger.error("Get user error", { error: error.message, stack: error.stack, userId: req.user.id });
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
    
    logger.info("User logged out successfully", { userId: req.user.id });
    
    res.json({ message: "Logout successful" });
  } catch (error) {
    logger.error("Logout error", { error: error.message, stack: error.stack, userId: req.user.id });
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
        logger.info("Scheduled deletion cancelled due to Google OAuth login", { userId: req.user._id });
      }

      const tokens = generateTokens(req.user);

      const { password, providers, scheduledDeletion, ...userData } = req.user.toObject();

      const redirectTo = `${process.env.FRONTEND_URL}/auth-login?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}&user=${encodeURIComponent(
        JSON.stringify(userData)
      )}`;

      logger.info("Google OAuth login successful", { userId: req.user._id, email: req.user.email });
      
      res.redirect(redirectTo); 
    } catch (err) {
      logger.error("Google OAuth callback error", { error: err.message, stack: err.stack });
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
        logger.info("Scheduled deletion cancelled due to GitHub OAuth login", { userId: req.user._id });
      }
      
      const tokens = generateTokens(req.user);

      const { password, providers, scheduledDeletion, ...userData } = req.user.toObject();

      const redirectTo = `${process.env.FRONTEND_URL}/auth-login?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}&user=${encodeURIComponent(
        JSON.stringify(userData)
      )}`;

      logger.info("GitHub OAuth login successful", { userId: req.user._id, email: req.user.email });
      
      res.redirect(redirectTo);
    } catch (err) {
      logger.error("GitHub callback error", { error: err.message, stack: err.stack });
      res.redirect("/oauth-failed");
    }
  }
);

router.post("/delete", authMiddleware, async (req, res) => {
  try {
    const { password } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      logger.warn("Account deletion - user not found", { userId: req.user.id });
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn("Account deletion - incorrect password", { userId: user._id });
      return res.status(400).json({ message: "Incorrect password" });
    }
    
    const deletionDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    user.scheduledDeletion = deletionDate;
    await user.save();

    logger.info("Account deletion scheduled", { userId: user._id, deletionDate });
    
    res.json({
      message: "Account deletion scheduled in 30 days.",
      deletionDate,
    });
  } catch (err) {
    logger.error("Error scheduling deletion", { error: err.message, stack: err.stack, userId: req.user.id });
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

router.post("/invite-friend/:friendId", authMiddleware, async (req, res) => {
  try {
    const { friendId } = req.params;

    if (!friendId) {
      logger.warn("Friend invite - friendId missing", { userId: req.user.id });
      return res.status(400).json({ message: "Friend ID is required." });
    }

    if (friendId === req.user.id) {
      logger.warn("Friend invite - self invite attempt", { userId: req.user.id });
      return res.status(400).json({ message: "You cannot invite yourself." });
    }

    const [user, userInvited] = await Promise.all([
      User.findById(req.user.id),
      User.findById(friendId),
    ]);

    if (!userInvited) {
      logger.warn("Friend invite - invited user not found", { userId: req.user.id, friendId });
      return res.status(404).json({ message: "User to invite not found." });
    }

    // Check if already friends
    const alreadyConnected = user.friendList.some(
      (f) =>
        f.friendId.toString() === friendId &&
        f.isConnected === true
    );
    if (alreadyConnected) {
      logger.warn("Friend invite - already friends", { userId: req.user.id, friendId });
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
      logger.warn("Friend invite - pending invite exists", { userId: req.user.id, friendId });
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

    logger.info("Friend invite sent successfully", { userId: req.user.id, friendId: userInvited._id });
    
    res.status(200).json({
      message: "✅ Friend invite sent successfully!",
      invitedUser: userInvited._id,
    });
  } catch (error) {
    logger.error("Error sending friend invite", { error: error.message, stack: error.stack, userId: req.user.id, friendId: req.params.friendId });
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
      logger.warn("Friend list - user not found", { userId: req.user.id });
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

    logger.info("Friend list and related data fetched successfully", { userId: req.user.id, friendCount: friendList.length });
    
    // ✅ Return combined data
    return res.status(200).json({
      friendList,
      workspaceList,
      documentList,
    });
  } catch (error) {
    logger.error("Error fetching friend list and related entities", { error: error.message, stack: error.stack, userId: req.user.id });
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
      logger.warn("Accept invite - user not found", { currentUserId, friendId });
      return res.status(404).json({ message: "User not found." });
    }

    // Find invite in current user's list
    const friendEntry = user.friendList.find(
      f => f.friendId.toString() === friendId && f.getInvite === true
    );

    if (!friendEntry) {
      logger.warn("Accept invite - no pending invite found", { currentUserId, friendId });
      return res.status(400).json({ message: "No pending invite found." });
    }

    // Update connection flags
    friendEntry.isConnected = true;
    friendEntry.getInvite = false;

    // Also update the friend's record to mark connection
    const friendSide = friendUser.friendList.find(
      f => f.friendId.toString() === currentUserId && f.isInvited === true
    );

    if (friendSide) {
      friendSide.isConnected = true;
      friendSide.isInvited = false;
    } else {
      // In case the record doesn't exist, add it
      friendUser.friendList.push({
        friendId: currentUserId,
        isConnected: true,
      });
    }

    await Promise.all([user.save(), friendUser.save()]);

    logger.info("Friend invite accepted", { currentUserId, friendId });
    
    return res.status(200).json({
      message: "✅ Friend invite accepted successfully.",
    });
  } catch (error) {
    logger.error("Error accepting invite", { error: error.message, stack: error.stack, userId: req.user.id, friendId: req.params.id });
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
      logger.warn("Reject invite - user not found", { currentUserId, friendId });
      return res.status(404).json({ message: "User not found." });
    }

    // Find invite in current user's friend list (the one who received the invite)
    const friendEntry = user.friendList.find(
      f => f.friendId.toString() === friendId && f.getInvite === true
    );

    if (!friendEntry) {
      logger.warn("Reject invite - no pending invite found", { currentUserId, friendId });
      return res.status(400).json({ message: "No pending invite found to reject." });
    }

    // Update flags for current user
    friendEntry.getInvite = false;
    friendEntry.rejectInvite = true;

    // Also update the friend's record (the one who sent the invite)
    const friendSide = friendUser.friendList.find(
      f => f.friendId.toString() === currentUserId && f.isInvited === true
    );

    if (friendSide) {
      friendSide.isInvited = false;
      friendSide.rejectInvite = true;
    }

    await Promise.all([user.save(), friendUser.save()]);

    logger.info("Friend invite rejected", { currentUserId, friendId });
    
    return res.status(200).json({
      message: "🚫 Friend invite rejected successfully.",
    });
  } catch (error) {
    logger.error("Error rejecting invite", { error: error.message, stack: error.stack, userId: req.user.id, friendId: req.params.id });
    return res.status(500).json({ message: "Internal server error." });
  }
});

router.post('/chat/history', authMiddleware, async (req, res) => {
  try {
    const { type, roomId, userId } = req.body;
    const currentUserId = req.user.id;

    logger.info("Chat history request", { type, roomId, userId, currentUserId });

    if (!type || !roomId || roomId === "undefined") {
      logger.warn("Chat history - missing parameters", { type, roomId, userId });
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

    logger.debug("Chat room query", { query });

    const chatRoom = await ChatRoom.findOne(query)
      .populate('messages.user', 'firstName lastName username avatar')
      .lean();

    if (!chatRoom) {
      logger.info("No chat room found", { query });
      return res.json({ messages: [] });
    }

    // Sort messages by createdAt ascending
    const messages = (chatRoom.messages || []).sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    logger.info(`Found ${messages.length} messages`, { roomId, type });

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
    logger.error("Error getting chat history", { error: err.message, stack: err.stack, userId: req.user.id, body: req.body });
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/chat-settings", authMiddleware, async (req, res) => {
  try {
    const { type, id, settings } = req.body;
    logger.info(`Received chat settings update request for type: ${type}, id: ${id}`);

    if (!type || !id || !settings || !settings.policy) {
      logger.warn("Missing required fields in request body");
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (type === "workspace") {
      const Workspace = await workspace.findById(id);
      if (!Workspace) {
        logger.warn(`Workspace not found with id: ${id}`);
        return res.status(404).json({ message: "Workspace not found" });
      }

      Workspace.chatPolicy = settings.policy;
      await Workspace.save();
      logger.info(`Workspace chat policy updated successfully for id: ${id}`);
      return res.status(200).json({ message: "Workspace chat settings updated" });
    }

    if (type === "document") {
      const DocumentItem = await Document.findById(id);
      if (!DocumentItem) {
        logger.warn(`Document not found with id: ${id}`);
        return res.status(404).json({ message: "Document not found" });
      }

      DocumentItem.chatPolicy = settings.policy;
      await DocumentItem.save();
      logger.info(`Document chat policy updated successfully for id: ${id}`);
      return res.status(200).json({ message: "Document chat settings updated" });
    }

    logger.warn(`Invalid type provided: ${type}`);
    return res.status(400).json({ message: "Invalid type" });
  } catch (error) {
    logger.error(`Error updating chat settings: ${error.message}`, { stack: error.stack });
    return res.status(500).json({ message: "Internal server error" });
  }
});


module.exports = router;