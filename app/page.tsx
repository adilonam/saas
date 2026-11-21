import { Suspense } from "react";
import ImprovedHomeDashboard from "components/ImprovedHomeDashboard";
import ResponsiveDashboardLayout from "components/ResponsiveDashboardLayout";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ResponsiveDashboardLayout fullWidth>
        <ImprovedHomeDashboard />
      </ResponsiveDashboardLayout>
    </Suspense>
  );
}
