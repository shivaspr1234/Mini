import React from "react";
import Link from "next/link";

const Home = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900dark:bg-slate-950 dark:text-white">

      {/* =========================================================
          HERO SECTION
      ========================================================= */}
      <section className="relative overflow-hidden bg-slate-50 dark:bg-slate-950">

        {/* Background Decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="
              absolute -top-32 -right-32
              w-96 h-96
              rounded-full
              bg-purple-200/40
              dark:bg-purple-900/20
              blur-3xl
            "
          />

          <div
            className="
              absolute top-72 -left-40
              w-96 h-96
              rounded-full
              bg-blue-200/30
              dark:bg-blue-900/20
              blur-3xl
            "
          />
        </div>

        <div
          className="
            relative max-w-7xl mx-auto
            px-6 lg:px-8
            py-20 lg:py-28
          "
        >
          <div className="grid lg:grid-cols-2 gap-14 items-center">

            {/* =====================================================
                LEFT CONTENT
            ===================================================== */}
            <div>

              {/* Badge */}
              <div
                className="
                  inline-flex items-center gap-2
                  px-4 py-2
                  rounded-full
                  bg-purple-100
                  dark:bg-purple-900/30
                  text-purple-700
                  dark:text-purple-300
                  text-sm font-semibold
                "
              >
                <span
                  className="
                    w-2 h-2
                    rounded-full
                    bg-purple-600
                  "
                />

                Connecting Students &amp; Alumni
              </div>

              {/* Heading */}
              <h1
                className="
                  mt-6
                  text-4xl sm:text-5xl lg:text-6xl
                  font-extrabold
                  leading-tight
                  tracking-tight
                  text-slate-900
                  dark:text-white
                "
              >
                Your Alumni Network.

                <span
                  className="
                    text-transparent
                    bg-clip-text
                    bg-gradient-to-r
                    from-purple-600
                    to-blue-600
                  "
                >
                  Your Future.
                </span>
              </h1>

              {/* Description */}
              <p
                className="
                  mt-6
                  max-w-xl
                  text-lg
                  leading-8
                  text-slate-600
                  dark:text-slate-300
                "
              >
                Connect with alumni, discover career opportunities, find
                mentors, share experiences and build meaningful professional
                relationships beyond your campus.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">

                <Link
                  href="/signup"
                  className="
                    inline-flex items-center justify-center
                    px-7 py-3.5
                    rounded-xl
                    bg-purple-600
                    text-white
                    font-semibold
                    shadow-lg shadow-purple-200
                    dark:shadow-purple-950/30
                    hover:bg-purple-700
                    transition duration-300
                  "
                >
                  Join Alumni Network

                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>

                <Link
                  href="/directory/Alumni"
                  className="
                    inline-flex items-center justify-center
                    px-7 py-3.5
                    rounded-xl
                    bg-white
                    dark:bg-slate-900
                    border border-slate-300
                    dark:border-slate-700
                    text-slate-700
                    dark:text-slate-200
                    font-semibold
                    hover:border-purple-400
                    hover:text-purple-600
                    transition duration-300
                  "
                >
                  Explore Alumni
                </Link>

              </div>

              {/* Mini Stats */}
              <div
                className="
                  grid grid-cols-3
                  gap-6
                  mt-12
                  max-w-lg
                "
              >
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    25K+
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Alumni
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    500+
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Mentors
                  </p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    1000+
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Opportunities
                  </p>
                </div>
              </div>

            </div>

            {/* =====================================================
                RIGHT SIDE - CONNECTION CARD
            ===================================================== */}
            <div className="relative">

              <div
                className="
                  relative
                  max-w-lg
                  mx-auto
                  bg-white
                  dark:bg-slate-900
                  rounded-3xl
                  border border-slate-200
                  dark:border-slate-700
                  shadow-2xl
                  p-6
                "
              >

                {/* Card Header */}
                <div className="flex items-center justify-between">

                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Alumni Network
                    </p>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Find Your Connection
                    </h3>
                  </div>

                  <div
                    className="
                      w-11 h-11
                      rounded-xl
                      bg-purple-100
                      dark:bg-purple-900/30
                      flex items-center justify-center
                      text-purple-600
                      dark:text-purple-300
                    "
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a4 4 0 00-4-4h-1M9 20H4v-2a4 4 0 014-4h1m8-5a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  </div>

                </div>

                {/* Search */}
                
                <div
                
                
                  className="
                    mt-6
                    flex items-center
                    gap-3
                    px-4 py-3
                    bg-slate-50
                    dark:bg-slate-800
                    border border-slate-200
                    dark:border-slate-700
                    rounded-xl
                  "
                >
                  <svg
                    className="w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-1.85z"
                      
                    />
                  </svg>

                  <span className="text-sm text-slate-400" >
                    
                  
                    Search alumni by skill, company...
                  </span>
                  
                </div>
                

                {/* Alumni 1 */}
                <div
                  className="
                    mt-5
                    flex items-center
                    gap-4
                    p-4
                    rounded-2xl
                    border border-slate-100
                    dark:border-slate-700
                    hover:bg-slate-50
                    dark:hover:bg-slate-800
                    transition
                  "
                >
                  <div
                    className="
                      w-12 h-12
                      rounded-full
                      bg-gradient-to-br
                      from-purple-500
                      to-indigo-600
                      flex items-center justify-center
                      text-white font-bold
                    "
                  >
                    AS
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      Ankit Sharma
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Software Engineer · Google
                    </p>
                  </div>

                  <Link
                    href="/directory/Alumni"
                    className="
                      px-4 py-2
                      rounded-lg
                      bg-purple-50
                      dark:bg-purple-950/40
                      text-purple-600
                      dark:text-purple-300
                      text-sm font-semibold
                      hover:bg-purple-100
                      dark:hover:bg-purple-900/50
                    "
                  >
                    Connect
                  </Link>
                </div>

                {/* Alumni 2 */}
                <div
                  className="
                    mt-3
                    flex items-center
                    gap-4
                    p-4
                    rounded-2xl
                    border border-slate-100
                    dark:border-slate-700
                    hover:bg-slate-50
                    dark:hover:bg-slate-800
                    transition
                  "
                >
                  <div
                    className="
                      w-12 h-12
                      rounded-full
                      bg-gradient-to-br
                      from-blue-500
                      to-cyan-500
                      flex items-center justify-center
                      text-white font-bold
                    "
                  >
                    PK
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      Priya Kapoor
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Product Manager · Microsoft
                    </p>
                  </div>

                  <Link
                    href="/directory/Alumni"
                    className="
                      px-4 py-2
                      rounded-lg
                      bg-purple-50
                      dark:bg-purple-950/40
                      text-purple-600
                      dark:text-purple-300
                      text-sm font-semibold
                      hover:bg-purple-100
                      dark:hover:bg-purple-900/50
                    "
                  >
                    Connect
                  </Link>
                </div>

                {/* Alumni 3 */}
                <div
                  className="
                    mt-3
                    flex items-center
                    gap-4
                    p-4
                    rounded-2xl
                    border border-slate-100
                    dark:border-slate-700
                    hover:bg-slate-50
                    dark:hover:bg-slate-800
                    transition
                  "
                >
                  <div
                    className="
                      w-12 h-12
                      rounded-full
                      bg-gradient-to-br
                      from-orange-500
                      to-pink-500
                      flex items-center justify-center
                      text-white font-bold
                    "
                  >
                    RK
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      Rahul Kumar
                    </h4>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Founder · Tech Startup
                    </p>
                  </div>

                  <Link
                    href="/directory/Alumni"
                    className="
                      px-4 py-2
                      rounded-lg
                      bg-purple-50
                      dark:bg-purple-950/40
                      text-purple-600
                      dark:text-purple-300
                      text-sm font-semibold
                      hover:bg-purple-100
                      dark:hover:bg-purple-900/50
                    "
                  >
                    Connect
                  </Link>
                </div>

              </div>

              {/* Floating Notification */}
              <div
                className="
                  hidden md:flex
                  absolute
                  -top-7
                  -right-8
                  bg-white
                  dark:bg-slate-900
                  rounded-2xl
                  shadow-xl
                  border border-slate-200
                  dark:border-slate-700
                  px-5 py-4
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    w-10 h-10
                    rounded-xl
                    bg-green-100
                    dark:bg-green-900/30
                    flex items-center justify-center
                  "
                >
                  ✓
                </div>

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    New Connection
                  </p>

                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Connection Accepted
                  </p>
                </div>
              </div>

              {/* Floating Mentor */}
              <div
                className="
                  hidden md:flex
                  absolute
                  -bottom-7
                  -left-8
                  bg-white
                  dark:bg-slate-900
                  rounded-2xl
                  shadow-xl
                  border border-slate-200
                  dark:border-slate-700
                  px-5 py-4
                  items-center
                  gap-3
                "
              >
                <div
                  className="
                    w-10 h-10
                    rounded-xl
                    bg-blue-100
                    dark:bg-blue-900/30
                    flex items-center justify-center
                  "
                >
                  🎓
                </div>

                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Mentor Available
                  </p>

                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    120+ Active Mentors
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>


      {/* =========================================================
          NETWORK STATS
      ========================================================= */}
      <section
        className="
          py-10
          border-b border-slate-200
          dark:border-slate-700
          bg-white
          dark:bg-slate-900
        "
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-8">

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">

            <div>
              <h3 className="text-3xl font-extrabold text-purple-600">
                25K+
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Registered Alumni
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-extrabold text-purple-600">
                500+
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Industry Mentors
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-extrabold text-purple-600">
                1K+
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Career Opportunities
              </p>
            </div>

            <div>
              <h3 className="text-3xl font-extrabold text-purple-600">
                50+
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Countries
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* =========================================================
          FEATURES
      ========================================================= */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900">

        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto">

            <span
              className="
                text-sm font-semibold
                uppercase tracking-wider
                text-purple-600
              "
            >
              Why Alumni Connect?
            </span>

            <h2
              className="
                mt-3
                text-3xl md:text-4xl
                font-bold
                text-slate-900
                dark:text-white
              "
            >
              Everything You Need To Grow
            </h2>

            <p className="mt-4 text-slate-500 dark:text-slate-400 leading-7">
              Build valuable relationships and unlock opportunities through
              your alumni network.
            </p>

          </div>


          <div
            className="
              grid
              sm:grid-cols-2
              lg:grid-cols-4
              gap-6
              mt-14
            "
          >

            {/* Networking */}
            <div
              className="
                group
                p-7
                rounded-2xl
                bg-white
                dark:bg-slate-900
                border border-slate-200
                dark:border-slate-700
                hover:border-purple-200
                dark:hover:border-purple-700
                hover:shadow-xl
                transition duration-300
              "
            >
              <div
                className="
                  w-14 h-14
                  rounded-2xl
                  bg-purple-100
                  dark:bg-purple-900/30
                  flex items-center justify-center
                  text-2xl
                  group-hover:scale-110
                  transition
                "
              >
                🤝
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                Networking
              </h3>

              <p className="mt-3 text-slate-500 dark:text-slate-400 leading-6">
                Connect with alumni and students from different batches and
                industries.
              </p>
            </div>


            {/* Mentorship */}
            <div
              className="
                group
                p-7
                rounded-2xl
                bg-white
                dark:bg-slate-900
                border border-slate-200
                dark:border-slate-700
                hover:border-blue-200
                dark:hover:border-blue-700
                hover:shadow-xl
                transition duration-300
              "
            >
              <div
                className="
                  w-14 h-14
                  rounded-2xl
                  bg-blue-100
                  dark:bg-blue-900/30
                  flex items-center justify-center
                  text-2xl
                  group-hover:scale-110
                  transition
                "
              >
                🎓
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                Mentorship
              </h3>

              <p className="mt-3 text-slate-500 dark:text-slate-400 leading-6">
                Learn from experienced alumni and get guidance for your career
                journey.
              </p>
            </div>


            {/* Career */}
            <div
              className="
                group
                p-7
                rounded-2xl
                bg-white
                dark:bg-slate-900
                border border-slate-200
                dark:border-slate-700
                hover:border-green-200
                dark:hover:border-green-700
                hover:shadow-xl
                transition duration-300
              "
            >
              <div
                className="
                  w-14 h-14
                  rounded-2xl
                  bg-green-100
                  dark:bg-green-900/30
                  flex items-center justify-center
                  text-2xl
                  group-hover:scale-110
                  transition
                "
              >
                💼
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                Career Opportunities
              </h3>

              <p className="mt-3 text-slate-500 dark:text-slate-400 leading-6">
                Discover internships, Jobs, referrals and career
                opportunities.
              </p>
            </div>


            {/* Events */}
            <div
              className="
                group
                p-7
                rounded-2xl
                bg-white
                dark:bg-slate-900
                border border-slate-200
                dark:border-slate-700
                hover:border-orange-200
                dark:hover:border-orange-700
                hover:shadow-xl
                transition duration-300
              "
            >
              <div
                className="
                  w-14 h-14
                  rounded-2xl
                  bg-orange-100
                  dark:bg-orange-900/30
                  flex items-center justify-center
                  text-2xl
                  group-hover:scale-110
                  transition
                "
              >
                📅
              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                Events
              </h3>

              <p className="mt-3 text-slate-500 dark:text-slate-400 leading-6">
                Join alumni meetups, webinars, workshops and networking
                events.
              </p>
            </div>

          </div>

        </div>
      </section>


      {/* =========================================================
          ALUMNI SECTION
      ========================================================= */}
      <section
        id="alumni"
        className="py-20 bg-slate-50 dark:bg-slate-950"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          <div
            className="
              flex flex-col
              md:flex-row
              md:items-end
              md:justify-between
              gap-5
            "
          >
            <div>

              <span
                className="
                  text-sm
                  font-semibold
                  uppercase
                  tracking-wider
                  text-purple-600
                "
              >
                Meet Our Alumni
              </span>

              <h2
                className="
                  mt-3
                  text-3xl md:text-4xl
                  font-bold
                  text-slate-900
                  dark:text-white
                "
              >
                People Making An Impact
              </h2>

            </div>

            <Link
              href="/directory/Alumni"
              className="
                font-semibold
                text-purple-600
                hover:text-purple-800
              "
            >
              View All Alumni →
            </Link>
          </div>


          <div
            className="
              grid
              sm:grid-cols-2
              lg:grid-cols-4
              gap-6
              mt-12
            "
          >

            {/* Alumni Card 1 */}
            <div
              className="
                bg-white
                dark:bg-slate-900
                rounded-2xl
                border border-slate-200
                dark:border-slate-700
                p-6
                text-center
                hover:-translate-y-2
                hover:shadow-xl
                transition duration-300
              "
            >
              <div
                className="
                  w-20 h-20 mx-auto
                  rounded-full
                  bg-gradient-to-br
                  from-purple-500
                  to-indigo-600
                  flex items-center justify-center
                  text-white text-xl font-bold
                "
              >
                AS
              </div>

              <h3 className="mt-5 font-bold text-lg text-slate-900 dark:text-white">
                Ankit Sharma
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Software Engineer
              </p>

              <p className="text-xs text-purple-600 font-semibold mt-2">
                Google
              </p><br/>

              <Link
                href="/directory/Alumni"
                className="
                  w-full mt-5 py-2.5 rounded-xl
                  bg-purple-50
                  dark:bg-purple-950/40
                  text-purple-600
                  dark:text-purple-300
                  text-sm font-semibold
                  hover:bg-purple-100
                  dark:hover:bg-purple-900/50
                "
              >
                View Profile
              </Link>
            </div>


            {/* Alumni Card 2 */}
            <div
              className="
                bg-white
                dark:bg-slate-900
                rounded-2xl
                border border-slate-200
                dark:border-slate-700
                p-6
                text-center
                hover:-translate-y-2
                hover:shadow-xl
                transition duration-300
              "
            >
              <div
                className="
                  w-20 h-20 mx-auto
                  rounded-full
                  bg-gradient-to-br
                  from-blue-500
                  to-cyan-500
                  flex items-center justify-center
                  text-white text-xl font-bold
                "
              >
                PK
              </div>

              <h3 className="mt-5 font-bold text-lg text-slate-900 dark:text-white">
                Priya Kapoor
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Product Manager
              </p>

              <p className="text-xs text-blue-600 font-semibold mt-2">
                Microsoft
              </p><br/>

              <Link
                href="/directory/Alumni"
                className="
                  w-full mt-5 py-2.5 rounded-xl
                  bg-blue-50
                  dark:bg-blue-950/40
                  text-blue-600
                  dark:text-blue-300
                  text-sm font-semibold
                  hover:bg-blue-100
                  dark:hover:bg-blue-900/50
                "
              >
                View Profile
              </Link>
            </div>


            {/* Alumni Card 3 */}
            <div
              className="
                bg-white
                dark:bg-slate-900
                rounded-2xl
                border border-slate-200
                dark:border-slate-700
                p-6
                text-center
                hover:-translate-y-2
                hover:shadow-xl
                transition duration-300
              "
            >
              <div
                className="
                  w-20 h-20 mx-auto
                  rounded-full
                  bg-gradient-to-br
                  from-orange-500
                  to-pink-500
                  flex items-center justify-center
                  text-white text-xl font-bold
                "
              >
                RK
              </div>

              <h3 className="mt-5 font-bold text-lg text-slate-900 dark:text-white">
                Rahul Kumar
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Founder &amp; CEO
              </p>

              <p className="text-xs text-orange-600 font-semibold mt-2">
                TechNova
              </p><br/>

              <Link
                href="/directory/Alumni"
                className="
                  w-full mt-5 py-2.5 rounded-xl
                  bg-orange-50
                  dark:bg-orange-950/40
                  text-orange-600
                  dark:text-orange-300
                  text-sm font-semibold
                  hover:bg-orange-100
                  dark:hover:bg-orange-900/50
                "
              >
                View Profile
              </Link>
            </div>


            {/* Alumni Card 4 */}
            <div
              className="
                bg-white
                dark:bg-slate-900
                rounded-2xl
                border border-slate-200
                dark:border-slate-700
                p-6
                text-center
                hover:-translate-y-2
                hover:shadow-xl
                transition duration-300
              "
            >
              <div
                className="
                  w-20 h-20 mx-auto
                  rounded-full
                  bg-gradient-to-br
                  from-green-500
                  to-emerald-600
                  flex items-center justify-center
                  text-white text-xl font-bold
                "
              >
                NM
              </div>

              <h3 className="mt-5 font-bold text-lg text-slate-900 dark:text-white">
                Neha Mishra
              </h3>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Data Scientist
              </p>

              <p className="text-xs text-green-600 font-semibold mt-2">
                Amazon
              </p><br/>

              <Link
                href="/directory/Alumni"
                className="
                  w-full mt-5 py-2.5 rounded-xl
                  bg-green-50
                  dark:bg-green-950/40
                  text-green-600
                  dark:text-green-300
                  text-sm font-semibold
                  hover:bg-green-100
                  dark:hover:bg-green-900/50
                "
              >
                View Profile
              </Link>
            </div>

          </div>

        </div>
      </section>


      {/* =========================================================
          MENTORSHIP SECTION
      ========================================================= */}
      <section id="events" className="py-20 bg-white dark:bg-slate-900">

        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          <div className="grid lg:grid-cols-2 gap-14 items-center">

            {/* LEFT */}
            <div>

              <span className="text-sm font-semibold uppercase tracking-wider text-purple-600">
                Alumni Mentorship
              </span>

              <h2
                className="
                  mt-4
                  text-3xl md:text-4xl
                  font-bold
                  leading-tight
                  text-slate-900
                  dark:text-white
                "
              >
                Learn From Those{" "}
                <span className="text-purple-600">
                  Who&apos;ve Been There.
                </span>
              </h2>

              <p className="mt-5 text-slate-500 dark:text-slate-400 leading-7 max-w-xl">
                Get career advice, interview preparation, industry insights
                and guidance directly from experienced alumni.
              </p>


              {/* Benefits */}
              <div className="mt-8 space-y-5">

                <div className="flex items-start gap-4">

                  <div
                    className="
                      w-10 h-10 shrink-0
                      rounded-xl
                      bg-purple-100
                      dark:bg-purple-900/30
                      flex items-center justify-center
                      text-purple-600
                    "
                  >
                    ✓
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      1-on-1 Mentorship
                    </h3>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Connect with mentors based on your career goals.
                    </p>
                  </div>

                </div>


                <div className="flex items-start gap-4">

                  <div
                    className="
                      w-10 h-10 shrink-0
                      rounded-xl
                      bg-blue-100
                      dark:bg-blue-900/30
                      flex items-center justify-center
                      text-blue-600
                    "
                  >
                    ✓
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      Career Guidance
                    </h3>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Get real-world advice from industry professionals.
                    </p>
                  </div>

                </div>


                <div className="flex items-start gap-4">

                  <div
                    className="
                      w-10 h-10 shrink-0
                      rounded-xl
                      bg-green-100
                      dark:bg-green-900/30
                      flex items-center justify-center
                      text-green-600
                    "
                  >
                    ✓
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      Industry Connections
                    </h3>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Expand your professional network with valuable
                      connections.
                    </p>
                  </div>

                </div>

              </div>

              <Link
                href="/directory/Alumni"
                className="
                  inline-flex
                  mt-9
                  px-7 py-3.5
                  rounded-xl
                  bg-purple-600
                  text-white
                  font-semibold
                  hover:bg-purple-700
                  transition
                "
              >
                Find A Mentor →
              </Link>

            </div>


            {/* RIGHT */}
            <div className="relative">

              <div
                className="
                  bg-slate-50
                  dark:bg-slate-950
                  rounded-3xl
                  border border-slate-200
                  dark:border-slate-700
                  p-7
                "
              >

                <div className="flex items-center justify-between mb-6">

                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Recommended For You
                    </p>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Top Mentors
                    </h3>
                  </div>

                  <span
                    className="
                      px-3 py-1
                      rounded-full
                      bg-green-100
                      dark:bg-green-900/30
                      text-green-600
                      dark:text-green-300
                      text-xs font-semibold
                    "
                  >
                    Available
                  </span>

                </div>


                {/* Mentor 1 */}
                <div
                  className="
                    bg-white
                    dark:bg-slate-900
                    rounded-2xl
                    p-5
                    border border-slate-200
                    dark:border-slate-700
                    flex items-center
                    gap-4
                  "
                >
                  <div
                    className="
                      w-14 h-14
                      rounded-full
                      bg-gradient-to-br
                      from-purple-500
                      to-indigo-600
                      flex items-center justify-center
                      text-white font-bold
                    "
                  >
                    VS
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      Vikram Singh
                    </h4>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Senior Software Engineer
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-yellow-500">
                        ★★★★★
                      </span>

                      <span className="text-xs text-slate-400">
                        4.9
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/directory/Alumni"
                    className="
                      hidden sm:block
                      px-4 py-2
                      rounded-lg
                      bg-purple-600
                      text-white
                      text-sm font-semibold
                      hover:bg-purple-700
                    "
                  >
                    Connect
                  </Link>
                </div>


                {/* Mentor 2 */}
                <div
                  className="
                    bg-white
                    dark:bg-slate-900
                    rounded-2xl
                    p-5
                    border border-slate-200
                    dark:border-slate-700
                    flex items-center
                    gap-4
                    mt-4
                  "
                >
                  <div
                    className="
                      w-14 h-14
                      rounded-full
                      bg-gradient-to-br
                      from-blue-500
                      to-cyan-500
                      flex items-center justify-center
                      text-white font-bold
                    "
                  >
                    AP
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      Aditi Patel
                    </h4>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Product Lead
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-yellow-500">
                        ★★★★★
                      </span>

                      <span className="text-xs text-slate-400">
                        4.8
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/directory/Alumni"
                    className="
                      hidden sm:block
                      px-4 py-2
                      rounded-lg
                      bg-purple-600
                      text-white
                      text-sm font-semibold
                      hover:bg-purple-700
                    "
                  >
                    Connect
                  </Link>
                </div>


                {/* Mentor 3 */}
                <div
                  className="
                    bg-white
                    dark:bg-slate-900
                    rounded-2xl
                    p-5
                    border border-slate-200
                    dark:border-slate-700
                    flex items-center
                    gap-4
                    mt-4
                  "
                >
                  <div
                    className="
                      w-14 h-14
                      rounded-full
                      bg-gradient-to-br
                      from-orange-500
                      to-pink-500
                      flex items-center justify-center
                      text-white font-bold
                    "
                  >
                    RM
                  </div>

                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white">
                      Rohan Mehta
                    </h4>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Startup Founder
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-yellow-500">
                        ★★★★★
                      </span>

                      <span className="text-xs text-slate-400">
                        4.9
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/directory/Alumni"
                    className="
                      hidden sm:block
                      px-4 py-2
                      rounded-lg
                      bg-purple-600
                      text-white
                      text-sm font-semibold
                      hover:bg-purple-700
                    "
                  >
                    Connect
                  </Link>
                </div>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* =========================================================
          OPPORTUNITIES
      ========================================================= */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">

        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto">

            <span className="text-sm font-semibold uppercase tracking-wider text-purple-600">
              Career Opportunities
            </span>

            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              Opportunities From Your Network
            </h2>

            <p className="mt-4 text-slate-500 dark:text-slate-400">
              Discover Jobs and internships shared by alumni and partner
              companies.
            </p>

          </div>


          <div className="grid lg:grid-cols-3 gap-6 mt-12">

            {/* Job 1 */}
            <div
              className="
                bg-white
                dark:bg-slate-900
                rounded-2xl
                border border-slate-200
                dark:border-slate-700
                p-6
                hover:shadow-xl
                transition
              "
            >
              <div className="flex items-center justify-between">

                <div
                  className="
                    w-12 h-12
                    rounded-xl
                    bg-blue-100
                    dark:bg-blue-900/30
                    flex items-center justify-center
                    font-bold
                    text-blue-600
                  "
                >
                  G
                </div>

                <span
                  className="
                    px-3 py-1
                    rounded-full
                    bg-green-100
                    dark:bg-green-900/30
                    text-green-600
                    dark:text-green-300
                    text-xs font-semibold
                  "
                >
                  Internship
                </span>

              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                Software Engineering Intern
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Google · Bangalore
              </p>

              <div className="flex flex-wrap gap-2 mt-5">

                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs">
                  React
                </span>

                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs">
                  JavaScript
                </span>

                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs">
                  Node.js
                </span>

              </div>

              <div className="mt-6 flex items-center justify-between">

                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Posted by Alumni
                </span>

                <Link href="/directory" className="text-purple-600 font-semibold text-sm">
                  Apply →
                </Link>

              </div>
            </div>


            {/* Job 2 */}
            <div
              className="
                bg-white
                dark:bg-slate-900
                rounded-2xl
                border border-slate-200
                dark:border-slate-700
                p-6
                hover:shadow-xl
                transition
              "
            >
              <div className="flex items-center justify-between">

                <div
                  className="
                    w-12 h-12
                    rounded-xl
                    bg-purple-100
                    dark:bg-purple-900/30
                    flex items-center justify-center
                    font-bold
                    text-purple-600
                  "
                >
                  M
                </div>

                <span
                  className="
                    px-3 py-1
                    rounded-full
                    bg-blue-100
                    dark:bg-blue-900/30
                    text-blue-600
                    dark:text-blue-300
                    text-xs font-semibold
                  "
                >
                  Full Time
                </span>

              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                Product Designer
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Microsoft · Hyderabad
              </p>

              <div className="flex flex-wrap gap-2 mt-5">

                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs">
                  Figma
                </span>

                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs">
                  UI/UX
                </span>

                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs">
                  Design
                </span>

              </div>

              <div className="mt-6 flex items-center justify-between">

                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Posted by Alumni
                </span>

                <Link href="/directory" className="text-purple-600 font-semibold text-sm">
                  Apply →
                </Link>

              </div>
            </div>


            {/* Job 3 */}
            <div
              className="
                bg-white
                dark:bg-slate-900
                rounded-2xl
                border border-slate-200
                dark:border-slate-700
                p-6
                hover:shadow-xl
                transition
              "
            >
              <div className="flex items-center justify-between">

                <div
                  className="
                    w-12 h-12
                    rounded-xl
                    bg-orange-100
                    dark:bg-orange-900/30
                    flex items-center justify-center
                    font-bold
                    text-orange-600
                  "
                >
                  A
                </div>

                <span
                  className="
                    px-3 py-1
                    rounded-full
                    bg-green-100
                    dark:bg-green-900/30
                    text-green-600
                    dark:text-green-300
                    text-xs font-semibold
                  "
                >
                  Internship
                </span>

              </div>

              <h3 className="mt-6 text-xl font-bold text-slate-900 dark:text-white">
                Data Analyst Intern
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Amazon · Chennai
              </p>

              <div className="flex flex-wrap gap-2 mt-5">

                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs">
                  Python
                </span>

                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs">
                  SQL
                </span>

                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs">
                  Excel
                </span>

              </div>

              <div className="mt-6 flex items-center justify-between">

                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Posted by Alumni
                </span>

                <Link href="/directory" className="text-purple-600 font-semibold text-sm">
                  Apply →
                </Link>

              </div>
            </div>

          </div>

        </div>
      </section>


      {/* =========================================================
          EVENTS
      ========================================================= */}
      <section className="py-20 bg-white dark:bg-slate-900">

        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          <div
            className="
              flex flex-col
              md:flex-row
              md:items-end
              md:justify-between
              gap-5
            "
          >
            <div>

              <span className="text-sm font-semibold uppercase tracking-wider text-purple-600">
                Upcoming Events
              </span>

              <h2 className="mt-3 text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                Connect Beyond The Screen
              </h2>

            </div>

            <Link href="#events" className="text-purple-600 font-semibold">
              View All Events →
            </Link>

          </div>


          <div className="grid md:grid-cols-3 gap-6 mt-12">

            {/* Event 1 */}
            <div
              className="
                rounded-2xl
                border border-slate-200
                dark:border-slate-700
                p-6
                hover:shadow-xl
                transition
                bg-white
                dark:bg-slate-900
              "
            >
              <div className="flex gap-4">

                <div
                  className="
                    w-14 h-14
                    rounded-xl
                    bg-purple-100
                    dark:bg-purple-900/30
                    text-purple-600
                    flex flex-col
                    items-center justify-center
                  "
                >
                  <span className="text-xs font-semibold">
                    AUG
                  </span>

                  <span className="text-xl font-bold">
                    28
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Alumni Tech Meetup
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Online · 6:00 PM
                  </p>
                </div>

              </div>

              <p className="mt-5 text-sm text-slate-500 dark:text-slate-400 leading-6">
                Meet technology professionals and fellow students from the
                community.
              </p>

              <button
                className="
                  w-full mt-6 py-3 rounded-xl
                  bg-purple-50
                  dark:bg-purple-950/40
                  text-purple-600
                  dark:text-purple-300
                  font-semibold
                  hover:bg-purple-100
                  dark:hover:bg-purple-900/50
                "
              >
                Register Now
              </button>

            </div>


            {/* Event 2 */}
            <div
              className="
                rounded-2xl
                border border-slate-200
                dark:border-slate-700
                p-6
                hover:shadow-xl
                transition
                bg-white
                dark:bg-slate-900
              "
            >
              <div className="flex gap-4">

                <div
                  className="
                    w-14 h-14
                    rounded-xl
                    bg-blue-100
                    dark:bg-blue-900/30
                    text-blue-600
                    flex flex-col
                    items-center justify-center
                  "
                >
                  <span className="text-xs font-semibold">
                    SEP
                  </span>

                  <span className="text-xl font-bold">
                    05
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Career Guidance Session
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Online · 5:00 PM
                  </p>
                </div>

              </div>

              <p className="mt-5 text-sm text-slate-500 dark:text-slate-400 leading-6">
                Learn how experienced alumni built their careers and entered
                top companies.
              </p>

              <button
                className="
                  w-full mt-6 py-3 rounded-xl
                  bg-blue-50
                  dark:bg-blue-950/40
                  text-blue-600
                  dark:text-blue-300
                  font-semibold
                  hover:bg-blue-100
                  dark:hover:bg-blue-900/50
                "
              >
                Register Now
              </button>

            </div>


            {/* Event 3 */}
            <div
              className="
                rounded-2xl
                border border-slate-200
                dark:border-slate-700
                p-6
                hover:shadow-xl
                transition
                bg-white
                dark:bg-slate-900
              "
            >
              <div className="flex gap-4">

                <div
                  className="
                    w-14 h-14
                    rounded-xl
                    bg-green-100
                    dark:bg-green-900/30
                    text-green-600
                    flex flex-col
                    items-center justify-center
                  "
                >
                  <span className="text-xs font-semibold">
                    SEP
                  </span>

                  <span className="text-xl font-bold">
                    14
                  </span>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">
                    Annual Alumni Meet
                  </h3>

                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Delhi · 11:00 AM
                  </p>
                </div>

              </div>

              <p className="mt-5 text-sm text-slate-500 dark:text-slate-400 leading-6">
                Reconnect with your batchmates, professors and alumni
                community.
              </p>

              <button
                className="
                  w-full mt-6 py-3 rounded-xl
                  bg-green-50
                  dark:bg-green-950/40
                  text-green-600
                  dark:text-green-300
                  font-semibold
                  hover:bg-green-100
                  dark:hover:bg-green-900/50
                "
              >
                Register Now
              </button>

            </div>

          </div>

        </div>
      </section>


      {/* =========================================================
          TESTIMONIALS
      ========================================================= */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950">

        <div className="max-w-7xl mx-auto px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto">

            <span className="text-sm font-semibold uppercase tracking-wider text-purple-600">
              Community Stories
            </span>

            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
              What Our Community Says
            </h2>

          </div>


          <div className="grid md:grid-cols-3 gap-6 mt-12">

            {/* Testimonial 1 */}
            <div
              className="
                bg-white
                dark:bg-slate-900
                rounded-2xl
                border border-slate-200
                dark:border-slate-700
                p-7
              "
            >
              <div className="text-yellow-500 tracking-widest">
                ★★★★★
              </div>

              <p className="mt-5 text-slate-600 dark:text-slate-300 leading-7">
                &quot;The alumni network helped me connect with a senior who
                guided me throughout my internship preparation.&quot;
              </p>

              <div className="flex items-center gap-3 mt-6">

                <div
                  className="
                    w-11 h-11
                    rounded-full
                    bg-purple-100
                    dark:bg-purple-900/30
                    flex items-center justify-center
                    font-bold
                    text-purple-600
                  "
                >
                  AM
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Arjun Mehta
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Final Year Student
                  </p>
                </div>

              </div>
            </div>


            {/* Testimonial 2 */}
            <div
              className="
                bg-white
                dark:bg-slate-900
                rounded-2xl
                border border-slate-200
                dark:border-slate-700
                p-7
              "
            >
              <div className="text-yellow-500 tracking-widest">
                ★★★★★
              </div>

              <p className="mt-5 text-slate-600 dark:text-slate-300 leading-7">
                &quot;I was able to reconnect with my college friends and also
                meet professionals from my industry.&quot;
              </p>

              <div className="flex items-center gap-3 mt-6">

                <div
                  className="
                    w-11 h-11
                    rounded-full
                    bg-blue-100
                    dark:bg-blue-900/30
                    flex items-center justify-center
                    font-bold
                    text-blue-600
                  "
                >
                  SK
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Sneha Kapoor
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Product Designer
                  </p>
                </div>

              </div>
            </div>


            {/* Testimonial 3 */}
            <div
              className="
                bg-white
                dark:bg-slate-900
                rounded-2xl
                border border-slate-200
                dark:border-slate-700
                p-7
              "
            >
              <div className="text-yellow-500 tracking-widest">
                ★★★★★
              </div>

              <p className="mt-5 text-slate-600 dark:text-slate-300 leading-7">
                &quot;Through the platform I found talented students for our
                startup and built a great team.&quot;
              </p>

              <div className="flex items-center gap-3 mt-6">

                <div
                  className="
                    w-11 h-11
                    rounded-full
                    bg-green-100
                    dark:bg-green-900/30
                    flex items-center justify-center
                    font-bold
                    text-green-600
                  "
                >
                  RV
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">
                    Rohan Verma
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Startup Founder
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>


      {/* =========================================================
          FINAL CTA
      ========================================================= */}
      <section className="py-20 px-6 bg-white dark:bg-slate-900">

        <div
          className="
            relative
            max-w-6xl mx-auto
            overflow-hidden
            rounded-3xl
            bg-gradient-to-r
            from-purple-700
            via-purple-600
            to-blue-600
            px-8 py-16
            md:px-14
            text-center
            text-white
          "
        >

          {/* Decoration */}
          <div
            className="
              absolute
              -top-32
              -right-20
              w-80 h-80
              rounded-full
              bg-white/10
            "
          />

          <div
            className="
              absolute
              -bottom-40
              -left-20
              w-80 h-80
              rounded-full
              bg-white/10
            "
          />

          <div className="relative">

            <h2 className="text-3xl md:text-5xl font-extrabold">
              Your Network Can Change Your Future.
            </h2>

            <p
              className="
                max-w-2xl
                mx-auto
                mt-5
                text-purple-100
                text-lg
                leading-7
              "
            >
              Join thousands of students and alumni building connections,
              sharing knowledge and creating opportunities together.
            </p>

            <div
              className="
                flex
                flex-col sm:flex-row
                justify-center
                gap-4
                mt-9
              "
            >

              <Link
                href="/signup"
                className="
                  px-8 py-3.5
                  rounded-xl
                  bg-white
                  text-purple-700
                  font-bold
                  hover:bg-purple-50
                  transition
                "
              >
                Create Your Profile
              </Link>

              <Link
                href="/directory"
                className="
                  px-8 py-3.5
                  rounded-xl
                  border border-white/40
                  text-white
                  font-bold
                  hover:bg-white/10
                  transition
                "
              >
                Explore Network
              </Link>

            </div>

          </div>

        </div>

      </section>
      

    </div>
  );
};

export default Home;