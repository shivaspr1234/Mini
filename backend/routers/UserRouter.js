const express = require("express");
const jwt = require("jsonwebtoken");

const Model = require("../models/UserModels");

const router = express.Router();


// =====================================================
// 1. ADD / REGISTER USER
// POST: /user/add
// =====================================================

router.post("/add", async (req, res) => {
  try {
    console.log(req.body);

    const user = new Model(req.body);

    const result = await user.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: result,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "User registration failed",
      error: error.message,
    });
  }
});


// =====================================================
// 2. GET ALL USERS
// GET: /user/getall
// =====================================================

router.get("/getall", async (req, res) => {

  try {

    const result = await Model.find();

    res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
});



// =====================================================
// STUDENT DIRECTORY
// GET: /user/directory
// =====================================================

// =====================================================
// STUDENT DIRECTORY - DEBUG VERSION
// GET: /user/directory
// =====================================================

router.get("/directory", async (req, res) => {
  try {

    // Get ALL users from same Model
    const allUsers = await Model.find({});

    console.log("====================================");
    console.log("DIRECTORY DEBUG");
    console.log("Total users:", allUsers.length);

    console.log(
      "Users:",
      allUsers.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      }))
    );

    console.log("====================================");

    res.status(200).json({
      success: true,
      totalUsers: allUsers.length,
      data: allUsers.map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      })),
    });

  } catch (error) {

    console.log("DIRECTORY DEBUG ERROR:", error);

    res.status(500).json({
      success: false,
      message: "Directory debug failed",
      error: error.message,
    });

  }
});

// =====================================================
// 4. GET USER BY EMAIL
// GET: /user/getbyemail/:email
// =====================================================

router.get("/getbyemail/:email", async (req, res) => {

  try {

    const result = await Model.find({
      email: req.params.email,
    });

    res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user by email",
      error: error.message,
    });
  }
});



// =====================================================
// STUDENT DIRECTORY BY ID
// GET: /user/directory/:id
// =====================================================

router.get("/directory/:id", async (req, res) => {
  try {
    const student = await Model.findOne({
      _id: req.params.id,
      role: "student",
    }).select("-password");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch student profile",
      error: error.message,
    });
  }
});


// =====================================================
// GET USER BY ID
// GET: /user/getbyid/:id
// =====================================================

router.get("/getbyid/:id", async (req, res) => {
  try {

    const result = await Model.findById(req.params.id)
      .select("-password");

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
});

// =====================================================
// 6. UPDATE USER
// PUT: /user/update/:id
// =====================================================

router.put("/update/:id", async (req, res) => {

  try {

    const result = await Model.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: result,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "User update failed",
      error: error.message,
    });
  }
});


// =====================================================
// 7. DELETE USER
// DELETE: /user/delete/:id
// =====================================================

router.delete("/delete/:id", async (req, res) => {

  try {

    const result = await Model.findByIdAndDelete(req.params.id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
      data: result,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "User deletion failed",
      error: error.message,
    });
  }
});


// =====================================================
// 8. LOGIN / AUTHENTICATE USER
// POST: /user/authenticate
// =====================================================

router.post("/authenticate", async (req, res) => {

  try {

    const { email, password } = req.body;

    const result = await Model.findOne({
      email,
      password,
    });

    if (!result) {

      return res.status(403).json({
        success: false,
        message: "Invalid credentials",
      });
    }


    // Create JWT Token

    const { _id, name, role } = result;

    jwt.sign(
      {
        _id,
        name,
        role,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "1h",
      },

      (err, token) => {

        if (err) {

          console.log(err);

          return res.status(500).json({
            success: false,
            message: "Token generation failed",
          });
        }


        res.status(200).json({

          success: true,

          message: "Login successful",

          token,

          user: {
            _id,
            name,
            role,
            email: result.email,
          },

        });

      }
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Authentication failed",
      error: error.message,
    });
  }
});


// =====================================================
// 9. GET PROFILE
// GET: /user/profile/:id
// =====================================================

router.get("/profile/:id", async (req, res) => {

  try {

    const result = await Model.findById(req.params.id)
      .select("-password");

    if (!result) {

      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({

      success: true,

      message: "Profile fetched successfully",

      data: result,

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: "Failed to fetch profile",

      error: error.message,

    });
  }
});


// =====================================================
// 10. UPDATE PROFILE
// PUT: /user/profile/:id
// =====================================================

router.put("/profile/:id", async (req, res) => {

  try {

    const result = await Model.findByIdAndUpdate(

      req.params.id,

      req.body,

      {
        new: true,
        runValidators: true,
      }

    ).select("-password");


    if (!result) {

      return res.status(404).json({

        success: false,

        message: "Profile not found",

      });
    }


    res.status(200).json({

      success: true,

      message: "Profile updated successfully",

      data: result,

    });

  } catch (error) {

    console.log(error);

    res.status(500).json({

      success: false,

      message: "Profile update failed",

      error: error.message,

    });
  }
});


module.exports = router;