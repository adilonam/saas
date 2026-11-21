"use client";

import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { GiftIcon, ShareIcon, ClipboardDocumentCheckIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Head from "next/head";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

function calculateTimeRemaining(): TimeRemaining {
  const now = new Date();
  const currentYear = now.getFullYear();
  const christmas = new Date(currentYear, 11, 25, 0, 0, 0); // Dec 25
  
  // If Christmas has passed this year, calculate for next year
  if (now > christmas) {
    christmas.setFullYear(currentYear + 1);
  }

  const total = christmas.getTime() - now.getTime();
  const seconds = Math.floor(total / 1000) % 60;
  const minutes = Math.floor(total / (1000 * 60)) % 60;
  const hours = Math.floor(total / (1000 * 60 * 60)) % 24;
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { days, hours, minutes, seconds, total };
}

export default function ChristmasCountdownPage() {
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() => calculateTimeRemaining());
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(calculateTimeRemaining());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

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
          title: "Christmas Countdown 2026",
          text: `${timeRemaining.days} days until Christmas! 🎄`,
          url: shareUrl,
        });
      } catch (err) {
        console.error("Failed to share:", err);
      }
    } else {
      handleCopyLink();
    }
  };

  const christmasYear = new Date().getMonth() === 11 && new Date().getDate() > 25 ? new Date().getFullYear() + 1 : new Date().getFullYear();

  return (
    <DashboardLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "Christmas Countdown 2026",
            "description": "Live countdown to Christmas Day 2026 with shareable link",
            "url": "https://www.eprod.io/christmas-countdown",
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
                "name": "How many days until Christmas 2026?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "The countdown updates in real-time showing exactly how many days, hours, minutes, and seconds remain until December 25, 2026."
                }
              },
              {
                "@type": "Question",
                "name": "Can I share this Christmas countdown?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! Click the share button to share the countdown link with friends and family via social media, messaging apps, or copy the link directly."
                }
              },
              {
                "@type": "Question",
                "name": "Is the Christmas countdown free to use?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, the Christmas countdown is completely free with no registration required."
                }
              },
              {
                "@type": "Question",
                "name": "Does the countdown work in all timezones?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, the countdown automatically adjusts to your local timezone and counts down to December 25 at midnight in your timezone."
                }
              }
            ]
          })
        }}
      />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
            <GiftIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Christmas Countdown {christmasYear}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Live countdown to Christmas Day - share with friends and family
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-red-50 to-green-50 dark:from-red-950/20 dark:to-green-950/20 p-8 sm:p-12 text-center space-y-8">
          <div className="space-y-2">
            <p className="text-lg text-slate-600 dark:text-slate-300">🎄 Time until Christmas 🎅</p>
            <p className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white">
              December 25, {christmasYear}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-6 shadow-sm">
              <p className="text-4xl sm:text-5xl font-bold text-red-600 dark:text-red-400">
                {timeRemaining.days}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Days</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-6 shadow-sm">
              <p className="text-4xl sm:text-5xl font-bold text-green-600 dark:text-green-400">
                {String(timeRemaining.hours).padStart(2, '0')}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Hours</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-6 shadow-sm">
              <p className="text-4xl sm:text-5xl font-bold text-red-600 dark:text-red-400">
                {String(timeRemaining.minutes).padStart(2, '0')}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">Minutes</p>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-2xl p-6 shadow-sm">
              <p className="text-4xl sm:text-5xl font-bold text-green-600 dark:text-green-400">
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
              href="/new-year-countdown"
              className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <p className="font-medium">🎉 New Year Countdown</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Count down to 2027
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
              <h3 className="font-semibold mb-2">How many days until Christmas 2026?</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                The countdown updates in real-time showing exactly how many days, hours, minutes, and seconds remain until December 25, 2026. The countdown automatically adjusts to your local timezone.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-2">Can I share this Christmas countdown?</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Yes! Click the share button to share the countdown link with friends and family via social media, messaging apps, or copy the link directly. Everyone who visits will see the same live countdown.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-2">Is the Christmas countdown free to use?</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Yes, the Christmas countdown is completely free with no registration required. Share it with as many people as you like.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-2">Does the countdown work in all timezones?</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Yes, the countdown automatically adjusts to your local timezone and counts down to December 25 at midnight in your timezone. No configuration needed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
