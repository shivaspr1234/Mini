const mongoose = require("mongoose");

const MentorshipSchema = new mongoose.Schema(
  {
    // Student who requests mentorship
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Alumni who will provide mentorship
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Alumni",
      required: true,
    },

    // Main mentorship topic
    topic: {
      type: String,
      required: [true, "Mentorship topic is required"],
      trim: true,
      maxlength: 150,
    },

    // Student's message to the mentor
    message: {
      type: String,
      required: [true, "Please enter a message"],
      trim: true,
      maxlength: 1000,
    },

    // Skills or areas where the student needs guidance
    areasOfGuidance: {
      type: [String],
      default: [],
    },

    // Current status of the mentorship request
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "rejected",
        "completed",
        "cancelled",
      ],
      default: "pending",
    },

    // Optional session details
    session: {
      scheduledAt: {
        type: Date,
        default: null,
      },

      meetingLink: {
        type: String,
        default: "",
        trim: true,
      },

      notes: {
        type: String,
        default: "",
        trim: true,
        maxlength: 2000,
      },
    },

    // Feedback after the mentorship session
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null,
      },

      comment: {
        type: String,
        default: "",
        trim: true,
        maxlength: 1000,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate pending/accepted requests for the same student and mentor.
MentorshipSchema.index(
  { student: 1, mentor: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["pending", "accepted"] },
    },
  }
);

module.exports = mongoose.model("Mentorship", MentorshipSchema);