"use client";
import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import DashboardLayout from "components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalculatorIcon } from "@heroicons/react/24/outline";
export default function CommissionImpactCalculatorPage() {
  const router = useRouter(); const pathname = usePathname(); const { data: session, status } = useSession();
  const [commission, setCommission] = useState("3.5"); const [lots, setLots] = useState("1"); const [trades, setTrades] = useState("20"); const [resultUnlocked, setResultUnlocked] = useState(false);
