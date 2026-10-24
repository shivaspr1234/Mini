"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function StudentProfileDetails() {
  const params = useParams();
  const router = useRouter();

  const studentId = params?.id;

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [connecting, setConnecting] = useState(false);

  // =====================================================
  // FETCH STUDENT DETAILS
  // =====================================================

  useEffect(() => {
    const fetchStudent = async () => {
      if (!studentId) return;

      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `http://localhost:5000/user/getbyid/${studentId}`
        );

        if (response.data?.success && response.data?.data) {
          setStudent(response.data.data);
        } else {
          setError("Student profile not found.");
        }
      } catch (err) {
        console.error("Student profile error:", err);

        setError(
          err.response?.data?.message ||
            "Unable to load student profile."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  // =====================================================
  // CONNECT
  // =====================================================

  const handleConnect = async () => {
    if (connecting) return;

    try {
      setConnecting(true);

      // ==================================================
      // GET CURRENT LOGGED-IN USER
      // ==================================================

      let currentUser = null;

      const storedUser =
        localStorage.getItem("user") ||
        sessionStorage.getItem("user");

      const storedAlumni =
        localStorage.getItem("alumni") ||
        sessionStorage.getItem("alumni");

      try {
        if (storedUser) {
          currentUser = JSON.parse(storedUser);
        } else if (storedAlumni) {
          currentUser = JSON.parse(storedAlumni);
        }
      } catch (storageError) {
        console.error(
          "User storage parsing error:",
          storageError
        );

        toast.error("Please login again.");
        return;
      }

      // ==================================================
      // LOGIN CHECK
      // ==================================================

      if (!currentUser?._id) {
        toast.error("Please login first.");
        return;
      }

      // ==================================================
      // STUDENT CHECK
      // ==================================================

      if (!student?._id) {
        toast.error("Student profile not found.");
        return;
      }

      // ==================================================
      // SELF CONNECTION CHECK
      // ==================================================

      if (
        String(currentUser._id) ===
        String(student._id)
      ) {
        toast.error(
          "You cannot send a connection request to yourself."
        );
        return;
      }

      // ==================================================
      // ROLE CHECK
      // ==================================================

      const fromRole =
        currentUser.role === "alumni"
          ? "alumni"
          : "student";

      // ==================================================
      // SEND CONNECTION REQUEST
      // ==================================================

      const response = await axios.post(
        "http://localhost:5000/connection/send",
        {
          fromUserId: currentUser._id,
          fromRole: fromRole,
          toUserId: student._id,
          toRole: "student",
        }
      );

      // ==================================================
      // SUCCESS
      // ==================================================

      if (response.data?.success) {
        toast.success(
          `Connection request sent to ${
            student.name || "student"
          } successfully! 🤝`
        );
      } else {
        toast.error(
          response.data?.message ||
            "Failed to send connection request."
        );
      }
    } catch (err) {
      console.error(
        "Connection request error:",
        err
      );

      const message =
        err.response?.data?.message ||
        "Failed to send connection request.";

      const lowerMessage =
        message.toLowerCase();

      // ==================================================
      // DUPLICATE REQUEST
      // ==================================================

      if (
        lowerMessage.includes(
          "already exists"
        )
      ) {
        toast.error(
          "Connection request already exists."
        );
        return;
      }

      // ==================================================
      // ALREADY CONNECTED
      // ==================================================

      if (
        lowerMessage.includes(
          "already connected"
        )
      ) {
        toast.success(
          "You are already connected with this student. 🤝"
        );
        return;
      }

      // ==================================================
      // SELF CONNECTION
      // ==================================================

      if (
        lowerMessage.includes(
          "yourself"
        )
      ) {
        toast.error(
          "You cannot send a connection request to yourself."
        );
        return;
      }

      // ==================================================
      // OTHER ERROR
      // ==================================================

      toast.error(message);
    } finally {
      setConnecting(false);
    }
  };

  // =====================================================
  // MESSAGE
  // =====================================================

  const handleMessage = () => {
    toast.success(
      "Messaging feature coming soon!"
    );
  };

  // =====================================================
  // INITIALS
  // =====================================================

  const getInitials = (name) => {
    if (!name) return "ST";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl animate-pulse">
          <div className="mb-6 h-10 w-48 rounded-xl bg-slate-200 dark:bg-slate-800" />

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="h-56 bg-slate-200 dark:bg-slate-800" />

            <div className="p-6 md:p-10">
              <div className="-mt-20 mb-6 h-32 w-32 rounded-3xl bg-slate-300 ring-8 ring-white dark:bg-slate-700 dark:ring-slate-900" />

              <div className="h-9 w-64 rounded-lg bg-slate-200 dark:bg-slate-800" />

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
  // ERROR
  // =====================================================

  if (error || !student) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl dark:bg-red-950/40">
            ⚠️
          </div>

          <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">
            Student Profile Not Found
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            {error ||
              "The requested student profile could not be found."}
          </p>

          <Link
            href="/directory/Students"
            className="mt-7 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-purple-600 to-amber-500 px-6 py-3 font-semibold text-white shadow-lg transition hover:scale-105"
          >
            ← Back to Student Directory
          </Link>
        </div>
      </main>
    );
  }

  const initials = getInitials(student.name);

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* =================================================
            BACK BUTTON
        ================================================== */}

        <button
          type="button"
          onClick={() =>
            router.push("/directory/Students")
          }
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:text-purple-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-purple-700 dark:hover:text-purple-400"
        >
          ← Back to Student Directory
        </button>

        {/* =================================================
            PROFILE CARD
        ================================================== */}

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">

          {/* =================================================
              COVER
          ================================================== */}

          <div className="relative h-56 overflow-hidden bg-gradient-to-br from-purple-700 via-purple-600 to-amber-500">
            <div className="absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

            <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl" />

            <div className="absolute inset-0 bg-black/10" />

            <div className="absolute bottom-6 left-6 right-6">
              <div className="inline-flex rounded-full border border-white/30 bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur-md">
                Student Professional Profile
              </div>
            </div>
          </div>

          {/* =================================================
              HEADER
          ================================================== */}

          <div className="px-5 pb-8 sm:px-8 lg:px-10">
            <div className="-mt-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">

              {/* =================================================
                  IDENTITY
              ================================================== */}

              <div className="flex flex-col gap-5 sm:flex-row sm:items-end">

                {/* IMAGE */}

                <div>
                  {student.profileImage ? (
                    <img
                      src={student.profileImage}
                      alt={
                        student.name ||
                        "Student"
                      }
                      className="h-32 w-32 rounded-3xl object-cover shadow-2xl ring-8 ring-white dark:ring-slate-900"
                    />
                  ) : (
                    <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-600 to-amber-500 text-3xl font-extrabold text-white shadow-2xl ring-8 ring-white dark:ring-slate-900">
                      {initials}
                    </div>
                  )}
                </div>

                {/* NAME */}

                <div className="pb-1">
                  <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                    {student.name ||
                      "Student"}
                  </h1>

                  <p className="mt-2 text-base font-medium text-slate-600 dark:text-slate-400">
                    {student.course ||
                      "Student"}

                    {student.branch
                      ? ` • ${student.branch}`
                      : ""}
                  </p>

                  {student.college && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      🏫 {student.college}
                    </p>
                  )}
                </div>
              </div>

              {/* =================================================
                  ACTIONS
              ================================================== */}

              <div className="flex flex-wrap gap-3">

                {/* CONNECT */}

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

                {/* MESSAGE */}

                <button
                  type="button"
                  onClick={handleMessage}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-purple-300 hover:text-purple-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-purple-600 dark:hover:text-purple-400"
                >
                  💬 Message
                </button>
              </div>
            </div>

            {/* =================================================
                CONTENT
            ================================================== */}

            <div className="mt-10 grid gap-6 lg:grid-cols-3">

              {/* =================================================
                  LEFT
              ================================================== */}

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
                        Student introduction
                      </p>
                    </div>
                  </div>

                  <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {student.bio ||
                      "This student has not added a biography yet."}
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
                        Academic Information
                      </h2>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Education details
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <InfoBox
                      icon="🏫"
                      label="College"
                      value={
                        student.college ||
                        "Not specified"
                      }
                    />

                    <InfoBox
                      icon="🎓"
                      label="Course"
                      value={
                        student.course ||
                        "Not specified"
                      }
                    />

                    <InfoBox
                      icon="📚"
                      label="Branch"
                      value={
                        student.branch ||
                        "Not specified"
                      }
                    />

                    <InfoBox
                      icon="📅"
                      label="Graduation Year"
                      value={
                        student.graduationYear ||
                        "Not specified"
                      }
                    />
                  </div>
                </section>

                {/* CAREER GOAL */}

                <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg dark:bg-blue-950/50">
                      🎯
                    </div>

                    <div>
                      <h2 className="text-lg font-bold">
                        Career Goal
                      </h2>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Career interests and aspirations
                      </p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/50 dark:bg-blue-950/20">
                    <p className="text-sm leading-7 text-slate-700 dark:text-slate-300">
                      {student.careerGoal ||
                        "No career goal has been added yet."}
                    </p>
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
                        Technical and professional skills
                      </p>
                    </div>
                  </div>

                  {Array.isArray(
                    student.skills
                  ) &&
                  student.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {student.skills.map(
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

              {/* =================================================
                  RIGHT SIDEBAR
              ================================================== */}

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
                      value={student.email}
                    />

                    <ContactItem
                      icon="📱"
                      label="Phone"
                      value={student.phone}
                    />
                  </div>
                </section>

                {/* PROFESSIONAL LINKS */}

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <h2 className="text-lg font-bold">
                    Professional Links
                  </h2>

                  <div className="mt-5 space-y-3">
                    {student.linkedin && (
                      <SocialLink
                        icon="🔗"
                        label="LinkedIn"
                        href={student.linkedin}
                      />
                    )}

                    {student.github && (
                      <SocialLink
                        icon="💻"
                        label="GitHub"
                        href={student.github}
                      />
                    )}

                    {student.portfolio && (
                      <SocialLink
                        icon="🌐"
                        label="Portfolio"
                        href={student.portfolio}
                      />
                    )}

                    {!student.linkedin &&
                      !student.github &&
                      !student.portfolio && (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          No professional links added.
                        </p>
                      )}
                  </div>
                </section>

                {/* NETWORK CARD */}

                <section className="overflow-hidden rounded-2xl bg-gradient-to-br from-purple-700 via-purple-600 to-amber-500 p-6 text-white shadow-xl">
                  <p className="text-xs font-bold uppercase tracking-widest text-white/70">
                    Student Network
                  </p>

                  <h2 className="mt-3 text-xl font-bold">
                    Connect, collaborate and grow together.
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-white/80">
                    Build meaningful connections with
                    students and alumni across the network.
                  </p>

                  {/* SEND CONNECTION REQUEST */}

                  <button
                    type="button"
                    onClick={handleConnect}
                    disabled={connecting}
                    data-connection-button="true"
                    className="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-bold text-purple-700 transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {connecting ? (
                      "Sending..."
                    ) : (
                      <>
                        🤝 Send Connection Request
                      </>
                    )}
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
// INFO BOX
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

// =====================================================
// SOCIAL LINK
// =====================================================

function SocialLink({ icon, label, href }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-xl border border-slate-200 p-4 transition hover:border-purple-400 hover:bg-purple-50 dark:border-slate-700 dark:hover:border-purple-700 dark:hover:bg-purple-950/20"
    >
      <span className="flex items-center gap-3 text-sm font-semibold">
        <span className="text-xl">
          {icon}
        </span>

        {label}
      </span>

      <span>↗</span>
    </a>
  );
}