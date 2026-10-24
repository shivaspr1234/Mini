"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";

const API_URL = "http://localhost:5000/api/mentorship";

const GUIDANCE_OPTIONS = [
  "Career Guidance",
  "Technical Skills",
  "Interview Preparation",
  "Resume Review",
  "Placement Preparation",
  "Higher Studies",
  "Entrepreneurship",
  "Project Guidance",
  "Industry Insights",
  "Networking",
];

export default function MentorProfilePage() {
  const params = useParams();
  const router = useRouter();

  const mentorId = params?.id;

  const [mentor, setMentor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [selectedAreas, setSelectedAreas] = useState([]);

  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");

  // =========================================
  // FETCH MENTOR PROFILE
  // GET /api/mentorship/mentors/:id
  // =========================================

  const fetchMentor = async () => {
    if (!mentorId) return;

    try {
      setLoading(true);
      setPageError("");

      const response = await axios.get(
        `${API_URL}/mentors/${mentorId}`
      );

      const mentorData =
        response.data?.data ||
        response.data?.mentor ||
        response.data;

      if (!mentorData || !mentorData._id) {
        throw new Error("Mentor profile not found.");
      }

      setMentor(mentorData);
    } catch (error) {
      console.error("Fetch mentor error:", error);

      setPageError(
        error.response?.data?.message ||
          error.message ||
          "Unable to load mentor profile. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mentorId]);

  // =========================================
  // READ LOGGED-IN USER
  // =========================================

  const getLoggedInUser = () => {
    if (typeof window === "undefined") {
      return null;
    }

    const storageKeys = ["user", "alumni"];

    for (const storage of [
      window.localStorage,
      window.sessionStorage,
    ]) {
      for (const key of storageKeys) {
        try {
          const rawData = storage.getItem(key);

          if (!rawData) continue;

          const parsedData = JSON.parse(rawData);

          // Some login APIs return { data: user }
          const userData =
            parsedData?.data ||
            parsedData?.user ||
            parsedData?.alumni ||
            parsedData;

          if (userData?._id || userData?.id) {
            return {
              ...userData,
              _id: userData._id || userData.id,
              role:
                userData.role ||
                (key === "alumni" ? "alumni" : "student"),
            };
          }
        } catch (error) {
          console.error(
            `Unable to read ${key} from storage:`,
            error
          );
        }
      }
    }

    return null;
  };

  // =========================================
  // TOGGLE GUIDANCE AREA
  // =========================================

  const toggleGuidanceArea = (area) => {
    setSelectedAreas((previousAreas) => {
      if (previousAreas.includes(area)) {
        return previousAreas.filter(
          (selectedArea) => selectedArea !== area
        );
      }

      return [...previousAreas, area];
    });
  };

  // =========================================
  // SUBMIT MENTORSHIP REQUEST
  // POST /api/mentorship/request
  // =========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setSuccessMessage("");

    const loggedInUser = getLoggedInUser();

    if (!loggedInUser) {
      setFormError(
        "Please log in with your student account before requesting mentorship."
      );
      return;
    }

    if (
      loggedInUser.role &&
      loggedInUser.role.toLowerCase() !== "student"
    ) {
      setFormError(
        "Only student accounts can send mentorship requests."
      );
      return;
    }

    if (loggedInUser._id === mentor?._id) {
      setFormError(
        "You cannot request mentorship from your own profile."
      );
      return;
    }

    if (!topic.trim()) {
      setFormError("Please enter your mentorship topic.");
      return;
    }

    if (!message.trim()) {
      setFormError(
        "Please explain why you want mentorship from this alumni."
      );
      return;
    }

    if (message.trim().length < 20) {
      setFormError(
        "Please write at least 20 characters in your message."
      );
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        studentId: loggedInUser._id,
        mentorId: mentor._id,
        topic: topic.trim(),
        message: message.trim(),
        areasOfGuidance: selectedAreas,
      };

      const response = await axios.post(
        `${API_URL}/request`,
        payload
      );

      setSuccessMessage(
        response.data?.message ||
          "Your mentorship request has been sent successfully!"
      );

      setTopic("");
      setMessage("");
      setSelectedAreas([]);

    } catch (error) {
      console.error("Mentorship request error:", error);

      setFormError(
        error.response?.data?.message ||
          "Unable to send your request. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // =========================================
  // HELPER FUNCTIONS
  // =========================================

  const getInitials = (name = "Mentor") => {
    return name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  };

  const mentorName = mentor?.name || "Alumni Mentor";

  const company =
    mentor?.currentCompany ||
    mentor?.company ||
    mentor?.organization ||
    "";

  const jobTitle =
    mentor?.jobTitle ||
    mentor?.designation ||
    mentor?.position ||
    "";

  const skills = Array.isArray(mentor?.skills)
    ? mentor.skills
    : [];

  const experience =
    mentor?.experience ??
    mentor?.yearsOfExperience ??
    null;

  // =========================================
  // LOADING STATE
  // =========================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-20 text-slate-900 dark:bg-slate-950 dark:text-white">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-40 rounded-lg bg-slate-200 dark:bg-slate-800" />

            <div className="rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="h-28 w-28 rounded-3xl bg-slate-200 dark:bg-slate-800" />

                <div className="flex-1 space-y-4">
                  <div className="h-7 w-1/2 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-2/3 rounded bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            </div>

            <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          </div>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading mentor profile...
          </p>
        </div>
      </main>
    );
  }

  // =========================================
  // ERROR STATE
  // =========================================

  if (pageError || !mentor) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-16 text-slate-900 dark:bg-slate-950 dark:text-white">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-3xl dark:bg-red-950">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold">
            Mentor Profile Unavailable
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {pageError ||
              "We could not find the requested mentor profile."}
          </p>

          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              onClick={fetchMentor}
              className="rounded-xl bg-purple-700 px-5 py-3 font-semibold text-white transition hover:bg-purple-800"
            >
              Try Again
            </button>

            <Link
              href="/mentorship"
              className="rounded-xl border border-slate-300 px-5 py-3 font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Back to Mentors
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // =========================================
  // MAIN PAGE
  // =========================================

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">

      {/* =====================================
          HERO / PROFILE HEADER
      ====================================== */}

      <section className="relative overflow-hidden border-b border-purple-100 bg-gradient-to-br from-purple-100 via-white to-amber-50 dark:border-slate-800 dark:from-purple-950/40 dark:via-slate-950 dark:to-slate-900">
        <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="pointer-events-none absolute -right-20 top-10 h-72 w-72 rounded-full bg-amber-400/15 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

          <Link
            href="/mentorship"
            className="inline-flex items-center gap-2 rounded-xl border border-purple-200 bg-white/80 px-4 py-2 text-sm font-semibold text-purple-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-white dark:border-slate-700 dark:bg-slate-900/80 dark:text-purple-300 dark:hover:bg-slate-800"
          >
            <span aria-hidden="true">←</span>
            Back to Mentors
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px] lg:items-center">

            {/* Mentor information */}

            <div>
              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

                {/* Avatar */}

                <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl border border-amber-300/60 bg-gradient-to-br from-purple-700 via-purple-600 to-amber-500 text-3xl font-extrabold text-white shadow-xl shadow-purple-900/20">
                  {getInitials(mentorName)}
                </div>

                <div className="min-w-0 flex-1">

                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-purple-200 bg-purple-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-800 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300">
                      Alumni Mentor
                    </span>

                    {mentor?.isVerified && (
                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                        ✓ Verified Alumni
                      </span>
                    )}
                  </div>

                  <h1 className="break-words text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                    {mentorName}
                  </h1>

                  <p className="mt-3 text-base font-medium text-slate-700 dark:text-slate-300 sm:text-lg">
                    {jobTitle || "Professional Mentor"}
                    {company ? ` at ${company}` : ""}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600 dark:text-slate-400">

                    {mentor?.location && (
                      <span className="inline-flex items-center gap-2">
                        <span aria-hidden="true">📍</span>
                        {mentor.location}
                      </span>
                    )}

                    {experience !== null &&
                      experience !== undefined &&
                      experience !== "" && (
                        <span className="inline-flex items-center gap-2">
                          <span aria-hidden="true">💼</span>
                          {experience} years experience
                        </span>
                      )}

                    {mentor?.graduationYear && (
                      <span className="inline-flex items-center gap-2">
                        <span aria-hidden="true">🎓</span>
                        Graduated in {mentor.graduationYear}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile quick facts */}

              <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">

                <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Professional Role
                  </p>

                  <p className="mt-2 font-bold">
                    {jobTitle || "Not specified"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Organization
                  </p>

                  <p className="mt-2 break-words font-bold">
                    {company || "Not specified"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Expertise
                  </p>

                  <p className="mt-2 font-bold">
                    {skills.length} listed skills
                  </p>
                </div>
              </div>
            </div>

            {/* CTA card */}

            <div className="rounded-3xl border border-amber-200 bg-white/90 p-6 shadow-xl shadow-purple-900/5 backdrop-blur dark:border-slate-700 dark:bg-slate-900/90">
              <div className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                YOUR NEXT CAREER STEP
              </div>

              <h2 className="mt-3 text-2xl font-extrabold">
                Learn from experience.
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Connect with an experienced professional and get guidance for your career journey.
              </p>

              <a
                href="#request-form"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-700 to-purple-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-purple-900/20 transition hover:-translate-y-0.5 hover:from-purple-800 hover:to-purple-700"
              >
                Request Mentorship
                <span className="ml-2" aria-hidden="true">
                  →
                </span>
              </a>

              <p className="mt-3 text-center text-xs text-slate-500 dark:text-slate-400">
                Your request will be sent to this mentor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================
          MAIN CONTENT
      ====================================== */}

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8 lg:py-14">

        {/* LEFT COLUMN */}

        <div className="space-y-8">

          {/* About */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl dark:bg-purple-950">
                👋
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  About the Mentor
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Background and professional introduction
                </p>
              </div>
            </div>

            <div className="mt-6 whitespace-pre-line text-sm leading-8 text-slate-600 dark:text-slate-300 sm:text-base">
              {mentor?.bio?.trim()
                ? mentor.bio
                : "This mentor has not added a professional introduction yet."}
            </div>

            {(mentor?.degree ||
              mentor?.department ||
              mentor?.college ||
              mentor?.course) && (
              <div className="mt-7 border-t border-slate-200 pt-6 dark:border-slate-800">
                <h3 className="font-bold">
                  Education
                </h3>

                <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                  {mentor?.degree && (
                    <p>
                      <span className="font-semibold">
                        Degree:
                      </span>{" "}
                      {mentor.degree}
                    </p>
                  )}

                  {mentor?.department && (
                    <p>
                      <span className="font-semibold">
                        Department:
                      </span>{" "}
                      {mentor.department}
                    </p>
                  )}

                  {(mentor?.college || mentor?.course) && (
                    <p>
                      <span className="font-semibold">
                        Institution:
                      </span>{" "}
                      {[mentor?.college, mentor?.course]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Skills */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-xl dark:bg-amber-950">
                ✨
              </div>

              <div>
                <h2 className="text-xl font-bold">
                  Skills & Expertise
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Areas where this mentor may guide you
                </p>
              </div>
            </div>

            {skills.length > 0 ? (
              <div className="mt-6 flex flex-wrap gap-3">
                {skills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-800 dark:border-purple-900 dark:bg-purple-950/60 dark:text-purple-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
                No skills have been listed yet.
              </p>
            )}
          </section>

          {/* Professional links */}

          {(mentor?.linkedin ||
            mentor?.github ||
            mentor?.portfolio) && (
            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <h2 className="text-xl font-bold">
                Professional Links
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Explore the mentor&apos;s professional presence.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                {mentor?.linkedin && (
                  <a
                    href={mentor.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold transition hover:border-purple-400 hover:bg-purple-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    LinkedIn ↗
                  </a>
                )}

                {mentor?.github && (
                  <a
                    href={mentor.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold transition hover:border-purple-400 hover:bg-purple-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    GitHub ↗
                  </a>
                )}

                {mentor?.portfolio && (
                  <a
                    href={mentor.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold transition hover:border-purple-400 hover:bg-purple-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    Portfolio ↗
                  </a>
                )}
              </div>
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: REQUEST FORM */}

        <aside id="request-form" className="scroll-mt-24">
          <div className="rounded-3xl border border-purple-200 bg-white p-6 shadow-xl shadow-purple-900/5 dark:border-slate-800 dark:bg-slate-900 sm:p-7">

            <div className="mb-6">
              <span className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Mentorship Request
              </span>

              <h2 className="mt-4 text-2xl font-extrabold">
                Connect with {mentorName.split(" ")[0]}
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Share your goals so the mentor can understand how to help you.
              </p>
            </div>

            {/* Success message */}

            {successMessage && (
              <div
                role="status"
                className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
              >
                <p className="font-bold">
                  ✓ Request submitted
                </p>

                <p className="mt-1">
                  {successMessage}
                </p>

                <Link
                  href="/mentorship/my-mentorship"
                  className="mt-3 inline-block font-bold underline underline-offset-4"
                >
                  View My Mentorship →
                </Link>
              </div>
            )}

            {/* Error message */}

            {formError && (
              <div
                role="alert"
                className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
              >
                {formError}

                {formError.toLowerCase().includes("log in") && (
                  <div className="mt-3">
                    <Link
                      href="/Login"
                      className="font-bold underline underline-offset-4"
                    >
                      Go to Login →
                    </Link>
                  </div>
                )}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* Topic */}

              <div>
                <label
                  htmlFor="mentorship-topic"
                  className="mb-2 block text-sm font-bold"
                >
                  Mentorship Topic
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="mentorship-topic"
                  type="text"
                  value={topic}
                  onChange={(event) =>
                    setTopic(event.target.value)
                  }
                  placeholder="e.g. Full Stack Development"
                  maxLength={120}
                  required
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>

              {/* Message */}

              <div>
                <label
                  htmlFor="mentorship-message"
                  className="mb-2 block text-sm font-bold"
                >
                  Your Message
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <textarea
                  id="mentorship-message"
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  placeholder="Introduce yourself, describe your goals, and explain what guidance you need..."
                  rows={5}
                  maxLength={1500}
                  required
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />

                <div className="mt-2 flex justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>Minimum 20 characters</span>

                  <span>{message.length}/1500</span>
                </div>
              </div>

              {/* Guidance areas */}

              <div>
                <div className="mb-3">
                  <p className="text-sm font-bold">
                    Areas of Guidance
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    Select one or more topics.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {GUIDANCE_OPTIONS.map((area) => {
                    const isSelected =
                      selectedAreas.includes(area);

                    return (
                      <button
                        key={area}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() =>
                          toggleGuidanceArea(area)
                        }
                        className={`rounded-xl border px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                          isSelected
                            ? "border-purple-700 bg-purple-700 text-white shadow-sm"
                            : "border-slate-200 bg-slate-50 text-slate-700 hover:border-purple-300 hover:bg-purple-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-purple-700 dark:hover:bg-purple-950"
                        }`}
                      >
                        {isSelected ? "✓ " : "+ "}
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-700 to-purple-600 px-5 py-4 font-bold text-white shadow-lg shadow-purple-900/20 transition hover:-translate-y-0.5 hover:from-purple-800 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Sending Request...
                  </>
                ) : (
                  <>
                    Send Mentorship Request
                    <span aria-hidden="true">→</span>
                  </>
                )}
              </button>

              <p className="text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
                Please keep your message clear, professional, and respectful.
              </p>
            </form>
          </div>
        </aside>
      </section>

      {/* =====================================
          BOTTOM CTA
      ====================================== */}

      <section className="px-4 pb-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-100 via-white to-amber-50 p-6 dark:border-slate-800 dark:from-purple-950/50 dark:via-slate-900 dark:to-slate-900 sm:flex-row sm:items-center sm:p-8">
          <div>
            <h2 className="text-xl font-extrabold sm:text-2xl">
              Explore more mentors
            </h2>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Find another alumni professional who matches your career goals.
            </p>
          </div>

          <button
            onClick={() => router.push("/mentorship")}
            className="shrink-0 rounded-xl border border-purple-300 bg-white px-5 py-3 font-bold text-purple-800 transition hover:bg-purple-50 dark:border-slate-700 dark:bg-slate-950 dark:text-purple-300 dark:hover:bg-slate-800"
          >
            Browse All Mentors →
          </button>
        </div>
      </section>
    </main>
  );
}