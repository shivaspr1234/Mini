"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

const API_URL = "http://localhost:5000";

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();

  const userId = params?.userId;

  // =========================================================
  // 1. CURRENT LOGGED-IN USER
  // =========================================================

  const [currentUser, setCurrentUser] = useState(null);

  // =========================================================
  // 2. OTHER USER
  // =========================================================

  const [otherUser, setOtherUser] = useState(null);
  const [otherRole, setOtherRole] = useState("");

  // =========================================================
  // 3. MESSAGES
  // =========================================================

  const [messages, setMessages] = useState([]);

  // =========================================================
  // 4. PAGE STATES
  // =========================================================

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  // =========================================================
  // 5. MESSAGE INPUT
  // =========================================================

  const [messageText, setMessageText] = useState("");

  // =========================================================
  // 6. CHAT ACTIONS
  // =========================================================

  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");

  // =========================================================
  // 7. REFS
  // =========================================================

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const moreMenuRef = useRef(null);

  // =========================================================
  // 8. EMOJIS
  // =========================================================

  const emojis = [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "🙂",
    "😉",
    "😍",
    "🥰",
    "😘",
    "😎",
    "🤝",
    "👍",
    "👏",
    "🙏",
    "🔥",
    "❤️",
    "💯",
    "🎉",
    "🚀",
    "💡",
    "⭐",
    "🙌",
    "😇",
    "🤗",
    "😮",
    "😢",
    "😡",
  ];

  // =========================================================
  // 9. GET CURRENT LOGGED-IN USER
  // =========================================================

  useEffect(() => {
    try {
      const storedAlumni =
        localStorage.getItem("alumni") ||
        sessionStorage.getItem("alumni");

      const storedUser =
        localStorage.getItem("user") ||
        sessionStorage.getItem("user");

      // Alumni
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

      // Student
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

      setError("Please login to access messages.");
      setLoading(false);
    } catch (err) {
      console.error("CURRENT USER ERROR:", err);

      setError("Unable to read your login information.");
      setLoading(false);
    }
  }, []);

  // =========================================================
  // 10. LOAD CHAT
  // =========================================================

  useEffect(() => {
    if (!currentUser?._id || !userId) {
      return;
    }

    loadChat();
  }, [currentUser, userId]);

  const loadChat = async () => {
    try {
      setLoading(true);
      setError("");

      // -------------------------------------------------------
      // GET CONVERSATION
      // -------------------------------------------------------

      const conversationResponse = await axios.get(
        `${API_URL}/message/conversation/${currentUser._id}/${userId}`
      );

      if (!conversationResponse.data?.success) {
        throw new Error(
          conversationResponse.data?.message ||
            "Failed to load conversation."
        );
      }

      setMessages(conversationResponse.data.data || []);

      // -------------------------------------------------------
      // GET OTHER USER PROFILE
      // -------------------------------------------------------

      try {
        const alumniResponse = await axios.get(
          `${API_URL}/alumni/directory/${userId}`
        );

        if (alumniResponse.data?.success) {
          setOtherUser(alumniResponse.data.data);
          setOtherRole("alumni");
        }
      } catch (alumniError) {
        try {
          const studentResponse = await axios.get(
            `${API_URL}/user/getbyid/${userId}`
          );

          if (studentResponse.data?.success) {
            setOtherUser(studentResponse.data.data);
            setOtherRole("student");
          }
        } catch (studentError) {
          console.error(
            "OTHER USER PROFILE ERROR:",
            studentError
          );
        }
      }

      // -------------------------------------------------------
      // MARK MESSAGES AS READ
      // -------------------------------------------------------

      try {
        await axios.put(`${API_URL}/message/read`, {
          userId: currentUser._id,
          otherUserId: userId,
        });
      } catch (readError) {
        console.error("MARK READ ERROR:", readError);
      }
    } catch (err) {
      console.error("LOAD CHAT ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load chat."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // 11. AUTO SCROLL
  // =========================================================

  useEffect(() => {
    if (!loading) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    }
  }, [messages, loading]);

  // =========================================================
  // 12. CLOSE MORE MENU WHEN CLICKING OUTSIDE
  // =========================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        moreMenuRef.current &&
        !moreMenuRef.current.contains(event.target)
      ) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // =========================================================
  // 13. SEND MESSAGE
  // =========================================================

  const handleSendMessage = async (event) => {
    event?.preventDefault();

    const cleanMessage = messageText.trim();

    if (!cleanMessage) {
      return;
    }

    if (!currentUser?._id || !userId) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const response = await axios.post(
        `${API_URL}/message/send`,
        {
          senderId: currentUser._id,
          senderRole: currentUser.role || "student",

          receiverId: userId,
          receiverRole: otherRole || "student",

          message: cleanMessage,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message ||
            "Failed to send message."
        );
      }

      if (response.data?.data) {
        setMessages((previousMessages) => [
          ...previousMessages,
          response.data.data,
        ]);
      }

      setMessageText("");
      setShowEmojiPicker(false);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    } catch (err) {
      console.error("SEND MESSAGE ERROR:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to send message."
      );
    } finally {
      setSending(false);
    }
  };

  // =========================================================
  // 14. ENTER KEY
  // =========================================================

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (!sending && messageText.trim()) {
        handleSendMessage(event);
      }
    }
  };

  // =========================================================
  // 15. EMOJI
  // =========================================================

  const handleEmojiClick = (emoji) => {
    setMessageText((previous) => previous + emoji);
  };

  // =========================================================
  // 16. FILE SELECT
  // =========================================================

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // 10 MB limit
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setSelectedFile(file);

    // Image preview
    if (file.type.startsWith("image/")) {
      const previewUrl = URL.createObjectURL(file);
      setFilePreview(previewUrl);
    } else {
      setFilePreview("");
    }
  };

  // =========================================================
  // 17. REMOVE FILE
  // =========================================================

  const removeSelectedFile = () => {
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
    }

    setSelectedFile(null);
    setFilePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // =========================================================
  // 18. ATTACHMENT BUTTON
  // =========================================================

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // =========================================================
  // 19. HELPERS
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

  const getOtherUserName = () => {
    return (
      otherUser?.name ||
      otherUser?.fullName ||
      "Unknown User"
    );
  };

  const getOtherUserImage = () => {
    return (
      otherUser?.profileImage ||
      otherUser?.image ||
      ""
    );
  };

  const getRoleLabel = (role) => {
    return role === "alumni" ? "Alumni" : "Student";
  };

  const formatMessageTime = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // 20. CURRENT USER NAME
  // =========================================================

  const currentUserName = useMemo(() => {
    return (
      currentUser?.name ||
      currentUser?.fullName ||
      "You"
    );
  }, [currentUser]);

  // =========================================================
  // 21. CURRENT USER IMAGE
  // =========================================================

  const currentUserImage = useMemo(() => {
    return (
      currentUser?.profileImage ||
      currentUser?.image ||
      ""
    );
  }, [currentUser]);

  // =========================================================
  // 22. FILE SIZE
  // =========================================================

  const getFileSize = (size) => {
    if (!size) {
      return "";
    }

    if (size < 1024) {
      return `${size} B`;
    }

    if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    }

    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  // =========================================================
  // 23. LOADING SCREEN
  // =========================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-600 shadow-xl shadow-purple-500/20">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-white/30 border-t-white" />
            </div>

            <h2 className="text-xl font-bold">
              Loading conversation...
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Please wait while we open your chat.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // 24. LOGIN REQUIRED
  // =========================================================

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
        <div className="flex min-h-screen items-center justify-center px-6">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl dark:bg-purple-500/10">
              🔐
            </div>

            <h1 className="text-2xl font-black">
              Login Required
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Please login to access your messages.
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
  // 25. MAIN CHAT UI
  // =========================================================

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-3 py-3 sm:px-5 sm:py-5 lg:px-8">
        <div className="flex min-h-[calc(100vh-1.5rem)] flex-1 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30 sm:min-h-[calc(100vh-2.5rem)]">

          {/* =====================================================
              CHAT HEADER
          ===================================================== */}

          <header className="border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">

              {/* LEFT SIDE */}

              <div className="flex min-w-0 items-center gap-3">

                {/* BACK */}

                <button
                  type="button"
                  onClick={() => router.push("/messages")}
                  aria-label="Back to messages"
                  title="Back to messages"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-lg text-slate-600 transition hover:bg-slate-100 hover:text-purple-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-purple-400"
                >
                  ←
                </button>

                {/* OTHER USER AVATAR */}

                <div className="relative shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-sm font-black text-white shadow-lg">
                    {getOtherUserImage() ? (
                      <img
                        src={getOtherUserImage()}
                        alt={getOtherUserName()}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(getOtherUserName())
                    )}
                  </div>

                  <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full border-2 border-white bg-green-500 dark:border-slate-900" />
                </div>

                {/* USER INFO */}

                <div className="min-w-0">
                  <h1 className="truncate text-sm font-black sm:text-base">
                    {getOtherUserName()}
                  </h1>

                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {getRoleLabel(otherRole)}
                    </span>

                    <span className="hidden text-xs text-slate-300 dark:text-slate-700 sm:inline">
                      •
                    </span>

                    <span className="hidden text-xs font-medium text-green-600 dark:text-green-400 sm:inline">
                      Connected
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE */}

              <div className="flex items-center gap-2">

                {/* CURRENT USER */}

                <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-950 sm:flex">
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-[10px] font-black text-white">
                    {currentUserImage ? (
                      <img
                        src={currentUserImage}
                        alt={currentUserName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(currentUserName)
                    )}
                  </div>

                  <div className="max-w-28">
                    <p className="truncate text-xs font-bold">
                      {currentUserName}
                    </p>

                    <p className="text-[10px] capitalize text-slate-500">
                      {currentUser.role}
                    </p>
                  </div>
                </div>

                {/* MORE MENU */}

                <div
                  ref={moreMenuRef}
                  className="relative"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setShowMoreMenu((previous) => !previous)
                    }
                    aria-label="More chat options"
                    title="More options"
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl font-bold text-slate-600 transition hover:bg-slate-100 hover:text-purple-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-purple-400"
                  >
                    ⋮
                  </button>

                  {showMoreMenu && (
                    <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-slate-700 dark:bg-slate-900">

                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);
                          alert(
                            "Conversation search feature will be connected next."
                          );
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <span className="text-lg">🔍</span>
                        Search Conversation
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);
                          alert(
                            "Mute conversation feature will be connected next."
                          );
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <span className="text-lg">🔕</span>
                        Mute Conversation
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowMoreMenu(false);
                          alert(
                            "Block user feature will be connected later."
                          );
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                      >
                        <span className="text-lg">🚫</span>
                        Block User
                      </button>

                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* CURRENT USER MOBILE INFO */}

            <div className="border-t border-slate-100 px-4 py-2.5 dark:border-slate-800 sm:hidden">
              <div className="flex items-center gap-2">

                <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 text-[9px] font-black text-white">
                  {currentUserImage ? (
                    <img
                      src={currentUserImage}
                      alt={currentUserName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(currentUserName)
                  )}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-[11px] font-bold">
                    Logged in as {currentUserName}
                  </p>

                  <p className="text-[10px] capitalize text-slate-500">
                    {currentUser.role}
                  </p>
                </div>

                <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-green-600 dark:text-green-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Active
                </span>
              </div>
            </div>
          </header>

          {/* =====================================================
              ERROR
          ===================================================== */}

          {error && (
            <div className="mx-4 mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300 sm:mx-6">
              <div className="flex items-start gap-3">
                <span>⚠️</span>

                <div className="min-w-0">
                  <p className="text-sm font-bold">
                    Something went wrong
                  </p>

                  <p className="mt-1 text-xs">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =====================================================
              MESSAGES AREA
          ===================================================== */}

          <div className="flex-1 overflow-y-auto bg-slate-50/70 px-3 py-5 dark:bg-slate-950/50 sm:px-6 sm:py-6">

            {/* CHAT INTRO */}

            <div className="mx-auto mb-6 max-w-md text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-xl dark:bg-purple-500/10">
                💬
              </div>

              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Conversation with {getOtherUserName()}
              </p>

              <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-600">
                Messages are available to your accepted connections.
              </p>
            </div>

            {/* EMPTY CHAT */}

            {messages.length === 0 ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <div className="max-w-sm text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-2xl shadow-lg dark:bg-slate-900">
                    👋
                  </div>

                  <h2 className="text-lg font-black">
                    Start the conversation
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                    Send a message to{" "}
                    <span className="font-bold text-purple-600 dark:text-purple-400">
                      {getOtherUserName()}
                    </span>{" "}
                    and start networking.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mx-auto max-w-4xl space-y-4">

                {messages.map((message) => {
                  const isMine =
                    String(message.senderId) ===
                    String(currentUser._id);

                  return (
                    <div
                      key={message._id}
                      className={`flex ${
                        isMine
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`flex max-w-[88%] items-end gap-2 sm:max-w-[70%] ${
                          isMine
                            ? "flex-row-reverse"
                            : "flex-row"
                        }`}
                      >

                        {/* MESSAGE AVATAR */}

                        <div className="hidden h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-[10px] font-black text-white sm:flex">

                          {isMine ? (
                            currentUserImage ? (
                              <img
                                src={currentUserImage}
                                alt={currentUserName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              getInitials(currentUserName)
                            )
                          ) : getOtherUserImage() ? (
                            <img
                              src={getOtherUserImage()}
                              alt={getOtherUserName()}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            getInitials(getOtherUserName())
                          )}

                        </div>

                        {/* BUBBLE */}

                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm ${
                            isMine
                              ? "rounded-br-md bg-purple-600 text-white"
                              : "rounded-bl-md border border-slate-200 bg-white text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                          }`}
                        >

                          <p className="whitespace-pre-wrap break-words text-sm leading-6">
                            {message.message}
                          </p>

                          <div
                            className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
                              isMine
                                ? "text-purple-100"
                                : "text-slate-400 dark:text-slate-500"
                            }`}
                          >
                            <span>
                              {formatMessageTime(
                                message.createdAt
                              )}
                            </span>

                            {isMine && (
                              <span
                                className={
                                  message.isRead
                                    ? "text-blue-200"
                                    : "text-purple-200"
                                }
                                title={
                                  message.isRead
                                    ? "Read"
                                    : "Sent"
                                }
                              >
                                {message.isRead
                                  ? "✓✓"
                                  : "✓"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* =====================================================
              FILE PREVIEW
          ===================================================== */}

          {selectedFile && (
            <div className="border-t border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-950 sm:px-4">

              <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-2xl border border-purple-200 bg-white p-3 dark:border-purple-500/20 dark:bg-slate-900">

                {/* PREVIEW */}

                {filePreview ? (
                  <img
                    src={filePreview}
                    alt="Selected file preview"
                    className="h-16 w-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-2xl dark:bg-purple-500/10">
                    📄
                  </div>
                )}

                {/* FILE INFO */}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">
                    {selectedFile.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {getFileSize(selectedFile.size)}
                  </p>
                </div>

                {/* REMOVE */}

                <button
                  type="button"
                  onClick={removeSelectedFile}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                  aria-label="Remove selected file"
                  title="Remove file"
                >
                  ×
                </button>
              </div>

              <p className="mx-auto mt-2 max-w-4xl px-1 text-[10px] text-amber-600 dark:text-amber-400">
                Attachment preview ready. Actual file upload will be connected in the next backend step.
              </p>
            </div>
          )}

          {/* =====================================================
              MESSAGE INPUT
          ===================================================== */}

          <div className="border-t border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:p-4">

            <form
              onSubmit={handleSendMessage}
              className="mx-auto max-w-4xl"
            >

              {/* EMOJI PICKER */}

              {showEmojiPicker && (
                <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-900">

                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      Select Emoji
                    </p>

                    <button
                      type="button"
                      onClick={() =>
                        setShowEmojiPicker(false)
                      }
                      className="text-sm text-slate-400 hover:text-slate-700 dark:hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-8 gap-1 sm:grid-cols-10">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() =>
                          handleEmojiClick(emoji)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-xl transition hover:bg-slate-100 hover:scale-110 dark:hover:bg-slate-800"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 transition focus-within:border-purple-400 focus-within:ring-4 focus-within:ring-purple-500/10 dark:border-slate-700 dark:bg-slate-950 dark:focus-within:border-purple-500">

                {/* EMOJI BUTTON */}

                <button
                  type="button"
                  onClick={() =>
                    setShowEmojiPicker(
                      (previous) => !previous
                    )
                  }
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl transition hover:bg-white dark:hover:bg-slate-800"
                  aria-label="Emoji"
                  title="Add emoji"
                >
                  😊
                </button>

                {/* FILE INPUT */}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf,.doc,.docx,.txt,.zip"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {/* ATTACHMENT BUTTON */}

                <button
                  type="button"
                  onClick={openFilePicker}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl text-slate-500 transition hover:bg-white hover:text-purple-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-purple-400"
                  aria-label="Attach file"
                  title="Attach file"
                >
                  📎
                </button>

                {/* TEXTAREA */}

                <textarea
                  value={messageText}
                  onChange={(event) =>
                    setMessageText(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  rows={1}
                  maxLength={2000}
                  placeholder={`Message ${getOtherUserName()}...`}
                  className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-600"
                />

                {/* SEND */}

                <button
                  type="submit"
                  disabled={
                    sending ||
                    !messageText.trim()
                  }
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-lg font-bold text-white shadow-lg shadow-purple-500/20 transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                  title="Send message"
                >
                  {sending ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : (
                    "➤"
                  )}
                </button>
              </div>

              {/* INPUT FOOTER */}

              <div className="mt-2 flex items-center justify-between px-1">

                <p className="text-[10px] text-slate-400 dark:text-slate-600">
                  Enter to send • Shift + Enter for new line
                </p>

                <p className="text-[10px] text-slate-400 dark:text-slate-600">
                  {messageText.length}/2000
                </p>

              </div>

            </form>
          </div>
        </div>
      </div>
    </main>
  );
}