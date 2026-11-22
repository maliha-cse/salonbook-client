
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

type ExtendedUser = {
  id: string;
  role?: string;
  isBlocked?: boolean;
};

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const [message, setMessage] = useState("Completing Google sign in...");
  const [error, setError] = useState("");

  const processed = useRef(false);

  useEffect(() => {
    if (isPending || processed.current) return;

    const completeGoogleSignIn = async () => {
      processed.current = true;

      try {
        if (!session?.user) {
          setError("Google authentication failed. Please sign in again.");
          setMessage("");
          return;
        }

        const user = session.user as typeof session.user & ExtendedUser;

        if (user.isBlocked) {
          await authClient.signOut();
          sessionStorage.removeItem("salonbook_token");
          setError(
            "Your account has been blocked. Please contact the administrator."
          );
          setMessage("");
          return;
        }

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
          setMessage("");
          return;
        }

        sessionStorage.setItem("salonbook_token", tokenData.token);

        if (user.role === "admin") {
          router.replace("/dashboard/admin");
        } else {
          router.replace("/dashboard/customer");
        }
      } catch (error) {
        console.error("Google authentication error:", error);
        setError("Something went wrong. Please sign in again.");
        setMessage("");
      }
    };

    completeGoogleSignIn();
  }, [isPending, session, router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#faf6f2] px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-2xl font-bold text-[#9b6248]">
          SalonBook
        </h1>

        {error ? (
          <>
            <p role="alert" className="mt-5 text-sm text-red-600">
              {error}
            </p>

            <button
              onClick={() => router.replace("/sign-in")}
              className="mt-6 rounded-lg bg-[#9b6248] px-6 py-3 font-semibold text-white hover:bg-[#80503b]"
            >
              Back to Sign In
            </button>
          </>
        ) : (
          <p className="mt-5 text-gray-600">{message}</p>
        )}
      </div>
    </main>
  );
}
