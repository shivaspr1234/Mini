const express = require("express");
const AlumniModel = require("../models/AlumniModel");

const router = express.Router();


// =====================================================
// 1. ADD ALUMNI
// POST: /alumni/add
// =====================================================

router.post("/add", async (req, res) => {
  try {
    const alumni = new AlumniModel(req.body);

    const result = await alumni.save();

    res.status(201).json({
      success: true,
      message: "Alumni added successfully",
      data: result,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to add alumni",
      error: error.message,
    });
  }
});


// =====================================================
// 2. ALUMNI SIGNUP
// POST: /alumni/signup
// =====================================================

router.post("/signup", async (req, res) => {
  try {
    const alumni = await AlumniModel.create(req.body);

    res.status(201).json({
      success: true,
      message: "Alumni created successfully",
      data: alumni,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to create alumni",
      error: error.message,
    });
  }
});


// =====================================================
// 3. ALUMNI LOGIN
// POST: /alumni/login
// =====================================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const alumni = await AlumniModel.findOne({
      email: email.toLowerCase(),
    });

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: "Alumni not found",
      });
    }

    if (alumni.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    const safeAlumni = alumni.toObject();

    delete safeAlumni.password;

    res.status(200).json({
      success: true,
      message: "Alumni logged in successfully",
      data: safeAlumni,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to login alumni",
      error: error.message,
    });
  }
});


// =====================================================
// 4. GET ALL ALUMNI
// GET: /alumni/all
// =====================================================

router.get("/all", async (req, res) => {
  try {
    const alumni = await AlumniModel.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alumni.length,
      data: alumni,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch alumni",
      error: error.message,
    });
  }
});


// =====================================================
// 5. ALUMNI DIRECTORY
// GET: /alumni/directory
// =====================================================

router.get("/directory", async (req, res) => {
  try {
    const alumni = await AlumniModel.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alumni.length,
      data: alumni,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch alumni directory",
      error: error.message,
    });
  }
});


// =====================================================
// 6. ALUMNI BY ID
// GET: /alumni/directory/:id
// =====================================================

router.get("/directory/:id", async (req, res) => {
  try {
    const alumni = await AlumniModel.findById(req.params.id)
      .select("-password");

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: "Alumni not found",
      });
    }

    res.status(200).json({
      success: true,
      data: alumni,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch alumni profile",
      error: error.message,
    });
  }
});


// =====================================================
// 7. ALUMNI PROFILE
// GET: /alumni/profile/:id
// =====================================================

router.get("/profile/:id", async (req, res) => {
  try {
    const alumni = await AlumniModel.findById(req.params.id)
      .select("-password");

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: alumni,
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
// GET ALUMNI BY ID
// GET: /alumni/:id
// =====================================================

router.get("/:id", async (req, res) => {
  try {
    const alumni = await AlumniModel.findById(req.params.id)
      .select("-password");

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: "Alumni not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Alumni profile fetched successfully",
      data: alumni,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch alumni profile",
      error: error.message,
    });
  }
});


// =====================================================
// 8. UPDATE ALUMNI PROFILE
// PUT: /alumni/:id
// =====================================================

router.put("/:id", async (req, res) => {
  try {
    const allowedFields = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      profileImage: req.body.profileImage,
      graduationYear: req.body.graduationYear,
      degree: req.body.degree,
      department: req.body.department,
      currentCompany: req.body.currentCompany,
      jobTitle: req.body.jobTitle,
      experience: req.body.experience,
      location: req.body.location,
      linkedin: req.body.linkedin,
      bio: req.body.bio,
      skills: req.body.skills,
    };

    const alumni = await AlumniModel.findByIdAndUpdate(
      req.params.id,
      allowedFields,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password");

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: "Alumni not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Alumni profile updated successfully",
      data: alumni,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to update alumni profile",
      error: error.message,
    });
  }
});


// =====================================================
// 9. DELETE ALUMNI
// DELETE: /alumni/:id
// =====================================================

router.delete("/:id", async (req, res) => {
  try {
    const alumni = await AlumniModel.findByIdAndDelete(
      req.params.id
    );

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: "Alumni not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Alumni deleted successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Failed to delete alumni",
      error: error.message,
    });
  }
});


module.exports = router;