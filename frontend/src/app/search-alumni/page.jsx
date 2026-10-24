"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

const DEPARTMENTS = [
  "All Departments",
  "Computer Science",
  "Information Technology",
  "Computer Applications",
  "Electronics",
  "Management",
];

const inputBase =
  "w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20";

export default function SearchAlumniPage() {
  const [darkMode, setDarkMode] = useState(false);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("All Departments");
  const [graduationYear, setGraduationYear] = useState("All Years");
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAlumni() {
      setLoading(true);
      setApiError("");

      try {
        const response = await fetch("http://localhost:5000/alumni/all", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Could not load alumni from the server (HTTP ${response.status}).`
          );
        }

        const result = await response.json();
        const list = Array.isArray(result)
          ? result
          : result &&
              typeof result === "object" &&
              Array.isArray(result.data)
            ? result.data
            : null;

        if (!list) {
          throw new Error(
            "Invalid API response. Expected an array or an object containing a data array."
          );
        }

        setAlumni(list);
        setConnectionStatus("connected");
      } catch (error) {
        if (controller.signal.aborted) return;

        console.error("Error loading alumni:", error);
        setAlumni([]);
        setConnectionStatus("offline");
        setApiError(
          error?.message || "Unable to connect to the alumni server."
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadAlumni();
    return () => controller.abort();
  }, []);

  const filteredAlumni = useMemo(() => {
    const query = search.trim().toLowerCase();

    const results = alumni.filter((person) => {
      const searchableText = [
        person.name,
        person.degree,
        person.department,
        person.currentCompany,
        person.company,
        person.jobTitle,
        person.location,
        person.city,
        person.bio,
        ...(Array.isArray(person.skills) ? person.skills : []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);
      const matchesDepartment =
        department === "All Departments" ||
        (person.department || "")
          .toLowerCase()
          .includes(department.toLowerCase());
      const matchesYear =
        graduationYear === "All Years" ||
        String(person.graduationYear ?? "") === graduationYear;
      const personLocation = (person.location || person.city || "").toLowerCase();
      const matchesLocation =
        !location.trim() ||
        personLocation.includes(location.trim().toLowerCase());
      const personCompany = (person.currentCompany || person.company || "").toLowerCase();
      const matchesCompany =
        !company.trim() ||
        personCompany.includes(company.trim().toLowerCase());

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesYear &&
        matchesLocation &&
        matchesCompany
      );
    });

    return [...results].sort((a, b) => {
      if (sortBy === "year-newest") {
        return Number(b.graduationYear || 0) - Number(a.graduationYear || 0);
      }
      if (sortBy === "year-oldest") {
        return Number(a.graduationYear || 0) - Number(b.graduationYear || 0);
      }
      return (a.name || "").localeCompare(b.name || "");
    });
  }, [alumni, search, department, graduationYear, location, company, sortBy]);

  const clearFilters = () => {
    setSearch("");
    setDepartment("All Departments");
    setGraduationYear("All Years");
    setLocation("");
    setCompany("");
    setSortBy("name");
  };

  const pageClass = darkMode
    ? "min-h-screen bg-slate-950 text-white"
    : "min-h-screen bg-[#f8f7fc] text-slate-900";
  const mutedClass = darkMode ? "text-slate-400" : "text-slate-500";
  const inputClass = `${inputBase} ${
    darkMode
      ? "border-slate-700 bg-slate-900 text-white"
      : "border-slate-200 bg-white text-slate-800"
  }`;

  return (
    <main className={pageClass}>
      <nav
        className={`sticky top-0 z-20 border-b backdrop-blur-xl ${
          darkMode ? "border-slate-800 bg-slate-950/90" : "border-purple-100 bg-white/90"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-purple-700 to-purple-950 text-xl font-black text-white shadow-lg">
              A
            </div>
            <div>
              <h1 className="text-lg font-black">
                ANP<span className="text-amber-500">.</span>
              </h1>
              <p className={`text-xs ${mutedClass}`}>Alumni Network Portal</p>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden text-sm font-semibold transition hover:text-purple-500 sm:block"
            >
              Home
            </Link>
            <Link
              href="/Alumni/Register"
              className="hidden rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-800 sm:block"
            >
              Join Network
            </Link>
            <button
              type="button"
              onClick={() => setDarkMode((previous) => !previous)}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
              className={`rounded-xl border px-3 py-2.5 text-sm font-semibold ${
                darkMode ? "border-slate-700 bg-slate-900" : "border-purple-100 bg-purple-50"
              }`}
            >
              {darkMode ? "☀️" : "🌙"}
              <span className="ml-1 hidden sm:inline">{darkMode ? "Light" : "Dark"}</span>
            </button>
          </div>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-br from-purple-950 via-purple-800 to-purple-700 px-4 py-14 text-white sm:px-8 sm:py-20">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-10 h-64 w-64 rounded-full bg-purple-400/20 blur-3xl" />
        <div className="relative mx-auto max-w-7xl">
          <span className="inline-flex rounded-full border border-amber-300/40 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
            Connect · Collaborate · Grow
          </span>
          <h2 className="mt-6 max-w-3xl text-3xl font-black leading-tight sm:text-5xl lg:text-6xl">
            Find Your People.
            <br />
            <span className="text-amber-300">Build Your Future.</span>
          </h2>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-purple-100 sm:text-base">
            Discover alumni by name, department, graduation year, company or professional skills.
            Connect with experienced graduates and learn from their journeys.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-md">
              <p className="text-2xl font-black text-amber-300">{loading ? "..." : alumni.length}</p>
              <p className="mt-1 text-xs text-purple-100">Alumni Profiles</p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur-md">
              <p className="text-2xl font-black text-amber-300">
                {loading ? "..." : filteredAlumni.length}
              </p>
              <p className="mt-1 text-xs text-purple-100">Matching Results</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-8 sm:py-14">
        <div
          className={`relative z-10 -mt-20 rounded-2xl border p-4 shadow-xl sm:p-6 ${
            darkMode ? "border-slate-800 bg-slate-900" : "border-white bg-white"
          }`}
        >
          <label htmlFor="alumni-search" className="mb-3 block font-bold">
            🔎 Search Alumni
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="alumni-search"
              className={inputClass}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, skills, department, job title..."
            />
            <button
              type="button"
              onClick={() => setSearch(search.trim())}
              className="rounded-xl bg-gradient-to-r from-purple-800 to-purple-600 px-7 py-3 font-bold text-white transition hover:opacity-90"
            >
              Search Alumni
            </button>
          </div>
        </div>

        <div className="mb-7 mt-12 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-600">Alumni Directory</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">Discover Our Alumni</h2>
            <p className={`mt-2 text-sm ${mutedClass}`}>Search, filter and explore professional profiles.</p>
          </div>
          <label className="flex items-center gap-3 text-sm">
            <span className={mutedClass}>Sort by</span>
            <select
              className={inputClass}
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              aria-label="Sort alumni"
            >
              <option value="name">Name: A–Z</option>
              <option value="year-newest">Graduation: Newest</option>
              <option value="year-oldest">Graduation: Oldest</option>
            </select>
          </label>
        </div>

        <div
          className={`mb-8 rounded-2xl border p-5 sm:p-6 ${
            darkMode ? "border-slate-800 bg-slate-900/70" : "border-slate-200 bg-white"
          }`}
        >
          <div className="mb-5 flex items-center justify-between gap-3">
            <h3 className="font-bold">⚙️ Filter Alumni</h3>
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-bold text-purple-500 transition hover:text-amber-500"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="department" className="mb-2 block text-sm font-semibold">Department</label>
              <select
                id="department"
                className={inputClass}
                value={department}
                onChange={(event) => setDepartment(event.target.value)}
              >
                {DEPARTMENTS.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="graduation-year" className="mb-2 block text-sm font-semibold">Graduation Year</label>
              <select
                id="graduation-year"
                className={inputClass}
                value={graduationYear}
                onChange={(event) => setGraduationYear(event.target.value)}
              >
                <option value="All Years">All Years</option>
                {Array.from({ length: 26 }, (_, index) => new Date().getFullYear() - index).map((year) => (
                  <option key={year} value={String(year)}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="location" className="mb-2 block text-sm font-semibold">Location</label>
              <input
                id="location"
                className={inputClass}
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g. Lucknow"
              />
            </div>
            <div>
              <label htmlFor="company" className="mb-2 block text-sm font-semibold">Company</label>
              <input
                id="company"
                className={inputClass}
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="e.g. Google"
              />
            </div>
          </div>
        </div>

        {apiError && (
          <div
            className={`mb-6 rounded-xl border p-4 text-sm ${
              darkMode
                ? "border-amber-900 bg-amber-950/30 text-amber-200"
                : "border-amber-200 bg-amber-50 text-amber-800"
            }`}
            role="alert"
          >
            <p>Could not load live alumni data: {apiError}</p>
            <p className="mt-1 text-xs">Check that your backend is running and that the API URL is correct.</p>
          </div>
        )}

        {connectionStatus === "connected" && !loading && (
          <p className={`mb-5 text-xs ${mutedClass}`}>✓ Live alumni data loaded from your backend.</p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className={`animate-pulse rounded-2xl border p-6 ${
                  darkMode ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-white"
                }`}
              >
                <div className="mb-5 flex gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-slate-300/30" />
                  <div className="flex-1 space-y-3 pt-2">
                    <div className="h-4 w-3/4 rounded bg-slate-300/30" />
                    <div className="h-3 w-1/2 rounded bg-slate-300/30" />
                  </div>
                </div>
                <div className="mb-3 h-3 rounded bg-slate-300/30" />
                <div className="h-3 w-2/3 rounded bg-slate-300/30" />
              </div>
            ))}
          </div>
        ) : filteredAlumni.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredAlumni.map((person, index) => {
              const name = person.name || "Alumni Member";
              const initials = name
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((word) => word[0])
                .join("")
                .toUpperCase();
              const skills = Array.isArray(person.skills) ? person.skills : [];
              const profileId = person._id || person.id;
              const linkedinIsValid =
                typeof person.linkedin === "string" &&
                /^https?:\/\/(www\.)?linkedin\.com\//i.test(person.linkedin);

              return (
                <article
                  key={profileId || `${name}-${index}`}
                  className={`group flex h-full flex-col rounded-2xl border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                    darkMode
                      ? "border-slate-800 bg-slate-900 hover:border-purple-700 hover:shadow-purple-950/20"
                      : "border-slate-200 bg-white hover:border-purple-200 hover:shadow-purple-900/10"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-700 to-purple-950 text-xl font-black text-amber-300 shadow-md">
                      {initials || "A"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-lg font-extrabold transition group-hover:text-purple-500">{name}</h3>
                      <p className={`mt-1 text-sm ${mutedClass}`}>{person.jobTitle || "Professional"}</p>
                      <p className="mt-1 text-sm font-semibold text-amber-600">
                        {person.currentCompany || person.company || "Company not provided"}
                      </p>
                    </div>
                  </div>

                  <div className={`mt-5 space-y-2 border-y py-4 text-sm ${darkMode ? "border-slate-800" : "border-slate-100"}`}>
                    <p className={mutedClass}>
                      🎓 <span className={darkMode ? "text-slate-200" : "text-slate-700"}>
                        {person.degree || "Degree not provided"}{person.department ? ` · ${person.department}` : ""}
                      </span>
                    </p>
                    <p className={mutedClass}>
                      📅 Graduation: <span className={darkMode ? "text-slate-200" : "text-slate-700"}>{person.graduationYear || "Not provided"}</span>
                    </p>
                    <p className={mutedClass}>📍 {person.location || person.city || "Location not provided"}</p>
                  </div>

                  <p className={`mt-4 text-sm leading-6 ${darkMode ? "text-slate-400" : "text-slate-600"}`}>
                    {person.bio || "No biography provided."}
                  </p>

                  <div className="mt-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-purple-500">Skills &amp; Expertise</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.length > 0 ? skills.slice(0, 4).map((skill, skillIndex) => (
                        <span
                          key={`${skill}-${skillIndex}`}
                          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                            darkMode ? "bg-purple-950 text-purple-200" : "bg-purple-50 text-purple-800"
                          }`}
                        >
                          {skill}
                        </span>
                      )) : <span className={`text-xs ${mutedClass}`}>No skills listed</span>}
                    </div>
                  </div>

                  <div className="mt-auto flex gap-3 pt-6">
                    {profileId ? (
                      <Link
                        href={`/alumni-details/${profileId}`}
                        className="flex-1 rounded-xl bg-gradient-to-r from-purple-800 to-purple-600 px-3 py-3 text-center text-sm font-bold text-white transition hover:opacity-90"
                      >
                        View Profile →
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        title="A profile ID was not returned by the API."
                        className="flex-1 cursor-not-allowed rounded-xl bg-purple-700 px-3 py-3 text-sm font-bold text-white opacity-50"
                      >
                        View Profile
                      </button>
                    )}
                    {linkedinIsValid && (
                      <a
                        href={person.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${name}'s LinkedIn profile`}
                        className={`flex items-center justify-center rounded-xl border px-4 py-3 text-sm font-bold transition hover:border-purple-500 hover:text-purple-500 ${
                          darkMode ? "border-slate-700" : "border-slate-200"
                        }`}
                      >
                        in ↗
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div
            className={`rounded-3xl border border-dashed px-6 py-16 text-center ${
              darkMode ? "border-slate-700 bg-slate-900/50" : "border-purple-200 bg-white"
            }`}
          >
            <div className="text-5xl">🔎</div>
            <h3 className="mt-5 text-xl font-extrabold">
              {apiError ? "Alumni Data Unavailable" : "No Alumni Found"}
            </h3>
            <p className={`mx-auto mt-3 max-w-md text-sm ${mutedClass}`}>
              {apiError
                ? "The alumni list could not be loaded from the API. Please check your backend connection and try again."
                : "No alumni match your current search or filters. Try another search or clear the filters to see all available profiles."}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-xl bg-purple-700 px-6 py-3 font-bold text-white transition hover:bg-purple-800"
            >
              Clear Filters
            </button>
          </div>
        )}

        <footer className={`mt-14 border-t pt-7 text-center text-sm ${darkMode ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-500"}`}>
          © {new Date().getFullYear()} Alumni–Student Networking Portal. Connecting generations, building futures.
        </footer>
      </section>
    </main>
  );
}
