"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-hot-toast";

const API_URL = "http://localhost:5000";

export default function ConnectionsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");

  // =====================================================
  // GET CURRENT LOGGED-IN USER
  // =====================================================

  useEffect(() => {
    const getCurrentUser = () => {
      try {
        const localUser = localStorage.getItem("user");
        const sessionUser = sessionStorage.getItem("user");

        const localAlumni = localStorage.getItem("alumni");
        const sessionAlumni = sessionStorage.getItem("alumni");

        let storedUser = null;
        let role = "";

        // Student
        if (localUser) {
          storedUser = JSON.parse(localUser);
          role = storedUser?.role || "student";
        } else if (sessionUser) {
          storedUser = JSON.parse(sessionUser);
          role = storedUser?.role || "student";
        }

        // Alumni
        else if (localAlumni) {
          storedUser = JSON.parse(localAlumni);
          role = "alumni";
        } else if (sessionAlumni) {
          storedUser = JSON.parse(sessionAlumni);
          role = "alumni";
        }


         console.log("=================================");
         console.log("CURRENT LOGGED USER:", storedUser);
         console.log("CURRENT USER ID:", storedUser?._id);
         console.log("CURRENT USER ROLE:", role);
         console.log("=================================");





        if (storedUser?._id) {
          setCurrentUser({
            ...storedUser,
            role,
          });
        } else {
          setError("Please login to view your connections.");
          setLoading(false);
        }
      } catch (err) {
        console.log(err);
        setError("Unable to read login information.");
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  // =====================================================
  // FETCH CONNECTIONS
  // =====================================================

  useEffect(() => {
    if (!currentUser?._id) return;

    fetchConnections();
  }, [currentUser]);

  // =====================================================
  // FETCH CONNECTION LIST
  // =====================================================

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError("");


      console.log(
  "CONNECTION API:",
  `${API_URL}/connection/my/${currentUser._id}`
);


      const response = await axios.get(
        `${API_URL}/connection/my/${currentUser._id}`
      );

      if (response.data.success) {
        const connectionData = response.data.data || [];

        setConnections(connectionData);

        await fetchProfiles(connectionData);
      } else {
        setConnections([]);
      }
    } catch (err) {
      console.log(err);

      setError(
        err.response?.data?.message ||
          "Failed to load your connections."
      );

      toast.error("Failed to load connections");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // FETCH PROFILE DETAILS
  // =====================================================

  const fetchProfiles = async (connectionData) => {
    try {
      const profileMap = {};

      await Promise.all(
        connectionData.map(async (connection) => {
          const isCurrentUserSender =
            connection.fromUserId === currentUser._id;

          const otherUserId = isCurrentUserSender
            ? connection.toUserId
            : connection.fromUserId;

          const otherRole = isCurrentUserSender
            ? connection.toRole
            : connection.fromRole;

          try {
            let response;

            // Alumni profile
            if (otherRole === "alumni") {
              response = await axios.get(
                `${API_URL}/alumni/directory/${otherUserId}`
              );
            }

            // Student profile
            else {
              response = await axios.get(
                `${API_URL}/user/getbyid/${otherUserId}`
              );
            }

            if (response.data.success) {
              profileMap[connection._id] = {
                ...response.data.data,
                role: otherRole,
              };
            }
          } catch (profileError) {
            console.log(
              "Profile fetch error:",
              profileError
            );

            profileMap[connection._id] = {
              _id: otherUserId,
              name: "Unknown User",
              role: otherRole,
            };
          }
        })
      );

      setProfiles(profileMap);
    } catch (error) {
      console.log(error);
    }
  };

  // =====================================================
  // REMOVE CONNECTION
  // =====================================================

  const handleRemoveConnection = async (connectionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this connection?"
    );

    if (!confirmed) return;

    try {
      setRemovingId(connectionId);

      const response = await axios.delete(
        `${API_URL}/connection/remove/${connectionId}`
      );

      if (response.data.success) {
        toast.success("Connection removed successfully");

        setConnections((previous) =>
          previous.filter(
            (connection) =>
              connection._id !== connectionId
          )
        );

        setProfiles((previous) => {
          const updated = { ...previous };

          delete updated[connectionId];

          return updated;
        });
      }
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to remove connection"
      );
    } finally {
      setRemovingId(null);
    }
  };

  // =====================================================
  // FILTER CONNECTIONS
  // =====================================================

  const filteredConnections = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return connections;
    }

    return connections.filter((connection) => {
      const profile = profiles[connection._id];

      if (!profile) return false;

      const searchableText = [
        profile.name,
        profile.email,
        profile.currentCompany,
        profile.jobTitle,
        profile.department,
        profile.degree,
        profile.course,
        profile.branch,
        profile.college,
        profile.location,
        profile.role,
        ...(profile.skills || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchText);
    });
  }, [connections, profiles, search]);

  // =====================================================
  // GET INITIAL
  // =====================================================

  const getInitial = (name) => {
    if (!name) return "?";

    return name
      .trim()
      .charAt(0)
      .toUpperCase();
  };

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="h-9 w-64 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />

            <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />

                  <div className="flex-1">
                    <div className="h-5 w-32 rounded bg-slate-200 dark:bg-slate-800" />

                    <div className="mt-2 h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                  </div>
                </div>

                <div className="mt-6 h-10 rounded-xl bg-slate-200 dark:bg-slate-800" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR STATE
  // =====================================================

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 text-center shadow-xl dark:border-red-900/50 dark:bg-slate-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl dark:bg-red-950/50">
            ⚠️
          </div>

          <h1 className="mt-5 text-xl font-bold">
            Something went wrong
          </h1>

          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            {error}
          </p>

          <button
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700"
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

        {/* HEADER */}

        <section className="mb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/30 dark:text-purple-300">
                <span>👥</span>
                My Network
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                My Connections
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                Manage your professional network and stay
                connected with alumni and students.
              </p>
            </div>

            <Link
              href="/connections/requests"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-3 font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5 hover:from-purple-700 hover:to-purple-800"
            >
              <span>📥</span>
              Connection Requests
            </Link>
          </div>
        </section>

        {/* STATS */}

        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Total Connections
                </p>

                <p className="mt-1 text-3xl font-extrabold">
                  {connections.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl dark:bg-purple-950/50">
                👥
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Showing
                </p>

                <p className="mt-1 text-3xl font-extrabold">
                  {filteredConnections.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-2xl dark:bg-amber-950/40">
                🔎
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Network Status
                </p>

                <p className="mt-1 text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  Active
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl dark:bg-emerald-950/40">
                ✓
              </div>
            </div>
          </div>

        </section>

        {/* SEARCH */}

        <section className="mb-8">
          <div className="relative">

            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl">
              🔎
            </span>

            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search your connections by name, company, course, skills..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-5 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
            />

          </div>
        </section>

        {/* EMPTY STATE */}

        {connections.length === 0 ? (
          <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-4xl dark:bg-purple-950/50">
              👥
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              No connections yet
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
              Start building your professional network by
              connecting with students and alumni.
            </p>

            <Link
              href="/directory"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700"
            >
              Explore Directory
              <span>→</span>
            </Link>

          </section>
        ) : filteredConnections.length === 0 ? (

          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="text-5xl">🔍</div>

            <h2 className="mt-5 text-xl font-bold">
              No connections found
            </h2>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Try searching with a different name,
              company, course or skill.
            </p>

          </section>

        ) : (

          /* CONNECTION CARDS */

          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {filteredConnections.map((connection) => {

              const profile = profiles[connection._id];

              if (!profile) {
                return (
                  <div
                    key={connection._id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="animate-pulse">
                      <div className="h-16 w-16 rounded-full bg-slate-200 dark:bg-slate-800" />

                      <div className="mt-4 h-5 w-32 rounded bg-slate-200 dark:bg-slate-800" />

                      <div className="mt-2 h-4 w-24 rounded bg-slate-200 dark:bg-slate-800" />
                    </div>
                  </div>
                );
              }

              const image = profile.profileImage || "";

              const isAlumni = profile.role === "alumni";

              return (
                <article
                  key={connection._id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >

                  {/* TOP GRADIENT */}

                  <div className="h-24 bg-gradient-to-r from-purple-700 via-purple-600 to-amber-500" />

                  <div className="px-5 pb-5">

                    {/* AVATAR */}

                    <div className="-mt-10 mb-4">

                      {image ? (
                        <img
                          src={image}
                          alt={profile.name || "Profile"}
                          className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-lg dark:border-slate-900"
                        />
                      ) : (
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-purple-600 to-amber-500 text-2xl font-extrabold text-white shadow-lg dark:border-slate-900">
                          {getInitial(profile.name)}
                        </div>
                      )}

                    </div>

                    {/* NAME */}

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <h2 className="line-clamp-1 text-lg font-bold">
                          {profile.name || "Unknown User"}
                        </h2>

                        <p className="mt-1 text-sm font-medium text-purple-600 dark:text-purple-400">
                          {isAlumni ? "Alumni" : "Student"}
                        </p>

                      </div>

                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-400">
                        Connected
                      </span>

                    </div>

                    {/* PROFESSIONAL / ACADEMIC INFO */}

                    <div className="mt-5 space-y-2 text-sm">

                      {isAlumni ? (
                        <>
                          {(profile.jobTitle ||
                            profile.currentCompany) && (
                            <p className="flex gap-2 text-slate-600 dark:text-slate-400">
                              <span>💼</span>

                              <span className="line-clamp-1">
                                {profile.jobTitle || "Professional"}

                                {profile.currentCompany
                                  ? ` at ${profile.currentCompany}`
                                  : ""}
                              </span>
                            </p>
                          )}

                          {profile.location && (
                            <p className="flex gap-2 text-slate-600 dark:text-slate-400">
                              <span>📍</span>

                              <span className="line-clamp-1">
                                {profile.location}
                              </span>
                            </p>
                          )}

                          {profile.department && (
                            <p className="flex gap-2 text-slate-600 dark:text-slate-400">
                              <span>🎓</span>

                              <span className="line-clamp-1">
                                {profile.department}
                              </span>
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          {profile.course && (
                            <p className="flex gap-2 text-slate-600 dark:text-slate-400">
                              <span>🎓</span>

                              <span className="line-clamp-1">
                                {profile.course}
                              </span>
                            </p>
                          )}

                          {profile.college && (
                            <p className="flex gap-2 text-slate-600 dark:text-slate-400">
                              <span>🏫</span>

                              <span className="line-clamp-1">
                                {profile.college}
                              </span>
                            </p>
                          )}

                          {profile.branch && (
                            <p className="flex gap-2 text-slate-600 dark:text-slate-400">
                              <span>📚</span>

                              <span className="line-clamp-1">
                                {profile.branch}
                              </span>
                            </p>
                          )}
                        </>
                      )}

                    </div>

                    {/* SKILLS */}

                    {profile.skills &&
                      profile.skills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">

                          {profile.skills
                            .slice(0, 3)
                            .map((skill, index) => (
                              <span
                                key={`${skill}-${index}`}
                                className="rounded-full bg-purple-50 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                              >
                                {skill}
                              </span>
                            ))}

                          {profile.skills.length > 3 && (
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              +{profile.skills.length - 3}
                            </span>
                          )}

                        </div>
                      )}

                    {/* ACTIONS */}

                    <div className="mt-6 grid grid-cols-2 gap-3">

                      <Link
                        href={
                          isAlumni
                            ? `/directory/alumni/${profile._id}`
                            : `/directory/Students/${profile._id}`
                        }
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold transition hover:border-purple-400 hover:text-purple-600 dark:border-slate-700 dark:hover:border-purple-500 dark:hover:text-purple-400"
                      >
                        View Profile
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          toast.info(
                            "Messaging module will be available soon."
                          )
                        }
                        className="inline-flex items-center justify-center rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-purple-700"
                      >
                        Message
                      </button>

                    </div>

                    {/* REMOVE */}

                    <button
                      type="button"
                      disabled={removingId === connection._id}
                      onClick={() =>
                        handleRemoveConnection(
                          connection._id
                        )
                      }
                      className="mt-3 w-full rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      {removingId === connection._id
                        ? "Removing..."
                        : "Remove Connection"}
                    </button>

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