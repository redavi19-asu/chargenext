import { Suspense } from "react";

import EmergencyStatusClient from "./emergency-status-client";

export default function EmergencyStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
          Loading request status...
        </div>
      }
    >
      <EmergencyStatusClient />
    </Suspense>
  );
}