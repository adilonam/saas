"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CalendarIcon, PrinterIcon } from "@heroicons/react/24/outline";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "2027 Calendar - Printable Year & Month Views | Eprod.io",
  description: "Free printable 2027 calendar with yearly and monthly views. Choose Monday or Sunday week start. Download as PDF via browser print.",
  alternates: {
    canonical: "https://www.eprod.io/2027-calendar",
  },
  openGraph: {
    title: "2027 Calendar - Printable Year & Month Views",
    description: "Free printable 2027 calendar. Choose your week start and download as PDF.",
    url: "https://www.eprod.io/2027-calendar",
    type: "website",
  },
};

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(month: number, year: number, startOnMonday: boolean): number {
  const day = new Date(year, month, 1).getDay();
  return startOnMonday ? (day === 0 ? 6 : day - 1) : day;
}

function generateCalendarDays(month: number, year: number, startOnMonday: boolean) {
  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfMonth(month, year, startOnMonday);
  const days: (number | null)[] = Array(firstDay).fill(null);
  
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  return days;
}

export default function Calendar2027Page() {
  const [view, setView] = useState<"year" | "month">("year");
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [weekStart, setWeekStart] = useState<"monday" | "sunday">("monday");

  const startOnMonday = weekStart === "monday";
  const weekDays = startOnMonday 
    ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          nav, footer, .no-print, .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          body { background: white !important; }
          * { color: black !important; background: white !important; }
          .calendar-grid { page-break-inside: avoid; }
          .calendar-month { page-break-inside: avoid; page-break-after: always; }
          .calendar-month:last-child { page-break-after: auto; }
        }
      `}</style>

      <DashboardLayout>
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "2027 Calendar",
            "description": "Printable 2027 calendar with yearly and monthly views",
            "url": "https://www.eprod.io/2027-calendar",
            "applicationCategory": "UtilityApplication",
            "operatingSystem": "Any",
            "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
          })
        }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Can I print the 2027 calendar?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes! Click the Print button to print or save as PDF via your browser's print dialog. The calendar has print-optimized layouts."
                }
              },
              {
                "@type": "Question",
                "name": "Can I choose Monday or Sunday as the first day?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, toggle between Monday and Sunday week start in the settings."
                }
              },
              {
                "@type": "Question",
                "name": "Is the calendar free?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, completely free with no watermarks or registration."
                }
              }
            ]
          })
        }} />

        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8 no-print">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <CalendarIcon className="size-7" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">2027 Calendar</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                  Printable yearly and monthly calendar views
                </p>
              </div>
            </div>
            <Button onClick={handlePrint} className="gap-2">
              <PrinterIcon className="h-4 w-4" />
              Print / PDF
            </Button>
          </div>

          <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 p-6 space-y-6 no-print">
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label>View</Label>
                <select
                  value={view}
                  onChange={(e) => setView(e.target.value as "year" | "month")}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                >
                  <option value="year">Yearly View</option>
                  <option value="month">Monthly View</option>
                </select>
              </div>

              {view === "month" && (
                <div>
                  <Label>Month</Label>
                  <select
                    value={selectedMonth.toString()}
                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                  >
                    {MONTHS.map((m, i) => (
                      <option key={i} value={i.toString()}>{m}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <Label>Week Starts On</Label>
                <select
                  value={weekStart}
                  onChange={(e) => setWeekStart(e.target.value as "monday" | "sunday")}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                >
                  <option value="monday">Monday</option>
                  <option value="sunday">Sunday</option>
                </select>
              </div>
            </div>
          </div>

          {view === "year" ? (
            <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6 print:gap-4">
              {MONTHS.map((monthName, monthIndex) => {
                const days = generateCalendarDays(monthIndex, 2027, startOnMonday);
                return (
                  <div key={monthIndex} className="calendar-month p-6 print:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
                    <h3 className="text-lg font-bold mb-4 text-center">{monthName} 2027</h3>
                    <div className="grid grid-cols-7 gap-1">
                      {weekDays.map((day) => (
                        <div key={day} className="text-center text-xs font-semibold p-2 text-slate-600 dark:text-slate-400">
                          {day}
                        </div>
                      ))}
                      {days.map((day, i) => (
                        <div key={i} className={`text-center p-2 text-sm ${day ? 'hover:bg-slate-100 dark:hover:bg-slate-700 rounded' : ''}`}>
                          {day || ''}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-8">
              <div className="calendar-month p-8 print:p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold mb-6 text-center">{MONTHS[selectedMonth]} 2027</h2>
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day) => (
                    <div key={day} className="text-center font-semibold p-3 text-slate-600 dark:text-slate-400">
                      {day}
                    </div>
                  ))}
                  {generateCalendarDays(selectedMonth, 2027, startOnMonday).map((day, i) => (
                    <div key={i} className={`text-center p-4 text-lg border border-slate-200 dark:border-slate-700 rounded-lg min-h-[80px] ${day ? 'hover:bg-slate-100 dark:hover:bg-slate-700' : 'bg-slate-50 dark:bg-slate-900'}`}>
                      {day || ''}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Holiday Tools */}
          <div className="mt-12 p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 no-print">
            <h2 className="text-lg font-semibold mb-4">More Holiday Tools</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link href="/christmas-countdown" className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <p className="font-medium">🎄 Christmas Countdown</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Count down to Christmas 2026</p>
              </Link>
              <Link href="/new-year-countdown" className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <p className="font-medium">🎉 New Year Countdown</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Count down to 2027</p>
              </Link>
              <Link href="/secret-santa-generator" className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <p className="font-medium">🎁 Secret Santa Generator</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Random gift exchange pairs</p>
              </Link>
              <Link href="/black-friday-discount-calculator" className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <p className="font-medium">🛍️ Black Friday Calculator</p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Stack & compare discounts</p>
              </Link>
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-12 space-y-6 no-print">
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold mb-2">Can I print the 2027 calendar?</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Yes! Click the Print button to print or save as PDF via your browser's print dialog. The calendar has print-optimized layouts with no headers or footers.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold mb-2">Can I choose Monday or Sunday as the first day?</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Yes, use the "Week Starts On" dropdown to toggle between Monday and Sunday as the first day of the week.
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold mb-2">Is the calendar free?</h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm">
                  Yes, completely free with no watermarks or registration. Print as many copies as you need!
                </p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
