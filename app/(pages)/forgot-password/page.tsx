"use client";

import { useState } from "react";
import Link from "next/link";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred. Please try again.");
        return;
      }

      setSuccess(
        data.message ||
          "If an account exists for that email, you will receive a password reset link shortly."
      );
      setEmail("");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "rounded-xl bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-dashboard-primary/20 h-11";
  const labelClass = "text-slate-700 dark:text-slate-300";

  return (
    <DashboardLayout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-8 shadow-xl">
          <div className="space-y-2 mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Forgot password
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter your email and we&apos;ll send you a link to reset your password.
              Google-only accounts can use this to set a password too.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {success && (
              <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 text-sm text-green-600 dark:text-green-400">
                {success}
              </div>
            )}
            {error && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className={labelClass}>
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className={inputClass}
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl bg-dashboard-primary hover:bg-dashboard-primary/90 text-white h-11 font-semibold"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send reset link"}
            </Button>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
              Remember your password?{" "}
              <Link
                href="/signin"
                className="font-medium text-dashboard-primary hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
