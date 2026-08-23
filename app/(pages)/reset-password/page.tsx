"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Reset link is missing or invalid. Please request a new one.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred. Please try again.");
        return;
      }

      setSuccess(data.message || "Password updated successfully.");
      setTimeout(() => {
        router.push("/signin?reset=success");
      }, 1500);
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "rounded-xl bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-dashboard-primary/20 h-11";
  const labelClass = "text-slate-700 dark:text-slate-300";

  if (!token) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-8 shadow-xl">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Invalid reset link
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 mb-6">
              This password reset link is missing or invalid. Request a new one below.
            </p>
            <Button
              asChild
              className="w-full rounded-xl bg-dashboard-primary hover:bg-dashboard-primary/90 text-white h-11 font-semibold"
            >
              <Link href="/forgot-password">Request new link</Link>
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-8 shadow-xl">
          <div className="space-y-2 mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Reset password
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Choose a new password for your account.
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
              <Label htmlFor="password" className={labelClass}>
                New password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                className={inputClass}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className={labelClass}>
                Confirm new password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                minLength={6}
                className={inputClass}
              />
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl bg-dashboard-primary hover:bg-dashboard-primary/90 text-white h-11 font-semibold"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update password"}
            </Button>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 pt-2">
              <Link
                href="/signin"
                className="font-medium text-dashboard-primary hover:underline"
              >
                Back to sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <DashboardLayout>
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 p-8">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Reset password
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Loading...
              </p>
            </div>
          </div>
        </DashboardLayout>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
