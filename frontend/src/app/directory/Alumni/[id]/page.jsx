"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-hot-toast";

const API_URL = "http://localhost:5000";

export default function AlumniProfileDetails() {
  const params = useParams();
  const router = useRouter();

  const alumniId = params?.id;

  const [alumni, setAlumni] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
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
        }
      } catch (error) {
        console.log("Login information error:", error);
      }
    };

    getCurrentUser();
  }, []);

  // =====================================================
  // FETCH ALUMNI DETAILS
  // =====================================================

  useEffect(() => {
    const fetchAlumni = async () => {
      if (!alumniId) return;

      try {
        setLoading(true);
        setError("");

        console.log(
          "FETCH ALUMNI:",
          `${API_URL}/alumni/directory/${alumniId}`
        );

        const response = await axios.get(
          `${API_URL}/alumni/directory/${alumniId}`
        );

        if (response.data?.success) {
          setAlumni(response.data.data);
        } else {
          setError("Alumni profile not found.");
        }
      } catch (err) {
        console.error("Failed to fetch alumni:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load alumni profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, [alumniId]);

  // =====================================================
  // CONNECT BUTTON
  // =====================================================

 // =====================================================
// CONNECT BUTTON
// =====================================================

const handleConnect = async () => {
  console.log("=================================");
  console.log("CONNECT BUTTON CLICKED");
  console.log("CURRENT USER:", currentUser);
  console.log("CURRENT USER ID:", currentUser?._id);
  console.log("CURRENT USER ROLE:", currentUser?.role);
  console.log("TARGET ALUMNI ID:", alumniId);
  console.log("=================================");

  // ---------------------------------------------------
  // 1. LOGIN CHECK
  // ---------------------------------------------------

  if (!currentUser?._id) {
    toast.error("Please login first to send a connection request.");
    return;
  }

  // ---------------------------------------------------
  // 2. TARGET ALUMNI CHECK
  // ---------------------------------------------------

  if (!alumniId) {
    toast.error("Alumni ID not found.");
    return;
  }

  // ---------------------------------------------------
  // 3. SELF CONNECTION CHECK
  // ---------------------------------------------------

  if (String(currentUser._id) === String(alumniId)) {
    toast.error("You cannot send a connection request to yourself.");
    return;
  }

  // ---------------------------------------------------
  // 4. PREVENT DOUBLE CLICK
  // ---------------------------------------------------

  if (connecting) {
    return;
  }

  try {
    setConnecting(true);

    // =================================================
    // STEP 1: CHECK ALREADY ACCEPTED CONNECTION
    // =================================================

    const myConnectionsResponse = await axios.get(
      `${API_URL}/connection/my/${currentUser._id}`
    );

    if (myConnectionsResponse.data?.success) {
      const myConnections =
        myConnectionsResponse.data.data || [];

      const alreadyConnected = myConnections.some(
        (connection) => {
          const fromId = String(connection.fromUserId);
          const toId = String(connection.toUserId);
          const targetId = String(alumniId);
          const currentId = String(currentUser._id);

          return (
            (fromId === currentId && toId === targetId) ||
            (fromId === targetId && toId === currentId)
          );
        }
      );

      if (alreadyConnected) {
        toast.success("You are already connected with this alumni. ✓");
        return;
      }
    }

    // =================================================
    // STEP 2: SEND NEW CONNECTION REQUEST
    // =================================================

    console.log("Sending new connection request...");

    const response = await axios.post(
      `${API_URL}/connection/send`,
      {
        fromUserId: currentUser._id,
        fromRole: currentUser.role || "student",

        toUserId: alumniId,
        toRole: "alumni",
      }
    );

    console.log("CONNECT RESPONSE:", response.data);

    if (response.data?.alreadyExists) {
      toast(
        "Connection request already exists. Please wait for the response.",
        {
          icon: "⏳",
        }
      );
      return;
    }

    if (response.data?.success) {
      toast.success(
        "Connection request sent successfully! 🤝"
      );

      return;
    }

    toast.error(
      response.data?.message ||
        "Failed to send connection request."
    );
  } catch (error) {
    console.error("CONNECT ERROR:", error);

    const message =
      error.response?.data?.message ||
      "Failed to send connection request.";

    // =================================================
    // EXISTING REQUEST
    // =================================================

    if (
      message
        .toLowerCase()
        .includes("already exists")
    ) {
      toast(
        "Connection request already exists. Please wait for the response.",
        {
          icon: "⏳",
        }
      );

      return;
    }

    // =================================================
    // ALREADY CONNECTED
    // =================================================

    if (
      message
        .toLowerCase()
        .includes("already connected")
    ) {
      toast.success(
        "You are already connected with this alumni. ✓"
      );

      return;
    }

    // =================================================
    // SELF CONNECTION
    // =================================================

    if (
      message
        .toLowerCase()
        .includes("yourself")
    ) {
      toast.error(
        "You cannot connect with yourself."
      );

      return;
    }

    // =================================================
    // OTHER BACKEND ERROR
    // =================================================

    toast.error(message);
  } finally {
    setConnecting(false);
  }
};

  // =====================================================
  // MESSAGE BUTTON
  // =====================================================

  const handleMessage = () => {
    // toast.info() avoid kiya hai because
    // tumhare current setup mein toast.info error aa raha tha.
    toast.success(
      "Messaging module will be available soon. 💬"
    );
  };

  // =====================================================
  // LOADING STATE
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-white">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="mb-6 h-10 w-40 rounded-xl bg-slate-200 dark:bg-slate-800" />

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="h-56 bg-slate-200 dark:bg-slate-800" />

            <div className="p-6 md:p-10">
              <div className="-mt-20 mb-6 h-32 w-32 rounded-full bg-slate-300 ring-8 ring-white dark:bg-slate-700 dark:ring-slate-900" />

              <div className="h-8 w-64 rounded-lg bg-slate-200 dark:bg-slate-800" />

              <div className="mt-3 h-5 w-48 rounded-lg bg-slate-200 dark:bg-slate-800" />

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
                <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // =====================================================
  // ERROR STATE
  // =====================================================

  if (error || !alumni) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl dark:bg-red-950/40">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Alumni Profile Not Found
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {error ||
              "The requested alumni profile could not be found."}
          </p>

          <Link
            href="/directory/alumni"
            className="mt-7 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105"
          >
            ← Back to Alumni Directory
          </Link>
        </div>
      </main>
    );
  }

  // =====================================================
  // PROFILE IMAGE / INITIALS
  // =====================================================

  const profileImage = alumni.profileImage?.trim();

  const initials =
    alumni.name
      ?.split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "AL";

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* BACK BUTTON */}

        <button
          onClick={() =>
            router.push("/directory/alumni")
          }
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:text-purple-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-purple-700 dark:hover:text-purple-400"
        >
          ← Back to Alumni Directory
        </button>

        {/* MAIN PROFILE CARD */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">

          {/* COVER AREA */}

          <div className="relative h-56 overflow-hidden bg-gradient-to-br from-purple-700 via-purple-600 to-amber-500">

            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />

            <div className="absolute inset-0 bg-black/10" />

            <div className="absolute bottom-6 left-6 right-6">
              <div className="inline-flex rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
                Alumni Professional Profile
              </div>
            </div>
          </div>

          {/* PROFILE HEADER */}

          <div className="px-5 pb-8 sm:px-8 lg:px-10">

            <div className="-mt-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

              {/* PROFILE IDENTITY */}

              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">

                {/* PROFILE IMAGE */}

                <div className="relative">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt={alumni.name || "Alumni"}
                      className="h-32 w-32 rounded-3xl object-cover shadow-2xl ring-8 ring-white dark:ring-slate-900"
                    />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-600 to-amber-500 text-3xl font-bold text-white shadow-2xl ring-8 ring-white dark:ring-slate-900">
                      {initials}
                    </div>
                  )}

                  {alumni.isVerified && (
                    <div
                      className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border-4 border-white bg-emerald-500 text-sm text-white dark:border-slate-900"
                      title="Verified Alumni"
                    >
                      ✓
                    </div>
                  )}
                </div>

                {/* NAME */}

                <div className="pb-1">

                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                      {alumni.name || "Alumni"}
                    </h1>

                    {alumni.isVerified && (
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-base font-medium text-slate-600 dark:text-slate-400">
                    {alumni.jobTitle || "Professional"}

                    {alumni.currentCompany
                      ? ` • ${alumni.currentCompany}`
                      : ""}
                  </p>

                  {alumni.location && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      📍 {alumni.location}
                    </p>
                  )}
                </div>
              </div>

              {/* ACTION BUTTONS */}

              <div className="flex flex-wrap gap-3">

                <button
                  type="button"
                  onClick={handleConnect}
                  disabled={connecting}
                  data-connection-button="true"
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {connecting ? (
                    "Sending..."
                  ) : (
                    <>
                      🤝 Connect
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleMessage}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:text-purple-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-purple-600 dark:hover:text-purple-400"
                >
                  💬 Message
                </button>

              </div>
            </div>

            {/* PROFILE INFORMATION */}

            <div className="mt-10 grid gap-6 lg:grid-cols-3">

              {/* LEFT COLUMN */}

              <div className="space-y-6 lg:col-span-2">

                {/* ABOUT */}

                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">

                  <div className="mb-5 flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-lg dark:bg-purple-950/50">
                      👋
                    </div>

                    <div>
                      <h2 className="text-lg font-bold">
                        About
                      </h2>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Professional introduction
                      </p>
                    </div>

                  </div>

                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {alumni.bio ||
                      "This alumni has not added a professional biography yet."}
                  </p>

                </section>

                {/* EDUCATION */}

                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">

                  <div className="mb-6 flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-lg dark:bg-amber-950/50">
                      🎓
                    </div>

                    <div>
                      <h2 className="text-lg font-bold">
                        Education
                      </h2>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Academic background
                      </p>
                    </div>

                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">

                    <InfoBox
                      icon="🎓"
                      label="Degree"
                      value={
                        alumni.degree || "Not specified"
                      }
                    />

                    <InfoBox
                      icon="🏢"
                      label="Department"
                      value={
                        alumni.department ||
                        "Not specified"
                      }
                    />

                    <InfoBox
                      icon="📅"
                      label="Graduation Year"
                      value={
                        alumni.graduationYear ||
                        "Not specified"
                      }
                    />

                  </div>

                </section>

                {/* PROFESSIONAL */}

                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">

                  <div className="mb-6 flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg dark:bg-blue-950/50">
                      💼
                    </div>

                    <div>
                      <h2 className="text-lg font-bold">
                        Professional Information
                      </h2>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Current career details
                      </p>
                    </div>

                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">

                    <InfoBox
                      icon="💼"
                      label="Job Title"
                      value={
                        alumni.jobTitle ||
                        "Not specified"
                      }
                    />

                    <InfoBox
                      icon="🏢"
                      label="Company"
                      value={
                        alumni.currentCompany ||
                        "Not specified"
                      }
                    />

                    <InfoBox
                      icon="⏳"
                      label="Experience"
                      value={
                        alumni.experience !== undefined &&
                        alumni.experience !== null
                          ? `${alumni.experience} years`
                          : "Not specified"
                      }
                    />

                    <InfoBox
                      icon="📍"
                      label="Location"
                      value={
                        alumni.location ||
                        "Not specified"
                      }
                    />

                  </div>

                </section>

                {/* SKILLS */}

                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">

                  <div className="mb-5 flex items-center gap-3">

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-lg dark:bg-purple-950/50">
                      🛠️
                    </div>

                    <div>
                      <h2 className="text-lg font-bold">
                        Skills
                      </h2>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Areas of expertise
                      </p>
                    </div>

                  </div>

                  {alumni.skills?.length > 0 ? (
                    <div className="flex flex-wrap gap-2">

                      {alumni.skills.map(
                        (skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            className="rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
                          >
                            {skill}
                          </span>
                        )
                      )}

                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No skills added yet.
                    </p>
                  )}

                </section>

              </div>

              {/* RIGHT SIDEBAR */}

              <aside className="space-y-6">

                {/* CONTACT */}

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

                  <h2 className="text-lg font-bold">
                    Contact Information
                  </h2>

                  <div className="mt-5 space-y-4">

                    <ContactItem
                      icon="📧"
                      label="Email"
                      value={alumni.email}
                    />

                    <ContactItem
                      icon="📱"
                      label="Phone"
                      value={alumni.phone}
                    />

                  </div>

                </section>

                {/* SOCIAL LINKS */}

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

                  <h2 className="text-lg font-bold">
                    Social & Professional Links
                  </h2>

                  <div className="mt-5 space-y-3">

                    {alumni.linkedin ? (
                      <a
                        href={alumni.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:border-blue-400 hover:bg-blue-50 dark:border-slate-700 dark:hover:border-blue-700 dark:hover:bg-blue-950/20"
                      >
                        <span className="flex items-center gap-3 text-sm font-semibold">
                          <span className="text-xl">
                            🔗
                          </span>
                          LinkedIn
                        </span>

                        <span>↗</span>
                      </a>
                    ) : (
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        LinkedIn profile not added.
                      </p>
                    )}

                  </div>

                </section>

                {/* QUICK INFO */}

                <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-700 via-purple-600 to-amber-500 p-6 text-white shadow-xl">

                  <p className="text-xs font-bold uppercase tracking-widest text-white/70">
                    Alumni Network
                  </p>

                  <h2 className="mt-3 text-xl font-bold">
                    Build meaningful professional connections.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-white/80">
                    Connect with alumni, exchange
                    knowledge, explore career
                    opportunities and grow together.
                  </p>

                  <button
                    type="button"
                    onClick={handleConnect}
                    disabled={connecting}
                    className="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-purple-700 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {connecting
                      ? "Sending..."
                      : "🤝 Connect with Alumni"}
                  </button>

                </section>

              </aside>

            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// =====================================================
// REUSABLE INFO BOX
// =====================================================

function InfoBox({ icon, label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">

      <div className="flex items-start gap-3">

        <span className="text-xl">
          {icon}
        </span>

        <div className="min-w-0">

          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-bold text-slate-800 dark:text-slate-200">
            {value}
          </p>

        </div>

      </div>
    </div>
  );
}

// =====================================================
// CONTACT ITEM
// =====================================================

function ContactItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">

      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-all text-sm font-semibold text-slate-800 dark:text-slate-200">
          {value || "Not provided"}
        </p>

      </div>

    </div>
  );
}