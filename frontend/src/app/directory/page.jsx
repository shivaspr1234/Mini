"use client";

import Link from "next/link";

export default function DirectoryPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">

      {/* HERO */}

      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

          <div className="max-w-3xl">

            <p className="text-sm font-bold uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">
              Networking
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              Explore Our Directory
            </h1>

            <p className="mt-5 text-lg leading-8 text-slate-600 dark:text-slate-400">
              Connect with alumni and students, discover professional
              journeys, exchange knowledge and build meaningful
              relationships.
            </p>

          </div>

        </div>
      </section>


      {/* DIRECTORY OPTIONS */}

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        <div className="grid gap-6 md:grid-cols-2">

          {/* Alumni */}

          <Link
            href="/directory/Alumni"
            className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-3xl dark:bg-purple-950">
              🎓
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              Alumni Directory
            </h2>

            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">
              Discover experienced alumni, explore their companies,
              skills and professional backgrounds.
            </p>

            <span className="mt-6 inline-block font-semibold text-purple-600 transition group-hover:translate-x-1 dark:text-purple-400">
              Explore Alumni →
            </span>

          </Link>


          {/* Students */}

          <Link
            href="/directory/Students"
            className="group rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-3xl dark:bg-amber-950">
              👨‍🎓
            </div>

            <h2 className="mt-6 text-2xl font-bold">
              Student Directory
            </h2>

            <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">
              Find students by course, branch, skills and career
              interests.
            </p>

            <span className="mt-6 inline-block font-semibold text-amber-600 transition group-hover:translate-x-1 dark:text-amber-400">
              Explore Students →
            </span>

          </Link>

        </div>

      </section>

    </main>
  );
}