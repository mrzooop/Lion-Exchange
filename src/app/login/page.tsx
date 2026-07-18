"use client";

import { Suspense, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isColumbiaEmail } from "@/lib/columbia-email";

type Status = "idle" | "sending" | "sent" | "error";

const CALLBACK_ERROR_MESSAGES: Record<string, string> = {
  missing_params:
    "That sign-in link was missing some information. Please request a new one.",
  invalid_type:
    "That sign-in link wasn't valid. Please request a new one.",
  verify_failed:
    "That sign-in link didn't work — it may have expired or already been used. Request a new one below.",
  exchange_failed:
    "That sign-in link didn't work — it may have expired or already been used. Request a new one below.",
};

function LoginForm() {
  const searchParams = useSearchParams();
  const callbackError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isColumbiaEmail(email)) {
      setStatus("error");
      setErrorMessage("Please use your @columbia.edu email address.");
      return;
    }

    setStatus("sending");
    setErrorMessage("");

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus("error");
      setErrorMessage(error.message);
      return;
    }

    setStatus("sent");
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Lion Exchange
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Give away or claim food, groceries, and household items with
            fellow Columbia students.
          </p>
        </div>

        {status !== "sent" && callbackError && (
          <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-center text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
            {CALLBACK_ERROR_MESSAGES[callbackError] ??
              "Something went wrong signing you in. Please try again."}
          </p>
        )}

        {status === "sent" ? (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-center text-sm dark:border-neutral-800 dark:bg-neutral-900">
            <p>
              Check <span className="font-medium">{email}</span> for a sign-in
              link.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Columbia email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="uni@columbia.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-base focus:border-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
                required
              />
            </div>

            {status === "error" && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-lg bg-blue-600 px-3 py-3 text-base font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
            >
              {status === "sending" ? "Sending link…" : "Send sign-in link"}
            </button>

            <p className="text-center text-xs text-neutral-500">
              Only @columbia.edu addresses can sign up.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
