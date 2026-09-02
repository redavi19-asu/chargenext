import { Suspense } from "react";

import CustomerStatusClient from "./customer-status-client";

export default function CustomerStatusPage() {
  return (
    <Suspense fallback={<main className="min-h-screen bg-[#050914]" />}>
      <CustomerStatusClient />
    </Suspense>
  );
}
