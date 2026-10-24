"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";

const API_URL = "http://localhost:5000";

export default function RegisteredEventsPage() {
  const [currentUser, setCurrentUser] = useState(null);

  const [events, setEvents] = useState([]);

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [cancellingId, setCancellingId] = useState(null);

  // ============================================================
  // GET CURRENT LOGGED-IN USER
  // ============================================================

  useEffect(() => {
    try {
      const possibleKeys = ["user", "alumni"];

      let foundUser = null;
      let foundRole = "";

      for (const key of possibleKeys) {
        const localData = localStorage.getItem(key);
        const sessionData = sessionStorage.getItem(key);

        const rawData = localData || sessionData;

        if (!rawData) continue;

        try {
          const parsed = JSON.parse(rawData);

          if (parsed) {
            foundUser = parsed;
            foundRole =
              key === "alumni" ? "alumni" : parsed.role || "student";

            break;
          }
        } catch (parseError) {
          console.error(`Failed to parse ${key}:`, parseError);
        }
      }

      // ----------------------------------------------------------
      // Sometimes login response can be stored as:
      // { data: {...} }
      // ----------------------------------------------------------

      if (foundUser?.data && typeof foundUser.data === "object") {
        foundUser = foundUser.data;
      }

      // ----------------------------------------------------------
      // Sometimes user ID can be inside user object
      // ----------------------------------------------------------

      const userId =
        foundUser?._id ||
        foundUser?.id ||
        foundUser?.userId;

      const role =
        foundRole ||
        foundUser?.role ||
        "student";

      if (!userId) {
        setCurrentUser(null);
        setLoadingUser(false);
        return;
      }

      setCurrentUser({
        ...foundUser,
        _id: String(userId),
        role: String(role).toLowerCase(),
      });

      setLoadingUser(false);
    } catch (error) {
      console.error("GET CURRENT USER ERROR:", error);

      setCurrentUser(null);
      setLoadingUser(false);
    }
  }, []);

  // ============================================================
  // VALIDATE MONGODB OBJECT ID
  // ============================================================

  const isValidMongoId = (id) => {
    return /^[a-fA-F0-9]{24}$/.test(String(id || ""));
  };

  // ============================================================
  // FETCH REGISTERED EVENTS
  // ============================================================

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      if (!currentUser?._id) {
        return;
      }

      const userId = String(currentUser._id).trim();

      // --------------------------------------------------------
      // IMPORTANT:
      // Do NOT call backend if ID is invalid.
      // This prevents Axios 400 error.
      // --------------------------------------------------------

      if (!isValidMongoId(userId)) {
        console.error("Invalid MongoDB user ID:", userId);

        setError(
          "Your login session contains an invalid user ID. Please logout and login again."
        );

        return;
      }

      try {
        setLoadingEvents(true);
        setError("");

        const response = await axios.get(
          `${API_URL}/event/registered/${userId}`
        );

        if (response.data?.success) {
          setEvents(
            Array.isArray(response.data.data)
              ? response.data.data
              : []
          );
        } else {
          setEvents([]);

          setError(
            response.data?.message ||
              "Failed to load registered events."
          );
        }
      } catch (error) {
        console.error(
          "FETCH REGISTERED EVENTS ERROR:",
          error
        );

        if (error.response) {
          console.error(
            "Backend response:",
            error.response.data
          );

          console.error(
            "Backend status:",
            error.response.status
          );

          if (error.response.status === 400) {
            setError(
              error.response.data?.message ||
                "Invalid user ID. Please login again."
            );
          } else if (error.response.status === 404) {
            setError(
              error.response.data?.message ||
                "Registered events route was not found."
            );
          } else {
            setError(
              error.response.data?.message ||
                "Unable to load registered events."
            );
          }
        } else if (error.request) {
          setError(
            "Backend server is not responding. Please make sure your backend is running on port 5000."
          );
        } else {
          setError(
            error.message ||
              "Something went wrong while loading events."
          );
        }

        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchRegisteredEvents();
  }, [currentUser]);

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (dateValue) => {
    if (!dateValue) return "Date not available";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date not available";
    }

    return date.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ============================================================
  // FORMAT TIME
  // ============================================================

  const formatTime = (startTime, endTime) => {
    if (!startTime && !endTime) {
      return "Time not available";
    }

    if (startTime && endTime) {
      return `${startTime} - ${endTime}`;
    }

    return startTime || endTime;
  };

  // ============================================================
  // CANCEL REGISTRATION
  // ============================================================

  const handleCancelRegistration = async (eventId) => {
    if (!currentUser?._id || !eventId) {
      return;
    }

    const userId = String(currentUser._id).trim();

    if (!isValidMongoId(userId)) {
      setError(
        "Invalid user session. Please login again."
      );

      return;
    }

    if (!isValidMongoId(eventId)) {
      setError("Invalid event ID.");

      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel your registration for this event?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancellingId(eventId);
      setError("");
      setSuccess("");

      const response = await axios.delete(
        `${API_URL}/event/register/${eventId}/${userId}`
      );

      if (response.data?.success) {
        setEvents((previousEvents) =>
          previousEvents.filter(
            (event) => String(event._id) !== String(eventId)
          )
        );

        setSuccess(
          response.data?.message ||
            "Event registration cancelled successfully."
        );

        setTimeout(() => {
          setSuccess("");
        }, 3000);
      } else {
        setError(
          response.data?.message ||
            "Unable to cancel registration."
        );
      }
    } catch (error) {
      console.error(
        "CANCEL REGISTRATION ERROR:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to cancel event registration."
      );
    } finally {
      setCancellingId(null);
    }
  };

  // ============================================================
  // UPCOMING / HISTORY
  // ============================================================

  const { upcomingEvents, pastEvents } = useMemo(() => {
    const now = new Date();

    const upcoming = [];
    const past = [];

    events.forEach((event) => {
      const eventDate = new Date(event.eventDate);

      if (
        event.status === "completed" ||
        eventDate < now
      ) {
        past.push(event);
      } else {
        upcoming.push(event);
      }
    });

    return {
      upcomingEvents: upcoming,
      pastEvents: past,
    };
  }, [events]);

  // ============================================================
  // LOADING USER
  // ============================================================

  if (loadingUser) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-20 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 dark:border-purple-900 dark:border-t-purple-400" />

            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Checking your login session...
            </p>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // USER NOT LOGGED IN
  // ============================================================

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none sm:p-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-100 text-4xl dark:bg-purple-500/10">
              🔐
            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Login Required
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-400 sm:text-base">
              Please login to view the events you have registered for.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="rounded-2xl bg-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5 hover:bg-purple-700"
              >
                Student Login
              </Link>

              <Link
                href="/Alumni/Login"
                className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-800 transition hover:border-purple-300 hover:text-purple-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:hover:border-purple-500 dark:hover:text-purple-400"
              >
                Alumni Login
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      {/* ======================================================
          HERO
      ======================================================= */}

      <section className="relative overflow-hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="absolute -right-32 top-10 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              My Events
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Registered{" "}
              <span className="bg-gradient-to-r from-purple-600 via-purple-500 to-amber-500 bg-clip-text text-transparent">
                Events
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-400 sm:text-lg">
              Manage the events you have joined and keep track of your upcoming networking opportunities.
            </p>

            {/* Current User */}

            <div className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-amber-500 text-lg font-black text-white">
                {String(currentUser.name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <p className="text-sm font-bold">
                  {currentUser.name || "Logged-in User"}
                </p>

                <p className="text-xs capitalize text-slate-500 dark:text-slate-400">
                  {currentUser.role || "student"} account
                </p>
              </div>

              <span className="ml-2 h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          CONTENT
      ======================================================= */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* SUCCESS */}

        {success && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
            ✓ {success}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 dark:border-red-500/20 dark:bg-red-500/10">
            <div className="flex gap-3">
              <div className="text-xl">⚠️</div>

              <div>
                <p className="font-bold text-red-700 dark:text-red-300">
                  Unable to load registered events
                </p>

                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            STATS
        ===================================================== */}

        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total
            </p>

            <p className="mt-2 text-3xl font-black text-purple-600 dark:text-purple-400">
              {events.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Upcoming
            </p>

            <p className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {upcomingEvents.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Completed
            </p>

            <p className="mt-2 text-3xl font-black text-slate-700 dark:text-slate-200">
              {pastEvents.length}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Account
            </p>

            <p className="mt-2 text-lg font-black capitalize text-amber-600 dark:text-amber-400">
              {currentUser.role}
            </p>
          </div>
        </div>

        {/* ====================================================
            LOADING
        ===================================================== */}

        {loadingEvents && (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 dark:border-purple-900 dark:border-t-purple-400" />

              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Loading your registered events...
              </p>
            </div>
          </div>
        )}

        {/* ====================================================
            EMPTY STATE
        ===================================================== */}

        {!loadingEvents &&
          !error &&
          events.length === 0 && (
            <div className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-100 text-4xl dark:bg-purple-500/10">
                📅
              </div>

              <h2 className="mt-6 text-2xl font-black">
                No Registered Events
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-400">
                You have not registered for any events yet. Explore upcoming events and connect with alumni and other students.
              </p>

              <Link
                href="/Events"
                className="mt-7 inline-flex items-center justify-center rounded-2xl bg-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5 hover:bg-purple-700"
              >
                Explore Events →
              </Link>
            </div>
          )}

        {/* ====================================================
            UPCOMING EVENTS
        ===================================================== */}

        {!loadingEvents && upcomingEvents.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">
                  Coming Soon
                </p>

                <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                  Upcoming Events
                </h2>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Events you are registered for.
                </p>
              </div>

              <Link
                href="/Events"
                className="text-sm font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400"
              >
                Browse all events →
              </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {upcomingEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  cancellingId={cancellingId}
                  onCancel={handleCancelRegistration}
                  isPast={false}
                />
              ))}
            </div>
          </section>
        )}

        {/* ====================================================
            PAST EVENTS
        ===================================================== */}

        {!loadingEvents && pastEvents.length > 0 && (
          <section>
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                History
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Previous Events
              </h2>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Events you have already attended or that have ended.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {pastEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  formatDate={formatDate}
                  formatTime={formatTime}
                  cancellingId={cancellingId}
                  onCancel={handleCancelRegistration}
                  isPast
                />
              ))}
            </div>
          </section>
        )}

        {/* ====================================================
            BOTTOM CTA
        ===================================================== */}

        {!loadingEvents && events.length > 0 && (
          <div className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 p-8 text-white shadow-xl shadow-purple-500/20 sm:p-10">
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-purple-200">
                  Keep Networking
                </p>

                <h3 className="mt-2 text-2xl font-black sm:text-3xl">
                  Discover more events
                </h3>

                <p className="mt-2 max-w-2xl text-sm leading-7 text-purple-100">
                  Join workshops, alumni meetups, networking sessions and career events.
                </p>
              </div>

              <Link
                href="/Events"
                className="inline-flex shrink-0 items-center justify-center rounded-2xl bg-white px-6 py-3 text-sm font-black text-purple-700 transition hover:-translate-y-0.5 hover:bg-purple-50"
              >
                Explore Events →
              </Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

// ==================================================================
// EVENT CARD COMPONENT
// ==================================================================

function EventCard({
  event,
  formatDate,
  formatTime,
  cancellingId,
  onCancel,
  isPast,
}) {
  const participantCount = Array.isArray(event.participants)
    ? event.participants.length
    : 0;

  const capacity =
    Number(event.maxParticipants) > 0
      ? Number(event.maxParticipants)
      : null;

  const percentage = capacity
    ? Math.min(
        100,
        Math.round((participantCount / capacity) * 100)
      )
    : 0;

  return (
    <article className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:shadow-black/20">
      {/* ======================================================
          CARD HEADER
      ======================================================= */}

      <div className="relative overflow-hidden bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-700 px-6 py-7 text-white">
        <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-black uppercase tracking-wider backdrop-blur-sm">
                {event.category || "Event"}
              </span>

              <span
                className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider ${
                  isPast
                    ? "bg-slate-900/30 text-white"
                    : "bg-emerald-400/20 text-emerald-100"
                }`}
              >
                {isPast ? "Completed" : "Registered"}
              </span>
            </div>

            <span className="text-2xl">✦</span>
          </div>

          <h3 className="mt-5 line-clamp-2 text-xl font-black leading-tight sm:text-2xl">
            {event.title || "Untitled Event"}
          </h3>

          <p className="mt-3 line-clamp-2 text-sm leading-6 text-purple-100">
            {event.description ||
              "No event description available."}
          </p>
        </div>
      </div>

      {/* ======================================================
          CARD BODY
      ======================================================= */}

      <div className="p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <InfoItem
            icon="📅"
            label="Date"
            value={formatDate(event.eventDate)}
          />

          <InfoItem
            icon="⏰"
            label="Time"
            value={formatTime(
              event.startTime,
              event.endTime
            )}
          />

          <InfoItem
            icon="📍"
            label="Location"
            value={
              event.location ||
              event.locationType ||
              "Online"
            }
          />

          <InfoItem
            icon="👤"
            label="Organizer"
            value={
              event.organizerName ||
              "ANP Community"
            }
          />
        </div>

        {/* Capacity */}

        {capacity && (
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Participants
                </p>

                <p className="mt-1 text-sm font-black">
                  {participantCount} / {capacity}
                </p>
              </div>

              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                {percentage}%
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-600 to-amber-500 transition-all"
                style={{
                  width: `${percentage}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* ====================================================
            ACTIONS
        ===================================================== */}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/Events/${event._id}`}
            className="flex flex-1 items-center justify-center rounded-2xl bg-purple-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5 hover:bg-purple-700"
          >
            View Event
          </Link>

          {!isPast && (
            <button
              type="button"
              onClick={() => onCancel(event._id)}
              disabled={cancellingId === event._id}
              className="flex flex-1 items-center justify-center rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20"
            >
              {cancellingId === event._id
                ? "Cancelling..."
                : "Cancel Registration"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

// ==================================================================
// INFO ITEM
// ==================================================================

function InfoItem({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/60">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-sm dark:bg-slate-700">
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">
            {label}
          </p>

          <p className="mt-1 truncate text-sm font-bold text-slate-800 dark:text-slate-200">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}