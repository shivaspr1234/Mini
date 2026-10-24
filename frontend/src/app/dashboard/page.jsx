export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">

      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-purple-600 font-semibold mb-2">
            Alumni-Student Networking Portal
          </p>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
            Welcome Back 👋
          </h1>

          <p className="mt-2 text-slate-600">
            Connect with alumni, build your network and explore
            career opportunities.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Connections */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              My Connections
            </p>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-3">
              0
            </h2>

            <p className="text-sm text-green-600 mt-2">
              Build your network
            </p>
          </div>

          {/* Messages */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Messages
            </p>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-3">
              0
            </h2>

            <p className="text-sm text-blue-600 mt-2">
              Start networking
            </p>
          </div>

          {/* Events */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Upcoming Events
            </p>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-3">
              0
            </h2>

            <p className="text-sm text-purple-600 mt-2">
              Explore events
            </p>
          </div>

          {/* Mentorship */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Mentorship
            </p>

            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-3">
              0
            </h2>

            <p className="text-sm text-orange-600 mt-2">
              Find a mentor
            </p>
          </div>

        </div>

        {/* Main Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

          {/* Recommended Alumni */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Recommended Alumni
              </h2>

              <a
                href="/alumni"
                className="text-purple-600 font-semibold text-sm"
              >
                View All
              </a>

            </div>

            <div className="py-10 text-center text-slate-500">
              <p>
                Alumni recommendations will appear here.
              </p>
            </div>

          </section>

          {/* Upcoming Events */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Upcoming Events
              </h2>

              <a
                href="/events"
                className="text-purple-600 font-semibold text-sm"
              >
                View All
              </a>

            </div>

            <div className="py-10 text-center text-slate-500">
              <p>
                Upcoming events will appear here.
              </p>
            </div>

          </section>

        </div>

        {/* Career Opportunities */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm mt-6">

          <div className="flex items-center justify-between mb-6">

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Latest Jobs & Internships
            </h2>

            <a
              href="/Jobs"
              className="text-purple-600 font-semibold text-sm"
            >
              Explore Jobs
            </a>

          </div>

          <div className="py-10 text-center text-slate-500">
            <p>
              Latest career opportunities will appear here.
            </p>
          </div>

        </section>

      </div>

    </main>
  );
}