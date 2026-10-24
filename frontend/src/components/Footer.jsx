"use client";

import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const handleNewsletter = (e) => {
    e.preventDefault();

    const email = e.target.email.value.trim();

    if (!email) {
      alert("Please enter your email address.");
      return;
    }

    alert(`Thank you! ${email} has been subscribed successfully.`);
    e.target.reset();
  };

  return (
    <footer className="bg-slate-950 text-white">
      {/* ==============================
          MAIN FOOTER
      =============================== */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">

          {/* ==============================
              BRAND
          =============================== */}
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-3"
            >
              <div
                className="
                  w-11 h-11
                  rounded-xl
                  bg-gradient-to-br
                  from-purple-600
                  to-blue-600
                  flex items-center
                  justify-center
                  font-extrabold
                  text-lg
                  shadow-lg
                  shadow-purple-900/30
                "
              >
                AN
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Alumni<span className="text-purple-400">Connect</span>
                </h2>

                <p className="text-xs text-slate-400">
                  Connect • Learn • Grow
                </p>
              </div>
            </Link>

            <p
              className="
                mt-6
                text-sm
                leading-7
                text-slate-400
                max-w-sm
              "
            >
              Build meaningful connections with students, alumni,
              mentors and professionals. Grow your network and
              unlock new career opportunities.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-6">

              {/* LinkedIn */}
              <a
                href="#"
                aria-label="LinkedIn"
                className="
                
                  w-10 h-10
                  rounded-xl
                  bg-purple-400 dark:bg-slate-900/5
                  border border-white/10
                  flex items-center
                  justify-center
                  hover:bg-purple-600
                  hover:border-purple-600
                  transition duration-300
                "
              >
                in
              </a>

              {/* GitHub */}
              <a
                href="#"
                aria-label="GitHub"
                className="
                  w-10 h-10
                  rounded-xl
                  bg-purple-400 dark:bg-slate-900/5
                  border border-white/10
                  flex items-center
                  justify-center
                  hover:bg-purple-600
                  hover:border-purple-600
                  transition duration-300
                "
              >
                GH
              </a>

              {/* Twitter */}
              <a
                href="#"
                aria-label="Twitter"
                className="
                  w-10 h-10
                  rounded-xl
                  bg-purple-400 dark:bg-slate-900/5
                  border border-white/10
                  flex items-center
                  justify-center
                  hover:bg-purple-600
                  hover:border-purple-600
                  transition duration-300
                "
              >
                X
              </a>

              {/* Instagram */}
              <a
                href="#"
                aria-label="Instagram"
                className="
                  w-10 h-10
                  rounded-xl
                  bg-purple-400 dark:bg-slate-900/5
                  border border-white/10
                  flex items-center
                  justify-center
                  hover:bg-purple-600
                  hover:border-purple-600
                  transition duration-300
                "
              >
                IG
              </a>

            </div>
          </div>

          {/* ==============================
              PLATFORM LINKS
          =============================== */}
          <div>
            <h3 className="text-lg font-bold mb-6">
              Platform
            </h3>

            <ul className="space-y-4 text-sm text-slate-400">

              <li>
                <Link
                  href="#alumni"
                  className="hover:text-purple-400 transition"
                >
                  Find Alumni
                </Link>
              </li>

              <li>
                <Link
                  href="#mentors"
                  className="hover:text-purple-400 transition"
                >
                  Find a Mentor
                </Link>
              </li>

              <li>
                <Link
                  href="#opportunities"
                  className="hover:text-purple-400 transition"
                >
                  Career Opportunities
                </Link>
              </li>

              <li>
                <Link
                  href="#events"
                  className="hover:text-purple-400 transition"
                >
                  Events
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="hover:text-purple-400 transition"
                >
                  Community
                </Link>
              </li>

            </ul>
          </div>

          {/* ==============================
              COMPANY
          =============================== */}
          <div>
            <h3 className="text-lg font-bold mb-6">
              Company
            </h3>

            <ul className="space-y-4 text-sm text-slate-400">

              <li>
                <Link
                  href="#"
                  className="hover:text-purple-400 transition"
                >
                  About Us
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="hover:text-purple-400 transition"
                >
                  Contact
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="hover:text-purple-400 transition"
                >
                  Privacy Policy
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="hover:text-purple-400 transition"
                >
                  Terms & Conditions
                </Link>
              </li>

              <li>
                <Link
                  href="#"
                  className="hover:text-purple-400 transition"
                >
                  Help Center
                </Link>
              </li>

            </ul>
          </div>

          {/* ==============================
              NEWSLETTER
          =============================== */}
          <div>
            <h3 className="text-lg font-bold">
              Stay Connected
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Get updates about new mentors, opportunities,
              events and alumni activities.
            </p>

            <form
              onSubmit={handleNewsletter}
              className="mt-6"
            >
              <div className="flex flex-col gap-3">

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    bg-white dark:bg-slate-900/5
                    border
                    border-white/10
                    text-white
                    placeholder:text-slate-500
                    outline-none
                    focus:border-purple-500
                    focus:ring-2
                    focus:ring-purple-500/20
                  "
                />

                <button
                  type="submit"
                  className="
                    w-full
                    px-4
                    py-3
                    rounded-xl
                    bg-gradient-to-r
                    from-purple-600
                    to-blue-600
                    text-white
                    font-semibold
                    hover:from-purple-500
                    hover:to-blue-500
                    transition
                    duration-300
                    shadow-lg
                    shadow-purple-900/20
                  "
                >
                  Subscribe
                </button>

              </div>
            </form>
          </div>

        </div>
      </div>

      {/* ==============================
          FOOTER BOTTOM
      =============================== */}
      <div className="border-t border-white/10">
        <div
          className="
            max-w-7xl
            mx-auto
            px-6
            lg:px-8
            py-6
            flex
            flex-col
            md:flex-row
            items-center
            justify-between
            gap-4
          "
        >
          <p className="text-sm text-slate-500 text-center md:text-left">
            © {currentYear} AlumniConnect. All rights reserved.
          </p>

          <div className="flex items-center gap-5 text-sm text-slate-500">
            <span>Made for Students & Alumni</span>

            <span className="hidden sm:block">
              •
            </span>

            <span className="text-purple-400">
              Connect. Learn. Grow.
            </span>
          </div>
        </div>
      </div>

    </footer>
  );
}