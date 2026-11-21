import { Suspense } from "react";
import ImprovedHomeDashboard from "components/ImprovedHomeDashboard";
import UnifiedLayout from "components/UnifiedLayout";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <UnifiedLayout>
        <ImprovedHomeDashboard />
      </UnifiedLayout>
    </Suspense>
  );
}
