"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";

const API_URL = "http://localhost:5000/api/mentorship";

const STAR_OPTIONS = [1, 2, 3, 4, 5];

function getStoredStudent() {
  if (typeof window === "undefined") return null;

  const keys = ["user", "student"];

  for (const storage of [localStorage, sessionStorage]) {
    for (const key of keys) {
      try {
        const raw = storage.getItem(key);

        if (!raw) continue;

        const parsed = JSON.parse(raw);

        const student =
          parsed?.data?.user ||
          parsed?.data ||
          parsed?.user ||
          parsed;

        const id = student?._id || student?.id;

        if (!id) continue;

        const role = String(
          student.role || parsed?.role || ""
        ).toLowerCase();

        // Do not treat a clearly identified alumni account as a student.
        if (key === "user" && role === "alumni") continue;

        return {
          ...student,
          _id: id,
        };
      } catch (error) {
        console.error(`Unable to read ${key} storage`, error);
      }
    }
  }

  return null;
}

function getPersonName(person) {
  if (!person) return "Mentor";

  return (
    person.name ||
    person.fullName ||
    person.username ||
    person.email ||
    "Mentor"
  );
}

function formatDate(dateValue) {
  if (!dateValue) return "Date not available";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date not available";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StarRating({ value, onChange, disabled = false }) {
  return (
    <div
      className="flex flex-wrap items-center gap-2"
      role="radiogroup"
      aria-label="Mentor rating"
    >
      {STAR_OPTIONS.map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} out of 5 stars`}
          disabled={disabled}
          onClick={() => onChange(star)}
          className={`text-3xl transition-transform duration-150 sm:text-4xl ${
            star <= value
              ? "scale-105 text-amber-400"
              : "text-slate-300 dark:text-slate-600"
          } ${
            disabled
              ? "cursor-not-allowed opacity-70"
              : "cursor-pointer hover:scale-110"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function FeedbackCard({
  item,
  onSubmit,
  submitting,
}) {
  const feedback = item.feedback || {};

  const alreadySubmitted =
    feedback.rating !== null &&
    feedback.rating !== undefined;

  const [rating, setRating] = useState(
    alreadySubmitted ? Number(feedback.rating) : 0
  );

  const [comment, setComment] = useState(
    feedback.comment || ""
  );

  const [error, setError] = useState("");

  const [success, setSuccess] = useState(false);

  const [savedFeedback, setSavedFeedback] = useState(
    alreadySubmitted
      ? {
          rating: Number(feedback.rating),
          comment: feedback.comment || "",
        }
      : null
  );

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (!rating || rating < 1 || rating > 5) {
      setError("Please mentor ke liye 1 se 5 stars select karein.");
      return;
    }

    if (comment.trim().length > 1000) {
      setError("Feedback 1000 characters se zyada nahi ho sakta.");
      return;
    }

    try {
      const result = await onSubmit({
        sessionId: item._id,
        rating,
        comment: comment.trim(),
      });

      if (result) {
        setSavedFeedback({
          rating: result.rating,
          comment: result.comment,
        });

        setSuccess(true);
      }
    } catch (submitError) {
      setError(
        submitError?.message ||
          "Feedback submit nahi ho paya. Please try again."
      );
    }
  }

  const isLocked = alreadySubmitted || Boolean(savedFeedback);

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg dark:border-slate-800 dark:bg-slate-900">
      <div className="h-1.5 bg-gradient-to-r from-purple-700 via-purple-500 to-amber-400" />

      <div className="p-5 sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-amber-400 text-xl font-black text-white">
              {getPersonName(item.mentor)
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-950 dark:text-white">
                {getPersonName(item.mentor)}
              </h2>

              <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">
                {item.mentor?.email || "Email not available"}
              </p>

              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Session: {formatDate(item.session?.scheduledAt)}
              </p>
            </div>
          </div>

          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            ✓ Completed
          </span>
        </div>

        <div className="mt-6">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
            Mentorship Topic
          </p>

          <h3 className="mt-2 text-xl font-black text-slate-900 dark:text-white">
            {item.topic || "Mentorship Session"}
          </h3>
        </div>

        {item.message && (
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Your Original Message
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
              {item.message}
            </p>
          </div>
        )}

        <div className="mt-6 rounded-2xl border border-purple-100 bg-purple-50/60 p-5 dark:border-purple-900/60 dark:bg-purple-950/20 sm:p-6">
          {isLocked ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h4 className="text-lg font-black text-slate-900 dark:text-white">
                  Your Feedback
                </h4>

                <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                  ✓ Submitted
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span className="text-3xl font-black text-amber-500">
                  {savedFeedback?.rating || 0}/5
                </span>

                <div
                  className="text-2xl tracking-wider text-amber-400"
                  aria-label={`${savedFeedback?.rating || 0} out of 5 stars`}
                >
                  {"★".repeat(savedFeedback?.rating || 0)}
                  <span className="text-slate-300 dark:text-slate-600">
                    {"★".repeat(
                      5 - (savedFeedback?.rating || 0)
                    )}
                  </span>
                </div>
              </div>

              {savedFeedback?.comment ? (
                <div className="mt-4 rounded-xl bg-white p-4 dark:bg-slate-900">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Your Comment
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
                    {savedFeedback.comment}
                  </p>
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                  Aapne rating submit ki hai. Is session ke liye feedback
                  dobara submit nahi kiya ja sakta.
                </p>
              )}

              {success && (
                <p className="mt-4 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  Feedback successfully saved!
                </p>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <h4 className="text-lg font-black text-slate-950 dark:text-white">
                    Rate Your Mentor
                  </h4>

                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Aapka feedback future students ki help karega.
                  </p>
                </div>

                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  Required: Rating
                </span>
              </div>

              <div className="mt-5">
                <StarRating
                  value={rating}
                  onChange={setRating}
                  disabled={submitting}
                />

                <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {rating === 0 && "Select your rating"}
                  {rating === 1 && "⭐ Needs improvement"}
                  {rating === 2 && "⭐⭐ Fair"}
                  {rating === 3 && "⭐⭐⭐ Good"}
                  {rating === 4 && "⭐⭐⭐⭐ Very good"}
                  {rating === 5 && "⭐⭐⭐⭐⭐ Excellent"}
                </p>
              </div>

              <div className="mt-5">
                <label
                  htmlFor={`feedback-${item._id}`}
                  className="mb-2 block text-sm font-bold text-slate-800 dark:text-slate-200"
                >
                  Share Your Experience
                </label>

                <textarea
                  id={`feedback-${item._id}`}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  placeholder="Mentor ne aapki kaise help ki? Apna experience share karein..."
                  rows={4}
                  maxLength={1000}
                  disabled={submitting}
                  className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-purple-400 focus:ring-4 focus:ring-purple-100 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-purple-950"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {comment.length}/1000 characters
                </p>
              </div>

              {error && (
                <p
                  role="alert"
                  className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-700 to-purple-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-600/20 transition hover:from-purple-800 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {submitting ? (
                  "Submitting Feedback..."
                ) : (
                  <>
                    Submit Feedback <span>→</span>
                  </>
                )}
              </button>

              <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Submit karne ke baad is session ki rating dobara change
                nahi ki ja sakegi.
              </p>
            </form>
          )}
        </div>
      </div>
    </article>
  );
}

export default function StudentFeedbackPage() {
  const [student, setStudent] = useState(null);
  const [ready, setReady] = useState(false);

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submittingId, setSubmittingId] = useState("");

  const loadSessions = useCallback(async (studentId) => {
    if (!studentId) {
      setSessions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `${API_URL}/student/${studentId}/sessions`
      );

      if (response.data?.success) {
        const data = Array.isArray(response.data.data)
          ? response.data.data
          : [];

        setSessions(
          data.filter((item) => item.status === "completed")
        );
      } else {
        setError(
          response.data?.message ||
            "Completed sessions load nahi ho paaye."
        );
      }
    } catch (err) {
      console.error("LOAD FEEDBACK SESSIONS ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Sessions load nahi ho paaye. Backend server aur API URL check karein."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const storedStudent = getStoredStudent();

    setStudent(storedStudent);
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      if (student?._id) {
        loadSessions(student._id);
      } else {
        setLoading(false);
      }
    }
  }, [ready, student, loadSessions]);

  async function handleFeedbackSubmit({
    sessionId,
    rating,
    comment,
  }) {
    if (!student?._id) {
      throw new Error("Please login with your student account.");
    }

    setSubmittingId(sessionId);
    setError("");

    try {
      const response = await axios.patch(
        `${API_URL}/session/${sessionId}/feedback`,
        {
          studentId: student._id,
          rating,
          comment,
        }
      );

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Feedback submit nahi ho paya."
        );
      }

      const feedback = response.data.data?.feedback;

      setSessions((previous) =>
        previous.map((item) =>
          item._id === sessionId
            ? {
                ...item,
                feedback: {
                  rating: feedback?.rating ?? rating,
                  comment: feedback?.comment ?? comment,
                },
              }
            : item
        )
      );

      return {
        rating: feedback?.rating ?? rating,
        comment: feedback?.comment ?? comment,
      };
    } catch (err) {
      console.error("SUBMIT FEEDBACK ERROR:", err);

      throw new Error(
        err.response?.data?.message ||
          err.message ||
          "Feedback submit nahi ho paya. Please try again."
      );
    } finally {
      setSubmittingId("");
    }
  }

  if (!ready || loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16 text-slate-900 dark:bg-slate-950 dark:text-white">
        <div className="mx-auto max-w-5xl">
          <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
            <div className="h-7 w-64 max-w-full rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-4 h-4 w-96 max-w-full rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-8 h-56 rounded-2xl bg-slate-100 dark:bg-slate-800" />
          </div>

          <p className="mt-5 text-center text-sm text-slate-500 dark:text-slate-400">
            Loading completed sessions...
          </p>
        </div>
      </main>
    );
  }

  if (!student?._id) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
        <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl dark:bg-purple-900/40">
            🔐
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-950 dark:text-white">
            Student Login Required
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Feedback submit karne ke liye pehle student account se login
            karein.
          </p>

          <Link
            href="/Login"
            className="mt-6 inline-flex rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
          >
            Student Login →
          </Link>
        </section>
      </main>
    );
  }

  const submittedCount = sessions.filter(
    (item) =>
      item.feedback?.rating !== null &&
      item.feedback?.rating !== undefined
  ).length;

  const pendingCount = sessions.length - submittedCount;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Link
            href="/mentorship"
            className="transition hover:text-purple-600 dark:hover:text-purple-400"
          >
            Mentorship
          </Link>

          <span>/</span>

          <span className="font-semibold text-slate-900 dark:text-white">
            Feedback & Rating
          </span>
        </nav>

        <section className="relative overflow-hidden rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-50 via-white to-amber-50 p-6 shadow-sm dark:border-purple-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-purple-950 sm:p-10">
          <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-purple-300/20 blur-3xl dark:bg-purple-500/10" />

          <div className="relative flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <span className="inline-flex rounded-full border border-purple-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-700 dark:border-purple-800 dark:bg-slate-900 dark:text-purple-300">
                Student Experience
              </span>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                Feedback & Rating
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                Apne completed mentorship sessions ko rate karein aur
                mentor ke saath apna experience share karein.
              </p>

              <p className="mt-3 text-sm font-semibold text-purple-700 dark:text-purple-300">
                Welcome, {getPersonName(student)} 👋
              </p>
            </div>

            <div className="flex h-20 w-20 shrink-0 items-center justify-center self-start rounded-3xl bg-gradient-to-br from-purple-600 to-amber-400 text-3xl text-white shadow-lg sm:self-center">
              ⭐
            </div>
          </div>
        </section>

        {error && (
          <div
            role="alert"
            className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={() => setError("")}
              aria-label="Dismiss error"
              className="font-bold"
            >
              ✕
            </button>
          </div>
        )}

        <section className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              label: "Completed Sessions",
              value: sessions.length,
              icon: "📅",
            },
            {
              label: "Feedback Pending",
              value: pendingCount,
              icon: "✍️",
            },
            {
              label: "Feedback Submitted",
              value: submittedCount,
              icon: "⭐",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {stat.label}
                </p>

                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-xl dark:bg-purple-950/40">
                  {stat.icon}
                </span>
              </div>

              <p className="mt-3 text-3xl font-black text-slate-950 dark:text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-9">
          <div className="mb-5">
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">
              Sessions Awaiting Your Feedback
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Sirf completed sessions ke liye rating aur feedback available
              hai.
            </p>
          </div>

          {sessions.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl dark:bg-purple-900/40">
                ⭐
              </div>

              <h3 className="mt-5 text-xl font-black text-slate-950 dark:text-white">
                No Completed Sessions Yet
              </h3>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
                Jab aapki mentorship session complete ho jayegi, tab aap
                yahan mentor ko rating aur feedback de sakenge.
              </p>

              <Link
                href="/mentorship/sessions"
                className="mt-6 inline-flex rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
              >
                View My Sessions →
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {sessions.map((item) => (
                <FeedbackCard
                  key={item._id}
                  item={item}
                  onSubmit={handleFeedbackSubmit}
                  submitting={submittingId === item._id}
                />
              ))}
            </div>
          )}
        </section>

        <div className="mt-10 flex flex-wrap gap-3 border-t border-slate-200 pt-6 dark:border-slate-800">
          <Link
            href="/mentorship/sessions"
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold transition hover:border-purple-300 hover:bg-purple-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            ← My Sessions
          </Link>

          <Link
            href="/mentorship"
            className="rounded-xl border border-purple-200 bg-purple-50 px-5 py-3 text-sm font-bold text-purple-700 transition hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300"
          >
            Explore Mentors
          </Link>
        </div>
      </div>
    </main>
  );
}