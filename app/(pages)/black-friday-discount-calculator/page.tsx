"use client";

import { useState } from "react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCartIcon, PlusIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Black Friday Discount Calculator - Stack & Compare Deals | Eprod.io",
  description: "Calculate stacked Black Friday discounts with multiple percentages, coupon codes, and tax. Compare up to 3 deals side-by-side to find the best price.",
  alternates: {
    canonical: "https://www.eprod.io/black-friday-discount-calculator",
  },
  openGraph: {
    title: "Black Friday Discount Calculator - Stack & Compare Deals",
    description: "Stack multiple discounts and compare Black Friday deals to find the best price.",
    url: "https://www.eprod.io/black-friday-discount-calculator",
    type: "website",
  },
};

interface Deal {
  id: string;
  name: string;
  originalPrice: string;
  discount1: string;
  discount2: string;
  couponAmount: string;
  taxRate: string;
}

function calculateFinalPrice(deal: Deal) {
  const original = parseFloat(deal.originalPrice) || 0;
  const d1 = parseFloat(deal.discount1) || 0;
  const d2 = parseFloat(deal.discount2) || 0;
  const coupon = parseFloat(deal.couponAmount) || 0;
  const tax = parseFloat(deal.taxRate) || 0;

  // Apply first discount
  let price = original * (1 - d1 / 100);
  
  // Apply second discount on the reduced price
  price = price * (1 - d2 / 100);
  
  // Apply coupon amount
  price = Math.max(0, price - coupon);
  
  // Add tax
  const finalPrice = price * (1 + tax / 100);
  
  // Calculate total discount percentage
  const totalSaved = original - price;
  const discountPercent = original > 0 ? (totalSaved / original) * 100 : 0;
  
  return {
    finalPrice: finalPrice.toFixed(2),
    priceBeforeTax: price.toFixed(2),
    totalSaved: totalSaved.toFixed(2),
    discountPercent: discountPercent.toFixed(1)
  };
}

export default function BlackFridayCalculatorPage() {
  const [deals, setDeals] = useState<Deal[]>([
    {
      id: "1",
      name: "Deal 1",
      originalPrice: "",
      discount1: "",
      discount2: "",
      couponAmount: "",
      taxRate: ""
    }
  ]);

  const addDeal = () => {
    if (deals.length >= 3) return;
    setDeals([...deals, {
      id: Date.now().toString(),
      name: `Deal ${deals.length + 1}`,
      originalPrice: "",
      discount1: "",
      discount2: "",
      couponAmount: "",
      taxRate: ""
    }]);
  };

  const removeDeal = (id: string) => {
    setDeals(deals.filter(d => d.id !== id));
  };

  const updateDeal = (id: string, field: keyof Deal, value: string) => {
    setDeals(deals.map(d => d.id === id ? { ...d, [field]: value } : d));
  };

  const results = deals.map(d => ({ deal: d, result: calculateFinalPrice(d) }));
  const bestDeal = results.reduce((best, curr) => 
    parseFloat(curr.result.finalPrice) < parseFloat(best.result.finalPrice) ? curr : best
  , results[0]);

  return (
    <DashboardLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Black Friday Discount Calculator",
          "description": "Stack and compare Black Friday discounts with tax calculations",
          "url": "https://www.eprod.io/black-friday-discount-calculator",
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
              "name": "How do I stack Black Friday discounts?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Enter the original price, first discount %, second discount %, and any coupon amount. The calculator applies discounts sequentially then adds tax."
              }
            },
            {
              "@type": "Question",
              "name": "Can I compare multiple Black Friday deals?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "Yes! Add up to 3 deals and compare them side-by-side. The best deal is highlighted automatically."
              }
            },
            {
              "@type": "Question",
              "name": "What's the real discount percentage?",
              "acceptedAnswer": {
                "@type": "Answer",
                "text": "The calculator shows the total discount percentage based on how much you actually saved from the original price."
              }
            }
          ]
        })
      }} />

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="size-12 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
            <ShoppingCartIcon className="size-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Black Friday Discount Calculator</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
              Stack discounts and compare deals to find the best Black Friday price
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {deals.map((deal, index) => {
              const result = results[index].result;
              const isBest = deals.length > 1 && results[index].deal.id === bestDeal.deal.id;
              
              return (
                <div key={deal.id} className={`rounded-3xl border p-6 space-y-4 ${isBest ? 'border-green-500 dark:border-green-600 bg-green-50/50 dark:bg-green-950/20' : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40'}`}>
                  <div className="flex items-center justify-between">
                    <Input
                      value={deal.name}
                      onChange={(e) => updateDeal(deal.id, 'name', e.target.value)}
                      className="font-semibold h-9 flex-1 mr-2"
                      placeholder="Deal name"
                    />
                    {deals.length > 1 && (
                      <Button onClick={() => removeDeal(deal.id)} size="sm" variant="ghost">
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label className="text-xs">Original Price ($)</Label>
                      <Input
                        type="number"
                        value={deal.originalPrice}
                        onChange={(e) => updateDeal(deal.id, 'originalPrice', e.target.value)}
                        placeholder="100.00"
                        className="h-10"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">1st Discount (%)</Label>
                      <Input
                        type="number"
                        value={deal.discount1}
                        onChange={(e) => updateDeal(deal.id, 'discount1', e.target.value)}
                        placeholder="25"
                        className="h-10"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">2nd Discount (%)</Label>
                      <Input
                        type="number"
                        value={deal.discount2}
                        onChange={(e) => updateDeal(deal.id, 'discount2', e.target.value)}
                        placeholder="10"
                        className="h-10"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Coupon Amount ($)</Label>
                      <Input
                        type="number"
                        value={deal.couponAmount}
                        onChange={(e) => updateDeal(deal.id, 'couponAmount', e.target.value)}
                        placeholder="5.00"
                        className="h-10"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Tax Rate (%)</Label>
                      <Input
                        type="number"
                        value={deal.taxRate}
                        onChange={(e) => updateDeal(deal.id, 'taxRate', e.target.value)}
                        placeholder="8.5"
                        className="h-10"
                      />
                    </div>
                  </div>

                  {deal.originalPrice && (
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                      {isBest && (
                        <p className="text-xs font-semibold text-green-600 dark:text-green-400 mb-2">🏆 BEST DEAL</p>
                      )}
                      <div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Final Price</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">${result.finalPrice}</p>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                        <p>Before tax: ${result.priceBeforeTax}</p>
                        <p>You save: ${result.totalSaved} ({result.discountPercent}%)</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {deals.length < 3 && (
            <Button onClick={addDeal} variant="outline" className="w-full gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Another Deal to Compare
            </Button>
          )}
        </div>

        {/* Holiday Tools */}
        <div className="mt-12 p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
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
            <Link href="/2027-calendar" className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
              <p className="font-medium">📅 2027 Calendar</p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Printable year & month views</p>
            </Link>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 space-y-6">
          <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-2">How do I stack Black Friday discounts?</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Enter the original price, first discount percentage, second discount percentage (applied on the reduced price), and any coupon amount. The calculator applies discounts sequentially then adds tax for the final price.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-2">Can I compare multiple Black Friday deals?</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Yes! Add up to 3 deals and compare them side-by-side. The best deal (lowest final price) is highlighted automatically with a trophy icon.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50/50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold mb-2">What's the real discount percentage?</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                The calculator shows the total discount percentage based on how much you actually saved from the original price, not just what the store advertises.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
