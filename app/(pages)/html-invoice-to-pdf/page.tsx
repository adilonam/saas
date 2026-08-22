"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardLayout from "components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { guardToolAccess } from "@/lib/guard-tool-access";

export default function HtmlInvoiceToPdfPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [company, setCompany] = useState("Eprod LLC");
  const [client, setClient] = useState("Client Inc.");
  const [item, setItem] = useState("Consulting Services");
  const [amount, setAmount] = useState("1200.00");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const html = useMemo(
    () => `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 32px;">
          <h1>Invoice</h1>
          <p><strong>From:</strong> ${company}</p>
          <p><strong>To:</strong> ${client}</p>
          <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th style="text-align:left; border-bottom:1px solid #ddd; padding:8px;">Item</th>
                <th style="text-align:right; border-bottom:1px solid #ddd; padding:8px;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding:8px; border-bottom:1px solid #eee;">${item}</td>
                <td style="padding:8px; border-bottom:1px solid #eee; text-align:right;">$${amount}</td>
              </tr>
            </tbody>
          </table>
          <p style="margin-top:20px;"><strong>Total:</strong> $${amount}</p>
        </body>
      </html>
    `,
    [amount, client, company, item],
  );

  const handleGenerate = async () => {
    if (!guardToolAccess(status, session, pathname, "/html-invoice-to-pdf", router)) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/html-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error || "Failed to generate invoice PDF.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "invoice.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      setError("Could not generate invoice PDF.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">HTML Invoice to PDF</h1>
          <p className="mt-1 text-muted-foreground">
            Fill invoice fields, generate HTML, and export to PDF.
          </p>
        </div>

        <div className="rounded-xl border border-input bg-card p-6 space-y-4">
          <input className="w-full rounded-lg border border-input px-3 py-2 text-sm" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Your company" />
          <input className="w-full rounded-lg border border-input px-3 py-2 text-sm" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client name" />
          <input className="w-full rounded-lg border border-input px-3 py-2 text-sm" value={item} onChange={(e) => setItem(e.target.value)} placeholder="Invoice item" />
          <input className="w-full rounded-lg border border-input px-3 py-2 text-sm" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" />

          <Button onClick={handleGenerate} disabled={isLoading} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowDownTrayIcon className="h-4 w-4" />}
            Generate invoice PDF
          </Button>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    </DashboardLayout>
  );
}
