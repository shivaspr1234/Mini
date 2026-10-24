"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const highlights = [
  {
    icon: "🤝",
    title: "Meaningful Networking",
    description:
      "Connect students with alumni and build valuable professional relationships.",
  },
  {
    icon: "🎯",
    title: "Career Mentorship",
    description:
      "Learn from alumni experiences, career journeys, and practical industry advice.",
  },
  {
    icon: "💼",
    title: "Career Opportunities",
    description:
      "Explore job openings, internships, and opportunities shared by the community.",
  },
  {
    icon: "🌱",
    title: "Continuous Learning",
    description:
      "Develop new skills, gain confidence, and prepare for your professional future.",
  },
];

const values = [
  {
    number: "01",
    title: "Community",
    description:
      "Build a supportive network where students and alumni can learn from one another.",
  },
  {
    number: "02",
    title: "Growth",
    description:
      "Encourage professional development through mentorship, knowledge sharing, and opportunities.",
  },
  {
    number: "03",
    title: "Connection",
    description:
      "Create meaningful relationships that continue beyond graduation.",
  },
];

export default function AboutPage() {
  const [darkMode, setDarkMode] = useState(false);

  // Read the theme controlled by the global Navbar.
  useEffect(() => {
    const updateTheme = () => {
      setDarkMode(
        document.documentElement.classList.contains("dark")
      );
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${
        darkMode
          ? "bg-slate-950 text-white"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      {/* HERO SECTION */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-purple-950 via-purple-800 to-indigo-950 px-4 py-20 text-white sm:px-6 sm:py-28 lg:px-8">
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200">
              <span>✦</span>
              ABOUT OUR COMMUNITY
            </span>

            <h1 className="mt-7 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-7xl">
              Connecting
              <span className="block text-amber-300">
                Generations.
              </span>
              Building Futures.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-8 text-purple-100 sm:text-lg">
              Alumni–Student Networking Portal is designed to
              bring students and alumni together through mentorship,
              professional networking, knowledge sharing, and career
              opportunities.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/services"
                className="rounded-xl bg-amber-300 px-6 py-3.5 text-sm font-bold text-purple-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-200"
              >
                Explore Our Services →
              </Link>

              <Link
                href="/directory"
                className="rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
              >
                Explore Community
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-amber-300">
              Who We Are
            </span>

            <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
              One Community.
              <span className="block text-purple-700 dark:text-amber-300">
                Endless Possibilities.
              </span>
            </h2>

            <p
              className={`mt-6 leading-8 ${
                darkMode ? "text-slate-300" : "text-slate-600"
              }`}
            >
              The Alumni–Student Networking Portal provides a
              dedicated space for students and graduates to connect,
              communicate, and support one another.
            </p>

            <p
              className={`mt-4 leading-8 ${
                darkMode ? "text-slate-300" : "text-slate-600"
              }`}
            >
              Students can discover career paths, seek guidance from
              experienced alumni, and explore opportunities. Alumni
              can share their knowledge, support upcoming graduates,
              and remain connected with their educational community.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  darkMode
                    ? "bg-purple-950 text-purple-200"
                    : "bg-purple-100 text-purple-800"
                }`}
              >
                🎓 Student Growth
              </span>

              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  darkMode
                    ? "bg-amber-950 text-amber-200"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                🤝 Alumni Connections
              </span>
            </div>
          </div>

          <div
            className={`rounded-3xl border p-6 shadow-xl sm:p-9 ${
              darkMode
                ? "border-slate-800 bg-slate-900"
                : "border-purple-100 bg-white"
            }`}
          >
            <div className="rounded-2xl bg-gradient-to-br from-purple-800 via-purple-700 to-indigo-900 p-7 text-white sm:p-9">
              <div className="text-5xl">🌉</div>

              <h3 className="mt-6 text-2xl font-extrabold">
                Bridging the Gap
              </h3>

              <p className="mt-4 leading-7 text-purple-100">
                Connecting academic learning with professional
                experience through a stronger alumni and student
                community.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div
                className={`rounded-xl p-4 ${
                  darkMode ? "bg-slate-800" : "bg-purple-50"
                }`}
              >
                <p className="text-2xl font-black text-purple-600 dark:text-amber-300">
                  🎯
                </p>

                <p className="mt-2 font-bold">Our Mission</p>

                <p
                  className={`mt-1 text-sm ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Enable meaningful connections.
                </p>
              </div>

              <div
                className={`rounded-xl p-4 ${
                  darkMode ? "bg-slate-800" : "bg-amber-50"
                }`}
              >
                <p className="text-2xl font-black text-amber-500">
                  ✨
                </p>

                <p className="mt-2 font-bold">Our Vision</p>

                <p
                  className={`mt-1 text-sm ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Grow together professionally.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HIGHLIGHTS */}
      <section
        className={`px-4 py-16 sm:px-6 sm:py-20 lg:px-8 ${
          darkMode ? "bg-slate-900/60" : "bg-white"
        }`}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-amber-300">
              What Makes Us Different
            </span>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              A Platform Built Around You
            </h2>

            <p
              className={`mt-4 leading-7 ${
                darkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              A supportive environment where knowledge,
              relationships, and opportunities come together.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item) => (
              <article
                key={item.title}
                className={`group rounded-2xl border p-6 transition duration-300 hover:-translate-y-2 hover:shadow-xl ${
                  darkMode
                    ? "border-slate-800 bg-slate-950 hover:border-purple-700"
                    : "border-slate-200 bg-slate-50 hover:border-purple-300"
                }`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-3xl transition group-hover:bg-amber-100 dark:bg-purple-950">
                  {item.icon}
                </div>

                <h3 className="mt-5 text-lg font-bold">
                  {item.title}
                </h3>

                <p
                  className={`mt-3 text-sm leading-7 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CORE VALUES */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-amber-300">
              Our Core Values
            </span>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              What We Believe In
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <article
                key={value.number}
                className={`rounded-2xl border p-7 sm:p-8 ${
                  darkMode
                    ? "border-slate-800 bg-slate-900"
                    : "border-slate-200 bg-white shadow-sm"
                }`}
              >
                <span className="text-4xl font-black text-purple-200 dark:text-purple-900">
                  {value.number}
                </span>

                <h3 className="mt-4 text-xl font-extrabold">
                  {value.title}
                </h3>

                <p
                  className={`mt-3 text-sm leading-7 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {value.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-purple-800 to-indigo-900 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <span className="text-4xl">🚀</span>

          <h2 className="mt-5 text-3xl font-black sm:text-4xl">
            Your Next Connection Starts Here
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-purple-100">
            Join a community focused on learning, mentorship,
            professional growth, and meaningful relationships.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-xl bg-amber-300 px-6 py-3.5 text-sm font-bold text-purple-950 transition hover:bg-amber-200"
            >
              Join Our Community →
            </Link>

            <Link
              href="/services"
              className="rounded-xl border border-white/30 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Explore Services
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        className={`border-t px-4 py-7 text-center text-sm ${
          darkMode
            ? "border-slate-800 bg-slate-950 text-slate-400"
            : "border-slate-200 bg-white text-slate-500"
        }`}
      >
        © {new Date().getFullYear()} Alumni–Student Networking Portal.
        All rights reserved.
      </footer>
    </main>
  );
}