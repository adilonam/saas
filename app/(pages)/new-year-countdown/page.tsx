"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SparklesIcon, ShareIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "New Year Countdown 2027 - Days Until New Year | Eprod.io",
  description: "Live countdown to New Year's Day 2027 with timezone selector. See exactly how many days, hours, minutes and seconds until January 1st in your timezone.",
  alternates: {
    canonical: "https://www.eprod.io/new-year-countdown",
  },
  openGraph: {
    title: "New Year Countdown 2027 - Days Until New Year",
    description: "Live countdown to New Year's Day 2027 with timezone support. Share your countdown!",
    url: "https://www.eprod.io/new-year-countdown",
    type: "website",
  },
};

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const TIMEZONES = [
  { value: "America/New_York", label: "New York (EST/EDT)" },
  { value: "America/Chicago", label: "Chicago (CST/CDT)" },
  { value: "America/Denver", label: "Denver (MST/MDT)" },
  { value: "America/Los_Angeles", label: "Los Angeles (PST/PDT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Australia/Sydney", label: "Sydney (AEDT/AEST)" },
  { value: "Pacific/Auckland", label: "Auckland (NZDT/NZST)" },
];

function calculateTimeRemaining(timezone: string): TimeRemaining {
  const now = new Date();
  
  // Create New Year's Day 2027 in the selected timezone
  const newYear = new Date(new Date("2027-01-01T00:00:00").toLocaleString("en-US", { timeZone: timezone }));
  
  // Get current time in selected timezone
  const nowInTz = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  
  const total = newYear.getTime() - nowInTz.getTime();
  
  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const seconds = Math.floor(total / 1000) % 60;
  const minutes = Math.floor(total / (1000 * 60)) % 60;
  const hours = Math.floor(total / (1000 * 60 * 60)) % 24;
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds };
}

export default function NewYearCountdownPage() {
  const [timezone, setTimezone] = useState("America/New_York");
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    // Detect user's timezone on mount
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const matchingTz = TIMEZONES.find(tz => tz.value === userTz);
      if (matchingTz) {
        setTimezone(userTz);
      }
    } catch (e) {
      // Fallback to default
    }
    setShareUrl(window.location.href);
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      setTimeRemaining(calculateTimeRemaining(timezone));
    };
    
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [timezone]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "New Year Countdown 2027",
          text: `${timeRemaining.days} days until 2027! 🎉`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Failed to share:", err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <DashboardLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "New Year Countdown 2027",
            "description": "Live countdown to New Year 2027 with timezone selector",
            "url": "https://www.eprod.io/new-year-countdown",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            }
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How many days until New Year 2027?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The countdown shows real-time days, hours, minutes, and seconds until January 1, 2027 in your selected timezone."
                }
              },
              {
                "@type": "Question",
                "name": "Can I change the timezone for the New Year countdown?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! Select from 12 major timezones including New York, London, Tokyo, Sydney and more. The countdown automatically adjusts."
                }
              },
              {
                "@type": "Question",
                "name": "Is the New Year countdown free?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, completely free with no registration required."
                }
              }
            ]
          })
        }}
      />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <SparklesIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">New Year Countdown 2027</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Live countdown to January 1st with timezone support
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 p-8 sm:p-12 space-y-8">
          <div className="space-y-4">
            <Label htmlFor="timezone" className="text-base">Select Timezone</Label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 text-center">
            <p className="text-lg text-slate-600 dark:text-slate-300">🎉 Time until New Year 🥳</p>
            <p className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">
              January 1, 2027
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-6 shadow-sm">
              <p className="text-4xl sm:text-5xl font-bold text-purple-600 dark:text-purple-400">
                {timeRemaining.days}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Days</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-6 shadow-sm">
              <p className="text-4xl sm:text-5xl font-bold text-blue-600 dark:text-blue-400">
                {String(timeRemaining.hours).padStart(2, '0')}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Hours</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-6 shadow-sm">
              <p className="text-4xl sm:text-5xl font-bold text-purple-600 dark:text-purple-400">
                {String(timeRemaining.minutes).padStart(2, '0')}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Minutes</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-6 shadow-sm">
              <p className="text-4xl sm:text-5xl font-bold text-blue-600 dark:text-blue-400">
                {String(timeRemaining.seconds).padStart(2, '0')}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Seconds</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button onClick={handleShare} className="gap-2">
              <ShareIcon className="h-4 w-4" />
              Share Countdown
            </Button>
            <Button onClick={handleCopyLink} variant="outline" className="gap-2">
              {copied ? (
                <>
                  <ClipboardDocumentCheckIcon className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <ClipboardDocumentCheckIcon className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Holiday Tools Section */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold mb-4">More Holiday Tools</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link
              href="/christmas-countdown"
              className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <p className="font-medium">🎄 Christmas Countdown</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Count down to Christmas 2026
              </p>
            </Link>
            <Link
              href="/secret-santa-generator"
              className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <p className="font-medium">🎁 Secret Santa Generator</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Random gift exchange pairs
              </p>
            </Link>
            <Link
              href="/black-friday-discount-calculator"
              className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <p className="font-medium">🛍️ Black Friday Calculator</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Stack & compare discounts
              </p>
            </Link>
            <Link
              href="/2027-calendar"
              className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <p className="font-medium">📅 2027 Calendar</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Printable year & month views
              </p>
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-2">How many days until New Year 2027?</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                The countdown shows real-time days, hours, minutes, and seconds until January 1, 2027 in your selected timezone. It updates every second for precision.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-2">Can I change the timezone for the New Year countdown?</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Yes! Select from 12 major timezones including New York, London, Paris, Tokyo, Sydney and more. The countdown automatically adjusts to show when New Year arrives in that timezone.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-2">Is the New Year countdown free?</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Yes, completely free with no registration required. Share it with friends around the world!
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
