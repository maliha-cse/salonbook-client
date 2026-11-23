
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const API_URL = "http://localhost:5000";

type Appointment = {
  _id: string;
  appointmentDate: string;
  timeSlot: string;
  message?: string;
  servicePrice: number;
  paymentStatus: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  createdAt?: string;
  service?: {
    serviceName?: string;
    category?: string;
  };
};

export default function CustomerDashboard() {
  const router = useRouter();

  const { data: session, isPending: sessionLoading } =
    authClient.useSession();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionId, setActionId] = useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("salonbook_token");

      if (!token) {
        setError("Please sign in again to view your appointments.");
        return;
      }

      const response = await fetch(`${API_URL}/api/appointments/my`, {
        method: "GET",
        credentials: "include",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load appointments.");
      }

      setAppointments(data.appointments || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading appointments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancelAppointment = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    try {
      setActionId(id);

      const token = sessionStorage.getItem("salonbook_token");

      if (!token) {
        throw new Error("Please sign in again.");
      }

      const response = await fetch(
        `${API_URL}/api/appointments/${id}/cancel`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to cancel appointment.");
      }

      await fetchAppointments();
      alert("Appointment cancelled successfully.");
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setActionId("");
    }
  };

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      sessionStorage.removeItem("salonbook_token");
      router.replace("/sign-in");
      router.refresh();
    }
  };

  const formatDate = (date: string) => {
    const [year, month, day] = date.split("-").map(Number);

    if (!year || !month || !day) return date;

    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      case "completed":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const user = session?.user;

  return (
    <main className="min-h-screen bg-[#faf6f2] text-[#34251f]">
      {/* Header */}
      <header className="border-b border-[#eee4dd] bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold text-[#9b6248]">
            SalonBook
          </Link>

          <div className="flex items-center gap-5">
            <Link
              href="/"
              className="text-sm font-medium text-[#806d63] hover:text-[#9b6248]"
            >
              Back to Home
            </Link>

            <button
              onClick={handleSignOut}
              className="rounded-xl bg-[#9b6248] px-5 py-2 text-sm font-semibold text-white hover:bg-[#80503b]"
            >
              Sign Out
            </button>
          </div>
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
            <h2 className="mt-5 text-xl font-bold">Browse Services</h2>
            <p className="mt-3 text-sm leading-6 text-[#806d63]">
              Explore our beauty and wellness services.
            </p>
          </Link>

          <a
            href="#my-appointments"
            className="rounded-2xl border border-[#eee4dd] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">📅</div>
            <h2 className="mt-5 text-xl font-bold">My Appointments</h2>
            <p className="mt-3 text-sm leading-6 text-[#806d63]">
              View and manage your salon appointments.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#9b6248]">
              View Appointments →
            </span>
          </a>

          <a
            href="#my-profile"
            className="rounded-2xl border border-[#eee4dd] bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="text-4xl">👤</div>
            <h2 className="mt-5 text-xl font-bold">My Profile</h2>
            <p className="mt-3 text-sm leading-6 text-[#806d63]">
              View your personal account information.
            </p>
            <span className="mt-4 inline-block text-sm font-semibold text-[#9b6248]">
              View Profile →
            </span>
          </a>
        </div>

        {/* My Appointments */}
        <section id="my-appointments" className="mt-14 scroll-mt-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold tracking-widest text-[#a97051]">
                YOUR BOOKINGS
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                My Appointments
              </h2>
            </div>

            <button
              onClick={fetchAppointments}
              disabled={loading}
              className="rounded-xl border border-[#9b6248] px-4 py-2 text-sm font-semibold text-[#9b6248] hover:bg-[#f5eae3] disabled:opacity-50"
            >
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-[#eee4dd] bg-white p-10 text-center text-[#806d63]">
              Loading your appointments...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
              <p className="text-red-600">{error}</p>
              <button
                onClick={fetchAppointments}
                className="mt-4 rounded-xl bg-[#9b6248] px-5 py-2 text-sm font-semibold text-white"
              >
                Try Again
              </button>
            </div>
          ) : appointments.length === 0 ? (
            <div className="rounded-2xl border border-[#eee4dd] bg-white p-10 text-center">
              <div className="text-5xl">📅</div>
              <h3 className="mt-4 text-xl font-bold">
                No Appointments Yet
              </h3>
              <p className="mt-2 text-sm text-[#806d63]">
                You have not booked any salon appointments yet.
              </p>
              <Link
                href="/services"
                className="mt-5 inline-block rounded-xl bg-[#9b6248] px-6 py-3 text-sm font-semibold text-white hover:bg-[#80503b]"
              >
                Browse Services
              </Link>
            </div>
          ) : (
            <div className="grid gap-5">
              {appointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="rounded-2xl border border-[#eee4dd] bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold">
                        {appointment.service?.serviceName || "Salon Service"}
                      </h3>
                      {appointment.service?.category && (
                        <p className="mt-1 text-sm text-[#806d63]">
                          {appointment.service.category}
                        </p>
                      )}
                    </div>

                    <span
                      className={`rounded-full px-4 py-2 text-xs font-bold capitalize ${getStatusStyle(
                        appointment.status
                      )}`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <p className="text-xs text-[#a18d82]">
                        Appointment Date
                      </p>
                      <p className="mt-1 font-semibold">
                        {formatDate(appointment.appointmentDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#a18d82]">Time Slot</p>
                      <p className="mt-1 font-semibold">
                        {appointment.timeSlot}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#a18d82]">Service Price</p>
                      <p className="mt-1 font-semibold">
                        ৳{appointment.servicePrice}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-[#a18d82]">
                        Payment Status
                      </p>
                      <p className="mt-1 font-semibold capitalize">
                        {appointment.paymentStatus}
                      </p>
                    </div>
                  </div>

                  {appointment.message && (
                    <div className="mt-5 rounded-xl bg-[#faf6f2] p-4">
                      <p className="text-xs font-semibold text-[#a18d82]">
                        Your Message
                      </p>
                      <p className="mt-1 text-sm text-[#806d63]">
                        {appointment.message}
                      </p>
                    </div>
                  )}

                  {appointment.status === "pending" && (
                    <div className="mt-5 border-t border-[#eee4dd] pt-4">
                      <button
                        onClick={() =>
                          handleCancelAppointment(appointment._id)
                        }
                        disabled={actionId === appointment._id}
                        className="rounded-xl border border-red-300 px-5 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {actionId === appointment._id
                          ? "Cancelling..."
                          : "Cancel Appointment"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* My Profile */}
        <section id="my-profile" className="mt-14 scroll-mt-8">
          <div className="mb-6">
            <p className="font-semibold tracking-widest text-[#a97051]">
              ACCOUNT INFORMATION
            </p>
            <h2 className="mt-2 text-2xl font-bold">My Profile</h2>
            <p className="mt-2 text-[#806d63]">
              View your personal account information.
            </p>
          </div>

          <div className="rounded-2xl border border-[#eee4dd] bg-white p-7 shadow-sm">
            {sessionLoading ? (
              <p className="text-center text-[#806d63]">
                Loading profile...
              </p>
            ) : user ? (
              <>
                <div className="flex flex-col items-center gap-4 border-b border-[#eee4dd] pb-7 sm:flex-row">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt="Profile"
                      className="h-24 w-24 rounded-full border-4 border-[#f5eae3] object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f5eae3] text-4xl font-bold text-[#9b6248]">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  )}

                  <div className="text-center sm:text-left">
                    <h3 className="text-2xl font-bold">
                      {user.name || "Customer"}
                    </h3>
                    <p className="mt-1 text-sm text-[#806d63]">
                      SalonBook Customer
                    </p>
                  </div>
                </div>

                <div className="mt-7 grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-[#a18d82]">
                      Full Name
                    </p>
                    <p className="mt-2 font-semibold">
                      {user.name || "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[#a18d82]">
                      Email Address
                    </p>
                    <p className="mt-2 break-all font-semibold">
                      {user.email || "Not available"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[#a18d82]">
                      Email Verification
                    </p>
                    <p className="mt-2 font-semibold">
                      {user.emailVerified ? "Verified" : "Not verified"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-[#a18d82]">
                      Account Type
                    </p>
                    <p className="mt-2 font-semibold">Customer</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-6 text-center">
                <p className="text-[#806d63]">
                  Unable to load profile information.
                </p>
                <Link
                  href="/sign-in"
                  className="mt-4 inline-block rounded-xl bg-[#9b6248] px-5 py-2 text-sm font-semibold text-white"
                >
                  Sign In Again
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
