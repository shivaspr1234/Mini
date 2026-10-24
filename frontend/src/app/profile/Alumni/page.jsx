"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // ==========================================
  // GET LOGGED-IN ALUMNI PROFILE
  // ==========================================

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Browser storage se Alumni data nikalo
        const storedAlumni =
          localStorage.getItem("alumni") ||
          sessionStorage.getItem("alumni");

        if (!storedAlumni) {
          toast.error("Please login as Alumni first");
          setLoading(false);
          return;
        }

        const alumniData = JSON.parse(storedAlumni);

        // MongoDB Alumni ID
        const alumniId = alumniData?._id;

        if (!alumniId) {
          toast.error("Alumni ID not found");
          setLoading(false);
          return;
        }

        console.log("Alumni ID:", alumniId);

        // Backend API
        const response = await axios.get(
          `http://localhost:5000/alumni/profile/${alumniId}`
        );

        if (response.data.success) {
          setProfile(response.data.data);
        } else {
          toast.error("Unable to load profile");
        }
      } catch (error) {
        console.log("Profile Error:", error);

        toast.error(
          error.response?.data?.message ||
            "Failed to load alumni profile"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // ==========================================
  // INPUT CHANGE
  // ==========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // UPDATE PROFILE
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await axios.put(
        `http://localhost:5000/alumni/${profile._id}`,
        {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          graduationYear: profile.graduationYear,
          degree: profile.degree,
          department: profile.department,
          currentCompany: profile.currentCompany,
          jobTitle: profile.jobTitle,
          experience: profile.experience,
          location: profile.location,
          linkedin: profile.linkedin,
          bio: profile.bio,
          skills: profile.skills,
        }
      );

      if (response.data.success) {
        setProfile(response.data.data);

        // Updated profile browser storage mein bhi save karo
        localStorage.setItem(
          "alumni",
          JSON.stringify(response.data.data)
        );

        sessionStorage.setItem(
          "alumni",
          JSON.stringify(response.data.data)
        );

        setIsEditing(false);

        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.log("Update Error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <main
        className="
          flex min-h-screen items-center justify-center
          bg-slate-50 px-4
          text-slate-900
          dark:bg-slate-950
          dark:text-white
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto mb-4 h-12 w-12 animate-spin rounded-full
              border-4 border-slate-200 border-t-amber-500
              dark:border-slate-700 dark:border-t-amber-400
            "
          />

          <p className="text-slate-600 dark:text-slate-300">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!profile) {
    return (
      <main
        className="
          flex min-h-screen items-center justify-center
          bg-slate-50 px-4
          text-slate-900
          dark:bg-slate-950
          dark:text-white
        "
      >
        <div
          className="
            w-full max-w-md rounded-3xl
            border border-slate-200
            bg-white
            p-8
            text-center
            shadow-xl

            dark:border-white/10
            dark:bg-white/5
            dark:backdrop-blur-xl
          "
        >
          <div
            className="
              mx-auto mb-5 flex h-16 w-16
              items-center justify-center
              rounded-2xl
              bg-gradient-to-br from-amber-400 to-orange-500
              text-2xl font-black
              text-slate-950
            "
          >
            A
          </div>

          <h1
            className="
              text-2xl font-bold
              text-slate-900
              dark:text-white
            "
          >
            Alumni Login Required
          </h1>

          <p
            className="
              mt-3 text-sm leading-6
              text-slate-600
              dark:text-slate-400
            "
          >
            Please login as an alumni to view your profile.
          </p>

          <a
            href="/Alumni/Login"
            className="
              mt-6 inline-flex
              rounded-xl
              bg-gradient-to-r from-amber-500 to-orange-500
              px-6 py-3
              text-sm font-bold
              text-slate-950
              shadow-lg shadow-amber-500/20
              transition
              hover:-translate-y-0.5
            "
          >
            Alumni Login
          </a>
        </div>
      </main>
    );
  }

  // ==========================================
  // PROFILE UI
  // ==========================================

  return (
    <main
      className="
        min-h-screen
        bg-slate-50
        px-4 py-8
        text-slate-900
        sm:px-6
        lg:px-8
        dark:bg-slate-950
        dark:text-white
      "
    >
      <div className="mx-auto max-w-6xl">

        {/* ==========================================
            PAGE HEADER
        ========================================== */}

        <div
          className="
            mb-8 flex flex-col gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <p
              className="
                text-sm font-semibold
                text-amber-600
                dark:text-amber-400
              "
            >
              Alumni Network
            </p>

            <h1
              className="
                mt-1 text-3xl font-extrabold
                tracking-tight
                text-slate-900
                dark:text-white
                sm:text-4xl
              "
            >
              My Profile
            </h1>

            <p
              className="
                mt-2 text-sm
                text-slate-600
                dark:text-slate-400
              "
            >
              Manage your professional profile and information.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="
              rounded-xl
              bg-gradient-to-r from-amber-500 to-orange-500
              px-6 py-3
              text-sm font-bold
              text-slate-950
              shadow-lg shadow-amber-500/20
              transition
              hover:-translate-y-0.5
            "
          >
            {isEditing ? "Cancel Editing" : "Edit Profile"}
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          {/* ==========================================
              PROFILE HEADER CARD
          ========================================== */}

          <section
            className="
              overflow-hidden rounded-3xl
              border border-slate-200
              bg-white
              shadow-2xl

              dark:border-white/10
              dark:bg-white/5
              dark:backdrop-blur-xl
            "
          >
            {/* Cover */}

            <div
              className="
                h-40
                bg-gradient-to-r
                from-amber-500/30
                via-orange-500/20
                to-cyan-500/20
              "
            />

            <div className="px-6 pb-8 sm:px-10">

              <div
                className="
                  -mt-14
                  flex flex-col gap-5
                  sm:flex-row
                  sm:items-end
                "
              >

                {/* Profile Image */}

                <div
                  className="
                    flex h-28 w-28 shrink-0
                    items-center justify-center
                    rounded-3xl
                    border-4 border-white
                    bg-gradient-to-br
                    from-amber-400 to-orange-500
                    text-4xl font-black
                    text-slate-950
                    shadow-xl
                    dark:border-slate-950
                  "
                >
                  {profile.name?.charAt(0)?.toUpperCase() || "A"}
                </div>

                <div className="flex-1">

                  <h2
                    className="
                      text-2xl font-bold
                      text-slate-900
                      dark:text-white
                    "
                  >
                    {profile.name}
                  </h2>

                  <p
                    className="
                      mt-1 text-sm
                      text-slate-600
                      dark:text-slate-400
                    "
                  >
                    {profile.jobTitle || "Alumni"}

                    {profile.currentCompany
                      ? ` at ${profile.currentCompany}`
                      : ""}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">

                    {/* Verified */}

                    {profile.isVerified && (
                      <span
                        className="
                          rounded-full
                          bg-emerald-100
                          px-3 py-1
                          text-xs font-semibold
                          text-emerald-700
                          dark:bg-emerald-400/10
                          dark:text-emerald-400
                        "
                      >
                        ✓ Verified Alumni
                      </span>
                    )}

                    {/* Location */}

                    {profile.location && (
                      <span
                        className="
                          rounded-full
                          bg-slate-100
                          px-3 py-1
                          text-xs
                          text-slate-700

                          dark:bg-white/10
                          dark:text-slate-300
                        "
                      >
                        📍 {profile.location}
                      </span>
                    )}

                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ==========================================
              PERSONAL INFORMATION
          ========================================== */}

          <section
            className="
              mt-6 rounded-3xl
              border border-slate-200
              bg-white
              p-6
              shadow-xl
              sm:p-8

              dark:border-white/10
              dark:bg-white/5
              dark:backdrop-blur-xl
            "
          >
            <div className="mb-6">

              <h2
                className="
                  text-xl font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                Personal Information
              </h2>

              <p
                className="
                  mt-1 text-sm
                  text-slate-600
                  dark:text-slate-400
                "
              >
                Your basic personal details.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <InputField
                label="Full Name"
                name="name"
                value={profile.name || ""}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <InputField
                label="Email Address"
                name="email"
                value={profile.email || ""}
                onChange={handleChange}
                disabled={!isEditing}
                type="email"
              />

              <InputField
                label="Phone Number"
                name="phone"
                value={profile.phone || ""}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <InputField
                label="Location"
                name="location"
                value={profile.location || ""}
                onChange={handleChange}
                disabled={!isEditing}
              />

            </div>
          </section>

          {/* ==========================================
              EDUCATION
          ========================================== */}

          <section
            className="
              mt-6 rounded-3xl
              border border-slate-200
              bg-white
              p-6
              shadow-xl
              sm:p-8

              dark:border-white/10
              dark:bg-white/5
              dark:backdrop-blur-xl
            "
          >
            <div className="mb-6">

              <h2
                className="
                  text-xl font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                Education
              </h2>

              <p
                className="
                  mt-1 text-sm
                  text-slate-600
                  dark:text-slate-400
                "
              >
                Your academic background.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">

              <InputField
                label="Degree"
                name="degree"
                value={profile.degree || ""}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <InputField
                label="Department"
                name="department"
                value={profile.department || ""}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <InputField
                label="Graduation Year"
                name="graduationYear"
                value={profile.graduationYear || ""}
                onChange={handleChange}
                disabled={!isEditing}
                type="number"
              />

            </div>
          </section>

          {/* ==========================================
              PROFESSIONAL INFORMATION
          ========================================== */}

          <section
            className="
              mt-6 rounded-3xl
              border border-slate-200
              bg-white
              p-6
              shadow-xl
              sm:p-8

              dark:border-white/10
              dark:bg-white/5
              dark:backdrop-blur-xl
            "
          >
            <div className="mb-6">

              <h2
                className="
                  text-xl font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                Professional Information
              </h2>

              <p
                className="
                  mt-1 text-sm
                  text-slate-600
                  dark:text-slate-400
                "
              >
                Your current career information.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <InputField
                label="Current Company"
                name="currentCompany"
                value={profile.currentCompany || ""}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <InputField
                label="Job Title"
                name="jobTitle"
                value={profile.jobTitle || ""}
                onChange={handleChange}
                disabled={!isEditing}
              />

              <InputField
                label="Experience (Years)"
                name="experience"
                value={profile.experience ?? ""}
                onChange={handleChange}
                disabled={!isEditing}
                type="number"
              />

            </div>
          </section>

          {/* ==========================================
              SKILLS
          ========================================== */}

          <section
            className="
              mt-6 rounded-3xl
              border border-slate-200
              bg-white
              p-6
              shadow-xl
              sm:p-8

              dark:border-white/10
              dark:bg-white/5
              dark:backdrop-blur-xl
            "
          >
            <div className="mb-6">

              <h2
                className="
                  text-xl font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                Skills
              </h2>

              <p
                className="
                  mt-1 text-sm
                  text-slate-600
                  dark:text-slate-400
                "
              >
                Add your technical and professional skills.
              </p>
            </div>

            {isEditing ? (

              <input
                type="text"
                value={
                  Array.isArray(profile.skills)
                    ? profile.skills.join(", ")
                    : profile.skills || ""
                }
                onChange={(e) => {
                  setProfile({
                    ...profile,
                    skills: e.target.value
                      .split(",")
                      .map((skill) => skill.trim())
                      .filter(Boolean),
                  });
                }}
                placeholder="React, Node.js, MongoDB, JavaScript"
                className="
                  w-full rounded-xl
                  border border-slate-200
                  bg-white
                  px-4 py-3
                  text-sm text-slate-900
                  outline-none
                  transition

                  placeholder:text-slate-400

                  focus:border-amber-500
                  focus:ring-4
                  focus:ring-amber-500/10

                  dark:border-white/10
                  dark:bg-slate-900
                  dark:text-white
                  dark:placeholder:text-slate-500
                "
              />

            ) : (

              <div className="flex flex-wrap gap-2">

                {Array.isArray(profile.skills) &&
                profile.skills.length > 0 ? (

                  profile.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="
                        rounded-full
                        bg-amber-100
                        px-4 py-2
                        text-sm font-medium
                        text-amber-700

                        dark:bg-amber-400/10
                        dark:text-amber-300
                      "
                    >
                      {skill}
                    </span>
                  ))

                ) : (

                  <p
                    className="
                      text-sm
                      text-slate-500
                      dark:text-slate-500
                    "
                  >
                    No skills added yet.
                  </p>
                )}

              </div>
            )}
          </section>

          {/* ==========================================
              ABOUT ME
          ========================================== */}

          <section
            className="
              mt-6 rounded-3xl
              border border-slate-200
              bg-white
              p-6
              shadow-xl
              sm:p-8

              dark:border-white/10
              dark:bg-white/5
              dark:backdrop-blur-xl
            "
          >
            <div className="mb-6">

              <h2
                className="
                  text-xl font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                About Me
              </h2>

              <p
                className="
                  mt-1 text-sm
                  text-slate-600
                  dark:text-slate-400
                "
              >
                Tell students and other alumni about yourself.
              </p>

            </div>

            <textarea
              name="bio"
              rows="5"
              value={profile.bio || ""}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Tell students and other alumni about yourself..."
              className="
                w-full resize-none rounded-xl
                border border-slate-200
                bg-white
                px-4 py-3
                text-sm leading-6
                text-slate-900
                outline-none
                transition

                placeholder:text-slate-400

                focus:border-amber-500
                focus:ring-4
                focus:ring-amber-500/10

                disabled:cursor-default
                disabled:bg-slate-100
                disabled:text-slate-700
                disabled:opacity-80

                dark:border-white/10
                dark:bg-slate-900
                dark:text-white
                dark:placeholder:text-slate-500

                dark:disabled:bg-slate-900
                dark:disabled:text-slate-300
              "
            />
          </section>

          {/* ==========================================
              SOCIAL LINKS
          ========================================== */}

          <section
            className="
              mt-6 rounded-3xl
              border border-slate-200
              bg-white
              p-6
              shadow-xl
              sm:p-8

              dark:border-white/10
              dark:bg-white/5
              dark:backdrop-blur-xl
            "
          >
            <div className="mb-6">

              <h2
                className="
                  text-xl font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                Social & Professional Links
              </h2>

              <p
                className="
                  mt-1 text-sm
                  text-slate-600
                  dark:text-slate-400
                "
              >
                Connect your professional profiles.
              </p>

            </div>

            <div className="grid gap-5 md:grid-cols-2">

              <InputField
                label="LinkedIn"
                name="linkedin"
                value={profile.linkedin || ""}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="https://linkedin.com/in/your-profile"
              />

            </div>
          </section>

          {/* ==========================================
              SAVE BUTTON
          ========================================== */}

          {isEditing && (
            <div className="mt-6 flex justify-end">

              <button
                type="submit"
                disabled={saving}
                className="
                  rounded-xl
                  bg-gradient-to-r
                  from-amber-500 to-orange-500
                  px-8 py-3
                  font-bold
                  text-slate-950
                  shadow-lg
                  shadow-amber-500/20
                  transition
                  hover:-translate-y-0.5

                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {saving
                  ? "Saving Changes..."
                  : "Save Changes"}
              </button>

            </div>
          )}

        </form>
      </div>
    </main>
  );
};

// ==========================================
// REUSABLE INPUT COMPONENT
// ==========================================

const InputField = ({
  label,
  name,
  value,
  onChange,
  disabled,
  type = "text",
  placeholder = "",
}) => {
  return (
    <div>
      <label
        htmlFor={name}
        className="
          mb-2 block text-sm font-semibold
          text-slate-700
          dark:text-slate-300
        "
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className="
          w-full rounded-xl
          border border-slate-200
          bg-white
          px-4 py-3
          text-sm
          text-slate-900
          outline-none
          transition

          placeholder:text-slate-400

          focus:border-amber-500
          focus:ring-4
          focus:ring-amber-500/10

          disabled:cursor-default
          disabled:bg-slate-100
          disabled:text-slate-700
          disabled:opacity-80

          dark:border-white/10
          dark:bg-slate-900
          dark:text-white
          dark:placeholder:text-slate-500

          dark:disabled:bg-slate-900
          dark:disabled:text-slate-300
        "
      />
    </div>
  );
};

export default ProfilePage;