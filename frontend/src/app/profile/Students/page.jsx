"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =====================================================
  // LOAD STUDENT PROFILE
  // =====================================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // -----------------------------------------------
        // 1. GET LOGGED-IN USER
        // -----------------------------------------------

        const storedUser =
          localStorage.getItem("user") ||
          sessionStorage.getItem("user");

        if (!storedUser) {
          toast.error("Please login first");
          setLoading(false);
          return;
        }

        const user = JSON.parse(storedUser);

        // -----------------------------------------------
        // 2. GET USER ID
        // -----------------------------------------------

        const userId = user?._id;

        if (!userId) {
          toast.error("User ID not found");
          setLoading(false);
          return;
        }

        // -----------------------------------------------
        // 3. FETCH PROFILE FROM BACKEND
        // -----------------------------------------------

        const response = await axios.get(
          `http://localhost:5000/user/profile/${userId}`
        );

        if (response.data.success) {
          setProfile(response.data.data);
        } else {
          toast.error(
            response.data.message || "Failed to load profile"
          );
        }
      } catch (error) {
        console.log("Profile Error:", error);

        toast.error(
          error.response?.data?.message ||
            "Failed to load student profile"
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // =====================================================
  // HANDLE INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // HANDLE SKILLS
  // =====================================================

  const handleSkillsChange = (e) => {
    const value = e.target.value;

    setProfile((prev) => ({
      ...prev,
      skills: value
        .split(",")
        .map((skill) => skill.trim())
        .filter((skill) => skill !== ""),
    }));
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleSave = async (e) => {
    e.preventDefault();

    if (!profile?._id) {
      toast.error("Student ID not found");
      return;
    }

    try {
      setSaving(true);

      const response = await axios.put(
        `http://localhost:5000/user/profile/${profile._id}`,
        {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          college: profile.college,
          course: profile.course,
          branch: profile.branch,
          graduationYear: profile.graduationYear,
          skills: profile.skills,
          bio: profile.bio,
          careerGoal: profile.careerGoal,
          linkedin: profile.linkedin,
          github: profile.github,
          portfolio: profile.portfolio,
          profileImage: profile.profileImage,
        }
      );

      if (response.data.success) {
        const updatedUser = response.data.data;

        setProfile(updatedUser);

        // -----------------------------------------------
        // UPDATE USER STORAGE
        // -----------------------------------------------

        const userStorage =
          localStorage.getItem("user")
            ? localStorage
            : sessionStorage;

        const oldUser = JSON.parse(
          userStorage.getItem("user")
        );

        userStorage.setItem(
          "user",
          JSON.stringify({
            ...oldUser,
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
          })
        );

        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.log("Update Profile Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Profile update failed"
      );
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main
        className="
          min-h-screen
          bg-slate-50
          dark:bg-slate-950
          flex
          items-center
          justify-center
          px-4
        "
      >
        <div
          className="
            text-center
            text-slate-600
            dark:text-slate-300
          "
        >
          <div
            className="
              mx-auto
              mb-4
              h-10
              w-10
              animate-spin
              rounded-full
              border-4
              border-violet-200
              border-t-violet-600
            "
          />

          <p className="text-sm font-medium">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // NOT LOGGED IN
  // =====================================================

  if (!profile) {
    return (
      <main
        className="
          min-h-screen
          bg-slate-50
          dark:bg-slate-950
          flex
          items-center
          justify-center
          px-4
        "
      >
        <div
          className="
            w-full
            max-w-md
            rounded-2xl
            border
            border-slate-200
            dark:border-slate-800
            bg-white
            dark:bg-slate-900
            p-8
            text-center
            shadow-lg
          "
        >
          <div className="text-5xl mb-4">
            👤
          </div>

          <h2
            className="
              text-xl
              font-bold
              text-slate-900
              dark:text-white
            "
          >
            Profile Not Found
          </h2>

          <p
            className="
              mt-2
              text-sm
              text-slate-500
              dark:text-slate-400
            "
          >
            Please login again to access your student profile.
          </p>
        </div>
      </main>
    );
  }

  // =====================================================
  // MAIN PROFILE
  // =====================================================

  return (
    <main
      className="
        min-h-screen
        bg-slate-50
        dark:bg-slate-950
        px-4
        py-8
        sm:px-6
        lg:px-8
        transition-colors
        duration-300
      "
    >
      <div className="mx-auto max-w-6xl">

        {/* =================================================
            PAGE HEADER
        ================================================== */}

        <div className="mb-8">

          <div
            className="
              inline-flex
              items-center
              gap-2
              rounded-full
              border
              border-violet-200
              dark:border-violet-500/20
              bg-violet-50
              dark:bg-violet-500/10
              px-4
              py-2
              text-sm
              font-semibold
              text-violet-700
              dark:text-violet-300
            "
          >
            🎓 Student Profile
          </div>

          <h1
            className="
              mt-4
              text-3xl
              font-extrabold
              tracking-tight
              text-slate-900
              dark:text-white
              sm:text-4xl
            "
          >
            Complete Your Profile
          </h1>

          <p
            className="
              mt-2
              max-w-2xl
              text-sm
              leading-6
              text-slate-600
              dark:text-slate-400
            "
          >
            Keep your profile updated so alumni and other
            students can discover and connect with you.
          </p>

        </div>

        {/* =================================================
            PROFILE CARD
        ================================================== */}

        <form onSubmit={handleSave}>

          <div
            className="
              overflow-hidden
              rounded-3xl
              border
              border-slate-200
              dark:border-slate-800
              bg-white
              dark:bg-slate-900
              shadow-xl
            "
          >

            {/* =================================================
                PROFILE HERO
            ================================================== */}

            <div
              className="
                bg-gradient-to-r
                from-violet-600
                via-indigo-600
                to-blue-600
                px-6
                py-8
                sm:px-10
              "
            >

              <div
                className="
                  flex
                  flex-col
                  gap-6
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >

                {/* PROFILE IMAGE */}

                <div className="flex items-center gap-5">

                  <div
                    className="
                      flex
                      h-24
                      w-24
                      shrink-0
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-full
                      border-4
                      border-white/30
                      bg-white/20
                      text-3xl
                      font-bold
                      text-white
                    "
                  >
                    {profile.profileImage ? (
                      <img
                        src={profile.profileImage}
                        alt={profile.name || "Student"}
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />
                    ) : (
                      profile.name
                        ?.charAt(0)
                        ?.toUpperCase() || "S"
                    )}
                  </div>

                  <div>

                    <h2
                      className="
                        text-2xl
                        font-bold
                        text-white
                      "
                    >
                      {profile.name || "Student"}
                    </h2>

                    <p
                      className="
                        mt-1
                        text-sm
                        text-indigo-100
                      "
                    >
                      {profile.course || "Student"}
                      {profile.branch
                        ? ` • ${profile.branch}`
                        : ""}
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-indigo-100/80
                      "
                    >
                      {profile.email}
                    </p>

                  </div>

                </div>

                {/* ROLE */}

                <div
                  className="
                    rounded-xl
                    border
                    border-white/20
                    bg-white/10
                    px-5
                    py-3
                    text-center
                    backdrop-blur-sm
                  "
                >
                  <p
                    className="
                      text-xs
                      text-indigo-100
                    "
                  >
                    Account Type
                  </p>

                  <p
                    className="
                      mt-1
                      font-bold
                      text-white
                    "
                  >
                    Student
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                PERSONAL INFORMATION
            ================================================== */}

            <section className="p-6 sm:p-10">

              <div className="mb-6">

                <h3
                  className="
                    text-xl
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Personal Information
                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Update your basic personal details.
                </p>

              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-5
                  md:grid-cols-2
                "
              >

                {/* NAME */}

                <div>

                  <label
                    htmlFor="name"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    Full Name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={profile.name || ""}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      dark:border-slate-700
                      bg-slate-50
                      dark:bg-slate-800
                      px-4
                      py-3
                      text-sm
                      text-slate-900
                      dark:text-white
                      outline-none
                      transition
                      focus:border-violet-500
                      focus:ring-4
                      focus:ring-violet-500/10
                    "
                  />

                </div>

                {/* EMAIL */}

                <div>

                  <label
                    htmlFor="email"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    Email Address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={profile.email || ""}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      dark:border-slate-700
                      bg-slate-50
                      dark:bg-slate-800
                      px-4
                      py-3
                      text-sm
                      text-slate-900
                      dark:text-white
                      outline-none
                      transition
                      focus:border-violet-500
                      focus:ring-4
                      focus:ring-violet-500/10
                    "
                  />

                </div>

                {/* PHONE */}

                <div>

                  <label
                    htmlFor="phone"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="text"
                    value={profile.phone || ""}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      dark:border-slate-700
                      bg-slate-50
                      dark:bg-slate-800
                      px-4
                      py-3
                      text-sm
                      text-slate-900
                      dark:text-white
                      outline-none
                      transition
                      focus:border-violet-500
                      focus:ring-4
                      focus:ring-violet-500/10
                    "
                  />

                </div>

                {/* COLLEGE */}

                <div>

                  <label
                    htmlFor="college"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    College / University
                  </label>

                  <input
                    id="college"
                    name="college"
                    type="text"
                    value={profile.college || ""}
                    onChange={handleChange}
                    placeholder="Enter your college"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      dark:border-slate-700
                      bg-slate-50
                      dark:bg-slate-800
                      px-4
                      py-3
                      text-sm
                      text-slate-900
                      dark:text-white
                      outline-none
                      transition
                      focus:border-violet-500
                      focus:ring-4
                      focus:ring-violet-500/10
                    "
                  />

                </div>

              </div>

            </section>

            {/* =================================================
                EDUCATION
            ================================================== */}

            <section
              className="
                border-t
                border-slate-200
                dark:border-slate-800
                p-6
                sm:p-10
              "
            >

              <div className="mb-6">

                <h3
                  className="
                    text-xl
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Education
                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Add your academic information.
                </p>

              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-5
                  md:grid-cols-3
                "
              >

                {/* COURSE */}

                <div>

                  <label
                    htmlFor="course"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    Course / Degree
                  </label>

                  <input
                    id="course"
                    name="course"
                    type="text"
                    value={profile.course || ""}
                    onChange={handleChange}
                    placeholder="e.g. B.Tech"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      dark:border-slate-700
                      bg-slate-50
                      dark:bg-slate-800
                      px-4
                      py-3
                      text-sm
                      text-slate-900
                      dark:text-white
                      outline-none
                      transition
                      focus:border-violet-500
                      focus:ring-4
                      focus:ring-violet-500/10
                    "
                  />

                </div>

                {/* BRANCH */}

                <div>

                  <label
                    htmlFor="branch"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    Branch / Department
                  </label>

                  <input
                    id="branch"
                    name="branch"
                    type="text"
                    value={profile.branch || ""}
                    onChange={handleChange}
                    placeholder="e.g. CSE"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      dark:border-slate-700
                      bg-slate-50
                      dark:bg-slate-800
                      px-4
                      py-3
                      text-sm
                      text-slate-900
                      dark:text-white
                      outline-none
                      transition
                      focus:border-violet-500
                      focus:ring-4
                      focus:ring-violet-500/10
                    "
                  />

                </div>

                {/* GRADUATION YEAR */}

                <div>

                  <label
                    htmlFor="graduationYear"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    Graduation Year
                  </label>

                  <input
                    id="graduationYear"
                    name="graduationYear"
                    type="text"
                    value={profile.graduationYear || ""}
                    onChange={handleChange}
                    placeholder="e.g. 2027"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      dark:border-slate-700
                      bg-slate-50
                      dark:bg-slate-800
                      px-4
                      py-3
                      text-sm
                      text-slate-900
                      dark:text-white
                      outline-none
                      transition
                      focus:border-violet-500
                      focus:ring-4
                      focus:ring-violet-500/10
                    "
                  />

                </div>

              </div>

            </section>

            {/* =================================================
                SKILLS & CAREER
            ================================================== */}

            <section
              className="
                border-t
                border-slate-200
                dark:border-slate-800
                p-6
                sm:p-10
              "
            >

              <div className="mb-6">

                <h3
                  className="
                    text-xl
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Skills & Career
                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Tell the community about your technical
                  skills and career goals.
                </p>

              </div>

              <div className="space-y-5">

                {/* SKILLS */}

                <div>

                  <label
                    htmlFor="skills"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    Skills
                  </label>

                  <input
                    id="skills"
                    name="skills"
                    type="text"
                    value={
                      Array.isArray(profile.skills)
                        ? profile.skills.join(", ")
                        : ""
                    }
                    onChange={handleSkillsChange}
                    placeholder="JavaScript, React, Node.js, MongoDB"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      dark:border-slate-700
                      bg-slate-50
                      dark:bg-slate-800
                      px-4
                      py-3
                      text-sm
                      text-slate-900
                      dark:text-white
                      outline-none
                      transition
                      focus:border-violet-500
                      focus:ring-4
                      focus:ring-violet-500/10
                    "
                  />

                  <p
                    className="
                      mt-2
                      text-xs
                      text-slate-400
                    "
                  >
                    Separate multiple skills using commas.
                  </p>

                </div>

                {/* CAREER GOAL */}

                <div>

                  <label
                    htmlFor="careerGoal"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    Career Goal
                  </label>

                  <input
                    id="careerGoal"
                    name="careerGoal"
                    type="text"
                    value={profile.careerGoal || ""}
                    onChange={handleChange}
                    placeholder="e.g. Full Stack Developer"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      dark:border-slate-700
                      bg-slate-50
                      dark:bg-slate-800
                      px-4
                      py-3
                      text-sm
                      text-slate-900
                      dark:text-white
                      outline-none
                      transition
                      focus:border-violet-500
                      focus:ring-4
                      focus:ring-violet-500/10
                    "
                  />

                </div>

                {/* BIO */}

                <div>

                  <label
                    htmlFor="bio"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    About Me
                  </label>

                  <textarea
                    id="bio"
                    name="bio"
                    rows="5"
                    value={profile.bio || ""}
                    onChange={handleChange}
                    placeholder="Write a short introduction about yourself..."
                    className="
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-slate-200
                      dark:border-slate-700
                      bg-slate-50
                      dark:bg-slate-800
                      px-4
                      py-3
                      text-sm
                      text-slate-900
                      dark:text-white
                      placeholder:text-slate-400
                      outline-none
                      transition
                      focus:border-violet-500
                      focus:ring-4
                      focus:ring-violet-500/10
                    "
                  />

                </div>

              </div>

            </section>

            {/* =================================================
                SOCIAL LINKS
            ================================================== */}

            <section
              className="
                border-t
                border-slate-200
                dark:border-slate-800
                p-6
                sm:p-10
              "
            >

              <div className="mb-6">

                <h3
                  className="
                    text-xl
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Professional Links
                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Add your professional and coding profiles.
                </p>

              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-5
                  md:grid-cols-3
                "
              >

                {/* LINKEDIN */}

                <div>

                  <label
                    htmlFor="linkedin"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    LinkedIn
                  </label>

                  <input
                    id="linkedin"
                    name="linkedin"
                    type="url"
                    value={profile.linkedin || ""}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/..."
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      dark:border-slate-700
                      bg-slate-50
                      dark:bg-slate-800
                      px-4
                      py-3
                      text-sm
                      text-slate-900
                      dark:text-white
                      outline-none
                      transition
                      focus:border-violet-500
                      focus:ring-4
                      focus:ring-violet-500/10
                    "
                  />

                </div>

                {/* GITHUB */}

                <div>

                  <label
                    htmlFor="github"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    GitHub
                  </label>

                  <input
                    id="github"
                    name="github"
                    type="url"
                    value={profile.github || ""}
                    onChange={handleChange}
                    placeholder="https://github.com/..."
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      dark:border-slate-700
                      bg-slate-50
                      dark:bg-slate-800
                      px-4
                      py-3
                      text-sm
                      text-slate-900
                      dark:text-white
                      outline-none
                      transition
                      focus:border-violet-500
                      focus:ring-4
                      focus:ring-violet-500/10
                    "
                  />

                </div>

                {/* PORTFOLIO */}

                <div>

                  <label
                    htmlFor="portfolio"
                    className="
                      mb-2
                      block
                      text-sm
                      font-semibold
                      text-slate-700
                      dark:text-slate-200
                    "
                  >
                    Portfolio
                  </label>

                  <input
                    id="portfolio"
                    name="portfolio"
                    type="url"
                    value={profile.portfolio || ""}
                    onChange={handleChange}
                    placeholder="https://yourportfolio.com"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      dark:border-slate-700
                      bg-slate-50
                      dark:bg-slate-800
                      px-4
                      py-3
                      text-sm
                      text-slate-900
                      dark:text-white
                      outline-none
                      transition
                      focus:border-violet-500
                      focus:ring-4
                      focus:ring-violet-500/10
                    "
                  />

                </div>

              </div>

            </section>

            {/* =================================================
                PROFILE IMAGE URL
            ================================================== */}

            <section
              className="
                border-t
                border-slate-200
                dark:border-slate-800
                p-6
                sm:p-10
              "
            >

              <div className="mb-6">

                <h3
                  className="
                    text-xl
                    font-bold
                    text-slate-900
                    dark:text-white
                  "
                >
                  Profile Image
                </h3>

                <p
                  className="
                    mt-1
                    text-sm
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  Add an image URL for your profile picture.
                </p>

              </div>

              <input
                id="profileImage"
                name="profileImage"
                type="url"
                value={profile.profileImage || ""}
                onChange={handleChange}
                placeholder="https://example.com/profile.jpg"
                className="
                  w-full
                  rounded-xl
                  border
                  border-slate-200
                  dark:border-slate-700
                  bg-slate-50
                  dark:bg-slate-800
                  px-4
                  py-3
                  text-sm
                  text-slate-900
                  dark:text-white
                  outline-none
                  transition
                  focus:border-violet-500
                  focus:ring-4
                  focus:ring-violet-500/10
                "
              />

            </section>

            {/* =================================================
                SAVE BUTTON
            ================================================== */}

            <div
              className="
                flex
                flex-col-reverse
                gap-3
                border-t
                border-slate-200
                dark:border-slate-800
                bg-slate-50
                dark:bg-slate-950/50
                p-6
                sm:flex-row
                sm:items-center
                sm:justify-end
                sm:px-10
              "
            >

              <button
                type="submit"
                disabled={saving}
                className="
                  inline-flex
                  min-w-40
                  items-center
                  justify-center
                  rounded-xl
                  bg-gradient-to-r
                  from-violet-600
                  to-indigo-600
                  px-6
                  py-3
                  text-sm
                  font-bold
                  text-white
                  shadow-lg
                  shadow-violet-600/20
                  transition
                  hover:-translate-y-0.5
                  hover:from-violet-500
                  hover:to-indigo-500
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {saving
                  ? "Saving..."
                  : "Save Profile"}
              </button>

            </div>

          </div>

        </form>

      </div>
    </main>
  );
};

export default StudentProfile;