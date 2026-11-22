"use client";

import { useState } from "react";
import UnifiedLayout from "./UnifiedLayout";
import ImprovedHomeDashboard from "./ImprovedHomeDashboard";

export default function HomePage() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <UnifiedLayout searchOpen={searchOpen} setSearchOpen={setSearchOpen}>
      <ImprovedHomeDashboard onSearchClick={() => setSearchOpen(true)} />
    </UnifiedLayout>
  );
}
