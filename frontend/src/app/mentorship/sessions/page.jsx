"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import axios from "axios";

const API_URL = "http://localhost:5000/api/mentorship";

const STATUS_OPTIONS = [
  "all",
  "accepted",
  "completed",
];

function readStoredUser() {
  if (typeof window === "undefined") return null;

  const keys = ["alumni", "user", "student"];

  for (const storage of [localStorage, sessionStorage]) {
    for (const key of keys) {
      try {
        const raw = storage.getItem(key);

        if (!raw) continue;

        const parsed = JSON.parse(raw);

        const user =
          parsed?.data?.user ||
          parsed?.data ||
          parsed?.user ||
          parsed;

        if (user?._id || user?.id) {
          return {
            ...user,
            _id: user._id || user.id,
            role:
              user.role ||
              parsed?.role ||
              (key === "alumni" ? "alumni" : ""),
          };
        }
      } catch (error) {
        console.error(`Unable to read ${key} from storage`, error);
      }
    }
  }

  return null;
}

function formatDate(date) {
  if (!date) return "Not scheduled";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClasses(status) {
  switch (status) {
    case "accepted":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";

    case "completed":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";

    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

function getPersonName(person) {
  if (!person) return "Unknown user";

  return (
    person.name ||
    person.fullName ||
    person.username ||
    person.email ||
    "Unknown user"
  );
}

export default function MentorshipSessionsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userReady, setUserReady] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [editingSession, setEditingSession] = useState(null);
  const [saving, setSaving] = useState(false);
  const [completingId, setCompletingId] = useState("");

  const [form, setForm] = useState({
    scheduledAt: "",
    meetingLink: "",
    notes: "",
  });

  // --------------------------------------------------
  // 1. READ LOGGED-IN USER
  // --------------------------------------------------

  useEffect(() => {
    const user = readStoredUser();

    setCurrentUser(user);
    setUserReady(true);
  }, []);

  const userId = currentUser?._id;

  const isAlumni = useMemo(() => {
    if (!currentUser) return false;

    const role = String(currentUser.role || "").toLowerCase();

    // Alumni login may store a separate Alumni object without role.
    // In that case, the "alumni" storage key is handled below.
    if (role === "alumni") return true;

    if (role === "student") return false;

    if (typeof window !== "undefined") {
      try {
        const alumniRaw = localStorage.getItem("alumni");
        const sessionAlumniRaw = sessionStorage.getItem("alumni");

        const alumniUser = alumniRaw
          ? JSON.parse(alumniRaw)
          : sessionAlumniRaw
            ? JSON.parse(sessionAlumniRaw)
            : null;

        const storedAlumni =
          alumniUser?.data?.user ||
          alumniUser?.data ||
          alumniUser?.user ||
          alumniUser;

        if (
          storedAlumni &&
          String(storedAlumni._id || storedAlumni.id) ===
            String(currentUser._id)
        ) {
          return true;
        }
      } catch (error) {
        console.error("Unable to identify account type", error);
      }
    }

    return false;
  }, [currentUser]);

  // --------------------------------------------------
  // 2. LOAD SESSIONS
  // --------------------------------------------------

  const loadSessions = useCallback(async () => {
    if (!userId) {
      setSessions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const endpoint = isAlumni
        ? `${API_URL}/mentor/${userId}/sessions`
        : `${API_URL}/student/${userId}/sessions`;

      const response = await axios.get(endpoint);

      if (response.data?.success) {
        setSessions(
          Array.isArray(response.data.data)
            ? response.data.data
            : []
        );
      } else {
        setSessions([]);
        setError(
          response.data?.message || "Unable to load mentorship sessions."
        );
      }
    } catch (err) {
      console.error("LOAD MENTORSHIP SESSIONS ERROR:", err);

      setSessions([]);

      setError(
        err.response?.data?.message ||
          "Sessions load nahi ho paaye. Backend server aur API URL check karein."
      );
    } finally {
      setLoading(false);
    }
  }, [userId, isAlumni]);

  useEffect(() => {
    if (userReady) {
      loadSessions();
    }
  }, [userReady, loadSessions]);

  // --------------------------------------------------
  // 3. FILTER SESSIONS
  // --------------------------------------------------

  const filteredSessions = useMemo(() => {
    const query = search.trim().toLowerCase();

    return sessions.filter((item) => {
      const person = isAlumni ? item.student : item.mentor;

      const matchesSearch =
        !query ||
        [
          getPersonName(person),
          person?.email,
          item.topic,
          item.message,
          item.session?.meetingLink,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [sessions, search, statusFilter, isAlumni]);

  const counts = useMemo(() => {
    return {
      all: sessions.length,
      accepted: sessions.filter((item) => item.status === "accepted").length,
      completed: sessions.filter((item) => item.status === "completed").length,
    };
  }, [sessions]);

  // --------------------------------------------------
  // 4. OPEN SCHEDULE / EDIT FORM
  // --------------------------------------------------

  function openScheduleForm(item) {
    setEditingSession(item);
    setError("");
    setSuccess("");

    let localDateTime = "";

    if (item.session?.scheduledAt) {
      const date = new Date(item.session.scheduledAt);

      if (!Number.isNaN(date.getTime())) {
        const offset = date.getTimezoneOffset() * 60000;

        localDateTime = new Date(date.getTime() - offset)
          .toISOString()
          .slice(0, 16);
      }
    }

    setForm({
      scheduledAt: localDateTime,
      meetingLink: item.session?.meetingLink || "",
      notes: item.session?.notes || "",
    });
  }

  function closeScheduleForm() {
    setEditingSession(null);

    setForm({
      scheduledAt: "",
      meetingLink: "",
      notes: "",
    });
  }

  function handleFormChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // --------------------------------------------------
  // 5. SCHEDULE OR UPDATE SESSION
  // --------------------------------------------------

  async function handleScheduleSubmit(event) {
    event.preventDefault();

    if (!editingSession || !userId) return;

    setError("");
    setSuccess("");

    if (!form.scheduledAt) {
      setError("Please session date aur time select karein.");
      return;
    }

    const selectedDate = new Date(form.scheduledAt);

    if (Number.isNaN(selectedDate.getTime())) {
      setError("Please valid date aur time select karein.");
      return;
    }

    if (selectedDate.getTime() <= Date.now()) {
      setError("Session ke liye future date aur time select karein.");
      return;
    }

    const cleanLink = form.meetingLink.trim();

    if (cleanLink) {
      try {
        const parsedLink = new URL(cleanLink);

        if (!["http:", "https:"].includes(parsedLink.protocol)) {
          setError("Meeting link http ya https URL hona chahiye.");
          return;
        }
      } catch {
        setError("Please valid meeting link enter karein.");
        return;
      }
    }

    setSaving(true);

    try {
      const response = await axios.patch(
        `${API_URL}/session/${editingSession._id}/schedule`,
        {
          mentorId: userId,
          scheduledAt: selectedDate.toISOString(),
          meetingLink: cleanLink,
          notes: form.notes.trim(),
        }
      );

      if (response.data?.success) {
        setSuccess(
          response.data.message || "Session successfully scheduled."
        );

        closeScheduleForm();

        await loadSessions();
      } else {
        setError(
          response.data?.message || "Session schedule nahi ho paaya."
        );
      }
    } catch (err) {
      console.error("SCHEDULE SESSION ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Session schedule nahi ho paaya. Backend route check karein."
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // 6. MARK SESSION COMPLETED
  // --------------------------------------------------

  async function handleCompleteSession(item) {
    const confirmed = window.confirm(
      "Kya aap is mentorship session ko completed mark karna chahte hain?"
    );

    if (!confirmed) return;

    setCompletingId(item._id);
    setError("");
    setSuccess("");

    try {
      const response = await axios.patch(
        `${API_URL}/session/${item._id}/complete`,
        {
          mentorId: userId,
        }
      );

      if (response.data?.success) {
        setSuccess("Mentorship session completed successfully.");
        await loadSessions();
      } else {
        setError(
          response.data?.message || "Session complete nahi ho paaya."
        );
      }
    } catch (err) {
      console.error("COMPLETE SESSION ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Session complete nahi ho paaya. Please try again."
      );
    } finally {
      setCompletingId("");
    }
  }

  // --------------------------------------------------
  // 7. LOADING SCREEN
  // --------------------------------------------------

  if (!userReady || loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900 dark:bg-slate-950 dark:text-white">
        <div className="mx-auto max-w-6xl">
          <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 h-5 w-36 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mb-3 h-10 w-72 max-w-full rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-4 w-96 max-w-full rounded bg-slate-200 dark:bg-slate-700" />
          </div>

          <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading mentorship sessions...
          </p>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // 8. LOGIN / USER NOT FOUND
  // --------------------------------------------------

  if (!currentUser || !userId) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl dark:bg-purple-900/40">
            🔐
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Login Required
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Mentorship sessions dekhne ke liye pehle apne account se login
            karein.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/Login"
              className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
            >
              Student Login
            </Link>

            <Link
              href="/Alumni/Login"
              className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-amber-400"
            >
              Alumni Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // 9. MAIN PAGE
  // --------------------------------------------------

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Breadcrumb */}

        <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link
            href="/mentorship"
            className="transition hover:text-purple-600 dark:hover:text-purple-400"
          >
            Mentorship
          </Link>

          <span>/</span>

          <span className="font-semibold text-slate-900 dark:text-white">
            Sessions
          </span>
        </nav>

        {/* Hero */}

        <section className="relative overflow-hidden rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-amber-50 p-6 shadow-sm dark:border-purple-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950 sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-purple-300/20 blur-3xl dark:bg-purple-500/10" />

          <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <span className="inline-flex rounded-full border border-purple-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-700 dark:border-purple-800 dark:bg-slate-900 dark:text-purple-300">
                {isAlumni ? "Alumni Dashboard" : "Student Dashboard"}
              </span>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Mentorship Sessions
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                {isAlumni
                  ? "Manage accepted mentorship requests, schedule meetings, share meeting links and complete sessions."
                  : "Track your accepted mentorship requests, view meeting details and continue your career guidance journey."}
              </p>

              <p className="mt-3 text-sm font-semibold text-purple-700 dark:text-purple-300">
                Welcome, {getPersonName(currentUser)} 👋
              </p>
            </div>

            <div className="flex h-20 w-20 shrink-0 items-center justify-center self-start rounded-3xl bg-gradient-to-br from-purple-600 to-amber-400 text-3xl font-black text-white shadow-lg md:self-center">
              {getPersonName(currentUser).charAt(0).toUpperCase()}
            </div>
          </div>
        </section>

        {/* Alerts */}

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              className="font-bold"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
          >
            <p>{success}</p>

            <button
              type="button"
              onClick={() => setSuccess("")}
              className="font-bold"
              aria-label="Dismiss success message"
            >
              ✕
            </button>
          </div>
        )}

        {/* Statistics */}

        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: "All Sessions",
              value: counts.all,
              icon: "📅",
              active: true,
            },
            {
              label: "Accepted",
              value: counts.accepted,
              icon: "🤝",
            },
            {
              label: "Completed",
              value: counts.completed,
              icon: "✅",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-2xl border p-5 shadow-sm transition ${
                stat.active
                  ? "border-purple-300 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30"
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {stat.label}
                </p>

                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl shadow-sm dark:bg-slate-800">
                  {stat.icon}
                </span>
              </div>

              <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        {/* Search and filters */}

        <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                🔎
              </span>

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  isAlumni
                    ? "Search student, email or topic..."
                    : "Search mentor, email or topic..."
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-purple-950"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-purple-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              aria-label="Filter by status"
            >
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status === "all"
                    ? "All Statuses"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={loadSessions}
              disabled={loading}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold transition hover:border-purple-300 hover:bg-purple-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              ↻ Refresh
            </button>
          </div>
        </section>

        {/* Session list heading */}

        <section className="mt-9">
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-2xl font-black text-slate-950 dark:text-white">
                {isAlumni ? "Your Mentorship Sessions" : "My Sessions"}
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {filteredSessions.length} session
                {filteredSessions.length === 1 ? "" : "s"} found
              </p>
            </div>
          </div>

          {/* Empty state */}

          {filteredSessions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl dark:bg-purple-900/40">
                🤝
              </div>

              <h3 className="mt-5 text-xl font-black text-slate-900 dark:text-white">
                {sessions.length === 0
                  ? "No mentorship sessions yet"
                  : "No matching sessions"}
              </h3>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
                {sessions.length === 0
                  ? "Accepted mentorship requests will appear here. Once a request is accepted, its session details can be managed here."
                  : "Search ya status filter change karke dobara try karein."}
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/mentorship/my-mentorship"
                  className="rounded-xl border border-purple-200 px-5 py-3 text-sm font-bold text-purple-700 transition hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950/40"
                >
                  My Mentorship
                </Link>

                <Link
                  href="/mentorship"
                  className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
                >
                  Explore Mentors →
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredSessions.map((item) => {
                const person = isAlumni ? item.student : item.mentor;

                const session = item.session || {};

                const scheduled = Boolean(session.scheduledAt);

                return (
                  <article
                    key={item._id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:border-purple-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-800"
                  >
                    <div className="h-1.5 bg-gradient-to-r from-purple-700 via-purple-500 to-amber-400" />

                    <div className="p-5 sm:p-7">
                      {/* User and status */}

                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-amber-400 text-lg font-black text-white shadow">
                            {getPersonName(person)
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <h3 className="text-lg font-black text-slate-950 dark:text-white">
                              {getPersonName(person)}
                            </h3>

                            <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">
                              {person?.email || "Email not available"}
                            </p>

                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                              Requested {formatDate(item.createdAt)}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${getStatusClasses(
                            item.status
                          )}`}
                        >
                          <span className="h-2 w-2 rounded-full bg-current" />
                          {item.status}
                        </span>
                      </div>

                      {/* Topic */}

                      <div className="mt-6">
                        <p className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                          Mentorship Topic
                        </p>

                        <h4 className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                          {item.topic || "Mentorship"}
                        </h4>
                      </div>

                      {/* Student message */}

                      {item.message && (
                        <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
                          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {isAlumni ? "Student Message" : "Your Message"}
                          </p>

                          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
                            {item.message}
                          </p>
                        </div>
                      )}

                      {/* Guidance areas */}

                      {Array.isArray(item.areasOfGuidance) &&
                        item.areasOfGuidance.length > 0 && (
                          <div className="mt-5">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Areas of Guidance
                            </p>

                            <div className="mt-3 flex flex-wrap gap-2">
                              {item.areasOfGuidance.map((area, index) => (
                                <span
                                  key={`${area}-${index}`}
                                  className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
                                >
                                  {area}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                      {/* Session details */}

                      <div className="mt-6 rounded-2xl border border-slate-200 p-4 dark:border-slate-700 sm:p-5">
                        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                              Session Schedule
                            </p>

                            <p className="mt-2 font-bold text-slate-900 dark:text-white">
                              {scheduled
                                ? formatDate(session.scheduledAt)
                                : "Not scheduled yet"}
                            </p>
                          </div>

                          <span
                            className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${
                              scheduled
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                            }`}
                          >
                            {scheduled ? "📅 Scheduled" : "⏳ Awaiting schedule"}
                          </span>
                        </div>

                        {session.meetingLink && (
                          <div className="mt-5">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Meeting Link
                            </p>

                            <a
                              href={session.meetingLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-2 inline-flex break-all font-semibold text-purple-700 underline decoration-purple-300 underline-offset-4 hover:text-purple-900 dark:text-purple-300 dark:hover:text-purple-200"
                            >
                              Join Meeting ↗
                            </a>
                          </div>
                        )}

                        {session.notes && (
                          <div className="mt-5">
                            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Session Notes
                            </p>

                            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
                              {session.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}

                      <div className="mt-6 flex flex-wrap gap-3">
                        {isAlumni && item.status === "accepted" && (
                          <>
                            <button
                              type="button"
                              onClick={() => openScheduleForm(item)}
                              className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-purple-700"
                            >
                              {scheduled
                                ? "✎ Update Session"
                                : "+ Schedule Session"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCompleteSession(item)}
                              disabled={completingId === item._id}
                              className="rounded-xl border border-emerald-300 px-5 py-3 text-sm font-bold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
                            >
                              {completingId === item._id
                                ? "Updating..."
                                : "✓ Mark Completed"}
                            </button>
                          </>
                        )}

                        {!isAlumni && item.status === "accepted" && (
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Your mentor will provide the session schedule.
                          </p>
                        )}

                        {item.status === "completed" && (
                          <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                            ✓ This mentorship session has been completed.
                          </p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Schedule modal */}

        {editingSession && isAlumni && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !saving) {
                closeScheduleForm();
              }
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="schedule-modal-title"
              className="my-8 w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                    Alumni Tools
                  </span>

                  <h2
                    id="schedule-modal-title"
                    className="mt-4 text-2xl font-black text-slate-950 dark:text-white"
                  >
                    {editingSession.session?.scheduledAt
                      ? "Update Session"
                      : "Schedule Session"}
                  </h2>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Student:{" "}
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {getPersonName(editingSession.student)}
                    </span>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeScheduleForm}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  aria-label="Close schedule form"
                >
                  ✕
                </button>
              </div>

              <form
                onSubmit={handleScheduleSubmit}
                className="mt-7 space-y-5"
              >
                <div>
                  <label
                    htmlFor="scheduledAt"
                    className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200"
                  >
                    Session Date & Time *
                  </label>

                  <input
                    id="scheduledAt"
                    name="scheduledAt"
                    type="datetime-local"
                    value={form.scheduledAt}
                    onChange={handleFormChange}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-purple-950"
                  />

                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Date aur time aapke local time zone ke hisaab se select karein.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="meetingLink"
                    className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200"
                  >
                    Meeting Link
                  </label>

                  <input
                    id="meetingLink"
                    name="meetingLink"
                    type="url"
                    value={form.meetingLink}
                    onChange={handleFormChange}
                    placeholder="https://meet.google.com/..."
                    maxLength={500}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-purple-950"
                  />

                  <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    Google Meet, Zoom ya kisi valid HTTPS meeting URL ka use karein.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200"
                  >
                    Session Notes
                  </label>

                  <textarea
                    id="notes"
                    name="notes"
                    value={form.notes}
                    onChange={handleFormChange}
                    placeholder="Topics to discuss, preparation instructions, etc."
                    rows={4}
                    maxLength={2000}
                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-purple-950"
                  />

                  <p className="mt-1 text-right text-xs text-slate-400">
                    {form.notes.length}/2000
                  </p>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                  >
                    {error}
                  </p>
                )}

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeScheduleForm}
                    disabled={saving}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-xl bg-gradient-to-r from-purple-700 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-600/20 transition hover:from-purple-800 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? "Saving..."
                      : "Save Session Details"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        {/* Bottom navigation */}

        <div className="mt-10 flex flex-wrap gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
          <Link
            href="/mentorship/requests"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold transition hover:border-purple-300 hover:bg-purple-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            ← Received Requests
          </Link>

          <Link
            href="/mentorship/my-mentorship"
            className="rounded-xl border border-purple-200 bg-purple-50 px-5 py-3 text-sm font-bold text-purple-700 transition hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
          >
            My Mentorship
          </Link>
        </div>
      </div>
    </main>
  );
}