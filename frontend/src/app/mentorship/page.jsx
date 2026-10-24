"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";

const API_URL = "http://localhost:5000/api/mentorship";

export default function MentorshipPage() {
  const [mentors, setMentors] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // FETCH MENTORS FROM BACKEND
  // ============================================

  useEffect(() => {
    let cancelled = false;

    const fetchMentors = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/mentors`);

        if (!cancelled) {
          const data = response.data?.data;

          setMentors(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("FETCH MENTORS ERROR:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Unable to load mentors. Please check whether the backend server is running."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchMentors();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================
  // EXTRACT AVAILABLE SKILLS
  // ============================================

  const availableSkills = useMemo(() => {
    const skillSet = new Set();

    mentors.forEach((mentor) => {
      const skills = Array.isArray(mentor.skills)
        ? mentor.skills
        : [];

      skills.forEach((skill) => {
        if (typeof skill === "string" && skill.trim()) {
          skillSet.add(skill.trim());
        }
      });
    });

    return ["All", ...Array.from(skillSet).sort()];
  }, [mentors]);

  // ============================================
  // FILTER MENTORS
  // ============================================

  const filteredMentors = useMemo(() => {
    const query = search.trim().toLowerCase();

    return mentors.filter((mentor) => {
      const skills = Array.isArray(mentor.skills)
        ? mentor.skills
        : [];

      const searchableText = [
        mentor.name,
        mentor.currentCompany,
        mentor.company,
        mentor.jobTitle,
        mentor.designation,
        mentor.bio,
        mentor.location,
        ...skills,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = searchableText.includes(query);

      const matchesSkill =
        selectedSkill === "All" ||
        skills.some(
          (skill) =>
            String(skill).toLowerCase() ===
            selectedSkill.toLowerCase()
        );

      return matchesSearch && matchesSkill;
    });
  }, [mentors, search, selectedSkill]);

  // ============================================
  // GET MENTOR EXPERIENCE
  // ============================================

  const getExperience = (mentor) => {
    if (mentor.experience !== undefined && mentor.experience !== null) {
      return `${mentor.experience} years experience`;
    }

    return "Experienced professional";
  };

  // ============================================
  // MAIN UI
  // ============================================

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ========================================
            HERO SECTION
        ======================================== */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-800 via-purple-700 to-amber-500 px-6 py-12 text-white shadow-2xl sm:px-10 sm:py-16 lg:px-14">

          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-2">

            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                <span>🎓</span>
                Alumni Mentorship Network
              </span>

              <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Learn from
                <span className="block text-amber-300">
                  Experience.
                </span>
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-purple-50 sm:text-base">
                Connect with experienced alumni, receive career guidance,
                improve your technical skills and take the next step
                toward your professional goals.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">

                <a
                  href="#mentor-directory"
                  className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-purple-800 shadow-lg transition hover:-translate-y-1 hover:bg-amber-100"
                >
                  Explore Mentors
                  <span className="ml-2">→</span>
                </a>

                <Link
                  href="/mentorship/my-mentorship"
                  className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
                >
                  My Mentorship
                </Link>

              </div>
            </div>

            {/* HERO HIGHLIGHTS */}

            <div className="grid grid-cols-2 gap-4">

              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md sm:p-6">
                <div className="text-3xl">🚀</div>
                <h3 className="mt-4 text-lg font-bold">
                  Career Growth
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Get guidance for your career journey.
                </p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md sm:p-6">
                <div className="text-3xl">💻</div>
                <h3 className="mt-4 text-lg font-bold">
                  Technical Skills
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Learn practical development skills.
                </p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md sm:p-6">
                <div className="text-3xl">🎯</div>
                <h3 className="mt-4 text-lg font-bold">
                  Interview Prep
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Prepare for interviews with expert guidance.
                </p>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-md sm:p-6">
                <div className="text-3xl">🤝</div>
                <h3 className="mt-4 text-lg font-bold">
                  Professional Network
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Build meaningful professional connections.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================
            STATISTICS
        ======================================== */}

        <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">

          <StatCard
            icon="👨‍🏫"
            label="Available Mentors"
            value={loading ? "..." : mentors.length}
          />

          <StatCard
            icon="🔎"
            label="Matching Results"
            value={loading ? "..." : filteredMentors.length}
          />

          <StatCard
            icon="🌐"
            label="Career Guidance"
            value="Multiple Areas"
          />

          <StatCard
            icon="💡"
            label="Learning Focus"
            value="Your Growth"
          />

        </section>

        {/* ========================================
            MENTOR DIRECTORY
        ======================================== */}

        <section id="mentor-directory" className="mt-16 scroll-mt-24">

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">

            <div>
              <span className="text-sm font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                Find Your Guide
              </span>

              <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                Explore Alumni Mentors
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
                Discover alumni who can help you develop your skills,
                plan your career and prepare for opportunities.
              </p>
            </div>

            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm font-semibold text-purple-700 dark:border-purple-900 dark:bg-purple-950/40 dark:text-purple-300">
              <span>👥</span>
              {loading ? "Loading mentors..." : `${filteredMentors.length} mentors found`}
            </div>

          </div>

          {/* SEARCH AND FILTERS */}

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-6">

            <div className="grid gap-4 md:grid-cols-[1fr_240px]">

              <div>
                <label
                  htmlFor="mentor-search"
                  className="mb-2 block text-sm font-semibold"
                >
                  Search mentors
                </label>

                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-950">

                  <svg
                    className="h-5 w-5 shrink-0 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      cx="11"
                      cy="11"
                      r="7"
                      strokeWidth="2"
                    />
                    <path
                      d="m16 16 4 4"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>

                  <input
                    id="mentor-search"
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search by name, company or skill..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />

                </div>
              </div>

              <div>
                <label
                  htmlFor="mentor-skill"
                  className="mb-2 block text-sm font-semibold"
                >
                  Filter by skill
                </label>

                <select
                  id="mentor-skill"
                  value={selectedSkill}
                  onChange={(event) =>
                    setSelectedSkill(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 dark:border-slate-700 dark:bg-slate-950"
                >
                  {availableSkills.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>

            </div>

          </div>

          {/* ========================================
              LOADING STATE
          ======================================== */}

          {loading && (
            <div className="grid gap-6 py-10 sm:grid-cols-2 lg:grid-cols-3">

              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="h-16 w-16 rounded-2xl bg-slate-200 dark:bg-slate-700" />

                  <div className="mt-5 h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />

                  <div className="mt-3 h-4 w-1/2 rounded bg-slate-200 dark:bg-slate-700" />

                  <div className="mt-6 h-20 rounded-xl bg-slate-100 dark:bg-slate-800" />

                  <div className="mt-5 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
                </div>
              ))}

            </div>
          )}

          {/* ========================================
              ERROR STATE
          ======================================== */}

          {!loading && error && (
            <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/30">

              <div className="flex items-start gap-4">

                <div className="text-3xl">⚠️</div>

                <div className="flex-1">
                  <h3 className="font-bold text-red-800 dark:text-red-300">
                    Unable to Load Mentors
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-red-700 dark:text-red-400">
                    {error}
                  </p>

                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
                  >
                    Try Again
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* ========================================
              EMPTY STATE
          ======================================== */}

          {!loading && !error && filteredMentors.length === 0 && (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-100 text-4xl dark:bg-purple-950/50">
                🔍
              </div>

              <h3 className="mt-6 text-xl font-bold">
                No Mentors Found
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600 dark:text-slate-400">
                {mentors.length === 0
                  ? "There are currently no alumni available in the mentor directory."
                  : "Try another search term or select a different skill."}
              </p>

              {(search || selectedSkill !== "All") && (
                <button
                  onClick={() => {
                    setSearch("");
                    setSelectedSkill("All");
                  }}
                  className="mt-6 rounded-xl bg-purple-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-purple-800"
                >
                  Clear Filters
                </button>
              )}

            </div>
          )}

          {/* ========================================
              MENTOR CARDS
          ======================================== */}

          {!loading && !error && filteredMentors.length > 0 && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

              {filteredMentors.map((mentor) => (
                <MentorCard
                  key={mentor._id || mentor.id}
                  mentor={mentor}
                  getExperience={getExperience}
                />
              ))}

            </div>
          )}

        </section>

        {/* ========================================
            BOTTOM CTA
        ======================================== */}

        <section className="mt-16 overflow-hidden rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-amber-50 p-8 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950/30 sm:p-10 lg:p-12">

          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">

            <div className="max-w-2xl">

              <span className="text-sm font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400">
                Your Future Starts Here
              </span>

              <h2 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Great careers grow with great guidance.
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
                Connect with alumni, learn from their experiences
                and take confident steps toward your goals.
              </p>

            </div>

            <a
              href="#mentor-directory"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-purple-700 to-amber-500 px-6 py-4 text-sm font-bold text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              Find a Mentor
              <span className="ml-2">→</span>
            </a>

          </div>
        </section>

      </div>
    </main>
  );
}

// ==================================================
// STATISTICS CARD
// ==================================================

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 sm:p-6">

      <div className="flex items-center justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl dark:bg-purple-950/50">
          {icon}
        </div>

        <span className="text-xs font-semibold text-slate-400">
          ANP
        </span>
      </div>

      <p className="mt-5 text-sm text-slate-500 dark:text-slate-400">
        {label}
      </p>

      <h3 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
        {value}
      </h3>

    </div>
  );
}

// ==================================================
// MENTOR CARD
// ==================================================

function MentorCard({ mentor, getExperience }) {
  const name = mentor.name || "Alumni Mentor";

  const skills = Array.isArray(mentor.skills)
    ? mentor.skills.filter(
        (skill) => typeof skill === "string" && skill.trim()
      )
    : [];

  const company =
    mentor.currentCompany ||
    mentor.company ||
    "Industry Professional";

  const jobTitle =
    mentor.jobTitle ||
    mentor.designation ||
    mentor.position ||
    "Alumni";

  const mentorId = mentor._id || mentor.id;

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-700">

      {/* TOP ACCENT */}

      <div className="h-1.5 bg-gradient-to-r from-purple-700 via-purple-500 to-amber-400" />

      <div className="flex flex-1 flex-col p-6">

        {/* MENTOR IDENTITY */}

        <div className="flex items-start gap-4">

          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-700 to-amber-500 text-xl font-extrabold text-white shadow-lg">
            {initials || "AM"}
          </div>

          <div className="min-w-0 flex-1">

            <h3 className="break-words text-lg font-extrabold transition group-hover:text-purple-700 dark:group-hover:text-purple-400">
              {name}
            </h3>

            <p className="mt-1 text-sm font-medium text-purple-700 dark:text-purple-400">
              {jobTitle}
            </p>

            <p className="mt-1 break-words text-sm text-slate-500 dark:text-slate-400">
              {company}
            </p>

          </div>

        </div>

        {/* LOCATION */}

        {mentor.location && (
          <div className="mt-5 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <span>📍</span>
            <span>{mentor.location}</span>
          </div>
        )}

        {/* EXPERIENCE */}

        <div className="mt-5 flex items-center gap-2 rounded-xl bg-purple-50 px-3 py-3 text-sm font-semibold text-purple-800 dark:bg-purple-950/40 dark:text-purple-300">
          <span>💼</span>
          {getExperience(mentor)}
        </div>

        {/* BIO */}

        <p className="mt-5 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-slate-600 dark:text-slate-400">
          {mentor.bio ||
            "Connect with this alumni to explore career guidance, professional development and mentorship opportunities."}
        </p>

        {/* SKILLS */}

        <div className="mt-5">

          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Skills & Expertise
          </p>

          <div className="mt-3 flex flex-wrap gap-2">

            {skills.length > 0 ? (
              skills.slice(0, 4).map((skill, index) => (
                <span
                  key={`${skill}-${index}`}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-sm text-slate-400">
                Expertise details not added
              </span>
            )}

            {skills.length > 4 && (
              <span className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                +{skills.length - 4} more
              </span>
            )}

          </div>
        </div>

        {/* ACTION BUTTON */}

        <div className="mt-auto pt-7">

          {mentorId ? (
            <Link
              href={`/mentorship/mentors/${mentorId}`}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-700 to-purple-600 px-4 py-3.5 text-sm font-bold text-white shadow-md transition hover:from-purple-800 hover:to-purple-700"
            >
              View Mentor Profile
              <span>→</span>
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="w-full cursor-not-allowed rounded-xl bg-slate-200 px-4 py-3.5 text-sm font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400"
            >
              Profile Unavailable
            </button>
          )}

        </div>

      </div>
    </article>
  );
}