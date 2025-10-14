require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const http = require("http");
const { Server } = require("socket.io");
const passport = require("passport");
const cron = require("node-cron");
const connectDB = require("./config/db");
const routes = require("./router/route");

// --- Chat socket ---
const chatSocket = require("./services/chat");
const { default: performUserDeletion } = require("./services/userCleanUp");

const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));
app.use(passport.initialize());

app.use("/api", routes);
app.get("/health", (_req, res) => res.json({ ok: true, ts: new Date() }));

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*", credentials: true } });

// Initialize chat socket
chatSocket(io);

connectDB()
  .then(() => {
    server.listen(PORT, () =>
      console.log(`✅ Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ Failed to connect DB:", err);
    process.exit(1);
  });
  
cron.schedule("0 0 * * *", async () => {
  console.log("🕛 Running daily scheduled user deletion check...");
  try {
    const now = new Date();
    const usersToDelete = await User.find({
      scheduledDeletion: { $lte: now },
    });

    if (usersToDelete.length === 0) {
      console.log("✅ No users scheduled for deletion today.");
      return;
    }

    for (const user of usersToDelete) {
      await performUserDeletion(user);
    }
  } catch (err) {
    console.error("❌ Cron job failed:", err.message);
  }
});


module.exports = { app, io, server };
