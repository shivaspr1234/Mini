const express = require("express");
const mongoose = require("mongoose");

const JobModel = require("../models/JobModel");
const JobApplicationModel = require("../models/JobApplicationModel");

const router = express.Router();

const isValidId = (id) =>
  mongoose.Types.ObjectId.isValid(id) &&
  /^[a-fA-F0-9]{24}$/.test(String(id));

const validRoles = ["student", "alumni"];

// =====================================================
// 1. CREATE JOB / INTERNSHIP
// POST /job/add
// =====================================================

router.post("/add", async (req, res) => {
  try {
    const {
      title,
      company,
      description,
      postedBy,
      postedByRole,
    } = req.body;

    if (
      !title?.trim() ||
      !company?.trim() ||
      !description?.trim() ||
      !postedBy ||
      !postedByRole
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, company, description, poster ID and role are required.",
      });
    }

    if (!isValidId(postedBy)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job poster ID.",
      });
    }

    if (!validRoles.includes(postedByRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job poster role.",
      });
    }

    const job = await JobModel.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Job posted successfully.",
      data: job,
    });
  } catch (error) {
    console.error("CREATE JOB ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create job.",
    });
  }
});

// =====================================================
// 2. GET ALL Jobs
// GET /job/all
// =====================================================

router.get("/all", async (req, res) => {
  try {
    const {
      search = "",
      type = "",
      mode = "",
      location = "",
      page = 1,
      limit = 12,
    } = req.query;

    const currentPage = Math.max(1, Number(page) || 1);
    const pageSize = Math.min(
      50,
      Math.max(1, Number(limit) || 12)
    );

    const filter = {};

    // By default, sirf open Jobs dikhengi.
    if (req.query.status) {
      if (!["open", "closed"].includes(req.query.status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid job status.",
        });
      }

      filter.status = req.query.status;
    } else {
      filter.status = "open";
    }

    if (type) {
      filter.jobType = type;
    }

    if (mode) {
      filter.workMode = mode;
    }

    if (location) {
      filter.location = {
        $regex: location,
        $options: "i",
      };
    }

    if (search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { company: { $regex: search.trim(), $options: "i" } },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        { skills: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const [Jobs, total] = await Promise.all([
      JobModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((currentPage - 1) * pageSize)
        .limit(pageSize)
        .lean(),

      JobModel.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: Jobs.length,
      total,
      currentPage,
      totalPages: Math.ceil(total / pageSize),
      data: Jobs,
    });
  } catch (error) {
    console.error("GET Jobs ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch Jobs.",
    });
  }
});

// =====================================================
// 3. GET Jobs POSTED BY A USER
// GET /job/posted/:userId
// =====================================================

router.get("/posted/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const Jobs = await JobModel.find({
      postedBy: userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: Jobs.length,
      data: Jobs,
    });
  } catch (error) {
    console.error("GET POSTED Jobs ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch posted Jobs.",
    });
  }
});

// =====================================================
// 4. GET SINGLE JOB
// GET /job/:id
// =====================================================

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID.",
      });
    }

    const job = await JobModel.findById(id).lean();

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("GET JOB DETAILS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch job details.",
    });
  }
});

// =====================================================
// 5. APPLY FOR A JOB
// POST /job/apply/:jobId
// =====================================================

router.post("/apply/:jobId", async (req, res) => {
  try {
    const { jobId } = req.params;

    const {
      applicantId,
      applicantRole,
      applicantName,
      applicantEmail,
      resumeUrl,
      coverLetter,
    } = req.body;

    if (!isValidId(jobId) || !isValidId(applicantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID or applicant ID.",
      });
    }

    if (!validRoles.includes(applicantRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid applicant role.",
      });
    }

    const job = await JobModel.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    if (job.status !== "open") {
      return res.status(400).json({
        success: false,
        message: "This job is no longer accepting applications.",
      });
    }

    if (
      job.applicationDeadline &&
      new Date(job.applicationDeadline) < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "The application deadline has passed.",
      });
    }

    if (String(job.postedBy) === String(applicantId)) {
      return res.status(400).json({
        success: false,
        message: "You cannot apply to your own job posting.",
      });
    }

    const application = await JobApplicationModel.create({
      jobId,
      applicantId,
      applicantRole,
      applicantName,
      applicantEmail,
      resumeUrl,
      coverLetter,
    });

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully.",
      data: application,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already applied for this job.",
      });
    }

    console.error("APPLY JOB ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit application.",
    });
  }
});

// =====================================================
// 6. GET MY APPLICATIONS
// GET /job/my-applications/:userId
// =====================================================

router.get("/my-applications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID.",
      });
    }

    const applications = await JobApplicationModel.find({
      applicantId: userId,
    })
      .populate("jobId")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error("GET MY APPLICATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch applications.",
    });
  }
});

// =====================================================
// 7. UPDATE JOB
// PUT /job/:id
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID.",
      });
    }

    const allowedFields = [
      "title",
      "company",
      "companyLogo",
      "description",
      "location",
      "jobType",
      "workMode",
      "experience",
      "salary",
      "skills",
      "requirements",
      "responsibilities",
      "applicationDeadline",
      "applicationLink",
      "status",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const job = await JobModel.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Job updated successfully.",
      data: job,
    });
  } catch (error) {
    console.error("UPDATE JOB ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update job.",
    });
  }
});

// =====================================================
// 8. DELETE JOB
// DELETE /job/:id
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID.",
      });
    }

    const job = await JobModel.findByIdAndDelete(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found.",
      });
    }

    await JobApplicationModel.deleteMany({
      jobId: id,
    });

    return res.status(200).json({
      success: true,
      message: "Job and associated applications deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE JOB ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete job.",
    });
  }
});

module.exports = router;