const express = require("express");
const mongoose = require("mongoose");

const MessageModel = require("../models/MessageModel");
const ConnectionModel = require("../models/ConnectionModel");

const router = express.Router();

// =====================================================
// HELPER — VALIDATE MONGODB OBJECT ID
// =====================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// =====================================================
// HELPER — CHECK WHETHER TWO USERS ARE CONNECTED
// =====================================================

const areUsersConnected = async (userId, otherUserId) => {
  const connection = await ConnectionModel.findOne({
    status: "accepted",

    $or: [
      {
        fromUserId: userId,
        toUserId: otherUserId,
      },
      {
        fromUserId: otherUserId,
        toUserId: userId,
      },
    ],
  });

  return !!connection;
};

// =====================================================
// 1. SEND MESSAGE
// POST: /message/send
// =====================================================

router.post("/send", async (req, res) => {
  try {
    const {
      senderId,
      senderRole,
      receiverId,
      receiverRole,
      message,
    } = req.body;

    // -------------------------------------------------
    // REQUIRED FIELDS
    // -------------------------------------------------

    if (
      !senderId ||
      !senderRole ||
      !receiverId ||
      !receiverRole ||
      !message
    ) {
      return res.status(400).json({
        success: false,
        message: "All message details are required",
      });
    }

    // -------------------------------------------------
    // VALIDATE USER IDS
    // -------------------------------------------------

    if (
      !isValidObjectId(senderId) ||
      !isValidObjectId(receiverId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid sender or receiver ID",
      });
    }

    // -------------------------------------------------
    // VALIDATE ROLES
    // -------------------------------------------------

    if (
      !["student", "alumni"].includes(senderRole) ||
      !["student", "alumni"].includes(receiverRole)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid sender or receiver role",
      });
    }

    // -------------------------------------------------
    // SELF MESSAGE CHECK
    // -------------------------------------------------

    if (String(senderId) === String(receiverId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a message to yourself",
      });
    }

    // -------------------------------------------------
    // CLEAN MESSAGE
    // -------------------------------------------------

    const cleanMessage = String(message).trim();

    if (!cleanMessage) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    // -------------------------------------------------
    // MESSAGE LENGTH CHECK
    // -------------------------------------------------

    if (cleanMessage.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Message cannot exceed 2000 characters",
      });
    }

    // -------------------------------------------------
    // CHECK ACCEPTED CONNECTION
    // -------------------------------------------------

    const connected = await areUsersConnected(
      senderId,
      receiverId
    );

    if (!connected) {
      return res.status(403).json({
        success: false,
        message:
          "You can send messages only to your connections",
      });
    }

    // -------------------------------------------------
    // CREATE MESSAGE
    // -------------------------------------------------

    const newMessage = await MessageModel.create({
      senderId,
      senderRole,
      receiverId,
      receiverRole,
      message: cleanMessage,
      isRead: false,
    });

    // -------------------------------------------------
    // SUCCESS RESPONSE
    // -------------------------------------------------

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.log("SEND MESSAGE ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send message",
      error: error.message,
    });
  }
});

// =====================================================
// 2. GET ONE CONVERSATION
// GET:
// /message/conversation/:userId/:otherUserId
// =====================================================

router.get(
  "/conversation/:userId/:otherUserId",
  async (req, res) => {
    try {
      const {
        userId,
        otherUserId,
      } = req.params;

      // -------------------------------------------------
      // VALIDATE IDS
      // -------------------------------------------------

      if (
        !isValidObjectId(userId) ||
        !isValidObjectId(otherUserId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      // -------------------------------------------------
      // FETCH CONVERSATION
      // -------------------------------------------------

      const messages = await MessageModel.find({
        $or: [
          {
            senderId: userId,
            receiverId: otherUserId,
          },
          {
            senderId: otherUserId,
            receiverId: userId,
          },
        ],
      }).sort({
        createdAt: 1,
      });

      // -------------------------------------------------
      // RESPONSE
      // -------------------------------------------------

      res.status(200).json({
        success: true,
        count: messages.length,
        data: messages,
      });
    } catch (error) {
      console.log(
        "GET CONVERSATION ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to fetch conversation",
        error: error.message,
      });
    }
  }
);

// =====================================================
// 3. GET ALL CONVERSATIONS
// GET: /message/conversations/:userId
// =====================================================

router.get(
  "/conversations/:userId",
  async (req, res) => {
    try {
      const { userId } = req.params;

      // -------------------------------------------------
      // VALIDATE USER ID
      // -------------------------------------------------

      if (!isValidObjectId(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      // -------------------------------------------------
      // GET ALL MESSAGES INVOLVING USER
      // -------------------------------------------------

      const messages = await MessageModel.find({
        $or: [
          {
            senderId: userId,
          },
          {
            receiverId: userId,
          },
        ],
      }).sort({
        createdAt: -1,
      });

      // -------------------------------------------------
      // CREATE UNIQUE CONVERSATIONS
      // -------------------------------------------------

      const conversationMap = new Map();

      messages.forEach((msg) => {
        const isSender =
          String(msg.senderId) === String(userId);

        const otherUserId = isSender
          ? String(msg.receiverId)
          : String(msg.senderId);

        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            otherUserId,

            otherRole: isSender
              ? msg.receiverRole
              : msg.senderRole,

            lastMessage: msg.message,

            lastMessageAt: msg.createdAt,

            unreadCount: 0,
          });
        }

        // -------------------------------------------------
        // COUNT UNREAD MESSAGES
        // -------------------------------------------------

        if (
          String(msg.receiverId) === String(userId) &&
          msg.isRead === false
        ) {
          const conversation =
            conversationMap.get(otherUserId);

          if (conversation) {
            conversation.unreadCount += 1;
          }
        }
      });

      const conversations =
        Array.from(conversationMap.values());

      // -------------------------------------------------
      // RESPONSE
      // -------------------------------------------------

      res.status(200).json({
        success: true,
        count: conversations.length,
        data: conversations,
      });
    } catch (error) {
      console.log(
        "GET CONVERSATIONS ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to fetch conversations",
        error: error.message,
      });
    }
  }
);

// =====================================================
// 4. GET RECEIVED MESSAGES
// GET: /message/received/:userId
// =====================================================

router.get(
  "/received/:userId",
  async (req, res) => {
    try {
      const { userId } = req.params;

      // -------------------------------------------------
      // VALIDATE USER ID
      // -------------------------------------------------

      if (!isValidObjectId(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      // -------------------------------------------------
      // FIND RECEIVED MESSAGES
      // -------------------------------------------------

      const messages = await MessageModel.find({
        receiverId: userId,
      }).sort({
        createdAt: -1,
      });

      // -------------------------------------------------
      // RESPONSE
      // -------------------------------------------------

      res.status(200).json({
        success: true,
        count: messages.length,
        data: messages,
      });
    } catch (error) {
      console.log(
        "GET RECEIVED MESSAGES ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to fetch received messages",
        error: error.message,
      });
    }
  }
);

// =====================================================
// 5. GET SENT MESSAGES
// GET: /message/sent/:userId
// =====================================================

router.get(
  "/sent/:userId",
  async (req, res) => {
    try {
      const { userId } = req.params;

      // -------------------------------------------------
      // VALIDATE USER ID
      // -------------------------------------------------

      if (!isValidObjectId(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      // -------------------------------------------------
      // FIND SENT MESSAGES
      // -------------------------------------------------

      const messages = await MessageModel.find({
        senderId: userId,
      }).sort({
        createdAt: -1,
      });

      // -------------------------------------------------
      // RESPONSE
      // -------------------------------------------------

      res.status(200).json({
        success: true,
        count: messages.length,
        data: messages,
      });
    } catch (error) {
      console.log(
        "GET SENT MESSAGES ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to fetch sent messages",
        error: error.message,
      });
    }
  }
);

// =====================================================
// 6. GET ALL MESSAGES OF USER
// GET: /message/all/:userId
// =====================================================

router.get(
  "/all/:userId",
  async (req, res) => {
    try {
      const { userId } = req.params;

      // -------------------------------------------------
      // VALIDATE USER ID
      // -------------------------------------------------

      if (!isValidObjectId(userId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
      }

      // -------------------------------------------------
      // FIND ALL USER MESSAGES
      // -------------------------------------------------

      const messages = await MessageModel.find({
        $or: [
          {
            senderId: userId,
          },
          {
            receiverId: userId,
          },
        ],
      }).sort({
        createdAt: -1,
      });

      // -------------------------------------------------
      // RESPONSE
      // -------------------------------------------------

      res.status(200).json({
        success: true,
        count: messages.length,
        data: messages,
      });
    } catch (error) {
      console.log(
        "GET ALL MESSAGES ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to fetch messages",
        error: error.message,
      });
    }
  }
);

// =====================================================
// 7. MARK MESSAGES AS READ
// PUT: /message/read
// =====================================================

router.put("/read", async (req, res) => {
  try {
    const {
      userId,
      otherUserId,
    } = req.body;

    // -------------------------------------------------
    // REQUIRED FIELDS
    // -------------------------------------------------

    if (!userId || !otherUserId) {
      return res.status(400).json({
        success: false,
        message:
          "User ID and other user ID are required",
      });
    }

    // -------------------------------------------------
    // VALIDATE IDS
    // -------------------------------------------------

    if (
      !isValidObjectId(userId) ||
      !isValidObjectId(otherUserId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    // -------------------------------------------------
    // MARK RECEIVED MESSAGES AS READ
    // -------------------------------------------------

    const result =
      await MessageModel.updateMany(
        {
          senderId: otherUserId,
          receiverId: userId,
          isRead: false,
        },
        {
          $set: {
            isRead: true,
          },
        }
      );

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    res.status(200).json({
      success: true,
      message: "Messages marked as read",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.log(
      "MARK READ ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to mark messages as read",
      error: error.message,
    });
  }
});

// =====================================================
// 8. DELETE MESSAGE
// DELETE: /message/:id
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // -------------------------------------------------
    // VALIDATE MESSAGE ID
    // -------------------------------------------------

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message ID",
      });
    }

    // -------------------------------------------------
    // FIND MESSAGE
    // -------------------------------------------------

    const message =
      await MessageModel.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // -------------------------------------------------
    // DELETE MESSAGE
    // -------------------------------------------------

    await MessageModel.findByIdAndDelete(id);

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      data: message,
    });
  } catch (error) {
    console.log(
      "DELETE MESSAGE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: error.message,
    });
  }
});

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;