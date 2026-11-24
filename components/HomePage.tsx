"use client";

import { useState } from "react";
import UnifiedLayout from "./UnifiedLayout";
import ImprovedHomeDashboard from "./ImprovedHomeDashboard";

export interface HomeGuide {
  slug: string;
  title: string;
  metaDescription: string | null;
  category: string | null;
}

export default function HomePage({ guides = [] }: { guides?: HomeGuide[] }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <UnifiedLayout searchOpen={searchOpen} setSearchOpen={setSearchOpen}>
      <ImprovedHomeDashboard onSearchClick={() => setSearchOpen(true)} guides={guides} />
    </UnifiedLayout>
  );
}
