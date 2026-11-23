
"use client";

import { useCallback, useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

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
  customer?: {
    name?: string;
    email?: string;
  };
};

type ProfileUpdateData = {
  name: string;
  image: string;
  phone: string;
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
  const { data: session } = authClient.useSession();

  const user = session?.user as
    | {
        name?: string;
        email?: string;
        image?: string | null;
        phone?: string;
      }
    | undefined;

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [form, setForm] = useState<ServiceForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [appointmentsLoading, setAppointmentsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [appointmentActionId, setAppointmentActionId] = useState<string | null>(
    null
  );

  const [error, setError] = useState("");
  const [appointmentsError, setAppointmentsError] = useState("");
  const [message, setMessage] = useState("");

  const getToken = () => sessionStorage.getItem("salonbook_token");

  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfileImage(user.image || "");
      setProfilePhone(user.phone || "");
    }
  }, [user?.name, user?.image, user?.phone]);

  // Update Admin Profile
  const handleUpdateProfile = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setProfileError("");
    setProfileMessage("");

    if (!profileName.trim()) {
      setProfileError("Please enter your full name.");
      return;
    }

    if (profileImage.trim()) {
      try {
        new URL(profileImage);
      } catch {
        setProfileError("Please enter a valid image URL.");
        return;
      }
    }

    try {
      setProfileSaving(true);

      const updateUser = authClient.updateUser as unknown as (
        data: ProfileUpdateData
      ) => Promise<{
        error?: { message?: string } | null;
      }>;

      const result = await updateUser({
        name: profileName.trim(),
        image: profileImage.trim(),
        phone: profilePhone.trim(),
      });

      if (result.error) {
        throw new Error(
          result.error.message || "Failed to update profile."
        );
      }

      setProfileMessage("Profile updated successfully!");
      setIsEditingProfile(false);
    } catch (err) {
      setProfileError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setProfileSaving(false);
    }
  };

  // Fetch all services
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

  // Fetch all appointments for admin
  const fetchAppointments = useCallback(async () => {
    try {
      setAppointmentsLoading(true);
      setAppointmentsError("");

      const token = getToken();

      if (!token) {
        throw new Error("Please sign in again. Authentication token not found.");
      }

      const response = await fetch(
        `${API_URL}/api/admin/appointments`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load appointments.");
      }

      setAppointments(data.appointments || []);
    } catch (err) {
      setAppointmentsError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setAppointmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
    fetchAppointments();
  }, [fetchServices, fetchAppointments]);

  // Form input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Reset service form
  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  // Add / Update Service
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
        credentials: "include",
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

  // Edit Service
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

  // Delete Service
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
          credentials: "include",
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

  // Activate / Deactivate Service
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
          credentials: "include",
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

  // Confirm / Cancel Appointment
  const handleAppointmentAction = async (
    id: string,
    action: "confirm" | "cancel"
  ) => {
    if (action === "cancel") {
      const confirmed = window.confirm(
        "Are you sure you want to cancel this appointment?"
      );

      if (!confirmed) return;
    }

    const token = getToken();

    if (!token) {
      setAppointmentsError("Please sign in again.");
      return;
    }

    try {
      setAppointmentsError("");
      setMessage("");
      setAppointmentActionId(id);

      const response = await fetch(
        `${API_URL}/api/admin/appointments/${id}/${action}`,
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
        throw new Error(data.message || "Failed to update appointment.");
      }

      setMessage(
        action === "confirm"
          ? "Appointment confirmed successfully!"
          : "Appointment cancelled successfully!"
      );

      await fetchAppointments();
    } catch (err) {
      setAppointmentsError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setAppointmentActionId(null);
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
          Admin Dashboard
        </h1>

        <p className="mt-3 text-[#806d63]">
          Manage salon services and customer appointments.
        </p>

        {/* Admin Profile */}
        <section className="mt-8 rounded-2xl border border-[#eee4dd] bg-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">My Profile</h2>
              <p className="mt-2 text-sm text-[#806d63]">
                Manage your admin account information.
              </p>
            </div>

            {!isEditingProfile && (
              <button
                onClick={() => {
                  setProfileError("");
                  setProfileMessage("");
                  setIsEditingProfile(true);
                }}
                className="rounded-lg bg-[#9b6248] px-5 py-2 font-semibold text-white hover:bg-[#80503b]"
              >
                Edit Profile
              </button>
            )}
          </div>

          {profileMessage && (
            <p className="mt-5 rounded-lg bg-green-50 p-3 text-sm text-green-700">
              {profileMessage}
            </p>
          )}

          {profileError && (
            <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {profileError}
            </p>
          )}

          {!isEditingProfile ? (
            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-center">
              {user?.image ? (
                <img
                  src={user.image}
                  alt="Admin profile"
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#f5e9e3] text-3xl font-bold text-[#9b6248]">
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
              )}

              <div className="space-y-2">
                <p className="text-xl font-bold">
                  {user?.name || "Admin"}
                </p>
                <p className="text-sm text-gray-500">
                  {user?.email || "Email unavailable"}
                </p>
                <p className="text-sm text-gray-500">
                  Phone: {user?.phone || "Not added"}
                </p>
                <span className="inline-block rounded-full bg-[#f5e9e3] px-3 py-1 text-xs font-semibold text-[#9b6248]">
                  Administrator
                </span>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleUpdateProfile}
              className="mt-6 grid gap-5 sm:grid-cols-2"
            >
              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Full Name
                </label>
                <input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#9b6248]"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#9b6248]"
                  placeholder="Your phone number"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-sm font-semibold">
                  Profile Image URL
                </label>
                <input
                  type="url"
                  value={profileImage}
                  onChange={(e) => setProfileImage(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#9b6248]"
                  placeholder="https://example.com/profile.jpg"
                />
              </div>

              <div className="flex flex-wrap gap-3 sm:col-span-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="rounded-lg bg-[#9b6248] px-7 py-3 font-semibold text-white hover:bg-[#80503b] disabled:opacity-60"
                >
                  {profileSaving ? "Saving..." : "Save Profile"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileError("");
                    setProfileMessage("");
                    setProfileName(user?.name || "");
                    setProfileImage(user?.image || "");
                    setProfilePhone(user?.phone || "");
                  }}
                  className="rounded-lg border border-gray-300 px-7 py-3 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </section>

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

        {/* Add / Edit Service */}
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

        {/* All Services */}
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

        {/* All Appointments */}
        <section className="mt-16">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold tracking-widest text-[#a97051]">
                BOOKING MANAGEMENT
              </p>

              <h2 className="mt-2 text-2xl font-bold">
                All Appointments
              </h2>

              <p className="mt-2 text-sm text-[#806d63]">
                View and manage customer appointment requests.
              </p>
            </div>

            <button
              onClick={fetchAppointments}
              disabled={appointmentsLoading}
              className="rounded-lg border border-[#9b6248] px-5 py-2 text-sm font-semibold text-[#9b6248] hover:bg-[#9b6248] hover:text-white disabled:opacity-50"
            >
              {appointmentsLoading ? "Refreshing..." : "Refresh Appointments"}
            </button>
          </div>

          {appointmentsError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {appointmentsError}
            </div>
          )}

          {appointmentsLoading ? (
            <div className="rounded-xl bg-white p-10 text-center text-gray-500">
              Loading appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#e7cfc5] bg-white p-12 text-center">
              <p className="text-lg font-semibold text-[#34251f]">
                No Appointments Yet
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Customer bookings will appear here.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-2">
              {appointments.map((appointment) => (
                <article
                  key={appointment._id}
                  className="rounded-2xl border border-[#eee4dd] bg-white p-6 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold tracking-widest text-[#a97051]">
                        APPOINTMENT
                      </p>

                      <h3 className="mt-2 text-xl font-bold">
                        {appointment.service?.serviceName ||
                          "Service unavailable"}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {appointment.service?.category || "Salon Service"}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
                        appointment.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : appointment.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : appointment.status === "completed"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>

                  <div className="mt-6 grid gap-4 border-t border-[#eee4dd] pt-5 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        Customer
                      </p>
                      <p className="mt-1 font-semibold">
                        {appointment.customer?.name || "Customer"}
                      </p>
                      <p className="mt-1 break-all text-sm text-gray-500">
                        {appointment.customer?.email || "Email unavailable"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        Appointment Date
                      </p>
                      <p className="mt-1 font-semibold">
                        {appointment.appointmentDate}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {appointment.timeSlot}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        Service Price
                      </p>
                      <p className="mt-1 text-lg font-bold text-[#9b6248]">
                        ৳{appointment.servicePrice}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        Payment Status
                      </p>
                      <p className="mt-1 font-semibold capitalize">
                        {appointment.paymentStatus}
                      </p>
                    </div>
                  </div>

                  {appointment.message && (
                    <div className="mt-5 rounded-xl bg-[#faf6f2] p-4">
                      <p className="text-xs font-semibold uppercase text-gray-400">
                        Customer Message
                      </p>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">
                        {appointment.message}
                      </p>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3 border-t border-[#eee4dd] pt-5">
                    {appointment.status === "pending" && (
                      <button
                        onClick={() =>
                          handleAppointmentAction(
                            appointment._id,
                            "confirm"
                          )
                        }
                        disabled={appointmentActionId === appointment._id}
                        className="flex-1 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                      >
                        {appointmentActionId === appointment._id
                          ? "Updating..."
                          : "Confirm Appointment"}
                      </button>
                    )}

                    {(appointment.status === "pending" ||
                      appointment.status === "confirmed") && (
                      <button
                        onClick={() =>
                          handleAppointmentAction(
                            appointment._id,
                            "cancel"
                          )
                        }
                        disabled={appointmentActionId === appointment._id}
                        className="flex-1 rounded-lg border border-red-300 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                      >
                        {appointmentActionId === appointment._id
                          ? "Updating..."
                          : "Cancel Appointment"}
                      </button>
                    )}
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
