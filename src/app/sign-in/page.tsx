
"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type ExtendedUser = {
  id: string;
  role?: string;
  isBlocked?: boolean;
};

export default function SignInPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  const handleSignIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        setError(error.message || "Invalid email or password.");
        return;
      }

      if (!data?.user) {
        setError("Sign in failed. Please try again.");
        return;
      }

      const user = data.user as typeof data.user & ExtendedUser;

      // Check whether the account is blocked
      if (user.isBlocked) {
        await authClient.signOut();
        setError(
          "Your account has been blocked. Please contact the administrator."
        );
        return;
      }

      // Generate JWT after successful sign in
      const tokenResponse = await fetch(
        "http://localhost:5000/api/token",
        {
          method: "POST",
          credentials: "include",
        }
      );

      const tokenData = await tokenResponse.json();

      if (
        !tokenResponse.ok ||
        !tokenData.success ||
        !tokenData.token
      ) {
        await authClient.signOut();
        sessionStorage.removeItem("salonbook_token");
        setError("Authentication failed. Please sign in again.");
        return;
      }

      // Store JWT for protected API requests
      sessionStorage.setItem("salonbook_token", tokenData.token);

      // Redirect according to user role
      if (user.role === "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/customer");
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);

    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "http://localhost:3000/auth/callback",
      });

      if (error) {
        setError(error.message || "Google sign in failed.");
        setLoading(false);
      }
    } catch {
      setError("Google sign in is currently unavailable.");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf6f2] px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg sm:p-10">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-3xl font-bold tracking-wide text-[#9b6248]"
          >
            SalonBook
          </Link>

          <h1 className="mt-6 text-2xl font-semibold text-gray-800">
            Welcome Back
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to manage your salon appointments.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-[#9b6248] focus:ring-2 focus:ring-[#9b6248]/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-800 outline-none transition focus:border-[#9b6248] focus:ring-2 focus:ring-[#9b6248]/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#9b6248] px-4 py-3 font-semibold text-white transition hover:bg-[#80503b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-400">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
        >
          Continue with Google
        </button>

        <p className="mt-7 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/sign-up"
            className="font-semibold text-[#9b6248] hover:underline"
          >
            Sign Up
          </Link>
        </p>

        <p className="mt-6 text-center text-xs text-gray-400">
          © {year} SalonBook. All rights reserved.
        </p>
      </div>
    </main>
  );
}
