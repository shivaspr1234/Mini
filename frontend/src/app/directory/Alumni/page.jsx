"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function AlumniDirectory() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [location, setLocation] = useState("");

  // =====================================================
  // FETCH ALUMNI
  // =====================================================

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          "http://localhost:5000/alumni/directory"
        );

        if (response.data.success) {
          setAlumni(response.data.data || []);
        } else {
          setError("Unable to load alumni.");
        }
      } catch (err) {
        console.log(err);

        setError(
          err.response?.data?.message ||
            "Unable to connect with server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, []);

  // =====================================================
  // UNIQUE DEPARTMENTS
  // =====================================================

  const departments = useMemo(() => {
    const values = alumni
      .map((item) => item.department)
      .filter(Boolean);

    return [...new Set(values)].sort();
  }, [alumni]);

  // =====================================================
  // UNIQUE GRADUATION YEARS
  // =====================================================

  const graduationYears = useMemo(() => {
    const values = alumni
      .map((item) => item.graduationYear)
      .filter(Boolean);

    return [...new Set(values)].sort((a, b) => b - a);
  }, [alumni]);

  // =====================================================
  // UNIQUE LOCATIONS
  // =====================================================

  const locations = useMemo(() => {
    const values = alumni
      .map((item) => item.location)
      .filter(Boolean);

    return [...new Set(values)].sort();
  }, [alumni]);

  // =====================================================
  // FILTER ALUMNI
  // =====================================================

  const filteredAlumni = useMemo(() => {
    return alumni.filter((item) => {
      const searchText = search.toLowerCase().trim();

      const searchableText = [
        item.name,
        item.email,
        item.currentCompany,
        item.jobTitle,
        item.department,
        item.degree,
        item.location,
        ...(item.skills || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchText || searchableText.includes(searchText);

      const matchesDepartment =
        !department || item.department === department;

      const matchesYear =
        !graduationYear ||
        String(item.graduationYear) === String(graduationYear);

      const matchesLocation =
        !location || item.location === location;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesYear &&
        matchesLocation
      );
    });
  }, [
    alumni,
    search,
    department,
    graduationYear,
    location,
  ]);

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setDepartment("");
    setGraduationYear("");
    setLocation("");
  };

  // =====================================================
  // CONNECT
  // =====================================================

  const handleConnect = (name) => {
    toast.success(
      `Connection request feature coming soon for ${name}`
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 transition-colors duration-300 dark:bg-[#08070d] dark:text-white sm:px-6 lg:px-8">

        <div className="mx-auto max-w-7xl">

          {/* Skeleton Hero */}

          <div className="animate-pulse">

            <div className="h-4 w-32 rounded-full bg-slate-200 dark:bg-slate-800" />

            <div className="mt-5 h-12 w-full max-w-xl rounded-xl bg-slate-200 dark:bg-slate-800" />

            <div className="mt-4 h-5 w-full max-w-2xl rounded bg-slate-200 dark:bg-slate-800" />

          </div>

          {/* Skeleton Cards */}

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-[28px] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-white/[0.04]"
              >

                <div className="h-20 w-20 rounded-2xl bg-slate-200 dark:bg-slate-800" />

                <div className="mt-5 h-5 w-36 rounded bg-slate-200 dark:bg-slate-800" />

                <div className="mt-3 h-4 w-28 rounded bg-slate-200 dark:bg-slate-800" />

                <div className="mt-7 h-3 w-full rounded bg-slate-200 dark:bg-slate-800" />

                <div className="mt-3 h-3 w-4/5 rounded bg-slate-200 dark:bg-slate-800" />

              </div>
            ))}

          </div>

        </div>

      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-hidden bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#08070d] dark:text-white">

      {/* =================================================
          DECORATIVE BACKGROUND
      ================================================== */}

      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">

        <div className="absolute -left-32 -top-32 h-80 w-80 rounded-full bg-purple-400/10 blur-3xl dark:bg-purple-600/10" />

        <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-500/10" />

      </div>


      {/* =================================================
          HERO
      ================================================== */}

      <section className="relative border-b border-slate-200 bg-white dark:border-white/10 dark:bg-[#0d0b14]">

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">

          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">

            <div className="max-w-3xl">

              {/* Eyebrow */}

              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300">

                <span className="h-2 w-2 rounded-full bg-purple-500" />

                Alumni Network

              </div>


              {/* Heading */}

              <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">

                Meet the people
                <span className="block bg-gradient-to-r from-purple-600 via-purple-500 to-amber-500 bg-clip-text text-transparent dark:from-purple-400 dark:via-purple-300 dark:to-amber-400">
                  behind the journey.
                </span>

              </h1>


              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">

                Discover experienced alumni, explore their professional
                journeys and build meaningful connections with people
                from your community.

              </p>

            </div>


            {/* Stats */}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[390px]">

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">

                <p className="text-2xl font-black text-purple-600 dark:text-purple-400">
                  {alumni.length}
                </p>

                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Total Alumni
                </p>

              </div>


              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">

                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {filteredAlumni.length}
                </p>

                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Results
                </p>

              </div>


              <div className="col-span-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04] sm:col-span-1">

                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {
                    alumni.filter(
                      (item) => item.isVerified
                    ).length
                  }
                </p>

                <p className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                  Verified
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =================================================
          SEARCH / FILTER PANEL
      ================================================== */}

      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">

        <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_60px_-25px_rgba(15,23,42,0.25)] dark:border-white/10 dark:bg-[#111019] dark:shadow-black/30 sm:p-6">

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end">

            {/* Search */}

            <div className="flex-1">

              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Search
              </label>

              <div className="group relative">

                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                  🔍
                </span>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, company, role, skills..."
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-purple-500 focus:bg-white focus:ring-4 focus:ring-purple-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:focus:border-purple-400 dark:focus:bg-white/[0.06]"
                />

              </div>

            </div>


            {/* Department */}

            <div className="w-full lg:w-52">

              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Department
              </label>

              <select
                value={department}
                onChange={(e) =>
                  setDepartment(e.target.value)
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              >

                <option value="">
                  All Departments
                </option>

                {departments.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}

              </select>

            </div>


            {/* Year */}

            <div className="w-full lg:w-48">

              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Graduation
              </label>

              <select
                value={graduationYear}
                onChange={(e) =>
                  setGraduationYear(e.target.value)
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              >

                <option value="">
                  All Years
                </option>

                {graduationYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}

              </select>

            </div>


            {/* Location */}

            <div className="w-full lg:w-48">

              <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Location
              </label>

              <select
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:border-white/10 dark:bg-white/[0.04] dark:text-white"
              >

                <option value="">
                  All Locations
                </option>

                {locations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}

              </select>

            </div>


            {/* Clear */}

            <button
              type="button"
              onClick={clearFilters}
              className="h-12 rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300 dark:hover:border-purple-500/30 dark:hover:bg-purple-500/10 dark:hover:text-purple-300"
            >
              Reset
            </button>

          </div>

        </div>

      </section>


      {/* =================================================
          ERROR STATE
      ================================================== */}

      {error && (
        <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">

          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-500/20 dark:bg-red-500/5">

            <div className="text-4xl">
              ⚠️
            </div>

            <h2 className="mt-4 text-xl font-bold">
              Unable to load alumni
            </h2>

            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-purple-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
            >
              Try Again
            </button>

          </div>

        </section>
      )}


      {/* =================================================
          ALUMNI SECTION
      ================================================== */}

      {!error && (
        <section className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">

          {/* Section Heading */}

          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-purple-600 dark:text-purple-400">
                Community
              </p>

              <h2 className="mt-2 text-2xl font-black sm:text-3xl">
                Alumni Network
              </h2>

            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {filteredAlumni.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-900 dark:text-white">
                {alumni.length}
              </span>{" "}
              alumni
            </p>

          </div>


          {/* Empty State */}

          {filteredAlumni.length === 0 ? (
            <div className="rounded-[30px] border border-dashed border-slate-300 bg-white px-6 py-20 text-center dark:border-white/10 dark:bg-white/[0.03]">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-purple-50 text-4xl dark:bg-purple-500/10">
                🔎
              </div>

              <h3 className="mt-6 text-xl font-black">
                No alumni found
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Try changing your search keyword or removing
                one or more filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 rounded-xl bg-purple-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-purple-700"
              >
                Clear All Filters
              </button>

            </div>
          ) : (

            /* =================================================
               CARDS
            ================================================== */

            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">

              {filteredAlumni.map((item) => (

                <article
                  key={item._id}
                  className="group relative overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-purple-200 hover:shadow-[0_25px_70px_-30px_rgba(124,58,237,0.35)] dark:border-white/10 dark:bg-[#111019] dark:hover:border-purple-500/20"
                >

                  {/* Top Gradient */}

                  <div className="h-1.5 bg-gradient-to-r from-purple-600 via-purple-500 to-amber-500" />


                  {/* Card */}

                  <div className="p-6">

                    {/* Profile Header */}

                    <div className="flex items-start justify-between gap-4">

                      <div className="flex min-w-0 items-center gap-4">

                        {/* Avatar */}

                        {item.profileImage ? (
                          <img
                            src={item.profileImage}
                            alt={item.name || "Alumni"}
                            className="h-20 w-20 shrink-0 rounded-2xl object-cover shadow-sm ring-4 ring-purple-50 dark:ring-purple-500/10"
                          />
                        ) : (
                          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-purple-700 to-slate-900 text-2xl font-black text-white shadow-lg">

                            <span>
                              {item.name
                                ?.charAt(0)
                                ?.toUpperCase() || "A"}
                            </span>

                            <div className="absolute -bottom-6 -right-6 h-14 w-14 rounded-full bg-amber-400/30 blur-xl" />

                          </div>
                        )}


                        <div className="min-w-0">

                          <div className="flex items-center gap-2">

                            <h3 className="truncate text-lg font-black">
                              {item.name || "Alumni"}
                            </h3>

                            {item.isVerified && (
                              <span
                                title="Verified Alumni"
                                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-black text-white"
                              >
                                ✓
                              </span>
                            )}

                          </div>

                          <p className="mt-1 truncate text-sm font-medium text-slate-500 dark:text-slate-400">
                            {item.jobTitle || "Professional"}
                          </p>

                        </div>

                      </div>

                    </div>


                    {/* Divider */}

                    <div className="my-6 h-px bg-slate-100 dark:bg-white/10" />


                    {/* Details */}

                    <div className="space-y-3">

                      {item.currentCompany && (
                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-sm dark:bg-purple-500/10">
                            🏢
                          </div>

                          <div className="min-w-0">

                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Company
                            </p>

                            <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                              {item.currentCompany}
                            </p>

                          </div>

                        </div>
                      )}


                      {item.location && (
                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-sm dark:bg-amber-500/10">
                            📍
                          </div>

                          <div className="min-w-0">

                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Location
                            </p>

                            <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                              {item.location}
                            </p>

                          </div>

                        </div>
                      )}


                      {(item.degree || item.department) && (
                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-sm dark:bg-purple-500/10">
                            🎓
                          </div>

                          <div className="min-w-0">

                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Education
                            </p>

                            <p className="truncate text-sm font-semibold text-slate-700 dark:text-slate-200">
                              {[
                                item.degree,
                                item.department,
                              ]
                                .filter(Boolean)
                                .join(" • ")}
                            </p>

                          </div>

                        </div>
                      )}


                      {item.graduationYear && (
                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm dark:bg-emerald-500/10">
                            📅
                          </div>

                          <div>

                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Graduation
                            </p>

                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                              Class of {item.graduationYear}
                            </p>

                          </div>

                        </div>
                      )}

                    </div>


                    {/* Skills */}

                    {item.skills?.length > 0 && (
                      <div className="mt-6">

                        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Skills
                        </p>

                        <div className="flex flex-wrap gap-2">

                          {item.skills
                            .slice(0, 4)
                            .map((skill, index) => (
                              <span
                                key={`${skill}-${index}`}
                                className="rounded-full border border-purple-100 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-300"
                              >
                                {skill}
                              </span>
                            ))}

                          {item.skills.length > 4 && (
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
                              +{item.skills.length - 4}
                            </span>
                          )}

                        </div>

                      </div>
                    )}


                    {/* Bio */}

                    {item.bio && (
                      <p className="mt-5 line-clamp-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                        {item.bio}
                      </p>
                    )}


                    {/* Buttons */}

                    <div className="mt-6 grid grid-cols-2 gap-3">

                      <Link
                        href={`/directory/Alumni/${item._id}`}
                        className="flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 transition hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-200 dark:hover:border-purple-500/30 dark:hover:bg-purple-500/10 dark:hover:text-purple-300"
                      >
                        View Profile
                      </Link>


                      <button
                        type="button"
                        onClick={() =>
                          handleConnect(item.name)
                        }
                        className="h-11 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 text-sm font-bold text-white shadow-lg shadow-purple-600/20 transition hover:-translate-y-0.5 hover:from-purple-700 hover:to-purple-800"
                      >
                        Connect
                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>

          )}

        </section>
      )}

    </main>
  );
}