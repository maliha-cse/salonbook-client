
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

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

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("default");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/api/services`);

        if (!response.ok) {
          throw new Error("Failed to fetch services.");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.services)) {
          throw new Error("Invalid service data received.");
        }

        setServices(data.services);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong while loading services."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const categories = useMemo(() => {
    return [
      ...new Set(
        services
          .map((service) => service.category)
          .filter(Boolean)
      ),
    ].sort();
  }, [services]);

  const filteredServices = useMemo(() => {
    let result = [...services];

    if (search.trim()) {
      result = result.filter((service) =>
        service.serviceName
          .toLowerCase()
          .includes(search.trim().toLowerCase())
      );
    }

    if (category !== "all") {
      result = result.filter(
        (service) => service.category === category
      );
    }

    if (sort === "price-asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === "price-desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [services, search, category, sort]);

  return (
    <main className="min-h-screen bg-[#fffaf7]">
      <section className="bg-[#3d2429] px-6 py-20 text-center text-white">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-[#e9b9a9]">
          Discover Your Beauty
        </p>

        <h1 className="text-4xl font-bold md:text-5xl">
          Explore Our Salon Services
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-white/75 md:text-base">
          Discover professional beauty and wellness services
          designed to make you look and feel your best.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-14">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-[#3d2429] md:text-3xl">
            All Salon Services
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Find the perfect service for your beauty needs.
          </p>
        </div>

        <div className="mb-10 grid gap-4 rounded-2xl border border-[#f0ded7] bg-white p-5 shadow-sm md:grid-cols-3">
          <div>
            <label
              htmlFor="service-search"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Search Services
            </label>

            <input
              id="service-search"
              type="search"
              placeholder="Search by service name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#a66b61] focus:ring-2 focus:ring-[#a66b61]/20"
            />
          </div>

          <div>
            <label
              htmlFor="category-filter"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Filter by Category
            </label>

            <select
              id="category-filter"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a66b61]"
            >
              <option value="all">All Categories</option>

              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="price-sort"
              className="mb-2 block text-sm font-semibold text-gray-700"
            >
              Sort by Price
            </label>

            <select
              id="price-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#a66b61]"
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            {loading
              ? "Loading services..."
              : `${filteredServices.length} services found`}
          </p>

          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCategory("all");
              setSort("default");
            }}
            className="text-sm font-semibold text-[#986057] transition hover:text-[#3d2429]"
          >
            Clear Filters
          </button>
        </div>

        {loading && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-sm"
              >
                <div className="h-56 bg-gray-200" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-1/3 rounded bg-gray-200" />
                  <div className="h-6 w-2/3 rounded bg-gray-200" />
                  <div className="h-4 w-full rounded bg-gray-200" />
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="font-semibold text-red-700">
              Unable to load services
            </p>
            <p className="mt-2 text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-[#3d2429] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#563239]"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && filteredServices.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[#e7cfc5] bg-white px-6 py-16 text-center">
            <h3 className="text-xl font-bold text-[#3d2429]">
              No Services Found
            </h3>

            <p className="mt-3 text-sm text-gray-500">
              Try changing your search or filter to find services.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setCategory("all");
                setSort("default");
              }}
              className="mt-6 rounded-lg bg-[#3d2429] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#563239]"
            >
              Reset Filters
            </button>
          </div>
        )}

        {!loading && !error && filteredServices.length > 0 && (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <article
                key={service._id}
                className="group overflow-hidden rounded-2xl border border-[#f0e3dd] bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-56 overflow-hidden bg-[#f5e9e3]">
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.serviceName}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-400">
                      No image available
                    </div>
                  )}

                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold text-[#75483f] shadow-sm">
                    {service.category}
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#3d2429] transition group-hover:text-[#986057]">
                    {service.serviceName}
                  </h3>

                  <p className="mt-3 min-h-12 text-sm leading-6 text-gray-500">
                    {service.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
                    <div>
                      <p className="text-xs text-gray-400">Starting from</p>
                      <p className="mt-1 text-lg font-bold text-[#986057]">
                        ৳{service.price}
                      </p>
                    </div>

                    <p className="text-sm text-gray-500">
                      {service.duration} min
                    </p>
                  </div>

                  <Link
                    href={`/services/${service._id}`}
                    className="mt-6 block rounded-lg bg-[#3d2429] px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-[#563239]"
                  >
                    View Details
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
