const express = require("express");
const mongoose = require("mongoose");

const EventModel = require("../models/EventModel");

const router = express.Router();


// ======================================================
// Helper: Validate MongoDB ObjectId
// ======================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};


// ======================================================
// 1. CREATE EVENT
// POST /event/create
// ======================================================

router.post("/create", async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      eventDate,
      startTime,
      endTime,
      locationType,
      location,
      meetingLink,
      organizerId,
      organizerRole,
      organizerName,
      coverImage,
      maxParticipants,
    } = req.body;


    // Required fields
    if (
      !title ||
      !description ||
      !eventDate ||
      !startTime ||
      !organizerId ||
      !organizerRole ||
      !organizerName
    ) {
      return res.status(400).json({
        success: false,
        message: "Required event details are missing",
      });
    }


    // Validate organizer ID
    if (!isValidObjectId(organizerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organizer ID",
      });
    }


    // Validate organizer role
    if (!["student", "alumni"].includes(organizerRole)) {
      return res.status(400).json({
        success: false,
        message: "Invalid organizer role",
      });
    }


    // Create event
    const event = await EventModel.create({
      title: String(title).trim(),
      description: String(description).trim(),
      category: category || "Other",
      eventDate,
      startTime,
      endTime: endTime || "",
      locationType: locationType || "Online",
      location: location || "",
      meetingLink: meetingLink || "",
      organizerId,
      organizerRole,
      organizerName: String(organizerName).trim(),
      coverImage: coverImage || "",
      maxParticipants: Number(maxParticipants) || 0,
      participants: [],
      status: "upcoming",
      isPublished: true,
    });


    res.status(201).json({
      success: true,
      message: "Event created successfully",
      data: event,
    });

  } catch (error) {
    console.log("CREATE EVENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create event",
      error: error.message,
    });
  }
});


// ======================================================
// 2. GET ALL EVENTS
// GET /event/all
// ======================================================

router.get("/all", async (req, res) => {
  try {
    const events = await EventModel.find({
      isPublished: true,
    }).sort({
      eventDate: 1,
    });


    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });

  } catch (error) {
    console.log("GET ALL EVENTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch events",
      error: error.message,
    });
  }
});


// ======================================================
// 3. GET UPCOMING EVENTS
// GET /event/upcoming
// ======================================================

router.get("/upcoming", async (req, res) => {
  try {
    const events = await EventModel.find({
      isPublished: true,
      status: "upcoming",
      eventDate: {
        $gte: new Date(),
      },
    }).sort({
      eventDate: 1,
    });


    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });

  } catch (error) {
    console.log("GET UPCOMING EVENTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch upcoming events",
      error: error.message,
    });
  }
});


// ======================================================
// 4. GET REGISTERED EVENTS OF USER
// GET /event/registered/:userId
//
// IMPORTANT:
// This route MUST come BEFORE /event/:id
// Otherwise Express treats "registered" as an event ID.
// ======================================================

router.get("/registered/:userId", async (req, res) => {
  try {
    const { userId } = req.params;


    // Validate user ID
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }


    // Find events where this user is registered
    const events = await EventModel.find({
      "participants.userId": userId,
    }).sort({
      eventDate: 1,
    });


    res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });

  } catch (error) {
    console.log("GET REGISTERED EVENTS ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch registered events",
      error: error.message,
    });
  }
});


// ======================================================
// 5. REGISTER FOR EVENT
// POST /event/register/:eventId
// ======================================================

router.post("/register/:eventId", async (req, res) => {
  try {
    const { eventId } = req.params;

    const {
      userId,
      role,
    } = req.body;


    // Required fields
    if (!userId || !role) {
      return res.status(400).json({
        success: false,
        message: "User ID and role are required",
      });
    }


    // Validate event ID
    if (!isValidObjectId(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }


    // Validate user ID
    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }


    // Validate role
    if (!["student", "alumni"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user role",
      });
    }


    // Find event
    const event = await EventModel.findById(eventId);


    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }


    // Check cancelled event
    if (event.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "This event has been cancelled",
      });
    }


    // Check completed event
    if (event.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "This event has already been completed",
      });
    }


    // Check duplicate registration
    const alreadyRegistered = event.participants.some(
      (participant) =>
        String(participant.userId) === String(userId)
    );


    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: "You are already registered for this event",
      });
    }


    // Check maximum participants
    if (
      event.maxParticipants > 0 &&
      event.participants.length >= event.maxParticipants
    ) {
      return res.status(400).json({
        success: false,
        message: "Event registration is full",
      });
    }


    // Add participant
    event.participants.push({
      userId,
      role,
      registeredAt: new Date(),
    });


    await event.save();


    res.status(200).json({
      success: true,
      message: "Successfully registered for event",
      data: event,
    });

  } catch (error) {
    console.log("REGISTER EVENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to register for event",
      error: error.message,
    });
  }
});


// ======================================================
// 6. CANCEL EVENT REGISTRATION
// DELETE /event/register/:eventId/:userId
// ======================================================

router.delete(
  "/register/:eventId/:userId",
  async (req, res) => {
    try {
      const {
        eventId,
        userId,
      } = req.params;


      // Validate IDs
      if (
        !isValidObjectId(eventId) ||
        !isValidObjectId(userId)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid event or user ID",
        });
      }


      // Find event
      const event = await EventModel.findById(eventId);


      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found",
        });
      }


      const previousLength = event.participants.length;


      // Remove user
      event.participants = event.participants.filter(
        (participant) =>
          String(participant.userId) !== String(userId)
      );


      // User wasn't registered
      if (event.participants.length === previousLength) {
        return res.status(400).json({
          success: false,
          message: "User is not registered for this event",
        });
      }


      await event.save();


      res.status(200).json({
        success: true,
        message: "Event registration cancelled",
        data: event,
      });

    } catch (error) {
      console.log(
        "CANCEL EVENT REGISTRATION ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        message: "Failed to cancel registration",
        error: error.message,
      });
    }
  }
);


// ======================================================
// 7. GET EVENT BY ID
// GET /event/:id
//
// IMPORTANT:
// This dynamic route MUST remain AFTER all static routes.
// ======================================================

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;


    // Validate event ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }


    // Find event
    const event = await EventModel.findById(id);


    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }


    res.status(200).json({
      success: true,
      data: event,
    });

  } catch (error) {
    console.log("GET EVENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch event",
      error: error.message,
    });
  }
});


// ======================================================
// 8. UPDATE EVENT
// PUT /event/:id
// ======================================================

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;


    // Validate event ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }


    const allowedFields = [
      "title",
      "description",
      "category",
      "eventDate",
      "startTime",
      "endTime",
      "locationType",
      "location",
      "meetingLink",
      "coverImage",
      "maxParticipants",
      "status",
      "isPublished",
    ];


    const updateData = {};


    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });


    const updatedEvent =
      await EventModel.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );


    if (!updatedEvent) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }


    res.status(200).json({
      success: true,
      message: "Event updated successfully",
      data: updatedEvent,
    });

  } catch (error) {
    console.log("UPDATE EVENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update event",
      error: error.message,
    });
  }
});


// ======================================================
// 9. DELETE EVENT
// DELETE /event/:id
// ======================================================

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;


    // Validate event ID
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
      });
    }


    const event =
      await EventModel.findByIdAndDelete(id);


    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }


    res.status(200).json({
      success: true,
      message: "Event deleted successfully",
      data: event,
    });

  } catch (error) {
    console.log("DELETE EVENT ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete event",
      error: error.message,
    });
  }
});


module.exports = router;