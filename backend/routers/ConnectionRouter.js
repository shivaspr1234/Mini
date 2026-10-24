const express = require("express");
const mongoose = require("mongoose");

const ConnectionModel = require("../models/ConnectionModel");

const router = express.Router();


// =====================================================
// 1. SEND CONNECTION REQUEST
// POST: /connection/send
// =====================================================

router.post("/send", async (req, res) => {
  try {
    const {
      fromUserId,
      fromRole,
      toUserId,
      toRole,
    } = req.body;

    // -----------------------------------------------
    // Basic validation
    // -----------------------------------------------

    if (
      !fromUserId ||
      !fromRole ||
      !toUserId ||
      !toRole
    ) {
      return res.status(400).json({
        success: false,
        message: "All connection details are required",
      });
    }


    // -----------------------------------------------
    // Check valid MongoDB IDs
    // -----------------------------------------------

    if (
      !mongoose.Types.ObjectId.isValid(fromUserId) ||
      !mongoose.Types.ObjectId.isValid(toUserId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }


    // -----------------------------------------------
    // User cannot connect with himself
    // -----------------------------------------------

    if (fromUserId === toUserId) {
      return res.status(400).json({
        success: false,
        message: "You cannot send a connection request to yourself",
      });
    }


    // -----------------------------------------------
    // Check existing connection
    // -----------------------------------------------

    const existingConnection = await ConnectionModel.findOne({
      $or: [
        {
          fromUserId,
          toUserId,
        },
        {
          fromUserId: toUserId,
          toUserId: fromUserId,
        },
      ],
    });


    if (existingConnection) {

      if (existingConnection.status === "pending") {
        return res.status(200).json({
          success: true,
          alreadyExists: true,
          message: "Connection request already exists",
          data: existingConnection,
        });
      }

      if (existingConnection.status === "accepted") {
        return res.status(400).json({
          success: false,
          message: "You are already connected",
        });
      }

      // If previous request was rejected,
      // allow a new request
      if (existingConnection.status === "rejected") {
        await ConnectionModel.findByIdAndDelete(
          existingConnection._id
        );
      }
    }


    // -----------------------------------------------
    // Create connection request
    // -----------------------------------------------

    const connection = await ConnectionModel.create({
      fromUserId,
      fromRole,
      toUserId,
      toRole,
      status: "pending",
    });


    res.status(201).json({
      success: true,
      message: "Connection request sent successfully",
      data: connection,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to send connection request",
      error: error.message,
    });
  }
});


// =====================================================
// 2. GET PENDING CONNECTION REQUESTS
// GET: /connection/requests/:userId
// =====================================================

router.get("/requests/:userId", async (req, res) => {
  try {

    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }


    const requests = await ConnectionModel.find({
      toUserId: userId,
      status: "pending",
    }).sort({
      createdAt: -1,
    });


    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch connection requests",
      error: error.message,
    });
  }
});


// =====================================================
// 3. ACCEPT CONNECTION REQUEST
// PUT: /connection/accept/:id
// =====================================================

router.put("/accept/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // -----------------------------------------------
    // Validate MongoDB ObjectId
    // -----------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid connection ID",
      });
    }

    // -----------------------------------------------
    // Find connection request
    // -----------------------------------------------

    const connection = await ConnectionModel.findById(id);

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found",
      });
    }

    // -----------------------------------------------
    // Check request status
    // -----------------------------------------------

    if (connection.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request has already been processed",
      });
    }

    // -----------------------------------------------
    // Accept request
    // -----------------------------------------------

    connection.status = "accepted";

    const updatedConnection = await connection.save();

    // -----------------------------------------------
    // Response
    // -----------------------------------------------

    res.status(200).json({
      success: true,
      message: "Connection request accepted",
      data: updatedConnection,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to accept connection request",
      error: error.message,
    });
  }
});

// =====================================================
// 4. REJECT CONNECTION REQUEST
// PUT: /connection/reject/:id
// =====================================================

router.put("/reject/:id", async (req, res) => {
  try {

    const connection = await ConnectionModel.findById(
      req.params.id
    );

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection request not found",
      });
    }


    if (connection.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "This request has already been processed",
      });
    }


    connection.status = "rejected";

    const updatedConnection = await connection.save();


    res.status(200).json({
      success: true,
      message: "Connection request rejected",
      data: updatedConnection,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to reject connection request",
      error: error.message,
    });
  }
});



router.get("/debug/all", async (req, res) => {
  try {
    const connections = await ConnectionModel.find();

    res.status(200).json({
      success: true,
      count: connections.length,
      data: connections,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch all connections",
      error: error.message,
    });
  }
});




// =====================================================
// 5. GET MY CONNECTIONS
// GET: /connection/my/:userId
// =====================================================

router.get("/my/:userId", async (req, res) => {
  try {

    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }


    const connections = await ConnectionModel.find({
      $or: [
        {
          fromUserId: userId,
          status: "accepted",
        },
        {
          toUserId: userId,
          status: "accepted",
        },
      ],
    }).sort({
      updatedAt: -1,
    });


    res.status(200).json({
      success: true,
      count: connections.length,
      data: connections,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch connections",
      error: error.message,
    });
  }
});


// =====================================================
// 6. REMOVE CONNECTION
// DELETE: /connection/remove/:id
// =====================================================

router.delete("/remove/:id", async (req, res) => {
  try {

    const connection = await ConnectionModel.findByIdAndDelete(
      req.params.id
    );

    if (!connection) {
      return res.status(404).json({
        success: false,
        message: "Connection not found",
      });
    }


    res.status(200).json({
      success: true,
      message: "Connection removed successfully",
      data: connection,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to remove connection",
      error: error.message,
    });
  }
});


module.exports = router;