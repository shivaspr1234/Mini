const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema(
  {
    // ==========================================
    // REQUEST SEND KARNE WALA USER
    // ==========================================
    fromUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    fromRole: {
      type: String,
      enum: ["student", "alumni"],
      required: true,
    },

    // ==========================================
    // REQUEST RECEIVE KARNE WALA USER
    // ==========================================
    toUserId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    toRole: {
      type: String,
      enum: ["student", "alumni"],
      required: true,
    },

    // ==========================================
    // CONNECTION STATUS
    // ==========================================
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Connection ||
  mongoose.model("Connection", connectionSchema);