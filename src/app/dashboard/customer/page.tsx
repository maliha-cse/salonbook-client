
"use client";

import Link from "next/link";

export default function CustomerDashboard() {
  return (
    <main className="min-h-screen bg-[#faf6f2] text-[#34251f]">
      {/* Header */}
      <header className="border-b border-[#eee4dd] bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link
            href="/"
            className="text-2xl font-bold text-[#9b6248]"
          >
            SalonBook
          </Link>

          <Link
            href="/"
            className="text-sm font-medium text-[#806d63] hover:text-[#9b6248]"
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Dashboard */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10">
          <p className="font-semibold tracking-widest text-[#a97051]">
            CUSTOMER PANEL
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Welcome to Your Dashboard
          </h1>

          <p className="mt-3 text-[#806d63]">
            Manage your appointments and enjoy your salon experience.
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/services"
            className="rounded-2xl border border-[#eee4dd] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">✨</div>
            <h2 className="mt-5 text-xl font-bold">
              Browse Services
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#806d63]">
              Explore our beauty and wellness services.
            </p>
          </Link>

          <div className="rounded-2xl border border-[#eee4dd] bg-white p-7 shadow-sm">
            <div className="text-4xl">📅</div>
            <h2 className="mt-5 text-xl font-bold">
              My Appointments
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#806d63]">
              View and manage your salon appointments.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#9b6248]">
              Coming Soon
            </span>
          </div>

          <div className="rounded-2xl border border-[#eee4dd] bg-white p-7 shadow-sm">
            <div className="text-4xl">👤</div>
            <h2 className="mt-5 text-xl font-bold">
              My Profile
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#806d63]">
              Manage your personal information.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#9b6248]">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
