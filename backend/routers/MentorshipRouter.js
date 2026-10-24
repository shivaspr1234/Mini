const express = require("express");
const mongoose = require("mongoose");

const MentorshipModel = require("../models/MentorshipModel");
const UserModel = require("../models/UserModels");
const AlumniModel = require("../models/AlumniModel");

const router = express.Router();

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const isValidId = (id) => mongoose.isValidObjectId(id);

const sendError = (res, statusCode, message) => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

const handleError = (res, error, label) => {
  console.error(`${label}:`, error);

  if (error.name === "ValidationError") {
    return sendError(res, 400, error.message);
  }

  if (error.code === 11000) {
    return sendError(
      res,
      409,
      "An active mentorship request already exists."
    );
  }

  return sendError(
    res,
    500,
    "Something went wrong. Please try again."
  );
};

const cleanText = (value) =>
  typeof value === "string" ? value.trim() : "";

// =====================================================
// 1. GET ALL MENTORS
// GET /api/mentorship/mentors
// =====================================================

router.get("/mentors", async (req, res) => {
  try {
    const mentors = await AlumniModel.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: mentors.length,
      data: mentors,
    });
  } catch (error) {
    return handleError(res, error, "GET MENTORS ERROR");
  }
});

// =====================================================
// 2. GET MENTOR PROFILE
// GET /api/mentorship/mentors/:id
// =====================================================

router.get("/mentors/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return sendError(res, 400, "Invalid mentor ID.");
    }

    const mentor = await AlumniModel.findById(id).select("-password");

    if (!mentor) {
      return sendError(res, 404, "Mentor not found.");
    }

    return res.status(200).json({
      success: true,
      data: mentor,
    });
  } catch (error) {
    return handleError(res, error, "GET MENTOR PROFILE ERROR");
  }
});

// =====================================================
// 3. CREATE MENTORSHIP REQUEST
// POST /api/mentorship/request
// =====================================================

router.post("/request", async (req, res) => {
  try {
    const {
      studentId,
      mentorId,
      topic,
      message,
      areasOfGuidance,
    } = req.body || {};

    if (!studentId || !mentorId || !topic || !message) {
      return sendError(
        res,
        400,
        "Student, mentor, topic and message are required."
      );
    }

    if (!isValidId(studentId) || !isValidId(mentorId)) {
      return sendError(
        res,
        400,
        "Invalid student ID or mentor ID."
      );
    }

    const cleanTopic = cleanText(topic);
    const cleanMessage = cleanText(message);

    if (!cleanTopic || !cleanMessage) {
      return sendError(
        res,
        400,
        "Topic and message cannot be empty."
      );
    }

    if (cleanTopic.length > 150) {
      return sendError(
        res,
        400,
        "Topic cannot exceed 150 characters."
      );
    }

    if (cleanMessage.length > 1000) {
      return sendError(
        res,
        400,
        "Message cannot exceed 1000 characters."
      );
    }

    const normalizedStudentId = String(studentId);
    const normalizedMentorId = String(mentorId);

    if (normalizedStudentId === normalizedMentorId) {
      return sendError(
        res,
        400,
        "You cannot request mentorship from yourself."
      );
    }

    const [student, mentor] = await Promise.all([
      UserModel.findById(normalizedStudentId).select("_id role"),
      AlumniModel.findById(normalizedMentorId).select("_id"),
    ]);

    if (!student) {
      return sendError(res, 404, "Student not found.");
    }

    if (!mentor) {
      return sendError(res, 404, "Mentor not found.");
    }

    const existingRequest = await MentorshipModel.findOne({
      student: normalizedStudentId,
      mentor: normalizedMentorId,
      status: { $in: ["pending", "accepted"] },
    });

    if (existingRequest) {
      return sendError(
        res,
        409,
        "An active mentorship request already exists for this mentor."
      );
    }

    let guidanceAreas = [];

    if (areasOfGuidance !== undefined) {
      if (!Array.isArray(areasOfGuidance)) {
        return sendError(
          res,
          400,
          "Areas of guidance must be an array."
        );
      }

      guidanceAreas = [
        ...new Set(
          areasOfGuidance
            .filter((item) => typeof item === "string")
            .map((item) => item.trim())
            .filter(Boolean)
        ),
      ];

      if (guidanceAreas.length > 20) {
        return sendError(
          res,
          400,
          "You can select at most 20 guidance areas."
        );
      }

      if (guidanceAreas.some((item) => item.length > 100)) {
        return sendError(
          res,
          400,
          "Each guidance area must be 100 characters or fewer."
        );
      }
    }

    const mentorship = await MentorshipModel.create({
      student: normalizedStudentId,
      mentor: normalizedMentorId,
      topic: cleanTopic,
      message: cleanMessage,
      areasOfGuidance: guidanceAreas,
    });

    return res.status(201).json({
      success: true,
      message: "Mentorship request sent successfully.",
      data: mentorship,
    });
  } catch (error) {
    return handleError(res, error, "CREATE MENTORSHIP REQUEST ERROR");
  }
});

// =====================================================
// 4. GET STUDENT'S MENTORSHIP REQUESTS
// GET /api/mentorship/student/:studentId
// =====================================================

router.get("/student/:studentId", async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!isValidId(studentId)) {
      return sendError(res, 400, "Invalid student ID.");
    }

    const requests = await MentorshipModel.find({
      student: studentId,
    })
      .populate("mentor", "-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    return handleError(res, error, "GET STUDENT REQUESTS ERROR");
  }
});

// =====================================================
// 5. GET MENTOR'S RECEIVED REQUESTS
// GET /api/mentorship/mentor/:mentorId
// =====================================================

router.get("/mentor/:mentorId", async (req, res) => {
  try {
    const { mentorId } = req.params;

    if (!isValidId(mentorId)) {
      return sendError(res, 400, "Invalid mentor ID.");
    }

    const requests = await MentorshipModel.find({
      mentor: mentorId,
    })
      .populate("student", "-password")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    return handleError(res, error, "GET MENTOR REQUESTS ERROR");
  }
});

// =====================================================
// 6. ACCEPT OR REJECT MENTORSHIP REQUEST
// PATCH /api/mentorship/request/:id/status
// =====================================================

router.patch("/request/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, mentorId } = req.body || {};

    if (!isValidId(id) || !isValidId(mentorId)) {
      return sendError(
        res,
        400,
        "Invalid request ID or mentor ID."
      );
    }

    if (!["accepted", "rejected"].includes(status)) {
      return sendError(
        res,
        400,
        "Status must be accepted or rejected."
      );
    }

    const request = await MentorshipModel.findOne({
      _id: id,
      mentor: mentorId,
    });

    if (!request) {
      return sendError(
        res,
        404,
        "Mentorship request not found."
      );
    }

    if (request.status !== "pending") {
      return sendError(
        res,
        409,
        "Only pending requests can be accepted or rejected."
      );
    }

    request.status = status;
    await request.save();

    return res.status(200).json({
      success: true,
      message: `Mentorship request ${status} successfully.`,
      data: request,
    });
  } catch (error) {
    return handleError(res, error, "UPDATE REQUEST STATUS ERROR");
  }
});

// =====================================================
// 7. CANCEL PENDING MENTORSHIP REQUEST
// PATCH /api/mentorship/request/:id/cancel
// =====================================================

router.patch("/request/:id/cancel", async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body || {};

    if (!isValidId(id) || !isValidId(studentId)) {
      return sendError(
        res,
        400,
        "Invalid request ID or student ID."
      );
    }

    const request = await MentorshipModel.findOne({
      _id: id,
      student: studentId,
    });

    if (!request) {
      return sendError(
        res,
        404,
        "Mentorship request not found."
      );
    }

    if (request.status !== "pending") {
      return sendError(
        res,
        409,
        "Only pending requests can be cancelled."
      );
    }

    request.status = "cancelled";
    await request.save();

    return res.status(200).json({
      success: true,
      message: "Mentorship request cancelled successfully.",
      data: request,
    });
  } catch (error) {
    return handleError(res, error, "CANCEL MENTORSHIP REQUEST ERROR");
  }
});

// =====================================================
// 8. GET STUDENT'S ACCEPTED/COMPLETED SESSIONS
// GET /api/mentorship/student/:studentId/sessions
// =====================================================

router.get("/student/:studentId/sessions", async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!isValidId(studentId)) {
      return sendError(res, 400, "Invalid student ID.");
    }

    const sessions = await MentorshipModel.find({
      student: studentId,
      status: { $in: ["accepted", "completed"] },
    })
      .populate("mentor", "-password")
      .sort({ "session.scheduledAt": 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    return handleError(res, error, "GET STUDENT SESSIONS ERROR");
  }
});

// =====================================================
// 9. GET ALUMNI'S ACCEPTED/COMPLETED SESSIONS
// GET /api/mentorship/mentor/:mentorId/sessions
// =====================================================

router.get("/mentor/:mentorId/sessions", async (req, res) => {
  try {
    const { mentorId } = req.params;

    if (!isValidId(mentorId)) {
      return sendError(res, 400, "Invalid mentor ID.");
    }

    const sessions = await MentorshipModel.find({
      mentor: mentorId,
      status: { $in: ["accepted", "completed"] },
    })
      .populate("student", "-password")
      .sort({ "session.scheduledAt": 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  } catch (error) {
    return handleError(res, error, "GET ALUMNI SESSIONS ERROR");
  }
});

// =====================================================
// 10. SCHEDULE OR UPDATE A SESSION
// PATCH /api/mentorship/session/:id/schedule
// =====================================================

router.patch("/session/:id/schedule", async (req, res) => {
  try {
    const { id } = req.params;
    const { mentorId, scheduledAt, meetingLink, notes } =
      req.body || {};

    if (!isValidId(id) || !isValidId(mentorId)) {
      return sendError(
        res,
        400,
        "Invalid request ID or mentor ID."
      );
    }

    if (!scheduledAt) {
      return sendError(
        res,
        400,
        "Session date and time are required."
      );
    }

    const sessionDate = new Date(scheduledAt);

    if (Number.isNaN(sessionDate.getTime())) {
      return sendError(res, 400, "Invalid session date and time.");
    }

    if (sessionDate.getTime() <= Date.now()) {
      return sendError(
        res,
        400,
        "Please select a future date and time."
      );
    }

    const cleanMeetingLink = cleanText(meetingLink);
    const cleanNotes = cleanText(notes);

    if (cleanMeetingLink.length > 500) {
      return sendError(res, 400, "Meeting link is too long.");
    }

    if (cleanMeetingLink) {
      try {
        const parsedURL = new URL(cleanMeetingLink);

        if (!["http:", "https:"].includes(parsedURL.protocol)) {
          return sendError(
            res,
            400,
            "Meeting link must use HTTP or HTTPS."
          );
        }
      } catch {
        return sendError(
          res,
          400,
          "Please enter a valid meeting link."
        );
      }
    }

    if (cleanNotes.length > 2000) {
      return sendError(
        res,
        400,
        "Session notes cannot exceed 2000 characters."
      );
    }

    const mentorship = await MentorshipModel.findOne({
      _id: id,
      mentor: mentorId,
    });

    if (!mentorship) {
      return sendError(res, 404, "Mentorship request not found.");
    }

    if (mentorship.status !== "accepted") {
      return sendError(
        res,
        409,
        "Only accepted mentorship requests can be scheduled."
      );
    }

    mentorship.session.scheduledAt = sessionDate;
    mentorship.session.meetingLink = cleanMeetingLink;
    mentorship.session.notes = cleanNotes;

    await mentorship.save();

    return res.status(200).json({
      success: true,
      message: "Mentorship session scheduled successfully.",
      data: mentorship,
    });
  } catch (error) {
    return handleError(res, error, "SCHEDULE MENTORSHIP SESSION ERROR");
  }
});

// =====================================================
// 11. MARK A SCHEDULED SESSION AS COMPLETED
// PATCH /api/mentorship/session/:id/complete
// =====================================================

router.patch("/session/:id/complete", async (req, res) => {
  try {
    const { id } = req.params;
    const { mentorId } = req.body || {};

    if (!isValidId(id) || !isValidId(mentorId)) {
      return sendError(
        res,
        400,
        "Invalid request ID or mentor ID."
      );
    }

    const mentorship = await MentorshipModel.findOne({
      _id: id,
      mentor: mentorId,
    });

    if (!mentorship) {
      return sendError(res, 404, "Mentorship request not found.");
    }

    if (mentorship.status !== "accepted") {
      return sendError(
        res,
        409,
        "Only accepted mentorship sessions can be completed."
      );
    }

    if (!mentorship.session?.scheduledAt) {
      return sendError(
        res,
        409,
        "Please schedule the session before marking it completed."
      );
    }

    mentorship.status = "completed";
    await mentorship.save();

    return res.status(200).json({
      success: true,
      message: "Mentorship session marked as completed.",
      data: mentorship,
    });
  } catch (error) {
    return handleError(res, error, "COMPLETE MENTORSHIP SESSION ERROR");
  }
});


// =====================================================
// 12. SUBMIT STUDENT FEEDBACK AND RATING
// PATCH /api/mentorship/session/:id/feedback
// =====================================================

router.patch("/session/:id/feedback", async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, rating, comment } = req.body || {};

    // 1. Validate IDs
    if (!isValidId(id) || !isValidId(studentId)) {
      return sendError(
        res,
        400,
        "Invalid mentorship session ID or student ID."
      );
    }

    // 2. Validate rating
    const numericRating = Number(rating);

    if (
      rating === undefined ||
      rating === null ||
      rating === "" ||
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return sendError(
        res,
        400,
        "Rating must be a whole number between 1 and 5."
      );
    }

    // 3. Validate comment
    if (comment !== undefined && typeof comment !== "string") {
      return sendError(
        res,
        400,
        "Feedback comment must be text."
      );
    }

    const cleanComment = cleanText(comment);

    if (cleanComment.length > 1000) {
      return sendError(
        res,
        400,
        "Feedback cannot exceed 1000 characters."
      );
    }

    // 4. Find the session belonging to this student
    const mentorship = await MentorshipModel.findOne({
      _id: id,
      student: studentId,
    });

    if (!mentorship) {
      return sendError(
        res,
        404,
        "Mentorship session not found for this student."
      );
    }

    // 5. Feedback is allowed only after completion
    if (mentorship.status !== "completed") {
      return sendError(
        res,
        409,
        "Feedback can only be submitted after the session is completed."
      );
    }

    // 6. Prevent duplicate feedback submissions
    if (mentorship.feedback?.rating !== null &&
        mentorship.feedback?.rating !== undefined) {
      return sendError(
        res,
        409,
        "Feedback has already been submitted for this session."
      );
    }

    // 7. Save feedback
    mentorship.feedback.rating = numericRating;
    mentorship.feedback.comment = cleanComment;

    await mentorship.save();

    return res.status(200).json({
      success: true,
      message: "Feedback submitted successfully.",
      data: {
        _id: mentorship._id,
        status: mentorship.status,
        feedback: mentorship.feedback,
      },
    });
  } catch (error) {
    return handleError(
      res,
      error,
      "SUBMIT MENTORSHIP FEEDBACK ERROR"
    );
  }
});

// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;