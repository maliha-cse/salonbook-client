
"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type Service = {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function ServiceDetailsContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/services/${params.id}`
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Service not found.");
        }

        setService(data.service);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load service details."
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchService();
    }
  }, [params.id]);

  const handleBooking = async () => {
    const { data: sessionData } = await authClient.getSession();

    if (!sessionData?.user) {
      router.push(
        `/sign-in?callbackURL=${encodeURIComponent(
          `/services/${params.id}`
        )}`
      );
      return;
    }

    router.push(`/services/${params.id}/book`);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#fffaf7] px-6">
        <p className="text-lg font-medium text-[#75483f]">
          Loading service details...
        </p>
      </main>
    );
  }

  if (error || !service) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#fffaf7] px-6 text-center">
        <h1 className="text-3xl font-bold text-[#3d2429]">
          Service Not Found
        </h1>

        <p className="mt-3 text-gray-500">
          {error || "The requested service is unavailable."}
        </p>

        <Link
          href="/services"
          className="mt-6 rounded-lg bg-[#3d2429] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#563239]"
        >
          Browse Services
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fffaf7]">
      <section className="bg-[#3d2429] px-6 py-14 text-center text-white">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#e9b9a9]">
          SalonBook Services
        </p>

        <h1 className="mt-3 text-3xl font-bold md:text-5xl">
          Service Details
        </h1>

        <p className="mt-4 text-sm text-white/75">
          Discover the perfect treatment for yourself.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <Link
          href="/services"
          className="mb-8 inline-flex text-sm font-semibold text-[#986057] transition hover:text-[#3d2429]"
        >
          ← Back to Services
        </Link>

        <div className="grid overflow-hidden rounded-3xl border border-[#f0e3dd] bg-white shadow-sm md:grid-cols-2">
          <div className="min-h-72 bg-[#f5e9e3] md:min-h-[500px]">
            {service.image ? (
              <img
                src={service.image}
                alt={service.serviceName}
                className="h-full min-h-72 w-full object-cover md:min-h-[500px]"
              />
            ) : (
              <div className="flex h-full min-h-72 items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center p-7 md:p-12">
            <span className="w-fit rounded-full bg-[#f8ece7] px-4 py-2 text-xs font-semibold text-[#986057]">
              {service.category}
            </span>

            <h2 className="mt-5 text-3xl font-bold text-[#3d2429] md:text-4xl">
              {service.serviceName}
            </h2>

            <p className="mt-5 text-sm leading-8 text-gray-600">
              {service.description}
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-[#fff7f3] p-5">
                <p className="text-xs text-gray-500">Service Price</p>
                <p className="mt-2 text-2xl font-bold text-[#986057]">
                  ৳{service.price}
                </p>
              </div>

              <div className="rounded-xl bg-[#fff7f3] p-5">
                <p className="text-xs text-gray-500">Duration</p>
                <p className="mt-2 text-2xl font-bold text-[#3d2429]">
                  {service.duration} min
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleBooking}
              className="mt-8 rounded-xl bg-[#3d2429] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#563239]"
            >
              Book Appointment
            </button>

            <p className="mt-4 text-center text-xs text-gray-400">
              Your beauty journey starts here.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
export default function ServiceDetailsPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#fffaf7]">
          <p className="text-lg font-medium text-[#75483f]">
            Loading service details...
          </p>
        </main>
      }
    >
      <ServiceDetailsContent />
    </Suspense>
  );
}