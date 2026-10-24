"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";

const API_URL = "http://localhost:5000/api/mentorship";

const STATUS_OPTIONS = [
  "all",
  "pending",
  "accepted",
  "rejected",
  "completed",
  "cancelled",
];

const STATUS_STYLES = {
  pending:
    "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  accepted:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  rejected:
    "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  completed:
    "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  cancelled:
    "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export default function MyMentorshipPage() {
  const [studentId, setStudentId] = useState("");
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const [cancellingId, setCancellingId] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  // =========================================
  // GET LOGGED-IN STUDENT
  // =========================================

  const getLoggedInStudent = useCallback(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const storages = [
      window.localStorage,
      window.sessionStorage,
    ];

    for (const storage of storages) {
      for (const key of ["user", "alumni"]) {
        try {
          const raw = storage.getItem(key);

          if (!raw) continue;

          const parsed = JSON.parse(raw);

          const user =
            parsed?.data ||
            parsed?.user ||
            parsed?.alumni ||
            parsed;

          if (user?._id || user?.id) {
            return {
              ...user,
              _id: user._id || user.id,
              role:
                user.role ||
                (key === "alumni" ? "alumni" : "student"),
            };
          }
        } catch (error) {
          console.error("Unable to read login data:", error);
        }
      }
    }

    return null;
  }, []);

  // =========================================
  // FETCH STUDENT MENTORSHIP REQUESTS
  // GET /api/mentorship/student/:studentId
  // =========================================

  const fetchRequests = useCallback(
    async (id) => {
      if (!id) return;

      try {
        setLoading(true);
        setPageError("");

        const response = await axios.get(
          `${API_URL}/student/${id}`
        );

        const data =
          response.data?.data ??
          response.data?.requests ??
          response.data;

        if (!Array.isArray(data)) {
          throw new Error(
            "Unexpected response from the mentorship API."
          );
        }

        setRequests(data);
      } catch (error) {
        console.error("Fetch mentorship requests error:", error);

        setPageError(
          error.response?.data?.message ||
            error.message ||
            "Unable to load your mentorship requests."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // =========================================
  // INITIALIZE PAGE
  // =========================================

  useEffect(() => {
    const student = getLoggedInStudent();

    if (!student) {
      setPageError(
        "Please log in with your student account to view your mentorship requests."
      );
      setLoading(false);
      return;
    }

    if (
      student.role &&
      student.role.toLowerCase() !== "student"
    ) {
      setPageError(
        "This page is intended for student accounts."
      );
      setLoading(false);
      return;
    }

    setStudentId(student._id);
    fetchRequests(student._id);
  }, [getLoggedInStudent, fetchRequests]);

  // =========================================
  // FILTER COUNTS
  // =========================================

  const counts = useMemo(() => {
    return {
      all: requests.length,
      pending: requests.filter(
        (item) => item.status === "pending"
      ).length,
      accepted: requests.filter(
        (item) => item.status === "accepted"
      ).length,
      rejected: requests.filter(
        (item) => item.status === "rejected"
      ).length,
      completed: requests.filter(
        (item) => item.status === "completed"
      ).length,
      cancelled: requests.filter(
        (item) => item.status === "cancelled"
      ).length,
    };
  }, [requests]);

  // =========================================
  // SEARCH AND FILTER
  // =========================================

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((item) => {
      const mentor = item.mentor || {};

      const mentorName = mentor.name || "";
      const company =
        mentor.currentCompany ||
        mentor.company ||
        "";

      const topic = item.topic || "";

      const matchesSearch = [
        mentorName,
        company,
        topic,
        item.message || "",
      ].some((value) =>
        String(value).toLowerCase().includes(query)
      );

      const matchesStatus =
        activeFilter === "all" ||
        item.status === activeFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, search, activeFilter]);

  // =========================================
  // CANCEL REQUEST
  // PATCH /api/mentorship/request/:id/cancel
  // =========================================

  const handleCancel = async (requestId) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this mentorship request?"
    );

    if (!confirmed) return;

    try {
      setCancellingId(requestId);
      setActionError("");
      setActionSuccess("");

      await axios.patch(
        `${API_URL}/request/${requestId}/cancel`,
        {
          studentId,
        }
      );

      setRequests((previous) =>
        previous.map((item) =>
          item._id === requestId
            ? { ...item, status: "cancelled" }
            : item
        )
      );

      setActionSuccess(
        "Your mentorship request has been cancelled."
      );
    } catch (error) {
      console.error("Cancel request error:", error);

      setActionError(
        error.response?.data?.message ||
          "Unable to cancel this request. Please try again."
      );
    } finally {
      setCancellingId("");
    }
  };

  // =========================================
  // LOADING STATE
  // =========================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900 dark:bg-slate-950 dark:text-white">
        <div className="mx-auto max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-56 rounded bg-slate-200 dark:bg-slate-800" />
            <div className="h-36 rounded-3xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          </div>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading your mentorship requests...
          </p>
        </div>
      </main>
    );
  }

  // =========================================
  // PAGE
  // =========================================

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">

        {/* Breadcrumb */}

        <div className="mb-7 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link
            href="/mentorship"
            className="transition hover:text-purple-700 dark:hover:text-purple-300"
          >
            Mentorship
          </Link>

          <span>/</span>

          <span className="font-semibold text-slate-900 dark:text-white">
            My Mentorship
          </span>
        </div>

        {/* Hero */}

        <section className="relative overflow-hidden rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-100 via-white to-amber-50 p-6 shadow-sm dark:border-slate-800 dark:from-purple-950/50 dark:via-slate-900 dark:to-slate-900 sm:p-10">
          <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-amber-400/20 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <span className="inline-flex rounded-full border border-purple-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-800 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300">
                Student Dashboard
              </span>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                My Mentorship
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                Track your mentorship requests, check mentor responses, and manage your career guidance journey in one place.
              </p>
            </div>

            <Link
              href="/mentorship"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-700 to-purple-600 px-5 py-3.5 font-bold text-white shadow-lg shadow-purple-900/20 transition hover:-translate-y-0.5 hover:from-purple-800 hover:to-purple-700"
            >
              + Find a Mentor
            </Link>
          </div>
        </section>

        {/* Page error */}

        {pageError && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm leading-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            <p className="font-bold">Unable to display mentorship requests</p>

            <p className="mt-1">{pageError}</p>

            {pageError.toLowerCase().includes("log in") && (
              <Link
                href="/Login"
                className="mt-3 inline-block font-bold underline underline-offset-4"
              >
                Go to Login →
              </Link>
            )}

            <button
              onClick={() => {
                setPageError("");
                const student = getLoggedInStudent();

                if (student?._id) {
                  setStudentId(student._id);
                  fetchRequests(student._id);
                } else {
                  setPageError(
                    "Please log in with your student account first."
                  );
                }
              }}
              className="ml-4 mt-3 inline-block font-bold underline underline-offset-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* Statistics */}

        {!pageError && (
          <>
            <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {STATUS_OPTIONS.map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 ${
                    activeFilter === status
                      ? "border-purple-400 bg-purple-50 shadow-md dark:border-purple-700 dark:bg-purple-950/50"
                      : "border-slate-200 bg-white hover:border-purple-200 dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <p className="text-xs font-semibold capitalize text-slate-500 dark:text-slate-400">
                    {status === "all"
                      ? "All Requests"
                      : status}
                  </p>

                  <p className="mt-2 text-2xl font-extrabold">
                    {counts[status]}
                  </p>
                </button>
              ))}
            </section>

            {/* Feedback messages */}

            {actionSuccess && (
              <div
                role="status"
                className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                ✓ {actionSuccess}
              </div>
            )}

            {actionError && (
              <div
                role="alert"
                className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
              >
                {actionError}
              </div>
            )}

            {/* Search and filter */}

            <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:p-5">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                    🔎
                  </span>

                  <input
                    type="search"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search by mentor, company, or topic..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>

                <select
                  value={activeFilter}
                  onChange={(event) =>
                    setActiveFilter(event.target.value)
                  }
                  aria-label="Filter by mentorship status"
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950"
                >
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status === "all"
                        ? "All Statuses"
                        : status.charAt(0).toUpperCase() +
                          status.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </section>

            {/* Request list */}

            <section className="mt-8">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold">
                    Your Requests
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {filteredRequests.length} request
                    {filteredRequests.length !== 1 ? "s" : ""} found
                  </p>
                </div>

                <button
                  onClick={() => fetchRequests(studentId)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold transition hover:border-purple-300 hover:bg-purple-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
                >
                  ↻ Refresh
                </button>
              </div>

              {filteredRequests.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl dark:bg-purple-950">
                    🤝
                  </div>

                  <h3 className="mt-5 text-xl font-bold">
                    {requests.length === 0
                      ? "No mentorship requests yet"
                      : "No matching requests"}
                  </h3>

                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {requests.length === 0
                      ? "Explore the alumni directory and send a mentorship request to a professional who matches your goals."
                      : "Try another search term or select a different status filter."}
                  </p>

                  {requests.length === 0 && (
                    <Link
                      href="/mentorship"
                      className="mt-6 inline-flex items-center justify-center rounded-xl bg-purple-700 px-5 py-3 font-bold text-white transition hover:bg-purple-800"
                    >
                      Explore Mentors →
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-5">
                  {filteredRequests.map((item) => {
                    const mentor = item.mentor || {};

                    const mentorName =
                      mentor.name || "Alumni Mentor";

                    const mentorCompany =
                      mentor.currentCompany ||
                      mentor.company ||
                      "";

                    const status =
                      STATUS_STYLES[item.status] ||
                      STATUS_STYLES.cancelled;

                    return (
                      <article
                        key={item._id}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-purple-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-900 sm:p-7"
                      >
                        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">

                          {/* Mentor details */}

                          <div className="flex min-w-0 gap-4">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-700 to-amber-500 text-lg font-extrabold text-white shadow-md">
                              {mentorName
                                .trim()
                                .split(/\s+/)
                                .filter(Boolean)
                                .slice(0, 2)
                                .map((part) => part[0])
                                .join("")
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <h3 className="break-words text-lg font-extrabold">
                                {item.topic || "Mentorship Request"}
                              </h3>

                              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                Mentor:{" "}
                                <span className="font-bold text-slate-900 dark:text-white">
                                  {mentorName}
                                </span>
                              </p>

                              {mentorCompany && (
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                  {mentorCompany}
                                </p>
                              )}

                              <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                                Requested{" "}
                                {item.createdAt
                                  ? new Date(
                                      item.createdAt
                                    ).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "date unavailable"}
                              </p>
                            </div>
                          </div>

                          {/* Status */}

                          <span
                            className={`inline-flex w-fit shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-bold capitalize ${status}`}
                          >
                            <span className="mr-2 h-2 w-2 rounded-full bg-current" />
                            {item.status || "unknown"}
                          </span>
                        </div>

                        {/* Message */}

                        {item.message && (
                          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Your Message
                            </p>

                            <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
                              {item.message}
                            </p>
                          </div>
                        )}

                        {/* Guidance areas */}

                        {Array.isArray(item.areasOfGuidance) &&
                          item.areasOfGuidance.length > 0 && (
                            <div className="mt-4">
                              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                Guidance Areas
                              </p>

                              <div className="flex flex-wrap gap-2">
                                {item.areasOfGuidance.map(
                                  (area, index) => (
                                    <span
                                      key={`${area}-${index}`}
                                      className="rounded-lg border border-purple-100 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-800 dark:border-purple-900 dark:bg-purple-950/50 dark:text-purple-300"
                                    >
                                      {area}
                                    </span>
                                  )
                                )}
                              </div>
                            </div>
                          )}

                        {/* Session details */}

                        {item.session?.scheduledAt && (
                          <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
                            <p className="font-bold text-blue-800 dark:text-blue-300">
                              📅 Scheduled Session
                            </p>

                            <p className="mt-2 text-sm text-blue-800 dark:text-blue-200">
                              {new Date(
                                item.session.scheduledAt
                              ).toLocaleString("en-IN", {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })}
                            </p>

                            {item.session.meetingLink && (
                              <a
                                href={item.session.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-block text-sm font-bold text-blue-700 underline underline-offset-4 dark:text-blue-300"
                              >
                                Join Meeting ↗
                              </a>
                            )}
                          </div>
                        )}

                        {/* Actions */}

                        <div className="mt-6 flex flex-wrap gap-3 border-t border-slate-100 pt-5 dark:border-slate-800">

                          {mentor._id && (
                            <Link
                              href={`/mentorship/mentors/${mentor._id}`}
                              className="rounded-xl border border-purple-200 px-4 py-2.5 text-sm font-bold text-purple-800 transition hover:bg-purple-50 dark:border-purple-900 dark:text-purple-300 dark:hover:bg-purple-950"
                            >
                              View Mentor →
                            </Link>
                          )}

                          {item.status === "pending" && (
                            <button
                              onClick={() =>
                                handleCancel(item._id)
                              }
                              disabled={
                                cancellingId === item._id
                              }
                              className="rounded-xl border border-red-200 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                            >
                              {cancellingId === item._id
                                ? "Cancelling..."
                                : "Cancel Request"}
                            </button>
                          )}

                          {item.status === "accepted" && (
                            <Link
                              href="/mentorship/sessions"
                              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
                            >
                              View Sessions →
                            </Link>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}