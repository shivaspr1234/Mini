"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API_URL = "http://localhost:5000";

const GUIDANCE_AREAS = [
  "Career Guidance",
  "Full Stack Development",
  "Web Development",
  "DSA & Problem Solving",
  "Interview Preparation",
  "Resume Review",
  "Internship Guidance",
  "Higher Studies",
  "Entrepreneurship",
  "Industry Insights",
];

function getLoggedInStudent() {
  if (typeof window === "undefined") return null;

  for (const storage of [localStorage, sessionStorage]) {
    for (const key of ["user", "student"]) {
      try {
        const saved = storage.getItem(key);

        if (!saved) continue;

        const parsed = JSON.parse(saved);

        const user =
          parsed?.data?.user ||
          parsed?.user ||
          parsed?.data ||
          parsed;

        if (user?._id || user?.id) {
          return {
            ...user,
            _id: user._id || user.id,
          };
        }
      } catch {
        // Ignore invalid storage values.
      }
    }
  }

  return null;
}

export default function MentorRequestPage() {
  const params = useParams();
  const router = useRouter();

  const mentorId = params?.mentorId;

  const [student, setStudent] = useState(null);
  const [mentor, setMentor] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [areas, setAreas] = useState([]);

  useEffect(() => {
    if (!mentorId) return;

    let active = true;

    async function loadData() {
      setLoading(true);

      try {
        const loggedInStudent = getLoggedInStudent();

        if (!loggedInStudent) {
          toast.error("Please login first.");
          router.replace("/Login");
          return;
        }

        if (
          loggedInStudent.role &&
          loggedInStudent.role.toLowerCase() !== "student"
        ) {
          toast.error("Only students can request mentorship.");
          return;
        }

        if (active) {
          setStudent(loggedInStudent);
        }

        // Mentor details endpoint.
        // Change this URL if your AlumniRouter uses a different route.
        const response = await axios.get(
          `${API_URL}/alumni/${mentorId}`
        );

        const data =
          response.data?.data ||
          response.data?.alumni ||
          response.data?.result ||
          response.data;

        if (!data?._id) {
          throw new Error(
            "Mentor details were not returned by the API."
          );
        }

        if (active) {
          setMentor(data);
        }
      } catch (error) {
        console.error("Mentor loading error:", error);

        if (active) {
          toast.error(
            error.response?.data?.message ||
              error.message ||
              "Could not load mentor details."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [mentorId, router]);

  function toggleArea(area) {
    setAreas((previous) => {
      if (previous.includes(area)) {
        return previous.filter((item) => item !== area);
      }

      if (previous.length >= 10) {
        toast.error("Select a maximum of 10 areas.");
        return previous;
      }

      return [...previous, area];
    });
  }

  async function sendRequest(event) {
    event.preventDefault();

    if (!student?._id || !mentor?._id) {
      toast.error("Student or mentor information is missing.");
      return;
    }

    if (String(student._id) === String(mentor._id)) {
      toast.error("You cannot request mentorship from yourself.");
      return;
    }

    if (!topic.trim()) {
      toast.error("Please enter a mentorship topic.");
      return;
    }

    if (topic.trim().length > 150) {
      toast.error("Topic must be within 150 characters.");
      return;
    }

    if (!message.trim()) {
      toast.error("Please enter your message.");
      return;
    }

    if (message.trim().length > 1000) {
      toast.error("Message must be within 1000 characters.");
      return;
    }

    if (areas.length === 0) {
      toast.error("Please select at least one guidance area.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/mentorship/request`,
        {
          studentId: student._id,
          mentorId: mentor._id,
          topic: topic.trim(),
          message: message.trim(),
          areasOfGuidance: areas,
        }
      );

      if (response.data?.success === false) {
        throw new Error(
          response.data?.message || "Request could not be sent."
        );
      }

      toast.success("Mentorship request sent successfully!");

      setTimeout(() => {
        router.push("/mentorship/my-mentorship");
      }, 1000);
    } catch (error) {
      console.error("Request submission error:", error);

      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to send request."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-700 dark:border-slate-700 dark:border-t-amber-400" />
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            Loading mentor details...
          </p>
        </div>
      </main>
    );
  }

  if (!mentor) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
          <div className="text-5xl">🔍</div>

          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
            Mentor Not Found
          </h1>

          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            We could not load this mentor. Please try again from
            the alumni directory.
          </p>

          <Link
            href="/mentorship"
            className="mt-6 inline-flex rounded-xl bg-purple-700 px-6 py-3 font-bold text-white hover:bg-purple-800"
          >
            Explore Mentors
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-5xl">
        <Link
          href="/mentorship"
          className="font-semibold text-purple-700 hover:text-purple-900 dark:text-amber-400"
        >
          ← Back to Mentors
        </Link>

        <div className="mt-8">
          <span className="rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            ✦ Mentorship Program
          </span>

          <h1 className="mt-5 text-3xl font-extrabold sm:text-4xl">
            Request a Mentor
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-400">
            Connect with experienced alumni, improve your skills,
            and get guidance for your career.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 items-start gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          {/* MENTOR DETAILS */}
          <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="h-2 bg-gradient-to-r from-purple-800 via-purple-600 to-amber-400" />

            <div className="p-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-purple-100 text-3xl font-extrabold text-purple-800 dark:bg-purple-500/20 dark:text-amber-300">
                {(mentor.name || mentor.fullName || "A")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <p className="mt-6 text-xs font-bold uppercase tracking-widest text-purple-700 dark:text-amber-400">
                Selected Mentor
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                {mentor.name || mentor.fullName || "Alumni Mentor"}
              </h2>

              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                {mentor.jobTitle ||
                  mentor.designation ||
                  "Professional Mentor"}
              </p>

              {(mentor.currentCompany || mentor.company) && (
                <p className="mt-1 text-sm font-semibold">
                  {mentor.currentCompany || mentor.company}
                </p>
              )}

              {(mentor.degree || mentor.department) && (
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                  {[mentor.degree, mentor.department]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              )}

              {mentor.graduationYear && (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Graduation Year: {mentor.graduationYear}
                </p>
              )}

              {mentor.bio && (
                <div className="mt-5 border-t border-slate-200 pt-5 dark:border-slate-800">
                  <h3 className="font-bold">About Mentor</h3>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {mentor.bio}
                  </p>
                </div>
              )}

              {Array.isArray(mentor.skills) &&
                mentor.skills.length > 0 && (
                  <div className="mt-5">
                    <h3 className="font-bold">Skills</h3>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {mentor.skills.slice(0, 8).map((skill, index) => (
                        <span
                          key={`${skill}-${index}`}
                          className="rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-800 dark:border-purple-500/30 dark:bg-purple-500/10 dark:text-purple-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
                <p className="font-bold text-amber-900 dark:text-amber-300">
                  💡 Pro Tip
                </p>

                <p className="mt-2 text-xs leading-6 text-amber-900/80 dark:text-amber-200/80">
                  Clearly explain your goals so your mentor
                  understands how they can help you.
                </p>
              </div>
            </div>
          </section>

          {/* REQUEST FORM */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
            <h2 className="text-2xl font-bold">
              Tell Us About Your Goals
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Complete the form to send your request.
            </p>

            <form onSubmit={sendRequest} className="mt-7 space-y-7">
              {/* TOPIC */}
              <div>
                <label
                  htmlFor="topic"
                  className="mb-2 block text-sm font-bold"
                >
                  Mentorship Topic *
                </label>

                <input
                  id="topic"
                  type="text"
                  maxLength={150}
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  placeholder="e.g. Full Stack Development Career Guidance"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-amber-400 dark:focus:ring-amber-400/10"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {topic.length}/150
                </p>
              </div>

              {/* GUIDANCE AREAS */}
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <label className="text-sm font-bold">
                    Areas of Guidance *
                  </label>

                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {areas.length}/10 selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {GUIDANCE_AREAS.map((area) => {
                    const selected = areas.includes(area);

                    return (
                      <button
                        key={area}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggleArea(area)}
                        className={`rounded-full border px-3 py-2 text-xs font-semibold transition ${
                          selected
                            ? "border-purple-700 bg-purple-700 text-white dark:border-amber-400 dark:bg-amber-400 dark:text-slate-950"
                            : "border-slate-300 bg-white text-slate-700 hover:border-purple-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                        }`}
                      >
                        {selected ? "✓ " : "+ "}
                        {area}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* MESSAGE */}
              <div>
                <label
                  htmlFor="message"
                  className="mb-2 block text-sm font-bold"
                >
                  Your Message *
                </label>

                <textarea
                  id="message"
                  rows={6}
                  maxLength={1000}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="Introduce yourself, explain your goals, and describe what guidance you need..."
                  className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm leading-6 outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 dark:border-slate-700 dark:bg-slate-950 dark:focus:border-amber-400 dark:focus:ring-amber-400/10"
                />

                <p className="mt-1 text-right text-xs text-slate-400">
                  {message.length}/1000
                </p>
              </div>

              {/* PRIVACY NOTE */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-sm font-semibold">
                  🔒 Your Mentorship Request
                </p>

                <p className="mt-2 text-xs leading-6 text-slate-600 dark:text-slate-400">
                  Your selected mentor will be able to view your
                  request and respond to it.
                </p>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 dark:border-slate-800 sm:flex-row">
                <Link
                  href="/mentorship"
                  className="inline-flex min-h-12 flex-1 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-800 to-purple-600 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:from-purple-900 hover:to-purple-700 disabled:cursor-not-allowed disabled:opacity-60 dark:from-purple-700 dark:to-purple-600"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      Sending Request...
                    </>
                  ) : (
                    <>
                      Send Mentorship Request →
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}