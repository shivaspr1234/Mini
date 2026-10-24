"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";

const API_URL = "http://localhost:5000";

// =====================================================
// GET LOGGED-IN USER
// =====================================================

function getStoredUser() {
  if (typeof window === "undefined") return null;

  try {
    const alumniData =
      localStorage.getItem("alumni") ||
      sessionStorage.getItem("alumni");

    if (alumniData) {
      const alumni = JSON.parse(alumniData);

      if (alumni?._id) {
        return {
          ...alumni,
          role: "alumni",
        };
      }
    }

    const userData =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    if (userData) {
      const user = JSON.parse(userData);

      if (user?._id) {
        return {
          ...user,
          role: user.role || "student",
        };
      }
    }
  } catch (error) {
    console.error("USER STORAGE ERROR:", error);
  }

  return null;
}

// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(date) {
  if (!date) return "Date not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date not available";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(date) {
  if (!date) return "Date not available";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date not available";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// =====================================================
// EVENT HELPERS
// =====================================================

function getLocationText(event) {
  if (event.locationType === "Online") {
    return "Online Event";
  }

  if (event.locationType === "Hybrid") {
    return event.location
      ? `${event.location} • Hybrid`
      : "Hybrid Event";
  }

  return event.location || "Location not specified";
}

function getParticipantCount(event) {
  return Array.isArray(event?.participants)
    ? event.participants.length
    : 0;
}

function isRegistered(event, user) {
  if (!event || !user?._id) return false;

  if (!Array.isArray(event.participants)) {
    return false;
  }

  return event.participants.some(
    (participant) =>
      String(participant.userId?._id || participant.userId) ===
      String(user._id)
  );
}

function isFull(event) {
  if (!event) return false;

  const maximum = Number(event.maxParticipants) || 0;

  return (
    maximum > 0 &&
    getParticipantCount(event) >= maximum
  );
}

// =====================================================
// MAIN PAGE
// =====================================================

export default function EventDetailsPage() {
  const params = useParams();

  const rawEventId = params?.id;

  const eventId = Array.isArray(rawEventId)
    ? rawEventId[0]
    : rawEventId;

  const [event, setEvent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // CURRENT USER
  // =====================================================

  useEffect(() => {
    setCurrentUser(getStoredUser());
  }, []);

  // =====================================================
  // FETCH EVENT
  // =====================================================

  const fetchEvent = useCallback(async () => {
    if (!eventId) {
      setEvent(null);
      setError("Event ID URL mein nahi mili.");
      setLoading(false);
      return;
    }

    // MongoDB ObjectId must contain 24 hexadecimal characters.
    if (!/^[a-fA-F0-9]{24}$/.test(String(eventId))) {
      setEvent(null);
      setError(
        "Invalid event ID. Events page se kisi valid event ko open karein."
      );
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/event/${encodeURIComponent(eventId)}`
      );

      if (response.data?.success && response.data?.data) {
        setEvent(response.data.data);
        setError("");
      } else {
        setEvent(null);

        setError(
          response.data?.message ||
            "Event could not be loaded."
        );
      }
    } catch (err) {
      console.error(
        "FETCH EVENT ERROR:",
        err.response?.data || err.message
      );

      setEvent(null);

      setError(
        err.response?.data?.message ||
          "Failed to load event. Please check the backend server."
      );
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  // =====================================================
  // JOIN EVENT
  // =====================================================

  const handleJoinEvent = async () => {
    if (!currentUser?._id) {
      toast.error("Please login to join this event.");
      return;
    }

    if (!event?._id) return;

    if (isRegistered(event, currentUser)) {
      toast("You are already registered.");
      return;
    }

    if (isFull(event)) {
      toast.error("This event is currently full.");
      return;
    }

    if (
      event.status === "cancelled" ||
      event.status === "completed"
    ) {
      toast.error(
        event.status === "cancelled"
          ? "This event has been cancelled."
          : "This event has already been completed."
      );

      return;
    }

    try {
      setActionLoading(true);

      const response = await axios.post(
        `${API_URL}/event/register/${event._id}`,
        {
          userId: currentUser._id,
          role: currentUser.role,
        }
      );

      if (response.data?.success) {
        setEvent(response.data.data);

        toast.success(
          "You have successfully joined the event."
        );
      } else {
        toast.error(
          response.data?.message ||
            "Unable to register for this event."
        );
      }
    } catch (err) {
      console.error(
        "JOIN EVENT ERROR:",
        err.response?.data || err.message
      );

      toast.error(
        err.response?.data?.message ||
          "Unable to join this event."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // CANCEL REGISTRATION
  // =====================================================

  const handleCancelRegistration = async () => {
    if (!currentUser?._id || !event?._id) {
      toast.error("Please login first.");
      return;
    }

    try {
      setActionLoading(true);

      const response = await axios.delete(
        `${API_URL}/event/register/${event._id}/${currentUser._id}`
      );

      if (response.data?.success) {
        setEvent(response.data.data);

        toast.success("Event registration cancelled.");
      } else {
        toast.error(
          response.data?.message ||
            "Unable to cancel registration."
        );
      }
    } catch (err) {
      console.error(
        "CANCEL REGISTRATION ERROR:",
        err.response?.data || err.message
      );

      toast.error(
        err.response?.data?.message ||
          "Unable to cancel registration."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // LOADING UI
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="h-6 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />

          <div className="mt-6 h-72 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="h-10 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-5 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
              <div className="h-5 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
            </div>

            <div className="h-64 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR UI
  // =====================================================

  if (error || !event) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6">
        <div className="mx-auto max-w-xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-4xl dark:bg-red-950/30">
            ⚠️
          </div>

          <h1 className="mt-6 text-3xl font-black">
            Event Not Found
          </h1>

          <p className="mt-3 text-slate-500 dark:text-slate-400">
            {error ||
              "The event you are looking for does not exist."}
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={fetchEvent}
              className="rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
            >
              Try Again
            </button>

            <Link
              href="/Events"
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-purple-300 hover:text-purple-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-purple-700 dark:hover:text-purple-400"
            >
              Back to Events
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // EVENT DATA
  // =====================================================

  const registered = isRegistered(event, currentUser);
  const full = isFull(event);
  const participantCount = getParticipantCount(event);
  const maximumParticipants = Number(event.maxParticipants) || 0;

  const participantPercentage =
    maximumParticipants > 0
      ? Math.min(
          100,
          (participantCount / maximumParticipants) * 100
        )
      : 0;

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      {/* HERO / COVER */}

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-800 via-violet-800 to-slate-950" />

        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="absolute -right-20 top-20 h-80 w-80 rounded-full bg-amber-400/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Link
            href="/Events"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/20"
          >
            ← Back to Events
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                  {event.category || "Other"}
                </span>

                {event.locationType && (
                  <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                    {event.locationType}
                  </span>
                )}

                {registered && (
                  <span className="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white">
                    ✓ Registered
                  </span>
                )}
              </div>

              <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                {event.title}
              </h1>

              <p className="mt-5 max-w-3xl text-base leading-7 text-white/75 sm:text-lg">
                {event.description}
              </p>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-amber-300">
                Event Date
              </p>

              <p className="mt-2 text-xl font-black text-white">
                {formatShortDate(event.eventDate)}
              </p>

              <p className="mt-1 text-sm text-white/70">
                {event.startTime || "Time not specified"}
                {event.endTime ? ` - ${event.endTime}` : ""}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* LEFT CONTENT */}

          <div className="space-y-8 lg:col-span-2">
            {/* ABOUT EVENT */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-100 text-xl dark:bg-purple-950/50">
                  📖
                </div>

                <div>
                  <h2 className="text-xl font-black">
                    About This Event
                  </h2>

                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Everything you need to know
                  </p>
                </div>
              </div>

              <p className="mt-6 whitespace-pre-line text-sm leading-7 text-slate-600 dark:text-slate-300">
                {event.description}
              </p>
            </section>

            {/* EVENT INFORMATION */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <h2 className="text-xl font-black">
                Event Information
              </h2>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Date
                  </p>

                  <p className="mt-2 font-bold">
                    {formatDate(event.eventDate)}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Time
                  </p>

                  <p className="mt-2 font-bold">
                    {event.startTime || "Not specified"}
                    {event.endTime ? ` - ${event.endTime}` : ""}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Format
                  </p>

                  <p className="mt-2 font-bold">
                    {event.locationType || "Not specified"}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Location
                  </p>

                  <p className="mt-2 font-bold">
                    {getLocationText(event)}
                  </p>
                </div>
              </div>

              {event.meetingLink &&
                ["Online", "Hybrid"].includes(event.locationType) && (
                  <a
                    href={event.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 flex items-center justify-center rounded-2xl bg-purple-50 px-5 py-4 text-sm font-bold text-purple-700 transition hover:bg-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-950/70"
                  >
                    🔗 Open Meeting Link
                  </a>
                )}
            </section>

            {/* ORGANIZER */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <h2 className="text-xl font-black">
                Event Organizer
              </h2>

              <div className="mt-6 flex items-center gap-4 rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-amber-500 text-xl font-black text-white">
                  {event.organizerName?.charAt(0)?.toUpperCase() || "O"}
                </div>

                <div>
                  <p className="font-black">
                    {event.organizerName || "Event Organizer"}
                  </p>

                  <p className="mt-1 text-sm capitalize text-slate-500 dark:text-slate-400">
                    {event.organizerRole || "Community"} Organizer
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-purple-500/5 dark:border-slate-800 dark:bg-slate-900">
              <div className="bg-gradient-to-br from-purple-700 to-violet-800 p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-wider text-purple-200">
                  Registration
                </p>

                <h2 className="mt-2 text-2xl font-black">
                  Join this event
                </h2>

                <p className="mt-2 text-sm leading-6 text-white/70">
                  Reserve your place and connect with the community.
                </p>
              </div>

              <div className="p-6">
                {/* PARTICIPANTS */}

                <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
                  <div className="flex items-end justify-between gap-4">
                    <div>
                      <p className="text-3xl font-black text-purple-600 dark:text-purple-400">
                        {participantCount}
                      </p>

                      <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                        Registered participants
                      </p>
                    </div>

                    {maximumParticipants > 0 && (
                      <div className="text-right">
                        <p className="text-lg font-black">
                          {maximumParticipants}
                        </p>

                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Capacity
                        </p>
                      </div>
                    )}
                  </div>

                  {maximumParticipants > 0 && (
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-purple-600 to-amber-500 transition-all"
                        style={{
                          width: `${participantPercentage}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* EVENT STATUS */}

                {event.status === "cancelled" && (
                  <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-sm font-bold text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                    This event has been cancelled.
                  </div>
                )}

                {event.status === "completed" && (
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-100 p-4 text-center text-sm font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    This event has been completed.
                  </div>
                )}

                {/* REGISTRATION BUTTON */}

                <div className="mt-5">
                  {registered ? (
                    <button
                      type="button"
                      onClick={handleCancelRegistration}
                      disabled={actionLoading}
                      className="w-full rounded-2xl bg-slate-800 px-5 py-4 text-sm font-black text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-700 dark:hover:bg-slate-600"
                    >
                      {actionLoading
                        ? "Please wait..."
                        : "Cancel Registration"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleJoinEvent}
                      disabled={
                        actionLoading ||
                        full ||
                        event.status === "cancelled" ||
                        event.status === "completed"
                      }
                      className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 px-5 py-4 text-sm font-black text-white shadow-lg shadow-purple-500/20 transition hover:from-purple-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none"
                    >
                      {actionLoading
                        ? "Joining..."
                        : full
                          ? "Event Full"
                          : event.status === "cancelled"
                            ? "Event Cancelled"
                            : event.status === "completed"
                              ? "Event Completed"
                              : "Join Event"}
                    </button>
                  )}
                </div>

                {!currentUser && (
                  <p className="mt-4 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
                    You need to be logged in to register for an event.
                  </p>
                )}

                {/* QUICK DETAILS */}

                <div className="mt-6 space-y-3 border-t border-slate-200 pt-6 dark:border-slate-800">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Category
                    </span>

                    <span className="text-sm font-bold">
                      {event.category || "Other"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Format
                    </span>

                    <span className="text-sm font-bold">
                      {event.locationType || "Not specified"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Date
                    </span>

                    <span className="text-sm font-bold">
                      {formatShortDate(event.eventDate)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}