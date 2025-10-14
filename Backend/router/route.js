const express = require("express");
const userRouter = require("./userRoute");
const workspaceRouter = require("./workspaceRoute");
const documentRouter = require("./documentRoute");
const searchRouter = require("./searchRoute");
const analyticsRouter = require("./analyticsRoute");

const router = express.Router();
router.use("/user", userRouter);
router.use("/workspace", workspaceRouter);
router.use("/docs", documentRouter);
router.use("/search", searchRouter);
router.use("/analytics", analyticsRouter);

module.exports = router;