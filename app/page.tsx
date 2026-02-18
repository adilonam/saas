import { Suspense } from "react";
import HomeDashboard from "components/HomeDashboard";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <HomeDashboard />
    </Suspense>
  );
}
