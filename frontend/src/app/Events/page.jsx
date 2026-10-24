"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-hot-toast";

const API_URL = "http://localhost:5000";

const CATEGORY_OPTIONS = [
  "All",
  "Networking",
  "Workshop",
  "Webinar",
  "Seminar",
  "Career",
  "Alumni Meet",
  "Other",
];

const getStoredUser = () => {
  if (typeof window === "undefined") return null;

  try {
    const alumni =
      localStorage.getItem("alumni") ||
      sessionStorage.getItem("alumni");

    if (alumni) {
      const parsedAlumni = JSON.parse(alumni);

      return {
        ...parsedAlumni,
        role: "alumni",
      };
    }

    const user =
      localStorage.getItem("user") ||
      sessionStorage.getItem("user");

    if (user) {
      const parsedUser = JSON.parse(user);

      return {
        ...parsedUser,
        role: parsedUser.role || "student",
      };
    }
  } catch (error) {
    console.error("USER STORAGE ERROR:", error);
  }

  return null;
};

const formatEventDate = (date) => {
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
};

const formatEventDay = (date) => {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    weekday: "short",
  });
};

const getLocationText = (event) => {
  if (event.locationType === "Online") {
    return "Online Event";
  }

  if (event.locationType === "Hybrid") {
    return event.location
      ? `${event.location} • Hybrid`
      : "Hybrid Event";
  }

  return event.location || "Location not specified";
};

const getParticipantCount = (event) => {
  return Array.isArray(event.participants)
    ? event.participants.length
    : 0;
};

const isEventFull = (event) => {
  const participantCount = getParticipantCount(event);

  return (
    Number(event.maxParticipants) > 0 &&
    participantCount >= Number(event.maxParticipants)
  );
};

const isEventRegistered = (event, currentUser) => {
  if (!currentUser?._id) return false;

  if (!Array.isArray(event.participants)) {
    return false;
  }

  return event.participants.some(
    (participant) =>
      String(participant.userId) === String(currentUser._id)
  );
};

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [actionLoadingId, setActionLoadingId] =
    useState(null);

  const [showFilters, setShowFilters] = useState(false);

  // =====================================================
  // LOAD CURRENT USER
  // =====================================================

  useEffect(() => {
    const user = getStoredUser();
    setCurrentUser(user);
  }, []);

  // =====================================================
  // FETCH EVENTS
  // =====================================================

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_URL}/event/all`
      );

      if (response.data?.success) {
        setEvents(response.data.data || []);
      } else {
        setEvents([]);
        setError("Unable to load events.");
      }
    } catch (err) {
      console.error("FETCH EVENTS ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load events. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // =====================================================
  // FILTER EVENTS
  // =====================================================

  const filteredEvents = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !searchValue ||
        event.title?.toLowerCase().includes(searchValue) ||
        event.description
          ?.toLowerCase()
          .includes(searchValue) ||
        event.organizerName
          ?.toLowerCase()
          .includes(searchValue) ||
        event.location
          ?.toLowerCase()
          .includes(searchValue);

      const matchesCategory =
        selectedCategory === "All" ||
        event.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [events, search, selectedCategory]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const eventStats = useMemo(() => {
    const upcoming = events.filter(
      (event) => event.status === "upcoming"
    ).length;

    const networking = events.filter(
      (event) => event.category === "Networking"
    ).length;

    const totalParticipants = events.reduce(
      (total, event) =>
        total + getParticipantCount(event),
      0
    );

    return {
      total: events.length,
      upcoming,
      networking,
      participants: totalParticipants,
    };
  }, [events]);

  // =====================================================
  // JOIN EVENT
  // =====================================================

  const handleJoinEvent = async (event) => {
    if (!currentUser?._id) {
      toast.error("Please login to join this event.");
      return;
    }

    if (isEventRegistered(event, currentUser)) {
      toast("You are already registered for this event.");
      return;
    }

    if (isEventFull(event)) {
      toast.error("This event is currently full.");
      return;
    }

    if (event.status === "cancelled") {
      toast.error("This event has been cancelled.");
      return;
    }

    if (event.status === "completed") {
      toast.error("This event has already been completed.");
      return;
    }

    try {
      setActionLoadingId(event._id);

      const response = await axios.post(
        `${API_URL}/event/register/${event._id}`,
        {
          userId: currentUser._id,
          role: currentUser.role,
        }
      );

      if (response.data?.success) {
        toast.success(
          "You have successfully joined the event."
        );

        setEvents((previousEvents) =>
          previousEvents.map((item) =>
            String(item._id) === String(event._id)
              ? response.data.data
              : item
          )
        );
      }
    } catch (err) {
      console.error("JOIN EVENT ERROR:", err);

      toast.error(
        err.response?.data?.message ||
          "Unable to join this event."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // =====================================================
  // CANCEL REGISTRATION
  // =====================================================

  const handleCancelRegistration = async (event) => {
    if (!currentUser?._id) {
      toast.error("Please login first.");
      return;
    }

    try {
      setActionLoadingId(event._id);

      const response = await axios.delete(
        `${API_URL}/event/register/${event._id}/${currentUser._id}`
      );

      if (response.data?.success) {
        toast.success(
          "Event registration cancelled."
        );

        setEvents((previousEvents) =>
          previousEvents.map((item) =>
            String(item._id) === String(event._id)
              ? response.data.data
              : item
          )
        );
      }
    } catch (err) {
      console.error(
        "CANCEL EVENT REGISTRATION ERROR:",
        err
      );

      toast.error(
        err.response?.data?.message ||
          "Unable to cancel registration."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("All");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedCategory !== "All";

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 animate-pulse">
            <div className="h-10 w-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="mt-4 h-5 w-full max-w-xl rounded-lg bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="h-48 animate-pulse bg-slate-200 dark:bg-slate-800" />

                <div className="space-y-4 p-6">
                  <div className="h-5 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-7 w-4/5 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                  <div className="h-11 w-full animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      {/* =================================================
          HERO
      ================================================== */}

      <section className="relative overflow-hidden border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        {/* Decorative Background */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl dark:bg-purple-500/10" />

        <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-400/10" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              Alumni & Student Events
            </div>

            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              Connect.
              <span className="bg-gradient-to-r from-purple-600 via-violet-600 to-amber-500 bg-clip-text text-transparent">
                Learn.
              </span>
              <br />
              Grow Together.
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
              Discover networking events, career sessions,
              workshops and alumni meetups designed to
              connect students with opportunities and
              experienced professionals.
            </p>
          </div>

          {/* Stats */}

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {eventStats.total}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Total Events
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {eventStats.upcoming}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Upcoming
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {eventStats.networking}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Networking
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {eventStats.participants}
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Registrations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          EVENTS CONTENT
      ================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        {/* Search + Filter */}

        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            {/* Search */}

            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                🔎
              </span>

              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search events, categories, organizers or locations..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 text-sm font-medium outline-none transition placeholder:text-slate-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
              />
            </div>

            {/* Mobile Filter Button */}

            <button
              type="button"
              onClick={() =>
                setShowFilters((previous) => !previous)
              }
              className="rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:border-purple-300 hover:text-purple-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-purple-700 dark:hover:text-purple-400 lg:hidden"
            >
              ⚙ Filters
            </button>

            {/* Desktop Categories */}

            <div className="hidden items-center gap-2 overflow-x-auto lg:flex">
              {CATEGORY_OPTIONS.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                  className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    selectedCategory === category
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                      : "bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-purple-950/50 dark:hover:text-purple-300"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Categories */}

          {showFilters && (
            <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4 dark:border-slate-800 lg:hidden">
              {CATEGORY_OPTIONS.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() =>
                    setSelectedCategory(category)
                  }
                  className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    selectedCategory === category
                      ? "bg-purple-600 text-white"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {/* Active Filter Information */}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {filteredEvents.length}
              </span>{" "}
              {filteredEvents.length === 1
                ? "event"
                : "events"}
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* Error */}

        {error && (
          <div className="mb-8 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold">
                  Unable to load events
                </p>

                <p className="mt-1 text-sm opacity-80">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={fetchEvents}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}

        {!error && filteredEvents.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-50 text-4xl dark:bg-purple-950/40">
              📅
            </div>

            <h2 className="mt-6 text-2xl font-black">
              No events found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
              We couldn't find any events matching your
              current search or category filter.
            </p>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-700"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Events Grid */}

        {filteredEvents.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredEvents.map((event) => {
              const participantCount =
                getParticipantCount(event);

              const registered =
                isEventRegistered(
                  event,
                  currentUser
                );

              const full = isEventFull(event);

              const actionLoading =
                actionLoadingId === event._id;

              return (
                <article
                  key={event._id}
                  className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-500/10 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-purple-900"
                >
                  {/* Event Cover */}

                  <div className="relative h-52 overflow-hidden bg-gradient-to-br from-purple-700 via-violet-700 to-amber-500">
                    {event.coverImage ? (
                      <img
                        src={event.coverImage}
                        alt={event.title}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <div className="text-center text-white">
                          <div className="text-5xl">
                            📅
                          </div>

                          <p className="mt-3 text-sm font-bold tracking-wide text-white/80">
                            ALUMNI NETWORKING
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                    {/* Category */}

                    <div className="absolute left-4 top-4">
                      <span className="rounded-full border border-white/20 bg-slate-950/50 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                        {event.category || "Other"}
                      </span>
                    </div>

                    {/* Date */}

                    <div className="absolute bottom-4 left-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 flex-col items-center justify-center rounded-xl bg-white text-slate-900 shadow-lg">
                        <span className="text-[10px] font-bold uppercase text-purple-600">
                          {formatEventDay(
                            event.eventDate
                          )}
                        </span>

                        <span className="text-lg font-black leading-none">
                          {new Date(
                            event.eventDate
                          ).getDate()}
                        </span>
                      </div>

                      <div className="text-white">
                        <p className="text-sm font-bold">
                          {formatEventDate(
                            event.eventDate
                          )}
                        </p>

                        <p className="mt-0.5 text-xs text-white/70">
                          {event.startTime}
                          {event.endTime
                            ? ` - ${event.endTime}`
                            : ""}
                        </p>
                      </div>
                    </div>

                    {/* Status */}

                    {event.status === "cancelled" && (
                      <div className="absolute right-4 top-4 rounded-full bg-red-600 px-3 py-1.5 text-xs font-bold text-white">
                        Cancelled
                      </div>
                    )}

                    {event.status === "completed" && (
                      <div className="absolute right-4 top-4 rounded-full bg-slate-700 px-3 py-1.5 text-xs font-bold text-white">
                        Completed
                      </div>
                    )}
                  </div>

                  {/* Card Content */}

                  <div className="p-6">
                    <h2 className="line-clamp-2 text-xl font-black leading-7 text-slate-900 dark:text-white">
                      {event.title}
                    </h2>

                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                      {event.description}
                    </p>

                    {/* Event Info */}

                    <div className="mt-5 space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 text-base">
                          📍
                        </span>

                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          {getLocationText(event)}
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 text-base">
                          👤
                        </span>

                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          Organized by{" "}
                          <span className="font-bold text-slate-900 dark:text-white">
                            {event.organizerName}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 text-base">
                          👥
                        </span>

                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          {participantCount} participant
                          {participantCount !== 1
                            ? "s"
                            : ""}
                          {Number(
                            event.maxParticipants
                          ) > 0
                            ? ` / ${event.maxParticipants}`
                            : ""}
                        </span>
                      </div>
                    </div>

                    {/* Registration Status */}

                    {registered && (
                      <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
                        <span>✓</span>
                        You are registered
                      </div>
                    )}

                    {/* Actions */}

                    <div className="mt-6 flex gap-3">
                      <Link
                        href={`/events/${event._id}`}
                        className="flex flex-1 items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-purple-800 dark:hover:bg-purple-950/40 dark:hover:text-purple-300"
                      >
                        View Details
                      </Link>

                      {registered ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleCancelRegistration(
                              event
                            )
                          }
                          disabled={actionLoading}
                          className="flex flex-1 items-center justify-center rounded-xl bg-slate-800 px-4 py-3 text-sm font-bold text-white transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-700 dark:hover:bg-slate-600"
                        >
                          {actionLoading
                            ? "Please wait..."
                            : "Cancel Registration"}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() =>
                            handleJoinEvent(event)
                          }
                          disabled={
                            actionLoading ||
                            full ||
                            event.status ===
                              "cancelled" ||
                            event.status ===
                              "completed"
                          }
                          className="flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition hover:from-purple-700 hover:to-violet-700 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-500 disabled:shadow-none"
                        >
                          {actionLoading
                            ? "Joining..."
                            : full
                              ? "Event Full"
                              : event.status ===
                                  "cancelled"
                                ? "Cancelled"
                                : event.status ===
                                    "completed"
                                  ? "Completed"
                                  : "Join Event"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}