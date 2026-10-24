const mongoose = require("mongoose");

const Jobschema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      maxlength: 150,
    },

    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: 150,
    },

    companyLogo: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    jobType: {
      type: String,
      enum: [
        "Full-time",
        "Part-time",
        "Internship",
        "Contract",
      ],
      default: "Full-time",
    },

    workMode: {
      type: String,
      enum: ["On-site", "Hybrid", "Remote"],
      default: "On-site",
    },

    experience: {
      type: String,
      default: "Entry Level",
      trim: true,
    },

    salary: {
      type: String,
      default: "",
      trim: true,
    },

    skills: {
      type: [String],
      default: [],
    },

    requirements: {
      type: [String],
      default: [],
    },

    responsibilities: {
      type: [String],
      default: [],
    },

    applicationDeadline: {
      type: Date,
      default: null,
    },

    applicationLink: {
      type: String,
      default: "",
      trim: true,
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Job poster ID is required"],
    },

    postedByRole: {
      type: String,
      enum: ["student", "alumni"],
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },
  },
  {
    timestamps: true,
  }
);

// Search aur filtering ke liye indexes.
Jobschema.index({
  title: "text",
  company: "text",
  description: "text",
});

Jobschema.index({
  status: 1,
  createdAt: -1,
});

module.exports =
  mongoose.models.Job ||
  mongoose.model("Job", Jobschema);