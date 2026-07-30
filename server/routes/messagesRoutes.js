const express = require("express");
const { auth } = require("../middleware/auth");
const {
  getMessages,
  getUsersForSidebar,
  markMessageAsSeen,
  sendMessage,
} = require("../Controller/messageController");

const messageRouter = express.Router();

messageRouter.get("/users", auth, getUsersForSidebar);
messageRouter.get("/:id", auth, getMessages);
messageRouter.put("/mark/:id", auth, markMessageAsSeen);
messageRouter.post("/send/:id", auth, sendMessage);

module.exports = messageRouter;