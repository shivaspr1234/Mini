const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    category: {
      type: String,
      enum: [
        "Networking",
        "Workshop",
        "Webinar",
        "Seminar",
        "Career",
        "Alumni Meet",
        "Other",
      ],
      default: "Other",
    },

    eventDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
    },

    endTime: {
      type: String,
      default: "",
    },

    locationType: {
      type: String,
      enum: ["Online", "Offline", "Hybrid"],
      default: "Online",
    },

    location: {
      type: String,
      default: "",
      trim: true,
    },

    meetingLink: {
      type: String,
      default: "",
      trim: true,
    },

    organizerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    organizerRole: {
      type: String,
      enum: ["student", "alumni"],
      required: true,
    },

    organizerName: {
      type: String,
      required: true,
      trim: true,
    },

    coverImage: {
      type: String,
      default: "",
    },

    maxParticipants: {
      type: Number,
      default: 0,
      min: 0,
    },

    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },

        role: {
          type: String,
          enum: ["student", "alumni"],
          required: true,
        },

        registeredAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Event ||
  mongoose.model("Event", eventSchema);