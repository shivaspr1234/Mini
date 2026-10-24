"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const services = [
  {
    number: "01",
    icon: "🤝",
    title: "Alumni–Student Networking",
    category: "COMMUNITY",
    description:
      "Build professional relationships with alumni and fellow students. Discover people who share your interests, goals, and career aspirations.",
    features: [
      "Discover alumni and students",
      "Build professional connections",
      "Expand your network",
    ],
    href: "/directory",
  },
  {
    number: "02",
    icon: "🎯",
    title: "Career Mentorship",
    category: "CAREER GROWTH",
    description:
      "Learn from alumni who have professional experience. Get guidance on career planning, industry expectations, and professional development.",
    features: [
      "Career planning guidance",
      "Industry insights",
      "Professional development",
    ],
    href: "/directory/alumni",
  },
  {
    number: "03",
    icon: "💼",
    title: "Jobs & Internships",
    category: "OPPORTUNITIES",
    description:
      "Explore employment and internship opportunities that can help you gain practical experience and take the next step in your career.",
    features: [
      "Explore job openings",
      "Discover internships",
      "Track your applications",
    ],
    href: "/Jobs",
  },
  {
    number: "04",
    icon: "🎓",
    title: "Alumni Directory",
    category: "DISCOVERY",
    description:
      "Discover alumni profiles and explore professional backgrounds, skills, industries, and career journeys within your community.",
    features: [
      "Explore alumni profiles",
      "Discover professional skills",
      "Find relevant experience",
    ],
    href: "/directory/alumni",
  },
  {
    number: "05",
    icon: "📚",
    title: "Career Guidance",
    category: "LEARNING",
    description:
      "Prepare for your professional journey with practical guidance on resumes, interviews, workplace expectations, and career choices.",
    features: [
      "Resume improvement",
      "Interview preparation",
      "Career planning support",
    ],
    href: "/directory",
  },
  {
    number: "06",
    icon: "🎤",
    title: "Events & Workshops",
    category: "ENGAGEMENT",
    description:
      "Learn through professional events, workshops, knowledge-sharing sessions, and community activities when available on the platform.",
    features: [
      "Professional learning",
      "Knowledge sharing",
      "Community engagement",
    ],
    href: "/",
  },
  {
    number: "07",
    icon: "🚀",
    title: "Skill Development",
    category: "PERSONAL GROWTH",
    description:
      "Identify the skills relevant to your career goals and learn how to improve your technical and professional capabilities.",
    features: [
      "Identify skill gaps",
      "Learn industry expectations",
      "Build career confidence",
    ],
    href: "/directory",
  },
  {
    number: "08",
    icon: "🌐",
    title: "Professional Community",
    category: "COLLABORATION",
    description:
      "Stay connected with your academic community, exchange experiences, and discover opportunities to collaborate and learn.",
    features: [
      "Share knowledge",
      "Connect with peers",
      "Build lasting relationships",
    ],
    href: "/directory",
  },
];

export default function ServicesPage() {
  const [darkMode, setDarkMode] = useState(false);

  // Read theme from the existing global Navbar.
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
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-purple-950 via-purple-800 to-indigo-950 px-4 py-20 text-white sm:px-6 sm:py-28 lg:px-8">
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-purple-400/20 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-300/10 px-4 py-2 text-sm font-semibold text-amber-200">
            <span>✦</span>
            WHAT WE OFFER
          </span>

          <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-7xl">
            Services That
            <span className="block text-amber-300">
              Move You Forward.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-purple-100 sm:text-lg">
            Discover the services designed to connect students and
            alumni, encourage career development, and make
            professional opportunities easier to explore.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <a
              href="#all-services"
              className="rounded-xl bg-amber-300 px-6 py-3.5 text-sm font-bold text-purple-950 shadow-lg transition hover:-translate-y-0.5 hover:bg-amber-200"
            >
              Explore Services ↓
            </a>

            <Link
              href="/about"
              className="rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:bg-white/20"
            >
              About Our Portal
            </Link>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-3">
          <div
            className={`rounded-2xl border p-6 ${
              darkMode
                ? "border-purple-900 bg-slate-900"
                : "border-purple-100 bg-white shadow-sm"
            }`}
          >
            <div className="text-3xl">🎓</div>

            <h2 className="mt-4 text-xl font-extrabold">
              For Students
            </h2>

            <p
              className={`mt-3 text-sm leading-7 ${
                darkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Discover alumni, explore career opportunities, improve
              your skills, and seek professional guidance.
            </p>
          </div>

          <div
            className={`rounded-2xl border p-6 ${
              darkMode
                ? "border-amber-900 bg-slate-900"
                : "border-amber-100 bg-white shadow-sm"
            }`}
          >
            <div className="text-3xl">🧑‍💼</div>

            <h2 className="mt-4 text-xl font-extrabold">
              For Alumni
            </h2>

            <p
              className={`mt-3 text-sm leading-7 ${
                darkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Share your professional experience, guide students,
              and remain connected with your academic community.
            </p>
          </div>

          <div
            className={`rounded-2xl border p-6 ${
              darkMode
                ? "border-indigo-900 bg-slate-900"
                : "border-indigo-100 bg-white shadow-sm"
            }`}
          >
            <div className="text-3xl">🌐</div>

            <h2 className="mt-4 text-xl font-extrabold">
              For the Community
            </h2>

            <p
              className={`mt-3 text-sm leading-7 ${
                darkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Encourage collaboration, knowledge sharing, and
              stronger connections across generations.
            </p>
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section
        id="all-services"
        className={`scroll-mt-24 px-4 py-16 sm:px-6 sm:py-20 lg:px-8 ${
          darkMode ? "bg-slate-900/50" : "bg-white"
        }`}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-amber-300">
              Our Services
            </span>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Everything to Help You Grow
            </h2>

            <p
              className={`mt-4 leading-7 ${
                darkMode ? "text-slate-400" : "text-slate-600"
              }`}
            >
              Explore the services that support networking, career
              development, mentorship, and professional growth.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <article
                key={service.number}
                className={`group flex flex-col rounded-2xl border p-6 transition duration-300 hover:-translate-y-2 hover:shadow-xl ${
                  darkMode
                    ? "border-slate-800 bg-slate-950 hover:border-purple-700"
                    : "border-slate-200 bg-slate-50 hover:border-purple-300"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-3xl transition group-hover:bg-amber-100 dark:bg-purple-950">
                    {service.icon}
                  </span>

                  <span
                    className={`text-sm font-black ${
                      darkMode ? "text-slate-700" : "text-slate-300"
                    }`}
                  >
                    {service.number}
                  </span>
                </div>

                <span className="mt-5 text-[10px] font-bold tracking-[0.15em] text-purple-600 dark:text-amber-300">
                  {service.category}
                </span>

                <h3 className="mt-2 text-lg font-extrabold leading-7">
                  {service.title}
                </h3>

                <p
                  className={`mt-3 flex-1 text-sm leading-7 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {service.description}
                </p>

                <ul className="mt-5 space-y-2 border-t border-slate-200 pt-4 dark:border-slate-800">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className={`flex items-start gap-2 text-xs leading-5 ${
                        darkMode ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      <span className="font-bold text-purple-600 dark:text-amber-300">
                        ✓
                      </span>

                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={service.href}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-purple-700 transition hover:gap-3 dark:text-amber-300"
                >
                  Explore Service <span>→</span>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-amber-300">
              Simple Process
            </span>

            <h2 className="mt-4 text-3xl font-black sm:text-4xl">
              Get Started in Three Steps
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              {
                number: "01",
                icon: "👤",
                title: "Create Your Account",
                description:
                  "Register on the portal and complete your profile with relevant information.",
              },
              {
                number: "02",
                icon: "🔎",
                title: "Explore the Community",
                description:
                  "Discover alumni, students, professional profiles, and available opportunities.",
              },
              {
                number: "03",
                icon: "🚀",
                title: "Build Your Future",
                description:
                  "Use the available features to develop connections and support your career goals.",
              },
            ].map((step) => (
              <article key={step.number} className="relative text-center">
                <div
                  className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border text-4xl shadow-sm ${
                    darkMode
                      ? "border-purple-900 bg-slate-900"
                      : "border-purple-100 bg-white"
                  }`}
                >
                  {step.icon}
                </div>

                <span className="mt-5 block text-xs font-black tracking-widest text-purple-600 dark:text-amber-300">
                  STEP {step.number}
                </span>

                <h3 className="mt-3 text-xl font-extrabold">
                  {step.title}
                </h3>

                <p
                  className={`mx-auto mt-3 max-w-sm text-sm leading-7 ${
                    darkMode ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl bg-gradient-to-br from-purple-950 via-purple-800 to-indigo-950 px-6 py-12 text-center text-white sm:px-12 sm:py-16">
          <div className="text-4xl">✨</div>

          <h2 className="mt-5 text-3xl font-black sm:text-4xl">
            Ready to Connect and Grow?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-purple-100">
            Take the next step towards meaningful connections,
            professional development, and new opportunities.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-xl bg-amber-300 px-6 py-3.5 text-sm font-bold text-purple-950 transition hover:bg-amber-200"
            >
              Join the Community →
            </Link>

            <Link
              href="/about"
              className="rounded-xl border border-white/30 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10"
            >
              Learn About Us
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