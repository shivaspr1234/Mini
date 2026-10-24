const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // ==========================================
    // MESSAGE SENDER
    // ==========================================

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    senderRole: {
      type: String,
      enum: ["student", "alumni"],
      required: true,
    },

    // ==========================================
    // MESSAGE RECEIVER
    // ==========================================

    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    receiverRole: {
      type: String,
      enum: ["student", "alumni"],
      required: true,
    },

    // ==========================================
    // MESSAGE CONTENT
    // ==========================================

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    // ==========================================
    // READ / UNREAD
    // ==========================================

    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// INDEXES
// ==========================================

// Faster conversation queries
messageSchema.index({
  senderId: 1,
  receiverId: 1,
  createdAt: -1,
});

messageSchema.index({
  receiverId: 1,
  senderId: 1,
  createdAt: -1,
});

module.exports =
  mongoose.models.Message ||
  mongoose.model("Message", messageSchema);