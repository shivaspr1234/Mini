"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

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
    "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300",
  accepted:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300",
  rejected:
    "bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300",
  completed:
    "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300",
  cancelled:
    "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
};

function getStoredAlumni() {
  if (typeof window === "undefined") {
    return null;
  }

  for (const storage of [localStorage, sessionStorage]) {
    try {
      const raw = storage.getItem("alumni");

      if (!raw) continue;

      const parsed = JSON.parse(raw);

      // Login response may contain the alumni directly
      // or inside a nested data object.
      const alumni =
        parsed?.data?.alumni ||
        parsed?.alumni ||
        parsed?.data ||
        parsed;

      const alumniId = alumni?._id || alumni?.id;

      if (alumniId) {
        return {
          ...alumni,
          _id: alumniId,
        };
      }
    } catch (error) {
      console.error("Could not read alumni session:", error);
    }
  }

  return null;
}

function getRequestStudent(request) {
  return request?.student || {};
}

function getStudentName(request) {
  const student = getRequestStudent(request);

  return student.name || student.fullName || "Student";
}

function getStudentInitial(request) {
  return getStudentName(request).charAt(0).toUpperCase();
}

function formatDate(date) {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function MentorRequestsPage() {
  const router = useRouter();

  const [alumni, setAlumni] = useState(null);
  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const [search, setSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("all");

  // ==========================================
  // LOAD ALUMNI SESSION
  // ==========================================
  useEffect(() => {
    const loggedInAlumni = getStoredAlumni();

    if (!loggedInAlumni) {
      toast.error("Please login as an alumnus first.");
      router.replace("/Alumni/Login");
      return;
    }

   setAlumni(loggedInAlumni);

    setAlumni(loggedInAlumni);
  }, [router]);

  // ==========================================
  // FETCH REQUESTS RECEIVED BY THIS ALUMNI
  // ==========================================
  const fetchRequests = useCallback(async () => {
    if (!alumni?._id) return;

    setLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/mentor/${alumni._id}`
      );

      const result = response.data?.data;

      if (!Array.isArray(result)) {
        throw new Error(
          "Unexpected response from mentorship API."
        );
      }

      setRequests(result);
    } catch (error) {
      console.error("Fetch mentorship requests error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Could not load mentorship requests."
      );
    } finally {
      setLoading(false);
    }
  }, [alumni]);

  useEffect(() => {
    if (alumni?._id) {
      fetchRequests();
    }
  }, [alumni, fetchRequests]);

  // ==========================================
  // FILTER COUNTS
  // ==========================================
  const counts = useMemo(() => {
    return {
      all: requests.length,
      pending: requests.filter(
        (request) => request.status === "pending"
      ).length,
      accepted: requests.filter(
        (request) => request.status === "accepted"
      ).length,
      rejected: requests.filter(
        (request) => request.status === "rejected"
      ).length,
      completed: requests.filter(
        (request) => request.status === "completed"
      ).length,
      cancelled: requests.filter(
        (request) => request.status === "cancelled"
      ).length,
    };
  }, [requests]);

  // ==========================================
  // SEARCH AND STATUS FILTER
  // ==========================================
  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return requests.filter((request) => {
      const student = getRequestStudent(request);

      const matchesStatus =
        activeStatus === "all" ||
        request.status === activeStatus;

      const searchableText = [
        student.name,
        student.fullName,
        student.email,
        student.college,
        student.course,
        request.topic,
        request.message,
        ...(Array.isArray(request.areasOfGuidance)
          ? request.areasOfGuidance
          : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !query || searchableText.includes(query);

      return matchesStatus && matchesSearch;
    });
  }, [requests, search, activeStatus]);

  // ==========================================
  // ACCEPT OR REJECT REQUEST
  // ==========================================
  async function updateRequestStatus(request, status) {
    if (!alumni?._id) {
      toast.error("Alumni session not found.");
      return;
    }

    if (request.status !== "pending") {
      toast.error("Only pending requests can be updated.");
      return;
    }

    const action = status === "accepted" ? "accept" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this mentorship request?`
    );

    if (!confirmed) return;

    setProcessingId(request._id);

    try {
      const response = await axios.patch(
        `${API_URL}/request/${request._id}/status`,
        {
          mentorId: alumni._id,
          status,
        }
      );

      const updatedRequest =
        response.data?.data ||
        response.data?.request ||
        response.data?.result;

      // Update the UI immediately.
      setRequests((previous) =>
        previous.map((item) => {
          if (item._id !== request._id) {
            return item;
          }

          return {
            ...item,
            ...(updatedRequest || {}),
            status,
          };
        })
      );

      toast.success(
        status === "accepted"
          ? "Mentorship request accepted!"
          : "Mentorship request rejected."
      );

      // Refresh from backend to ensure UI reflects saved data.
      await fetchRequests();
    } catch (error) {
      console.error("Update request status error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Could not update request status."
      );
    } finally {
      setProcessingId(null);
    }
  }

  // ==========================================
  // LOADING SCREEN
  // ==========================================
  if (loading && !requests.length) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-700 dark:border-slate-700 dark:border-t-amber-400" />

          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            Loading mentorship requests...
          </p>
        </div>
      </main>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-7xl">
        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/mentorship"
              className="text-sm font-semibold text-purple-700 hover:text-purple-900 dark:text-amber-400"
            >
              ← Back to Mentorship
            </Link>

            <div className="mt-5">
              <span className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                ✦ Alumni Mentorship
              </span>

              <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">
                Mentor Requests
              </h1>

              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Review student requests, understand their goals,
                and help them move forward in their careers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchRequests}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            ↻ Refresh
          </button>
        </div>

        {/* WELCOME CARD */}
        <section className="mt-8 overflow-hidden rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-50 via-white to-amber-50 shadow-sm dark:border-slate-800 dark:from-purple-950/40 dark:via-slate-900 dark:to-amber-950/20">
          <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-purple-700 dark:text-amber-400">
                Welcome back
              </p>

              <h2 className="mt-2 text-2xl font-extrabold">
                {alumni?.name || alumni?.fullName || "Alumni Mentor"}
              </h2>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Your mentorship inbox keeps every student request
                organized in one place.
              </p>
            </div>

            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-purple-700 text-2xl font-extrabold text-white shadow-lg dark:bg-amber-400 dark:text-slate-950">
              {(
                alumni?.name ||
                alumni?.fullName ||
                "A"
              )
                .charAt(0)
                .toUpperCase()}
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {STATUS_OPTIONS.map((status) => {
            const selected = activeStatus === status;

            return (
              <button
                key={status}
                type="button"
                onClick={() => setActiveStatus(status)}
                className={`rounded-2xl border p-4 text-left transition ${
                  selected
                    ? "border-purple-400 bg-purple-50 shadow-md dark:border-amber-400/50 dark:bg-purple-950/30"
                    : "border-slate-200 bg-white hover:border-purple-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-500/50"
                }`}
              >
                <p className="text-xs font-medium capitalize text-slate-500 dark:text-slate-400">
                  {status === "all" ? "All Requests" : status}
                </p>

                <p className="mt-2 text-2xl font-extrabold">
                  {counts[status]}
                </p>
              </button>
            );
          })}
        </section>

        {/* SEARCH */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_220px]">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2">
                🔎
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search student, college, topic..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:ring-purple-500/10"
              />
            </div>

            <select
              value={activeStatus}
              onChange={(event) => setActiveStatus(event.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950"
              aria-label="Filter requests by status"
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

        {/* REQUEST LIST HEADER */}
        <div className="mt-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold">
              Received Requests
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {filteredRequests.length}{" "}
              {filteredRequests.length === 1 ? "request" : "requests"} found
            </p>
          </div>
        </div>

        {/* REQUEST CARDS */}
        <section className="mt-5 space-y-5">
          {filteredRequests.map((request) => {
            const student = getRequestStudent(request);
            const isPending = request.status === "pending";
            const isProcessing = processingId === request._id;

            return (
              <article
                key={request._id}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="h-1.5 bg-gradient-to-r from-purple-800 via-purple-600 to-amber-400" />

                <div className="p-5 sm:p-7">
                  {/* STUDENT HEADER */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-700 to-amber-400 text-xl font-extrabold text-white shadow-md">
                        {getStudentInitial(request)}
                      </div>

                      <div className="min-w-0">
                        <h3 className="text-lg font-extrabold">
                          {getStudentName(request)}
                        </h3>

                        {student.email && (
                          <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">
                            {student.email}
                          </p>
                        )}

                        {(student.college || student.course) && (
                          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            {[student.college, student.course]
                              .filter(Boolean)
                              .join(" · ")}
                          </p>
                        )}

                        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          Requested {formatDate(request.createdAt)}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
                        STATUS_STYLES[request.status] ||
                        STATUS_STYLES.pending
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      {request.status || "pending"}
                    </span>
                  </div>

                  {/* TOPIC */}
                  <div className="mt-6">
                    <p className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-amber-400">
                      Mentorship Topic
                    </p>

                    <h4 className="mt-2 text-lg font-bold">
                      {request.topic || "Mentorship Request"}
                    </h4>
                  </div>

                  {/* MESSAGE */}
                  <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Student Message
                    </p>

                    <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700 dark:text-slate-300">
                      {request.message || "No message provided."}
                    </p>
                  </div>

                  {/* GUIDANCE AREAS */}
                  <div className="mt-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Areas of Guidance
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {Array.isArray(request.areasOfGuidance) &&
                      request.areasOfGuidance.length > 0 ? (
                        request.areasOfGuidance.map((area, index) => (
                          <span
                            key={`${area}-${index}`}
                            className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-800 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-200"
                          >
                            {area}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          No guidance areas specified.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  {isPending && (
                    <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row">
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() =>
                          updateRequestStatus(request, "accepted")
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isProcessing ? "Processing..." : "✓ Accept Request"}
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() =>
                          updateRequestStatus(request, "rejected")
                        }
                        className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-red-300 bg-white px-5 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/40 dark:bg-slate-900 dark:text-red-300 dark:hover:bg-red-950/30"
                      >
                        {isProcessing ? "Processing..." : "✕ Reject Request"}
                      </button>
                    </div>
                  )}

                  {!isPending && (
                    <div className="mt-6 border-t border-slate-200 pt-5 dark:border-slate-800">
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        This request is currently{" "}
                        <span className="font-bold capitalize">
                          {request.status}
                        </span>
                        .
                      </p>

                      {request.status === "accepted" && (
                        <Link
                          href="/mentorship/sessions"
                          className="mt-4 inline-flex rounded-xl bg-purple-700 px-5 py-3 text-sm font-bold text-white hover:bg-purple-800 dark:bg-purple-600"
                        >
                          View Mentorship Sessions →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              </article>
            );
          })}

          {/* EMPTY STATE */}
          {!loading && filteredRequests.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl dark:bg-purple-500/15">
                🤝
              </div>

              <h3 className="mt-5 text-xl font-extrabold">
                No Requests Found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                {search || activeStatus !== "all"
                  ? "Try changing your search or status filter."
                  : "Student mentorship requests will appear here when they are submitted."}
              </p>

              {(search || activeStatus !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setActiveStatus("all");
                  }}
                  className="mt-5 rounded-xl bg-purple-700 px-5 py-3 text-sm font-bold text-white hover:bg-purple-800"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </section>

        {/* FOOTER NAVIGATION */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/mentorship"
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            ← Explore Mentors
          </Link>

          <Link
            href="/mentorship/my-mentorship"
            className="rounded-xl border border-purple-200 bg-purple-50 px-5 py-3 text-sm font-bold text-purple-800 hover:bg-purple-100 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-200"
          >
            My Mentorship
          </Link>
        </div>
      </div>
    </main>
  );
}
