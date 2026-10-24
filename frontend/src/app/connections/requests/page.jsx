"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-hot-toast";

const API_URL = "http://localhost:5000";

export default function ConnectionRequestsPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);
  const [error, setError] = useState("");

  // =========================================================
  // GET CURRENT LOGGED-IN USER
  // Alumni ko Student se priority di gayi hai.
  // =========================================================
  useEffect(() => {
    const getCurrentUser = () => {
      try {
        let storedUser = null;
        let role = "";

        // =====================================================
        // IMPORTANT:
        // Pehle ALUMNI check karenge.
        // Isse agar old student "user" storage mein pada hai,
        // tab bhi Alumni account priority lega.
        // =====================================================

        const localAlumni = localStorage.getItem("alumni");
        const sessionAlumni = sessionStorage.getItem("alumni");

        const localUser = localStorage.getItem("user");
        const sessionUser = sessionStorage.getItem("user");

        // -----------------------------------------------------
        // 1. Alumni - Local Storage
        // -----------------------------------------------------
        if (localAlumni) {
          storedUser = JSON.parse(localAlumni);
          role = "alumni";
        }

        // -----------------------------------------------------
        // 2. Alumni - Session Storage
        // -----------------------------------------------------
        else if (sessionAlumni) {
          storedUser = JSON.parse(sessionAlumni);
          role = "alumni";
        }

        // -----------------------------------------------------
        // 3. Student - Local Storage
        // -----------------------------------------------------
        else if (localUser) {
          storedUser = JSON.parse(localUser);
          role = storedUser?.role || "student";
        }

        // -----------------------------------------------------
        // 4. Student - Session Storage
        // -----------------------------------------------------
        else if (sessionUser) {
          storedUser = JSON.parse(sessionUser);
          role = storedUser?.role || "student";
        }

        console.log("=================================");
        console.log("REQUESTS - CURRENT USER:", storedUser);
        console.log("REQUESTS - USER ID:", storedUser?._id);
        console.log("REQUESTS - USER ROLE:", role);
        console.log("=================================");

        // -----------------------------------------------------
        // User found
        // -----------------------------------------------------
        if (storedUser?._id) {
          setCurrentUser({
            ...storedUser,
            role,
          });
        } else {
          setError("Please login to view connection requests.");
          setLoading(false);
        }
      } catch (error) {
        console.error("Current user error:", error);

        setError("Unable to read login information.");
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  // =========================================================
  // FETCH REQUESTS
  // =========================================================
  useEffect(() => {
    if (!currentUser?._id) return;

    fetchRequests();
  }, [currentUser]);

  // =========================================================
  // FETCH PENDING REQUESTS
  // =========================================================
  const fetchRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const requestUrl = `${API_URL}/connection/requests/${currentUser._id}`;

      console.log("=================================");
      console.log("REQUEST API:", requestUrl);
      console.log("CURRENT USER:", currentUser);
      console.log("=================================");

      const response = await axios.get(requestUrl);

      console.log("REQUEST API RESPONSE:", response.data);

      if (response.data.success) {
        const requestData = response.data.data || [];

        setRequests(requestData);

        // Fetch sender profiles
        await fetchSenderProfiles(requestData);
      } else {
        setRequests([]);
      }
    } catch (error) {
      console.error("Fetch requests error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load connection requests."
      );

      toast.error("Failed to load connection requests");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH SENDER PROFILE
  // =========================================================
  const fetchSenderProfiles = async (requestData) => {
    try {
      const profileMap = {};

      await Promise.all(
        requestData.map(async (request) => {
          const senderId = request.fromUserId;
          const senderRole = request.fromRole;

          try {
            let response;

            // -------------------------------------------------
            // Alumni sender
            // -------------------------------------------------
            if (senderRole === "alumni") {
              response = await axios.get(
                `${API_URL}/alumni/directory/${senderId}`
              );
            }

            // -------------------------------------------------
            // Student sender
            // -------------------------------------------------
            else {
              response = await axios.get(
                `${API_URL}/user/getbyid/${senderId}`
              );
            }

            if (response.data.success) {
              profileMap[request._id] = {
                ...response.data.data,
                role: senderRole,
              };
            }
          } catch (profileError) {
            console.error(
              "Sender profile error:",
              profileError
            );

            profileMap[request._id] = {
              _id: senderId,
              name: "Unknown User",
              role: senderRole,
            };
          }
        })
      );

      setProfiles(profileMap);
    } catch (error) {
      console.error("Profile loading error:", error);
    }
  };

  // =========================================================
  // ACCEPT REQUEST
  // =========================================================
  const handleAccept = async (requestId) => {
    try {
      setActionId(requestId);

      const response = await axios.put(
        `${API_URL}/connection/accept/${requestId}`
      );

      if (response.data.success) {
        toast.success("Connection request accepted!");

        // Remove accepted request from pending list
        setRequests((previous) =>
          previous.filter(
            (request) => request._id !== requestId
          )
        );

        // Remove its profile data
        setProfiles((previous) => {
          const updated = { ...previous };
          delete updated[requestId];
          return updated;
        });
      }
    } catch (error) {
      console.error("Accept request error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to accept request."
      );
    } finally {
      setActionId(null);
    }
  };

  // =========================================================
  // REJECT REQUEST
  // =========================================================
  const handleReject = async (requestId) => {
    const confirmed = window.confirm(
      "Are you sure you want to reject this connection request?"
    );

    if (!confirmed) return;

    try {
      setActionId(requestId);

      const response = await axios.put(
        `${API_URL}/connection/reject/${requestId}`
      );

      if (response.data.success) {
        toast.success("Connection request rejected.");

        // Remove rejected request from UI
        setRequests((previous) =>
          previous.filter(
            (request) => request._id !== requestId
          )
        );

        // Remove profile
        setProfiles((previous) => {
          const updated = { ...previous };
          delete updated[requestId];
          return updated;
        });
      }
    } catch (error) {
      console.error("Reject request error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to reject request."
      );
    } finally {
      setActionId(null);
    }
  };

  // =========================================================
  // SEARCH
  // =========================================================
  const filteredRequests = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    if (!searchText) {
      return requests;
    }

    return requests.filter((request) => {
      const profile = profiles[request._id];

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
  }, [requests, profiles, search]);

  // =========================================================
  // GET INITIAL
  // =========================================================
  const getInitial = (name) => {
    if (!name) return "?";

    return name
      .trim()
      .charAt(0)
      .toUpperCase();
  };

  // =========================================================
  // LOADING UI
  // =========================================================
  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8">
            <div className="h-9 w-72 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />

            <div className="mt-3 h-5 w-96 max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
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

  // =========================================================
  // ERROR UI
  // =========================================================
  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-slate-900 dark:bg-slate-950 dark:text-white">
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
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700"
          >
            Try Again
          </button>

        </div>
      </main>
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">

      <div className="mx-auto max-w-7xl">

        {/* ================================================
            HEADER
        ================================================= */}
        <section className="mb-8">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 dark:border-purple-900/50 dark:bg-purple-950/30 dark:text-purple-300">
                <span>📥</span>
                Network Requests
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Connection Requests
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
                Review incoming connection requests and grow
                your professional network.
              </p>

            </div>

            <Link
              href="/connections"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold shadow-sm transition hover:border-purple-400 hover:text-purple-600 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-purple-500 dark:hover:text-purple-400"
            >
              ← My Connections
            </Link>

          </div>

        </section>

        {/* ================================================
            STATS
        ================================================= */}
        <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* Pending */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Pending Requests
                </p>

                <p className="mt-1 text-3xl font-extrabold">
                  {requests.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl dark:bg-purple-950/50">
                📥
              </div>

            </div>

          </div>

          {/* Showing */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Showing
                </p>

                <p className="mt-1 text-3xl font-extrabold">
                  {filteredRequests.length}
                </p>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-2xl dark:bg-amber-950/40">
                🔎
              </div>

            </div>

          </div>

          {/* Network */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="flex items-center justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Network
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

        {/* ================================================
            SEARCH
        ================================================= */}
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
              placeholder="Search requests by name, company, course, skills..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-5 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500"
            />

          </div>

        </section>

        {/* ================================================
            NO REQUESTS
        ================================================= */}
        {requests.length === 0 ? (

          <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">

            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 text-4xl dark:bg-purple-950/50">
              📬
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              No connection requests
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-600 dark:text-slate-400">
              You currently have no pending connection
              requests. New requests will appear here.
            </p>

            <Link
              href="/directory"
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition hover:bg-purple-700"
            >
              Explore Directory
              <span>→</span>
            </Link>

          </section>

        ) : filteredRequests.length === 0 ? (

          /* ================================================
             NO SEARCH RESULTS
          ================================================= */
          <section className="rounded-3xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">

            <div className="text-5xl">
              🔍
            </div>

            <h2 className="mt-5 text-xl font-bold">
              No requests found
            </h2>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Try searching with a different name,
              company, course or skill.
            </p>

          </section>

        ) : (

          /* ================================================
             REQUEST CARDS
          ================================================= */
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {filteredRequests.map((request) => {

              const profile = profiles[request._id];

              // Profile loading
              if (!profile) {
                return (
                  <div
                    key={request._id}
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

              const isAlumni =
                profile.role === "alumni";

              return (
                <article
                  key={request._id}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
                >

                  {/* Gradient Header */}
                  <div className="h-24 bg-gradient-to-r from-purple-700 via-purple-600 to-amber-500" />

                  <div className="px-5 pb-5">

                    {/* Profile Image */}
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

                    {/* Name + Role */}
                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <h2 className="line-clamp-1 text-lg font-bold">
                          {profile.name || "Unknown User"}
                        </h2>

                        <p className="mt-1 text-sm font-medium text-purple-600 dark:text-purple-400">
                          {isAlumni ? "Alumni" : "Student"}
                        </p>

                      </div>

                      <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-400">
                        Pending
                      </span>

                    </div>

                    {/* Profile Information */}
                    <div className="mt-5 space-y-2 text-sm">

                      {isAlumni ? (

                        <>
                          {(profile.jobTitle ||
                            profile.currentCompany) && (

                            <p className="flex gap-2 text-slate-600 dark:text-slate-400">
                              <span>💼</span>

                              <span className="line-clamp-1">
                                {profile.jobTitle ||
                                  "Professional"}

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

                    {/* Skills */}
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

                    {/* Buttons */}
                    <div className="mt-6">

                      <Link
                        href={
                          isAlumni
                            ? `/directory/alumni/${profile._id}`
                            : `/directory/Students/${profile._id}`
                        }
                        className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold transition hover:border-purple-400 hover:text-purple-600 dark:border-slate-700 dark:hover:border-purple-500 dark:hover:text-purple-400"
                      >
                        View Profile
                      </Link>

                    </div>

                    {/* Accept / Reject */}
                    <div className="mt-3 grid grid-cols-2 gap-3">

                      <button
                        type="button"
                        disabled={actionId === request._id}
                        onClick={() =>
                          handleAccept(request._id)
                        }
                        className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {actionId === request._id
                          ? "Processing..."
                          : "Accept"}
                      </button>

                      <button
                        type="button"
                        disabled={actionId === request._id}
                        onClick={() =>
                          handleReject(request._id)
                        }
                        className="inline-flex items-center justify-center rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        Reject
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