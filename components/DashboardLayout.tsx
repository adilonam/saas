"use client";

import UnifiedLayout from "./UnifiedLayout";
import Footer from "./Footer";

interface DashboardLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export default function DashboardLayout({ children, fullWidth }: DashboardLayoutProps) {
  return (
    <UnifiedLayout>
      <div className={`flex flex-col min-h-screen ${fullWidth ? "p-0" : "px-4 sm:px-6 lg:px-8 py-6"}`}>
        <div className={fullWidth ? "h-full w-full flex-1" : "max-w-7xl mx-auto w-full flex-1"}>
          {children}
        </div>
        <Footer />
      </div>
    </UnifiedLayout>
  );
}
