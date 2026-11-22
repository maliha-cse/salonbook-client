
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

const categories = [
  "Haircut & Styling",
  "Hair Coloring",
  "Hair Treatment",
  "Facial & Skincare",
  "Makeup",
  "Manicure & Pedicure",
  "Spa & Massage",
];

export default function Home() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error("Sign out failed:", error);
    } finally {
      sessionStorage.removeItem("salonbook_token");
      router.replace("/");
      router.refresh();
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch(`${API_URL}/api/services`);

        if (!response.ok) {
          throw new Error("Failed to fetch salon services.");
        }

        const data = await response.json();
        setServices(data.services || []);
      } catch {
        setError(
          "Unable to load services right now. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <main className="min-h-screen bg-[#faf6f2] text-[#34251f]">

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-[#eee4dd] bg-white/95 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-12">
          <Link
            href="/"
            className="text-2xl font-bold tracking-wide text-[#9b6248]"
          >
            SalonBook
          </Link>

          <div className="flex flex-wrap items-center gap-5 sm:gap-7">
            <Link
              href="/"
              className="text-sm font-medium text-[#34251f] transition hover:text-[#9b6248]"
            >
              Home
            </Link>

            <Link
              href="/services"
              className="text-sm font-medium text-[#34251f] transition hover:text-[#9b6248]"
            >
              Services
            </Link>

            {!isPending && (
              session?.user ? (
                <>
                  <Link
                    href={
                      session.user.role === "admin"
                        ? "/dashboard/admin"
                        : "/dashboard/customer"
                    }
                    className="text-sm font-medium text-[#34251f] transition hover:text-[#9b6248]"
                  >
                    Dashboard
                  </Link>

                  <button
                    onClick={handleSignOut}
                    className="rounded-lg bg-[#9b6248] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#80503b]"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/sign-in"
                    className="text-sm font-medium text-[#34251f] transition hover:text-[#9b6248]"
                  >
                    Sign In
                  </Link>

                  <Link
                    href="/sign-up"
                    className="rounded-lg bg-[#9b6248] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#80503b]"
                  >
                    Sign Up
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex min-h-[650px] items-center overflow-hidden bg-[#4b3027]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgba(35,22,17,0.88), rgba(35,22,17,0.38)), url('https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=2000&q=85')",
          }}
        />

        <div className="relative mx-auto w-full max-w-7xl px-6 py-24 sm:px-10 lg:px-12">
          <div className="max-w-2xl">
            <span className="mb-6 inline-block rounded-full border border-white/30 px-5 py-2 text-sm font-medium tracking-widest text-[#f2d6c2]">
              YOUR BEAUTY, OUR PASSION
            </span>

            <h1 className="text-5xl leading-tight font-bold text-white sm:text-6xl lg:text-7xl">
              Discover Your
              <span className="block text-[#e9bd9f]">
                Beauty & Glow
              </span>
            </h1>

            <p className="mt-7 max-w-xl text-base leading-8 text-[#f1e5df] sm:text-lg">
              Experience exceptional beauty and wellness services
              with professionals who care about your style,
              comfort, and confidence.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#featured"
                className="rounded-lg bg-[#c58c6b] px-8 py-4 font-semibold text-white transition hover:bg-[#a97051]"
              >
                Explore Salon Services
              </a>

              <Link
                href="/sign-up"
                className="rounded-lg border border-white/70 px-8 py-4 font-semibold text-white transition hover:bg-white hover:text-[#4b3027]"
              >
                Join SalonBook
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <span className="text-sm font-semibold tracking-[0.25em] text-[#a97051]">
            WELCOME TO SALONBOOK
          </span>

          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            A Little Care Goes a Long Way
          </h2>

          <p className="mt-5 leading-8 text-[#806d63]">
            From refreshing hair treatments to relaxing spa
            experiences, discover services designed to make you
            feel your absolute best. Your next beauty experience
            starts here.
          </p>
        </div>
      </section>

      {/* Featured Services */}
      <section id="featured" className="bg-white px-6 py-20 sm:px-10 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <span className="text-sm font-semibold tracking-[0.25em] text-[#a97051]">
                OUR SERVICES
              </span>

              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                Featured Salon Services
              </h2>

              <p className="mt-3 text-[#806d63]">
                Find the perfect treatment for your beauty needs.
              </p>
            </div>

            <Link
              href="/services"
              className="font-semibold text-[#a97051] transition hover:text-[#80503b]"
            >
              View All Services →
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-2xl bg-[#faf6f2]"
                >
                  <div className="h-56 bg-[#eadfd7]" />
                  <div className="space-y-3 p-6">
                    <div className="h-5 w-2/3 rounded bg-[#eadfd7]" />
                    <div className="h-4 w-full rounded bg-[#eadfd7]" />
                    <div className="h-4 w-1/2 rounded bg-[#eadfd7]" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 p-8 text-center text-red-700">
              {error}
            </div>
          ) : services.length === 0 ? (
            <div className="rounded-xl bg-[#faf6f2] px-6 py-14 text-center">
              <h3 className="text-xl font-semibold">
                Services Coming Soon
              </h3>
              <p className="mt-3 text-[#806d63]">
                Our salon services will appear here once they are
                added by the administrator.
              </p>
            </div>
          ) : (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {services.slice(0, 6).map((service) => (
                <article
                  key={service._id}
                  className="group overflow-hidden rounded-2xl border border-[#eee4dd] bg-[#faf6f2] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="h-56 overflow-hidden bg-[#eadfd7]">
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.serviceName}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-5xl text-[#b18a73]">
                        ✨
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <span className="text-xs font-semibold tracking-wider text-[#a97051]">
                      {service.category}
                    </span>

                    <h3 className="mt-2 text-xl font-bold">
                      {service.serviceName}
                    </h3>

                    <p className="mt-3 line-clamp-2 min-h-12 text-sm leading-6 text-[#806d63]">
                      {service.description}
                    </p>

                    <div className="mt-5 flex items-center justify-between border-t border-[#e9dcd3] pt-5">
                      <div>
                        <p className="text-lg font-bold text-[#9b6248]">
                          ৳{service.price}
                        </p>
                        <p className="text-xs text-[#806d63]">
                          {service.duration} minutes
                        </p>
                      </div>

                      <Link
                        href={`/services/${service._id}`}
                        className="rounded-lg bg-[#9b6248] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#80503b]"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10 lg:px-12">
        <div className="text-center">
          <span className="text-sm font-semibold tracking-[0.25em] text-[#a97051]">
            EXPLORE BY CATEGORY
          </span>

          <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
            Find Your Perfect Service
          </h2>

          <p className="mt-4 text-[#806d63]">
            Explore our range of beauty and wellness categories.
          </p>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {categories.map((category) => (
            <Link
              key={category}
              href={`/services?category=${encodeURIComponent(category)}`}
              className="rounded-full border border-[#dfc9ba] bg-white px-6 py-3 text-sm font-medium text-[#75513f] transition hover:border-[#9b6248] hover:bg-[#9b6248] hover:text-white"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-[#4b3027] px-6 py-20 text-white sm:px-10 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold tracking-[0.25em] text-[#e9bd9f]">
              THE SALONBOOK EXPERIENCE
            </span>

            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Beauty Made Simple
            </h2>

            <p className="mt-5 leading-8 text-[#e8d6cd]">
              We make finding and booking your favorite salon
              services simple, convenient, and enjoyable.
            </p>
          </div>

          <div className="mt-14 grid gap-10 md:grid-cols-3">
            <div className="text-center">
              <div className="text-4xl">✦</div>
              <h3 className="mt-5 text-xl font-semibold">
                Quality Services
              </h3>
              <p className="mt-3 leading-7 text-[#e8d6cd]">
                Explore carefully selected beauty and wellness
                treatments.
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl">♡</div>
              <h3 className="mt-5 text-xl font-semibold">
                Easy Booking
              </h3>
              <p className="mt-3 leading-7 text-[#e8d6cd]">
                Request your preferred appointment with just a
                few simple steps.
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl">✧</div>
              <h3 className="mt-5 text-xl font-semibold">
                Your Convenience
              </h3>
              <p className="mt-3 leading-7 text-[#e8d6cd]">
                Manage your appointments and enjoy a smoother
                salon experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-6 py-20 text-center sm:px-10">
        <h2 className="text-3xl font-bold sm:text-4xl">
          Ready for Your Next Beauty Experience?
        </h2>

        <p className="mx-auto mt-4 max-w-xl leading-7 text-[#806d63]">
          Create your account and discover the services waiting
          for you at SalonBook.
        </p>

        <Link
          href="/sign-up"
          className="mt-8 inline-block rounded-lg bg-[#9b6248] px-9 py-4 font-semibold text-white transition hover:bg-[#80503b]"
        >
          Get Started
        </Link>
      </section>
    </main>
  );
}
