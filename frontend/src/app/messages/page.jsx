"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";

const API_URL = "http://localhost:5000";

export default function MessagesPage() {
  // =========================================================
  // 1. CURRENT LOGGED-IN USER
  // =========================================================

  const [currentUser, setCurrentUser] = useState(null);

  // =========================================================
  // 2. CONVERSATIONS
  // =========================================================

  const [conversations, setConversations] = useState([]);

  // =========================================================
  // 3. PAGE STATES
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // 4. SEARCH + FILTER
  // =========================================================

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // =========================================================
  // 5. GET LOGGED-IN USER
  // =========================================================

  useEffect(() => {
    const getCurrentUser = () => {
      try {
        // -----------------------------------------------------
        // Check Alumni Login
        // -----------------------------------------------------

        const storedAlumni =
          localStorage.getItem("alumni") ||
          sessionStorage.getItem("alumni");

        if (storedAlumni) {
          const alumni = JSON.parse(storedAlumni);

          if (alumni?._id) {
            setCurrentUser({
              ...alumni,
              role: "alumni",
            });

            return;
          }
        }

        // -----------------------------------------------------
        // Check Student Login
        // -----------------------------------------------------

        const storedUser =
          localStorage.getItem("user") ||
          sessionStorage.getItem("user");

        if (storedUser) {
          const user = JSON.parse(storedUser);

          if (user?._id) {
            setCurrentUser({
              ...user,
              role: user.role || "student",
            });

            return;
          }
        }

        // -----------------------------------------------------
        // No Login
        // -----------------------------------------------------

        setError("Please login to access your messages.");
        setLoading(false);
      } catch (error) {
        console.error("CURRENT USER ERROR:", error);

        setError("Unable to read your login information.");
        setLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  // =========================================================
  // 6. FETCH CONVERSATIONS
  // =========================================================

  useEffect(() => {
    if (!currentUser?._id) {
      return;
    }

    fetchConversations();
  }, [currentUser]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError("");

      // -----------------------------------------------------
      // Get Conversations
      // -----------------------------------------------------

      const response = await axios.get(
        `${API_URL}/message/conversations/${currentUser._id}`
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to load conversations."
        );
      }

      const conversationData = response.data.data || [];

      // -----------------------------------------------------
      // No Conversations
      // -----------------------------------------------------

      if (conversationData.length === 0) {
        setConversations([]);
        return;
      }

      // -----------------------------------------------------
      // Get Profile Information
      // -----------------------------------------------------

      setProfileLoading(true);

      const updatedConversations = await Promise.all(
        conversationData.map(async (conversation) => {
          try {
            let profileResponse;

            // Alumni
            if (conversation.otherRole === "alumni") {
              profileResponse = await axios.get(
                `${API_URL}/alumni/directory/${conversation.otherUserId}`
              );
            }

            // Student
            else {
              profileResponse = await axios.get(
                `${API_URL}/user/getbyid/${conversation.otherUserId}`
              );
            }

            return {
              ...conversation,
              profile:
                profileResponse.data?.data || null,
            };
          } catch (profileError) {
            console.error(
              "PROFILE FETCH ERROR:",
              conversation.otherUserId,
              profileError
            );

            return {
              ...conversation,
              profile: null,
            };
          }
        })
      );

      setConversations(updatedConversations);
    } catch (error) {
      console.error("CONVERSATIONS ERROR:", error);

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to load conversations."
      );
    } finally {
      setLoading(false);
      setProfileLoading(false);
    }
  };

  // =========================================================
  // 7. PROFILE NAME
  // =========================================================

  const getProfileName = (conversation) => {
    return (
      conversation.profile?.name ||
      conversation.profile?.fullName ||
      "Unknown User"
    );
  };

  // =========================================================
  // 8. PROFILE IMAGE
  // =========================================================

  const getProfileImage = (conversation) => {
    return (
      conversation.profile?.profileImage ||
      conversation.profile?.image ||
      ""
    );
  };

  // =========================================================
  // 9. CURRENT USER IMAGE
  // =========================================================

  const getCurrentUserImage = () => {
    return (
      currentUser?.profileImage ||
      currentUser?.image ||
      ""
    );
  };

  // =========================================================
  // 10. GET INITIALS
  // =========================================================

  const getInitials = (name) => {
    if (!name) {
      return "U";
    }

    const words = name.trim().split(/\s+/);

    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }

    return (
      words[0].charAt(0) +
      words[words.length - 1].charAt(0)
    ).toUpperCase();
  };

  // =========================================================
  // 11. FORMAT MESSAGE TIME
  // =========================================================

  const formatTime = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();

    // Today
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Yesterday
    const yesterday = new Date(now);

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    if (
      date.toDateString() ===
      yesterday.toDateString()
    ) {
      return "Yesterday";
    }

    // Older
    return date.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
    });
  };

  // =========================================================
  // 12. ROLE LABEL
  // =========================================================

  const getRoleLabel = (role) => {
    return role === "alumni"
      ? "Alumni"
      : "Student";
  };

  // =========================================================
  // 13. SEARCH + FILTER
  // =========================================================

  const filteredConversations = useMemo(() => {
    const searchText = search
      .trim()
      .toLowerCase();

    return conversations.filter(
      (conversation) => {
        const name = getProfileName(
          conversation
        ).toLowerCase();

        const lastMessage =
          conversation.lastMessage?.toLowerCase() ||
          "";

        const matchesSearch =
          !searchText ||
          name.includes(searchText) ||
          lastMessage.includes(searchText);

        const matchesTab =
          activeTab === "all" ||
          (activeTab === "unread" &&
            Number(
              conversation.unreadCount || 0
            ) > 0);

        return (
          matchesSearch &&
          matchesTab
        );
      }
    );
  }, [
    conversations,
    search,
    activeTab,
  ]);

  // =========================================================
  // 14. TOTAL UNREAD
  // =========================================================

  const unreadTotal = conversations.reduce(
    (total, conversation) => {
      return (
        total +
        Number(
          conversation.unreadCount || 0
        )
      );
    },
    0
  );

  // =========================================================
  // 15. LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
        <div className="flex min-h-[70vh] items-center justify-center px-6">
          <div className="text-center">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600 shadow-xl shadow-purple-500/20">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-white/30 border-t-white" />
            </div>

            <h2 className="text-xl font-bold">
              Loading messages...
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Please wait while we load your conversations.
            </p>

          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // 16. LOGIN REQUIRED
  // =========================================================

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">

        <div className="flex min-h-[70vh] items-center justify-center px-6">

          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900">

            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl dark:bg-purple-500/10">
              🔐
            </div>

            <h1 className="text-2xl font-black">
              Login Required
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Please login to access your conversations
              and messages.
            </p>

            <Link
              href="/login"
              className="mt-7 inline-flex rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5 hover:bg-purple-700"
            >
              Go to Login
            </Link>

          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // 17. MAIN PAGE
  // =========================================================

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">

      <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

        {/* =================================================
            PAGE HEADER
        ================================================== */}

        <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

          {/* LEFT */}

          <div>

            <div className="mb-2 flex items-center gap-2">

              <span className="h-2 w-2 rounded-full bg-green-500" />

              <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                Your Inbox
              </span>

            </div>

            <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
              Conversations
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base dark:text-slate-400">
              Connect with students and alumni,
              share ideas, and grow your professional
              network.
            </p>

          </div>

          {/* =================================================
              CURRENT USER + STATS
          ================================================== */}

          <div className="flex flex-col gap-3 sm:flex-row">

            {/* CURRENT USER */}

            <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              {/* Avatar */}

              <div className="relative">

                <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-sm font-black text-white">

                  {getCurrentUserImage() ? (
                    <img
                      src={getCurrentUserImage()}
                      alt={
                        currentUser.name ||
                        "Current User"
                      }
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(
                      currentUser.name
                    )
                  )}

                </div>

                {/* Online */}

                <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 dark:border-slate-900" />

              </div>

              {/* User Details */}

              <div className="min-w-0">

                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Logged in as
                </p>

                <p className="max-w-[150px] truncate text-sm font-black">
                  {currentUser.name ||
                    "Current User"}
                </p>

                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                  {getRoleLabel(
                    currentUser.role
                  )}
                </p>

              </div>

            </div>

            {/* MESSAGE STATS */}

            <div className="flex w-fit items-center gap-5 rounded-2xl border border-slate-200 bg-white px-5 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              {/* Conversations */}

              <div>

                <p className="text-xs font-semibold text-slate-500">
                  Conversations
                </p>

                <p className="mt-1 text-xl font-black">
                  {conversations.length}
                </p>

              </div>

              <div className="h-9 w-px bg-slate-200 dark:bg-slate-800" />

              {/* Unread */}

              <div>

                <p className="text-xs font-semibold text-slate-500">
                  Unread
                </p>

                <p className="mt-1 text-xl font-black text-purple-600">
                  {unreadTotal}
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">

            <div className="flex items-start gap-3">

              <span className="text-lg">
                ⚠️
              </span>

              <div>

                <p className="font-bold">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm">
                  {error}
                </p>

              </div>

            </div>

          </div>
        )}

        {/* =================================================
            MAIN MESSAGE BOX
        ================================================== */}

        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20">

          {/* SEARCH + FILTER */}

          <div className="border-b border-slate-200 p-4 dark:border-slate-800 sm:p-5">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              {/* SEARCH */}

              <div className="relative w-full lg:max-w-xl">

                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                  ⌕
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search conversations..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-400 focus:bg-white dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600 dark:focus:border-purple-500"
                />

              </div>

              {/* ALL / UNREAD */}

              <div className="flex w-full rounded-xl bg-slate-100 p-1 dark:bg-slate-950 lg:w-auto">

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab("all")
                  }
                  className={`flex-1 rounded-lg px-5 py-2.5 text-sm font-bold transition lg:flex-none ${
                    activeTab === "all"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  All
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setActiveTab("unread")
                  }
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition lg:flex-none ${
                    activeTab === "unread"
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                      : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  }`}
                >
                  Unread

                  {unreadTotal > 0 && (
                    <span
                      className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] ${
                        activeTab === "unread"
                          ? "bg-white text-purple-600"
                          : "bg-purple-600 text-white"
                      }`}
                    >
                      {unreadTotal > 99
                        ? "99+"
                        : unreadTotal}
                    </span>
                  )}

                </button>

              </div>

            </div>

          </div>

          {/* =================================================
              CONVERSATION LIST
          ================================================== */}

          <div>

            {profileLoading &&
              conversations.length > 0 && (
                <div className="border-b border-slate-200 px-5 py-3 text-xs text-slate-500 dark:border-slate-800">
                  Loading profile information...
                </div>
              )}

            {/* EMPTY STATE */}

            {filteredConversations.length === 0 ? (

              <div className="flex min-h-[420px] items-center justify-center px-6">

                <div className="max-w-md text-center">

                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-50 text-4xl dark:bg-slate-800">
                    {search ||
                    activeTab === "unread"
                      ? "🔎"
                      : "💬"}
                  </div>

                  <h3 className="text-xl font-black">
                    {search
                      ? "No conversations found"
                      : activeTab === "unread"
                      ? "No unread messages"
                      : "No conversations yet"}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    {search
                      ? "Try searching with a different name or message."
                      : activeTab === "unread"
                      ? "You're all caught up. There are no unread messages."
                      : "Once you start messaging your connections, your conversations will appear here."}
                  </p>

                  {!search &&
                    activeTab === "all" && (
                      <Link
                        href="/directory"
                        className="mt-6 inline-flex rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5 hover:bg-purple-700"
                      >
                        Explore Directory
                      </Link>
                    )}

                </div>

              </div>

            ) : (

              /* =================================================
                 CONVERSATIONS
              ================================================== */

              <div>

                {filteredConversations.map(
                  (
                    conversation,
                    index
                  ) => {

                    const name =
                      getProfileName(
                        conversation
                      );

                    const image =
                      getProfileImage(
                        conversation
                      );

                    const initials =
                      getInitials(name);

                    const unread =
                      Number(
                        conversation.unreadCount ||
                          0
                      ) > 0;

                    return (
                      <Link
                        key={
                          conversation.otherUserId
                        }
                        href={`/messages/${conversation.otherUserId}`}
                        className={`group block transition hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                          index !==
                          filteredConversations.length -
                            1
                            ? "border-b border-slate-100 dark:border-slate-800"
                            : ""
                        }`}
                      >

                        <div className="flex items-center gap-3 px-4 py-4 sm:gap-4 sm:px-6 sm:py-5">

                          {/* PROFILE */}

                          <div className="relative shrink-0">

                            <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-base font-black text-white shadow-lg sm:h-16 sm:w-16">

                              {image ? (
                                <img
                                  src={image}
                                  alt={name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                initials
                              )}

                            </div>

                            {/* CONNECTED */}

                            <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white bg-green-500 dark:border-slate-900" />

                          </div>

                          {/* CONTENT */}

                          <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-3">

                              <div className="min-w-0">

                                <div className="flex items-center gap-2">

                                  <h3
                                    className={`truncate text-sm sm:text-base ${
                                      unread
                                        ? "font-black"
                                        : "font-bold text-slate-800 dark:text-slate-200"
                                    }`}
                                  >
                                    {name}
                                  </h3>

                                  <span
                                    className={`hidden rounded-full px-2 py-0.5 text-[10px] font-bold sm:inline-flex ${
                                      conversation.otherRole ===
                                      "alumni"
                                        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                                        : "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
                                    }`}
                                  >
                                    {getRoleLabel(
                                      conversation.otherRole
                                    )}
                                  </span>

                                </div>

                                {/* Mobile Role */}

                                <p
                                  className={`mt-0.5 text-[11px] font-semibold sm:hidden ${
                                    conversation.otherRole ===
                                    "alumni"
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-blue-600 dark:text-blue-400"
                                  }`}
                                >
                                  {getRoleLabel(
                                    conversation.otherRole
                                  )}
                                </p>

                              </div>

                              {/* TIME */}

                              <span
                                className={`shrink-0 text-[11px] sm:text-xs ${
                                  unread
                                    ? "font-bold text-purple-600"
                                    : "font-medium text-slate-400 dark:text-slate-500"
                                }`}
                              >
                                {formatTime(
                                  conversation.lastMessageAt
                                )}
                              </span>

                            </div>

                            {/* LAST MESSAGE */}

                            <div className="mt-1.5 flex items-center justify-between gap-3">

                              <p
                                className={`line-clamp-1 min-w-0 text-xs sm:text-sm ${
                                  unread
                                    ? "font-semibold text-slate-700 dark:text-slate-200"
                                    : "text-slate-500"
                                }`}
                              >
                                {conversation.lastMessage ||
                                  "Start a conversation"}
                              </p>

                              {/* UNREAD */}

                              {unread && (
                                <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-purple-600 px-2 text-[10px] font-black text-white shadow-lg shadow-purple-500/20">
                                  {conversation.unreadCount >
                                  99
                                    ? "99+"
                                    : conversation.unreadCount}
                                </span>
                              )}

                            </div>

                          </div>

                          {/* ARROW */}

                          <div className="hidden shrink-0 text-lg text-slate-300 transition duration-300 group-hover:translate-x-1 group-hover:text-purple-500 dark:text-slate-600 dark:group-hover:text-purple-400 sm:block">
                            →
                          </div>

                        </div>

                      </Link>
                    );
                  }
                )}

              </div>

            )}

          </div>

        </div>

        {/* =================================================
            BOTTOM NOTE
        ================================================== */}

        <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">

          <p className="text-xs text-slate-400 dark:text-slate-600">
            Your conversations are limited to your accepted
            connections.
          </p>

          <Link
            href="/connections"
            className="text-xs font-bold text-purple-600 transition hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
          >
            Manage Connections →
          </Link>

        </div>

      </section>

    </main>
  );
}