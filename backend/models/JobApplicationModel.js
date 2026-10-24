const mongoose = require("mongoose");

const jobApplicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },

    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    applicantRole: {
      type: String,
      enum: ["student", "alumni"],
      required: true,
    },

    applicantName: {
      type: String,
      trim: true,
      default: "",
    },

    applicantEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    resumeUrl: {
      type: String,
      default: "",
    },

    coverLetter: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "reviewing",
        "shortlisted",
        "rejected",
        "accepted",
      ],
      default: "pending",
    },

    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Ek user ek job ke liye duplicate application na kar sake.
jobApplicationSchema.index(
  {
    jobId: 1,
    applicantId: 1,
  },
  {
    unique: true,
  }
);

jobApplicationSchema.index({
  applicantId: 1,
  createdAt: -1,
});

module.exports =
  mongoose.models.JobApplication ||
  mongoose.model("JobApplication", jobApplicationSchema);