
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TIME_SLOTS = [
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 01:00 PM",
  "02:00 PM - 03:00 PM",
  "03:00 PM - 04:00 PM",
  "04:00 PM - 05:00 PM",
  "05:00 PM - 06:00 PM",
  "06:00 PM - 07:00 PM",
];

export default function BookingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#faf6f2]">
          <p className="text-[#806d63]">Loading booking page...</p>
        </main>
      }
    >
      <BookingContent />
    </Suspense>
  );
}

function BookingContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [appointmentDate, setAppointmentDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const today = new Date();
  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await authClient.getSession();

      if (!data?.user) {
        router.replace(
          `/sign-in?callbackURL=${encodeURIComponent(
            `/services/${params.id}/book`
          )}`
        );
      }
    };

    checkSession();
  }, [params.id, router]);

  const handleBooking = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");

    if (!appointmentDate || !timeSlot) {
      setError("Please select a date and time slot.");
      return;
    }

    try {
      setLoading(true);

      const token = sessionStorage.getItem("salonbook_token");

      if (!token) {
        throw new Error("Authentication token not found. Please sign in again.");
      }

      const response = await fetch(`${API_URL}/api/appointments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          serviceId: params.id,
          appointmentDate,
          timeSlot,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Booking failed.");
      }

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf6f2] px-6">
        <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-sm">
          <div className="text-5xl">🎉</div>
          <h1 className="mt-5 text-3xl font-bold text-[#34251f]">
            Booking Successful!
          </h1>
          <p className="mt-4 text-[#806d63]">
            Your appointment request has been submitted successfully.
          </p>
          <Link
            href="/dashboard"
            className="mt-8 inline-block rounded-xl bg-[#9b6248] px-7 py-3 font-semibold text-white"
          >
            Go to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf6f2] px-6 py-12 text-[#34251f]">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/services/${params.id}`}
          className="text-sm font-semibold text-[#9b6248]"
        >
          ← Back to Service
        </Link>

        <div className="mt-8 rounded-3xl border border-[#eee4dd] bg-white p-7 shadow-sm sm:p-10">
          <p className="font-semibold tracking-widest text-[#a97051]">
            SALONBOOK
          </p>

          <h1 className="mt-3 text-3xl font-bold">
            Book Your Appointment
          </h1>

          <p className="mt-3 text-sm text-[#806d63]">
            Choose your preferred date and time.
          </p>

          <form onSubmit={handleBooking} className="mt-8 space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Appointment Date
              </label>
              <input
                type="date"
                min={minDate}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                required
                className="w-full rounded-xl border border-[#eee4dd] p-3 outline-none focus:border-[#9b6248]"
              />
            </div>

            <div>
              <label className="mb-3 block text-sm font-semibold">
                Select Time Slot
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`rounded-xl border p-3 text-sm font-medium transition ${
                      timeSlot === slot
                        ? "border-[#9b6248] bg-[#f8ece7] text-[#9b6248]"
                        : "border-[#eee4dd] hover:border-[#9b6248]"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Additional Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                rows={4}
                placeholder="Write any special request..."
                className="w-full rounded-xl border border-[#eee4dd] p-3 outline-none focus:border-[#9b6248]"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#3d2429] px-6 py-4 font-semibold text-white transition hover:bg-[#563239] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Submitting..." : "Confirm Appointment"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
