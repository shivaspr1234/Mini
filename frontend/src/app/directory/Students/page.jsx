"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast } from "react-hot-toast";

export default function StudentDirectory() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search
  const [search, setSearch] = useState("");

  // Filters
  const [courseFilter, setCourseFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  // Mobile filter panel
  const [showFilters, setShowFilters] = useState(false);

  // Connection loading
  const [connectingId, setConnectingId] = useState(null);

  // =====================================================
  // FETCH STUDENTS
  // =====================================================

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          "http://localhost:5000/user/directory"
        );

        if (response.data?.success) {
          setStudents(response.data.data || []);
        } else {
          setError("Unable to load student directory.");
        }
      } catch (err) {
        console.error("Student Directory Error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to connect with the server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // =====================================================
  // UNIQUE FILTER VALUES
  // =====================================================

  const courses = useMemo(() => {
    return [
      ...new Set(
        students
          .map((student) => student.course)
          .filter(Boolean)
      ),
    ].sort();
  }, [students]);

  const branches = useMemo(() => {
    return [
      ...new Set(
        students
          .map((student) => student.branch)
          .filter(Boolean)
      ),
    ].sort();
  }, [students]);

  const graduationYears = useMemo(() => {
    return [
      ...new Set(
        students
          .map((student) => student.graduationYear)
          .filter(Boolean)
      ),
    ].sort();
  }, [students]);

  // =====================================================
  // FILTER STUDENTS
  // =====================================================

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const searchableText = [
        student.name,
        student.email,
        student.college,
        student.course,
        student.branch,
        student.graduationYear,
        student.bio,
        student.careerGoal,
        ...(Array.isArray(student.skills)
          ? student.skills
          : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      const matchesCourse =
        !courseFilter ||
        student.course === courseFilter;

      const matchesBranch =
        !branchFilter ||
        student.branch === branchFilter;

      const matchesYear =
        !yearFilter ||
        String(student.graduationYear) ===
          String(yearFilter);

      return (
        matchesSearch &&
        matchesCourse &&
        matchesBranch &&
        matchesYear
      );
    });
  }, [
    students,
    search,
    courseFilter,
    branchFilter,
    yearFilter,
  ]);

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setCourseFilter("");
    setBranchFilter("");
    setYearFilter("");
  };

  const hasFilters =
    search ||
    courseFilter ||
    branchFilter ||
    yearFilter;

  // =====================================================
  // GET CURRENT LOGGED-IN USER
  // =====================================================

  const getCurrentUser = () => {
    try {
      const storedUser =
        localStorage.getItem("user") ||
        sessionStorage.getItem("user");

      if (storedUser) {
        return JSON.parse(storedUser);
      }

      const storedAlumni =
        localStorage.getItem("alumni") ||
        sessionStorage.getItem("alumni");

      if (storedAlumni) {
        const alumni = JSON.parse(storedAlumni);

        return {
          ...alumni,
          role: "alumni",
        };
      }

      return null;
    } catch (error) {
      console.error(
        "Failed to read current user:",
        error
      );

      return null;
    }
  };

  // =====================================================
  // CONNECT
  // =====================================================

  const handleConnect = async (student) => {
    try {
      if (!student?._id) {
        toast.error("Student ID not found.");
        return;
      }

      const currentUser = getCurrentUser();

      // -----------------------------------------------
      // LOGIN CHECK
      // -----------------------------------------------

      if (!currentUser?._id) {
        toast.error(
          "Please login first to send a connection request."
        );
        return;
      }

      // -----------------------------------------------
      // ROLE CHECK
      // -----------------------------------------------

      const currentUserRole =
        currentUser.role === "alumni"
          ? "alumni"
          : "student";

      // -----------------------------------------------
      // SELF CONNECTION CHECK
      // -----------------------------------------------

      if (
        String(currentUser._id) ===
        String(student._id)
      ) {
        toast.error(
          "You cannot send a connection request to yourself."
        );
        return;
      }

      // -----------------------------------------------
      // PREVENT DOUBLE CLICK
      // -----------------------------------------------

      setConnectingId(student._id);

      // -----------------------------------------------
      // SEND CONNECTION REQUEST
      // -----------------------------------------------

      const response = await axios.post(
        "http://localhost:5000/connection/send",
        {
          fromUserId: currentUser._id,
          fromRole: currentUserRole,

          toUserId: student._id,
          toRole: "student",
        }
      );

      // -----------------------------------------------
      // SUCCESS
      // -----------------------------------------------

      if (response.data?.success) {
        toast.success(
          `Connection request sent to ${
            student.name || "student"
          }! 🤝`
        );

        return;
      }

      // -----------------------------------------------
      // BACKEND MESSAGE
      // -----------------------------------------------

      toast.error(
        response.data?.message ||
          "Unable to send connection request."
      );
    } catch (error) {
      console.error(
        "Connection request error:",
        error
      );

      const message =
        error.response?.data?.message ||
        "Failed to send connection request.";

      // -----------------------------------------------
      // ALREADY EXISTS
      // -----------------------------------------------

      if (
        message
          .toLowerCase()
          .includes("already exists")
      ) {
        toast.error(
          "Connection request already exists."
        );
        return;
      }

      // -----------------------------------------------
      // ALREADY CONNECTED
      // -----------------------------------------------

      if (
        message
          .toLowerCase()
          .includes("already connected")
      ) {
        toast.success(
          "You are already connected with this student."
        );
        return;
      }

      // -----------------------------------------------
      // SELF REQUEST
      // -----------------------------------------------

      if (
        message
          .toLowerCase()
          .includes("yourself")
      ) {
        toast.error(
          "You cannot send a connection request to yourself."
        );
        return;
      }

      // -----------------------------------------------
      // OTHER ERROR
      // -----------------------------------------------

      toast.error(message);
    } finally {
      setConnectingId(null);
    }
  };

  // =====================================================
  // PROFILE IMAGE
  // =====================================================

  const getInitials = (name) => {
    if (!name) return "ST";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse">
            <div className="h-10 w-72 rounded-xl bg-slate-200 dark:bg-slate-800" />

            <div className="mt-4 h-5 w-96 max-w-full rounded-lg bg-slate-200 dark:bg-slate-800" />

            <div className="mt-8 h-16 rounded-2xl bg-slate-200 dark:bg-slate-800" />

            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800"
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl dark:bg-red-950/40">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
            Unable to Load Students
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        {/* =================================================
            HEADER
        ================================================== */}

        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-700 via-purple-600 to-amber-500 p-6 text-white shadow-2xl sm:p-8 lg:p-10">
          <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold backdrop-blur-md">
              🎓 Student Network
            </div>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Student Directory
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
              Discover students, explore academic interests,
              connect with peers and build meaningful
              professional relationships.
            </p>
          </div>
        </section>

        {/* =================================================
            STATISTICS
        ================================================== */}

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            icon="👨‍🎓"
            label="Total Students"
            value={students.length}
          />

          <StatCard
            icon="🔎"
            label="Search Results"
            value={filteredStudents.length}
          />

          <StatCard
            icon="🏫"
            label="Colleges"
            value={
              new Set(
                students
                  .map((student) => student.college)
                  .filter(Boolean)
              ).size
            }
          />
        </section>

        {/* =================================================
            SEARCH + FILTER AREA
        ================================================== */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">

          {/* SEARCH */}

          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                🔍
              </span>

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by name, college, course, branch, skills..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            <button
              onClick={() =>
                setShowFilters(!showFilters)
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-purple-300 hover:text-purple-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-purple-700 dark:hover:text-purple-400 lg:hidden"
            >
              🎯 Filters
            </button>

            {hasFilters && (
              <button
                onClick={clearFilters}
                className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                Clear
              </button>
            )}
          </div>

          {/* FILTERS */}

          <div
            className={`mt-4 grid gap-4 ${
              showFilters ? "grid" : "hidden"
            } lg:grid lg:grid-cols-3`}
          >
            {/* COURSE */}

            <select
              value={courseFilter}
              onChange={(e) =>
                setCourseFilter(e.target.value)
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="">All Courses</option>

              {courses.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>

            {/* BRANCH */}

            <select
              value={branchFilter}
              onChange={(e) =>
                setBranchFilter(e.target.value)
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="">All Branches</option>

              {branches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>

            {/* YEAR */}

            <select
              value={yearFilter}
              onChange={(e) =>
                setYearFilter(e.target.value)
              }
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="">
                All Graduation Years
              </option>

              {graduationYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* =================================================
            RESULT HEADER
        ================================================== */}

        <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold">
              Students
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Showing {filteredStudents.length} of{" "}
              {students.length} students
            </p>
          </div>

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="self-start text-sm font-semibold text-purple-600 hover:text-purple-700 dark:text-purple-400"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* =================================================
            EMPTY STATE
        ================================================== */}

        {filteredStudents.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-4xl dark:bg-slate-800">
              🔍
            </div>

            <h3 className="mt-5 text-xl font-bold">
              No students found
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              Try changing your search keyword or removing
              some filters to find more students.
            </p>

            <button
              onClick={clearFilters}
              className="mt-6 rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105"
            >
              Clear Filters
            </button>
          </section>
        ) : (
          /* =================================================
             STUDENT GRID
          ================================================== */

          <section className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredStudents.map((student) => {
              const initials = getInitials(
                student.name
              );

              return (
                <article
                  key={student._id}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900"
                >
                  {/* TOP GRADIENT */}

                  <div className="h-28 bg-gradient-to-r from-purple-600 to-amber-500" />

                  {/* PROFILE CONTENT */}

                  <div className="px-5 pb-5">

                    {/* PROFILE IMAGE */}

                    <div className="-mt-12">
                      {student.profileImage ? (
                        <img
                          src={student.profileImage}
                          alt={
                            student.name ||
                            "Student"
                          }
                          className="h-24 w-24 rounded-2xl object-cover shadow-xl ring-4 ring-white dark:ring-slate-900"
                        />
                      ) : (
                        <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-amber-500 text-2xl font-extrabold text-white shadow-xl ring-4 ring-white dark:ring-slate-900">
                          {initials}
                        </div>
                      )}
                    </div>

                    {/* NAME */}

                    <div className="mt-4">
                      <h3 className="line-clamp-1 text-xl font-bold text-slate-900 dark:text-white">
                        {student.name ||
                          "Student"}
                      </h3>

                      <p className="mt-1 line-clamp-1 text-sm font-medium text-purple-600 dark:text-purple-400">
                        {student.course ||
                          "Student"}

                        {student.branch
                          ? ` • ${student.branch}`
                          : ""}
                      </p>
                    </div>

                    {/* DETAILS */}

                    <div className="mt-5 space-y-3">
                      {student.college && (
                        <DetailRow
                          icon="🏫"
                          text={
                            student.college
                          }
                        />
                      )}

                      {student.graduationYear && (
                        <DetailRow
                          icon="📅"
                          text={`Graduation: ${student.graduationYear}`}
                        />
                      )}

                      {student.careerGoal && (
                        <DetailRow
                          icon="🎯"
                          text={
                            student.careerGoal
                          }
                        />
                      )}
                    </div>

                    {/* SKILLS */}

                    {Array.isArray(
                      student.skills
                    ) &&
                      student.skills.length > 0 && (
                        <div className="mt-5">
                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                            Skills
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {student.skills
                              .slice(0, 5)
                              .map(
                                (
                                  skill,
                                  index
                                ) => (
                                  <span
                                    key={`${skill}-${index}`}
                                    className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
                                  >
                                    {skill}
                                  </span>
                                )
                              )}

                            {student.skills
                              .length > 5 && (
                              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                                +
                                {student.skills.length -
                                  5}{" "}
                                more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                    {/* BIO */}

                    {student.bio && (
                      <p className="mt-5 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {student.bio}
                      </p>
                    )}

                    {/* ACTIONS */}

                    <div className="mt-6 flex gap-3">
                      <Link
                        href={`/directory/Students/${student._id}`}
                        className="flex-1 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-3 text-center text-sm font-bold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
                      >
                        View Profile
                      </Link>

                      <button
                        onClick={() =>
                          handleConnect(
                            student
                          )
                        }
                        disabled={
                          connectingId ===
                          student._id
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-purple-300 hover:text-purple-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-purple-600 dark:hover:text-purple-400"
                        title="Connect"
                        type="button"
                      >
                        🤝
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

// =====================================================
// STAT CARD
// =====================================================

function StatCard({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-xl dark:bg-purple-950/50">
          {icon}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p className="mt-1 text-2xl font-extrabold">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// DETAIL ROW
// =====================================================

function DetailRow({ icon, text }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 text-base">
        {icon}
      </span>

      <p className="line-clamp-2 text-sm font-medium text-slate-600 dark:text-slate-300">
        {text}
      </p>
    </div>
  );
}