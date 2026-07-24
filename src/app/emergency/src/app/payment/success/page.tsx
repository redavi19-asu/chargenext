import { Suspense } from "react";

import PaymentSuccessClient from "./payment-success-client";

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
          Verifying payment...
        </div>
      }
    >
      <PaymentSuccessClient />
    </Suspense>
  );
}