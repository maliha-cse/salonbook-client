
"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";
import Link from "next/link";

type Service = {
  _id: string;
  serviceName: string;
  category: string;
  description: string;
  price: number;
  duration: number;
  image: string;
  status?: "active" | "inactive";
};

type ServiceForm = {
  serviceName: string;
  category: string;
  description: string;
  price: string;
  duration: string;
  image: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const emptyForm: ServiceForm = {
  serviceName: "",
  category: "",
  description: "",
  price: "",
  duration: "",
  image: "",
};

export default function AdminDashboard() {
  const [services, setServices] = useState<Service[]>([]);
  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const getToken = () => sessionStorage.getItem("salonbook_token");

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_URL}/api/services`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load services.");
      }

      setServices(data.services || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const token = getToken();

    if (!token) {
      setError("Please sign in again. Authentication token not found.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        ...form,
        price: Number(form.price),
        duration: Number(form.duration),
      };

      const url = editingId
        ? `${API_URL}/api/admin/services/${editingId}`
        : `${API_URL}/api/admin/services`;

      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to save service.");
      }

      setMessage(
        editingId
          ? "Service updated successfully!"
          : "Service added successfully!"
      );

      resetForm();
      await fetchServices();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingId(service._id);
    setForm({
      serviceName: service.serviceName,
      category: service.category,
      description: service.description,
      price: String(service.price),
      duration: String(service.duration),
      image: service.image,
    });

    setMessage("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this service?"
    );

    if (!confirmed) return;

    const token = getToken();

    if (!token) {
      setError("Please sign in again.");
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/admin/services/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to delete service.");
      }

      setMessage("Service deleted successfully!");
      await fetchServices();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  };

  const handleStatusChange = async (
    service: Service,
    status: "active" | "inactive"
  ) => {
    const token = getToken();

    if (!token) {
      setError("Please sign in again.");
      return;
    }

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/api/admin/services/${service._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update status.");
      }

      setMessage("Service status updated successfully!");
      await fetchServices();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  };

  return (
    <main className="min-h-screen bg-[#faf6f2] text-[#34251f]">
      <header className="border-b border-[#eee4dd] bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-2xl font-bold text-[#9b6248]">
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

      <div className="mx-auto max-w-7xl px-6 py-12">
        <p className="font-semibold tracking-widest text-[#a97051]">
          ADMIN PANEL
        </p>

        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          Manage Salon Services
        </h1>

        <p className="mt-3 text-[#806d63]">
          Add, edit, delete and manage your salon services.
        </p>

        {error && (
          <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        <section className="mt-10 rounded-2xl border border-[#eee4dd] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="mb-6 text-2xl font-bold">
            {editingId ? "Edit Service" : "Add New Service"}
          </h2>

          <form onSubmit={handleSubmit} className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Service Name
              </label>
              <input
                name="serviceName"
                value={form.serviceName}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#9b6248]"
                placeholder="e.g. Hair Cutting"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Category
              </label>
              <input
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#9b6248]"
                placeholder="e.g. Hair Care"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Price (৳)
              </label>
              <input
                name="price"
                type="number"
                min="1"
                value={form.price}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#9b6248]"
                placeholder="e.g. 500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Duration (Minutes)
              </label>
              <input
                name="duration"
                type="number"
                min="1"
                value={form.duration}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#9b6248]"
                placeholder="e.g. 60"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Image URL
              </label>
              <input
                name="image"
                type="url"
                value={form.image}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#9b6248]"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#9b6248]"
                placeholder="Describe the salon service..."
              />
            </div>

            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-[#9b6248] px-7 py-3 font-semibold text-white transition hover:bg-[#80503b] disabled:opacity-60"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Service"
                    : "Add Service"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg border border-gray-300 px-7 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="mt-12">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">All Services</h2>

            <button
              onClick={fetchServices}
              className="rounded-lg border border-[#9b6248] px-5 py-2 text-sm font-semibold text-[#9b6248] hover:bg-[#9b6248] hover:text-white"
            >
              Refresh List
            </button>
          </div>

          {loading ? (
            <p className="rounded-xl bg-white p-8 text-center text-gray-500">
              Loading services...
            </p>
          ) : services.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#e7cfc5] bg-white p-12 text-center text-gray-500">
              No services available. Add your first service above.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <article
                  key={service._id}
                  className="overflow-hidden rounded-2xl border border-[#eee4dd] bg-white shadow-sm"
                >
                  {service.image ? (
                    <img
                      src={service.image}
                      alt={service.serviceName}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-400">
                      No image
                    </div>
                  )}

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-[#f5e9e3] px-3 py-1 text-xs font-semibold text-[#9b6248]">
                        {service.category}
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          service.status === "inactive"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {service.status || "active"}
                      </span>
                    </div>

                    <h3 className="mt-4 text-xl font-bold">
                      {service.serviceName}
                    </h3>

                    <p className="mt-2 min-h-12 text-sm leading-6 text-gray-500">
                      {service.description}
                    </p>

                    <div className="mt-4 flex justify-between border-t pt-4 text-sm">
                      <strong className="text-[#9b6248]">
                        ৳{service.price}
                      </strong>
                      <span className="text-gray-500">
                        {service.duration} min
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleEdit(service)}
                        className="rounded-lg border border-[#9b6248] px-3 py-2 text-sm font-semibold text-[#9b6248] hover:bg-[#9b6248] hover:text-white"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(service._id)}
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>

                    <button
                      onClick={() =>
                        handleStatusChange(
                          service,
                          service.status === "inactive" ? "active" : "inactive"
                        )
                      }
                      className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      {service.status === "inactive"
                        ? "Activate Service"
                        : "Deactivate Service"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <div className="mt-12">
          <Link
            href="/dashboard/customer"
            className="text-sm font-semibold text-[#9b6248] hover:underline"
          >
            View Customer Dashboard →
          </Link>
        </div>
      </div>
    </main>
  );
}
